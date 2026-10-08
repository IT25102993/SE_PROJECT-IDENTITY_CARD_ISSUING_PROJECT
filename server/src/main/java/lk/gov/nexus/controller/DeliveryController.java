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
@RequestMapping("/api/delivery")
public class DeliveryController {

    private static final List<String> DELIVERY_STATUSES =
            Arrays.asList("Dispatched", "Delivered", "Not-Delivered", "Canceled");

    private static final List<String> IN_FLIGHT_STATUSES =
            Arrays.asList("Dispatched", "Not-Delivered");

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private DispatchRecordRepository dispatchRecordRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;

    private Long parseId(String id) {
        if (id == null) return null;
        String clean = id.replaceAll("[^0-9]", "");
        return clean.isEmpty() ? null : Long.parseLong(clean);
    }

    private boolean canAccessPool() {
        String role = UserContext.getCurrentUserRole();
        if (role == null || role.trim().isEmpty()) return false;
        String normalized = role.trim().toLowerCase();
        return normalized.equals("delivery-manager") || normalized.equals("admin");
    }

    private Map<String, Object> forbidden() {
        return Map.of(
                "success", false,
                "message", "Forbidden. Action requires role: Delivery-Manager or Admin"
        );
    }

    // ── Get Delivery Job Pool ─────────────────────────────────────────────────
    // Every application Operation Management pushed out (Dispatched) plus the
    // ones Delivery Management already resolved.
    @GetMapping("/job-pool")
    public ResponseEntity<?> getJobPool(@RequestParam(value = "search", required = false) String search) {
        if (!canAccessPool()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(forbidden());

        try {
            List<Application> queue = applicationRepository.findByStatusInOrderByUpdatedAtDesc(DELIVERY_STATUSES);

            String term = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

            List<Map<String, Object>> jobs = new ArrayList<>();
            for (Application app : queue) {
                Map<String, Object> m = buildJob(app);
                if (term != null && !matchesSearch(m, term)) continue;
                jobs.add(m);
            }

            // Same ordering as the SQL: FIELD(status, Dispatched, Not-Delivered, Delivered, Canceled)
            jobs.sort((x, y) -> {
                int dx = DELIVERY_STATUSES.indexOf(String.valueOf(x.get("status")));
                int dy = DELIVERY_STATUSES.indexOf(String.valueOf(y.get("status")));
                if (dx != dy) return Integer.compare(dx, dy);
                return compareDates(y.get("updated_at"), x.get("updated_at"));
            });

            return ResponseEntity.ok(Map.of("success", true, "count", jobs.size(), "jobs", jobs));
        } catch (Exception error) {
            System.err.println("getDeliveryJobPool error: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", String.valueOf(error.getMessage())));
        }
    }

    private boolean matchesSearch(Map<String, Object> job, String term) {
        return contains(job.get("first_name"), term)
                || contains(job.get("last_name"), term)
                || contains(job.get("national_id_number"), term)
                || contains(String.valueOf(job.get("application_id")), term)
                || contains(job.get("tracking_id"), term);
    }

    private boolean contains(Object value, String term) {
        return value != null && String.valueOf(value).toLowerCase().contains(term);
    }

    private int compareDates(Object a, Object b) {
        if (a instanceof LocalDateTime la && b instanceof LocalDateTime lb) return la.compareTo(lb);
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        return String.valueOf(a).compareTo(String.valueOf(b));
    }

    private Map<String, Object> buildJob(Application app) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("application_id", app.getApplicationId());
        m.put("tracking_id", "NEX-2026-" + app.getApplicationId());
        m.put("status", app.getStatus());
        m.put("assigned_officer", app.getAssignedOfficer());
        m.put("remarks", app.getRemarks());
        m.put("application_type", app.getApplicationType());
        m.put("service_type", app.getServiceType());
        m.put("submitted_at", app.getSubmittedAt());
        m.put("updated_at", app.getUpdatedAt());

        if (app.getApplicantId() != null) {
            applicantRepository.findById(app.getApplicantId()).ifPresent(a -> {
                m.put("first_name", a.getFirstName());
                m.put("last_name", a.getLastName());
                m.put("fullNameEn", ((a.getFirstName() != null ? a.getFirstName() : "") + " "
                        + (a.getLastName() != null ? a.getLastName() : "")).trim());
                m.put("national_id_number", a.getNationalIdNumber());
                m.put("dob", a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
                m.put("gender", a.getGender());
                m.put("address", a.getAddress());
                m.put("phone_number", a.getPhoneNumber());
            });
        }

        identityCardRepository.findByApplicationId(app.getApplicationId())
                .ifPresent(card -> m.put("card_number", card.getCardNumber()));

        dispatchRecordRepository.findTopByApplicationIdOrderByDispatchedAtDesc(app.getApplicationId())
                .ifPresent(dr -> {
                    m.put("dispatch_method", dr.getDispatchMethod());
                    m.put("delivery_address", dr.getDeliveryAddress());
                    m.put("dispatched_at", dr.getDispatchedAt());
                });

        return m;
    }

    // ── Get Delivery Statistics (KPI cards) ───────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        if (!canAccessPool()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(forbidden());

        try {
            Map<String, Object> stats = new LinkedHashMap<>();
            long total = 0;
            for (String status : DELIVERY_STATUSES) {
                long count = applicationRepository.countByStatus(status);
                stats.put(status, count);
                total += count;
            }
            stats.put("total", total);

            long unclaimed = 0;
            for (Application app : applicationRepository.findByStatusInOrderByUpdatedAtDesc(IN_FLIGHT_STATUSES)) {
                if (app.getAssignedOfficer() == null || app.getAssignedOfficer().trim().isEmpty()) unclaimed++;
            }
            stats.put("unclaimed", unclaimed);

            return ResponseEntity.ok(Map.of("success", true, "stats", stats));
        } catch (Exception error) {
            System.err.println("getDeliveryStats error: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", String.valueOf(error.getMessage())));
        }
    }

    // ── Update Delivery Status ────────────────────────────────────────────────
    // Only moves an application between the four delivery statuses; it must
    // already be inside the delivery pipeline (dispatched by Operations).
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        if (!canAccessPool()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(forbidden());

        try {
            Long appId = parseId(id);
            if (appId == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));
            }

            String status = body.get("status");
            String remarks = body.get("remarks");

            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Status field is required."));
            }
            if (!DELIVERY_STATUSES.contains(status)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid delivery status. Allowed: " + String.join(", ", DELIVERY_STATUSES)
                ));
            }

            Optional<Application> appOpt = applicationRepository.findById(appId);
            if (appOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false, "message", "Application #" + id + " not found."
                ));
            }

            Application app = appOpt.get();
            if (!DELIVERY_STATUSES.contains(app.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Application #" + appId + " is currently '" + app.getStatus()
                                + "'. Only dispatched applications can be given a delivery status."
                ));
            }

            app.setStatus(status);
            if (body.containsKey("remarks")) app.setRemarks(remarks);
            app.setUpdatedAt(LocalDateTime.now());
            applicationRepository.save(app);

            Long staffId = UserContext.getCurrentUserId();
            User staff = UserContext.getCurrentUser();
            String staffName = staff != null && staff.getFullName() != null ? staff.getFullName() : "Delivery Manager";

            auditLogRepository.save(new AuditLog(staffId, "DELIVERY_STATUS_UPDATE",
                    "Application #" + appId + " delivery status set to '" + status + "' by " + staffName));
            backupService.triggerAutoBackup("Application #" + appId + " delivery status set to '" + status + "'");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Application #" + appId + " delivery status updated to " + status + "."
            ));
        } catch (Exception error) {
            System.err.println("updateDeliveryStatus error: " + error.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", String.valueOf(error.getMessage())));
        }
    }
}
