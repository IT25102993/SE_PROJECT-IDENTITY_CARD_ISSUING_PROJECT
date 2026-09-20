package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.OperationDtos;
import com.nexusgov.identity.model.*;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.DispatchRecordRepository;
import com.nexusgov.identity.repository.IdentityCardRepository;
import com.nexusgov.identity.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

/**
 * Operation service — print queue, status updates, dispatch and analytics.
 * Java port of the Node.js operation-management module.
 */
@Service
public class OperationService {

    private static final Set<ApplicationStatus> ALLOWED_STATUSES = Set.of(
        ApplicationStatus.Approved, ApplicationStatus.Rejected, ApplicationStatus.Processing,
        ApplicationStatus.Printed, ApplicationStatus.Issued, ApplicationStatus.Dispatched,
        ApplicationStatus.Verification_Passed, ApplicationStatus.Documents_Required
    );

    private final ApplicationRepository applicationRepository;
    private final IdentityCardRepository identityCardRepository;
    private final DispatchRecordRepository dispatchRecordRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public OperationService(ApplicationRepository applicationRepository,
                            IdentityCardRepository identityCardRepository,
                            DispatchRecordRepository dispatchRecordRepository,
                            AuditLogRepository auditLogRepository,
                            UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.identityCardRepository = identityCardRepository;
        this.dispatchRecordRepository = dispatchRecordRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public record DispatchResult(boolean success, String message, Long dispatchId) {}

    // ── Status update ─────────────────────────────────────────────────────────

    @Transactional
    public String updateStatus(Long id, String status, String remarks, User officer) {
        Application app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application #" + id + " not found."));

        ApplicationStatus parsed = ApplicationStatus.parse(status);
        if (parsed == null || !ALLOWED_STATUSES.contains(parsed)) {
            throw new RuntimeException("Invalid or disallowed status transition: " + status);
        }

        app.setStatus(parsed);
        if (remarks != null) app.setRemarks(remarks);
        app.setProcessedBy(officer);
        applicationRepository.save(app);

        if (officer != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(officer)
                .action("STATUS_UPDATED")
                .details("Application #" + id + " status updated to " + parsed.getDbValue() + ".")
                .build());
        }

        return "Application #" + id + " status updated to " + parsed.getDbValue() + ".";
    }

    // ── Print queue ───────────────────────────────────────────────────────────

    public List<OperationDtos.PrintQueueItemDto> getPrintQueue() {
        List<Application> apps = applicationRepository.findByStatusInOrderByUpdatedAtDesc(
            List.of(ApplicationStatus.Approved, ApplicationStatus.Processing, ApplicationStatus.Printed));
        return apps.stream()
            .sorted(Comparator.comparing(Application::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(app -> {
                OperationDtos.PrintQueueItemDto dto = new OperationDtos.PrintQueueItemDto();
                dto.setApplication_id(app.getApplicationId());
                dto.setTracking_id("NEX-2026-" + app.getApplicationId());
                dto.setStatus(app.getStatus() != null ? app.getStatus().getDbValue() : null);
                dto.setApplication_type(app.getApplicationType() != null ? app.getApplicationType().name() : null);

                Applicant a = app.getApplicant();
                if (a != null) {
                    dto.setFirst_name(a.getFirstName());
                    dto.setLast_name(a.getLastName());
                    dto.setFullNameEn(a.getFirstName() + " " + a.getLastName());
                    dto.setNational_id_number(a.getNationalIdNumber());
                    dto.setDob(a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
                    dto.setGender(a.getGender() != null ? a.getGender().name() : null);
                    dto.setAddress(a.getAddress());
                }

                identityCardRepository.findByApplication_ApplicationId(app.getApplicationId())
                    .ifPresent(card -> {
                        dto.setCard_number(card.getCardNumber());
                        dto.setIssue_date(card.getIssueDate() != null ? card.getIssueDate().toString() : null);
                        dto.setExpiry_date(card.getExpiryDate() != null ? card.getExpiryDate().toString() : null);
                    });

                return dto;
            })
            .toList();
    }

    // ── Dispatch ──────────────────────────────────────────────────────────────

    @Transactional
    public DispatchResult recordDispatch(Long applicationId, OperationDtos.DispatchRequest req, User officer) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application #" + applicationId + " not found."));

        Applicant applicant = app.getApplicant();

        String applicantName = (req != null && req.getApplicant_name() != null && !req.getApplicant_name().isBlank())
            ? req.getApplicant_name()
            : applicant.getFirstName() + " " + applicant.getLastName();
        String nic = (req != null && req.getNic_number() != null && !req.getNic_number().isBlank())
            ? req.getNic_number()
            : applicant.getNationalIdNumber();

        DispatchRecord.DispatchMethod method = DispatchRecord.DispatchMethod.Postal;
        if (req != null && req.getDispatch_method() != null) {
            for (DispatchRecord.DispatchMethod m : DispatchRecord.DispatchMethod.values()) {
                if (m.name().equalsIgnoreCase(req.getDispatch_method())) {
                    method = m;
                    break;
                }
            }
        }

        app.setStatus(ApplicationStatus.Dispatched);
        applicationRepository.save(app);

        DispatchRecord record = DispatchRecord.builder()
            .applicationId(applicationId)
            .trackingId("NEX-2026-" + applicationId)
            .applicantName(applicantName)
            .nicNumber(nic)
            .dispatchMethod(method)
            .deliveryAddress(req != null ? req.getDelivery_address() : null)
            .dispatchedBy(officer != null ? officer.getUserId() : null)
            .dispatchedByName(officer != null ? officer.getFullName() : null)
            .notes(req != null ? req.getNotes() : null)
            .build();
        record = dispatchRecordRepository.save(record);

        if (officer != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(officer)
                .action("APPLICATION_DISPATCHED")
                .details("Application #" + applicationId + " dispatched via " + method.name() + ".")
                .build());
        }

        return new DispatchResult(true, "Application #" + applicationId + " dispatched successfully.", record.getDispatchId());
    }

    // ── Dispatch records ──────────────────────────────────────────────────────

    public List<OperationDtos.DispatchRecordDto> getDispatchRecords() {
        return dispatchRecordRepository.findAllByOrderByDispatchedAtDesc()
            .stream()
            .map(record -> {
                OperationDtos.DispatchRecordDto dto = new OperationDtos.DispatchRecordDto();
                dto.setDispatch_id(record.getDispatchId());
                dto.setApplication_id(record.getApplicationId());
                dto.setTracking_id(record.getTrackingId());
                dto.setApplicant_name(record.getApplicantName());
                dto.setNic_number(record.getNicNumber());
                dto.setDispatch_method(record.getDispatchMethod() != null ? record.getDispatchMethod().name() : null);
                dto.setDelivery_address(record.getDeliveryAddress());
                dto.setDispatched_by(record.getDispatchedBy());
                dto.setDispatched_by_name(record.getDispatchedByName());
                dto.setDispatched_at(record.getDispatchedAt() != null ? record.getDispatchedAt().toString() : null);
                dto.setNotes(record.getNotes());
                return dto;
            })
            .toList();
    }

    // ── Analytics ─────────────────────────────────────────────────────────────

    public OperationDtos.Analytics getAnalytics() {
        return new OperationDtos.Analytics(
            applicationRepository.count(),
            applicationRepository.countByStatus(ApplicationStatus.Pending),
            applicationRepository.countByStatus(ApplicationStatus.Approved),
            applicationRepository.countByStatus(ApplicationStatus.Rejected),
            applicationRepository.countByBotVerifiedTrue(),
            userRepository.count()
        );
    }
}