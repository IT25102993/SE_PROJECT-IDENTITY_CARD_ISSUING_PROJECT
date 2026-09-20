package com.nexusgov.identity.service;

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

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Citizen account management — mirrors the Node.js checkUserDeletionEligibility /
 * deleteOwnAccount / requestAccountDeletion handlers under {@code /api/users}.
 */
@Service
public class UserAccountService {

    public record DeleteResult(boolean success, String message) {}
    public record RequestResult(boolean success, String message, Long requestId) {}

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final AccountDeletionRequestRepository deletionRequestRepository;
    private final AuditLogRepository auditLogRepository;

    public UserAccountService(UserRepository userRepository,
                              ApplicationRepository applicationRepository,
                              AccountDeletionRequestRepository deletionRequestRepository,
                              AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.deletionRequestRepository = deletionRequestRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // ── GET /api/users/deletion-status ─────────────────────────────────────────

    public Map<String, Object> getDeletionStatus(User currentUser) {
        List<Application> applications = applicationRepository
            .findAllByApplicant_EmailIgnoreCaseOrderBySubmittedAtDesc(currentUser.getEmail());

        boolean hasApplications = !applications.isEmpty();

        List<Map<String, Object>> appSummaries = new ArrayList<>();
        for (Application app : applications) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("application_id", app.getApplicationId());
            m.put("tracking_id", "NEX-2026-" + app.getApplicationId());
            m.put("application_type", app.getApplicationType() == null ? null : app.getApplicationType().name());
            m.put("status", app.getStatus() == null ? null : app.getStatus().getDbValue());
            m.put("submitted_at", app.getSubmittedAt() == null ? null : app.getSubmittedAt().toString());
            m.put("remarks", app.getRemarks());
            m.put("first_name", app.getApplicant().getFirstName());
            m.put("last_name", app.getApplicant().getLastName());
            m.put("national_id_number", app.getApplicant().getNationalIdNumber());
            appSummaries.add(m);
        }

        Map<String, Object> pending = deletionRequestRepository
            .findPendingRequest(currentUser.getUserId(), currentUser.getEmail(), AccountDeletionRequest.DeletionStatus.Pending)
            .map(this::pendingDto)
            .orElse(null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("hasApplications", hasApplications);
        response.put("applicationCount", applications.size());
        response.put("applications", appSummaries);
        response.put("canDirectDelete", !hasApplications);
        response.put("pendingRequest", pending);
        return response;
    }

    // ── DELETE /api/users/me ───────────────────────────────────────────────────

    @Transactional
    public DeleteResult deleteOwnAccount(User currentUser) {
        long appCount = applicationRepository
            .findAllByApplicant_EmailIgnoreCaseOrderBySubmittedAtDesc(currentUser.getEmail()).size();

        if (appCount > 0) {
            return new DeleteResult(false,
                "You have submitted applications on file. Please submit an account deletion request for administrative approval.");
        }

        auditLogRepository.save(AuditLog.builder()
            .user(currentUser).action("USER_DELETED_OWN_ACCOUNT")
            .details("User " + currentUser.getUsername() + " (" + currentUser.getEmail()
                + ") directly deleted their account (0 applications on file).")
            .build());

        userRepository.delete(currentUser);
        return new DeleteResult(true, "Your account has been deleted successfully.");
    }

    // ── POST /api/users/request-deletion ───────────────────────────────────────

    @Transactional
    public RequestResult requestAccountDeletion(User currentUser, String reason) {
        String normalizedReason = (reason == null || reason.isBlank())
            ? "Citizen requested account removal." : reason.trim();

        boolean pendingExists = deletionRequestRepository
            .findPendingRequest(currentUser.getUserId(), currentUser.getEmail(),
                AccountDeletionRequest.DeletionStatus.Pending)
            .isPresent();
        if (pendingExists) {
            return new RequestResult(false,
                "You already have a pending deletion request under administrative review.", null);
        }

        AccountDeletionRequest request = AccountDeletionRequest.builder()
            .userId(currentUser.getUserId())
            .username(currentUser.getUsername())
            .email(currentUser.getEmail())
            .reason(normalizedReason)
            .status(AccountDeletionRequest.DeletionStatus.Pending)
            .build();
        request = deletionRequestRepository.save(request);

        auditLogRepository.save(AuditLog.builder()
            .user(currentUser).action("ACCOUNT_DELETION_REQUESTED")
            .details("User " + currentUser.getUsername() + " requested account deletion. Reason: " + normalizedReason)
            .build());

        return new RequestResult(true,
            "Account deletion request submitted successfully. An administrator will review your application status before processing.",
            request.getRequestId());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Map<String, Object> pendingDto(AccountDeletionRequest r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("request_id", r.getRequestId());
        m.put("reason", r.getReason());
        m.put("status", r.getStatus() == null ? null : r.getStatus().name());
        m.put("requested_at", r.getRequestedAt() == null ? null : r.getRequestedAt().toString());
        m.put("admin_notes", r.getAdminNotes());
        return m;
    }
}