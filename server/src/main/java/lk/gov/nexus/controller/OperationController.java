package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/operations")
public class OperationController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DispatchRecordRepository dispatchRecordRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;

    private Long parseId(String id) {
        if (id == null) return null;
        String clean = id.replaceAll("[^0-9]", "");
        return clean.isEmpty() ? null : Long.parseLong(clean);
    }

    // ── Get Operational Metrics & Analytics ───────────────────────────────────
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        long totalApps = applicationRepository.count();
        long pending = applicationRepository.countByStatus("Pending");
        long approved = applicationRepository.countByStatus("Approved");
        long rejected = applicationRepository.countByStatus("Rejected");
        long botVerified = verificationRepository.countByPassed(1);
        long totalUsers = userRepository.count();

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalApplications", totalApps);
        analytics.put("pending", pending);
        analytics.put("approved", approved);
        analytics.put("rejected", rejected);
        analytics.put("botVerified", botVerified);
        analytics.put("totalUsers", totalUsers);

        return ResponseEntity.ok(Map.of("success", true, "analytics", analytics));
    }

    // ── Get Print Queue (Approved, Processing, Printed) ───────────────────────
    @GetMapping("/print-queue")
    public ResponseEntity<?> getPrintQueue() {
        List<Application> queue = applicationRepository
                .findByStatusInOrderByUpdatedAtDesc(Arrays.asList("Approved", "Processing", "Printed"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Application app : queue) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("application_id", app.getApplicationId());
            m.put("tracking_id", "NEX-2026-" + app.getApplicationId());
            m.put("status", app.getStatus());
            m.put("application_type", app.getApplicationType());

            if (app.getApplicantId() != null) {
                applicantRepository.findById(app.getApplicantId()).ifPresent(applicant -> {
                    m.put("first_name", applicant.getFirstName());
                    m.put("last_name", applicant.getLastName());
                    m.put("fullNameEn", applicant.getFirstName() + " " + applicant.getLastName());
                    m.put("national_id_number", applicant.getNationalIdNumber());
                    m.put("dob", applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : null);
                    m.put("gender", applicant.getGender());
                    m.put("address", applicant.getAddress());
                });
            }

            identityCardRepository.findByApplicationId(app.getApplicationId()).ifPresent(card -> {
                m.put("card_number", card.getCardNumber());
                m.put("issue_date", card.getIssueDate() != null ? card.getIssueDate().toString() : null);
                m.put("expiry_date", card.getExpiryDate() != null ? card.getExpiryDate().toString() : null);
            });

            if (!m.containsKey("card_number")) {
                m.put("card_number", m.get("national_id_number") != null ? m.get("national_id_number") : "Pending Issuance");
            }

            result.add(m);
        }

        return ResponseEntity.ok(Map.of("success", true, "count", result.size(), "queue", result));
    }

    // ── Update Application Status ─────────────────────────────────────────────
    @RequestMapping(value = {"/applications/{id}/status", "/{id}/status"}, method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        String status = body.get("status");
        String remarks = body.get("remarks");

        if (status != null) app.setStatus(status);
        if (remarks != null) app.setRemarks(remarks);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "STATUS_UPDATE",
                "Application #" + appId + " status updated to " + (status != null ? status : "unchanged")));
        backupService.triggerAutoBackup("Application #" + appId + " status updated to " + status);

        return ResponseEntity.ok(Map.of("success", true, "message", "Application #" + appId + " status updated to " + status + "."));
    }

    // ── Record Dispatch ───────────────────────────────────────────────────────
    @PostMapping("/dispatch/{id}")
    public ResponseEntity<?> recordDispatch(@PathVariable String id, @RequestBody Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        String trackingId = "NEX-2026-" + appId;
        String applicantName = body.get("applicant_name") != null ? body.get("applicant_name") : "Unknown";
        String nicNumber = body.get("nic_number");
        String dispatchMethod = body.get("dispatch_method") != null ? body.get("dispatch_method") : "Postal";
        String deliveryAddress = body.get("delivery_address");
        String notes = body.get("notes");

        Long staffId = UserContext.getCurrentUserId();
        String staffName = UserContext.getCurrentUser() != null ? UserContext.getCurrentUser().getFullName() : "Operational Staff";

        // 1. Update application status to Dispatched
        applicationRepository.findById(appId).ifPresent(app -> {
            app.setStatus("Dispatched");
            app.setUpdatedAt(LocalDateTime.now());
            applicationRepository.save(app);
        });

        // 2. Insert dispatch record
        DispatchRecord record = new DispatchRecord();
        record.setApplicationId(appId);
        record.setTrackingId(trackingId);
        record.setApplicantName(applicantName);
        record.setNicNumber(nicNumber);
        record.setDispatchMethod(dispatchMethod);
        record.setDeliveryAddress(deliveryAddress);
        record.setDispatchedBy(staffId);
        record.setDispatchedByName(staffName);
        record.setDispatchedAt(LocalDateTime.now());
        record.setNotes(notes);
        dispatchRecordRepository.save(record);

        auditLogRepository.save(new AuditLog(staffId, "DISPATCH",
                "Application " + trackingId + " dispatched via " + dispatchMethod + " by " + staffName));
        backupService.triggerAutoBackup("Application " + trackingId + " dispatched");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application " + trackingId + " dispatched successfully via " + dispatchMethod + "."
        ));
    }

    // ── Get All Dispatch Records ──────────────────────────────────────────────
    @GetMapping("/dispatch-records")
    public ResponseEntity<?> getDispatchRecords() {
        List<DispatchRecord> list = dispatchRecordRepository.findAllByOrderByDispatchedAtDesc();
        return ResponseEntity.ok(Map.of("success", true, "count", list.size(), "records", list));
    }
}
