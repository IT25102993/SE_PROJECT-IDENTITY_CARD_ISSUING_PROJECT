package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.AdminDtos;
import com.nexusgov.identity.model.AccountDeletionRequest;
import com.nexusgov.identity.model.Application;
import com.nexusgov.identity.model.AuditLog;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.repository.AccountDeletionRequestRepository;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin service — audit logs, account-deletion governance.
 * Java port of the Node.js admin-management module.
 */
@Service
public class AdminService {

    private final AuditLogRepository auditLogRepository;
    private final AccountDeletionRequestRepository deletionRequestRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public AdminService(AuditLogRepository auditLogRepository,
                        AccountDeletionRequestRepository deletionRequestRepository,
                        ApplicationRepository applicationRepository,
                        UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.deletionRequestRepository = deletionRequestRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    // ── Audit logs ────────────────────────────────────────────────────────────

    public List<AdminDtos.LogDto> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc()
            .stream()
            .map(log -> {
                AdminDtos.LogDto dto = new AdminDtos.LogDto();
                dto.setLog_id(log.getLogId());
                User u = log.getUser();
                if (u != null) {
                    dto.setUser_id(u.getUserId());
                    dto.setUsername(u.getUsername());
                    dto.setRole(u.getRole() != null ? u.getRole().name() : null);
                }
                dto.setAction(log.getAction());
                dto.setDetails(log.getDetails());
                dto.setTimestamp(log.getTimestamp() != null ? log.getTimestamp().toString() : null);
                return dto;
            })
            .toList();
    }

    // ── Account deletion requests ─────────────────────────────────────────────

    public List<AdminDtos.DeletionRequestDto> getDeletionRequests() {
        List<AccountDeletionRequest> requests = new ArrayList<>(
            deletionRequestRepository.findAllByOrderByRequestedAtDesc());

        requests.sort(Comparator
            .comparingInt((AccountDeletionRequest r) ->
                r.getStatus() == AccountDeletionRequest.DeletionStatus.Pending ? 0 : 1)
            .thenComparing(Comparator.comparing(
                AccountDeletionRequest::getRequestedAt,
                Comparator.nullsLast(Comparator.reverseOrder()))));

        return requests.stream().map(this::toDeletionDto).toList();
    }

    private AdminDtos.DeletionRequestDto toDeletionDto(AccountDeletionRequest request) {
        AdminDtos.DeletionRequestDto dto = new AdminDtos.DeletionRequestDto();
        dto.setRequest_id(request.getRequestId());
        dto.setUser_id(request.getUserId());
        dto.setUsername(request.getUsername());
        dto.setEmail(request.getEmail());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus() != null ? request.getStatus().name() : null);
        dto.setAdmin_notes(request.getAdminNotes());
        dto.setRequested_at(request.getRequestedAt() != null ? request.getRequestedAt().toString() : null);
        dto.setProcessed_at(request.getProcessedAt() != null ? request.getProcessedAt().toString() : null);
        dto.setProcessed_by(request.getProcessedBy());

        userRepository.findById(request.getUserId())
            .ifPresent(user -> dto.setCurrent_user_fullname(user.getFullName()));
        if (request.getProcessedBy() != null) {
            userRepository.findById(request.getProcessedBy())
                .ifPresent(user -> dto.setProcessed_by_name(user.getFullName()));
        }

        List<Application> submitted = applicationRepository
            .findAllByApplicant_EmailIgnoreCaseOrderBySubmittedAtDesc(request.getEmail());
        dto.setApplication_count(submitted.size());
        List<Object> applications = new ArrayList<>();
        for (Application app : submitted) {
            Map<String, Object> appMap = new LinkedHashMap<>();
            appMap.put("application_id", app.getApplicationId());
            appMap.put("tracking_id", "NEX-2026-" + app.getApplicationId());
            appMap.put("status", app.getStatus() != null ? app.getStatus().getDbValue() : null);
            appMap.put("submitted_at", app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : null);
            applications.add(appMap);
        }
        dto.setSubmitted_applications(applications);
        return dto;
    }

    @Transactional
    public Map<String, Object> approveDeletionRequest(Long requestId, User admin) {
        AccountDeletionRequest request = deletionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Deletion request not found."));

        if (request.getStatus() != AccountDeletionRequest.DeletionStatus.Pending) {
            throw new RuntimeException("This deletion request has already been processed.");
        }

        request.setStatus(AccountDeletionRequest.DeletionStatus.Approved);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(admin != null ? admin.getUserId() : null);
        deletionRequestRepository.save(request);

        userRepository.deleteById(request.getUserId());

        if (admin != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(admin)
                .action("DELETION_APPROVED")
                .details("Account deletion approved and user account #" + request.getUserId() + " removed.")
                .build());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Account deletion request approved and user account deleted.");
        return response;
    }

    @Transactional
    public Map<String, Object> rejectDeletionRequest(Long requestId, AdminDtos.DeletionRejectRequest req, User admin) {
        AccountDeletionRequest request = deletionRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Deletion request not found."));

        if (request.getStatus() != AccountDeletionRequest.DeletionStatus.Pending) {
            throw new RuntimeException("This deletion request has already been processed.");
        }

        String notes = (req != null && req.getAdmin_notes() != null)
            ? req.getAdmin_notes()
            : "Account deletion request rejected by administration.";

        request.setStatus(AccountDeletionRequest.DeletionStatus.Rejected);
        request.setAdminNotes(notes);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(admin != null ? admin.getUserId() : null);
        deletionRequestRepository.save(request);

        if (admin != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(admin)
                .action("DELETION_REJECTED")
                .details("Account deletion request #" + requestId + " rejected. Notes: " + notes)
                .build());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Account deletion request rejected.");
        return response;
    }
}