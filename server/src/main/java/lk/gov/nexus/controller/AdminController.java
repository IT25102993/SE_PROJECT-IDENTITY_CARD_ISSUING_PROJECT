package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private AccountDeletionRequestRepository deletionRequestRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private BackupService backupService;

    // ── Get All Users ─────────────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "count", users.size(), "users", users));
    }

    // ── Register Staff Member ─────────────────────────────────────────────────
    @PostMapping("/register-staff")
    public ResponseEntity<?> registerStaff(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("full_name");
        String role = body.get("role");

        if (username == null || email == null || password == null || fullName == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username, email, password, full name, and role are required."));
        }

        List<String> allowedRoles = Arrays.asList("Admin", "Form-Officer", "Document-Officer", "Approver", "Operational");
        if (!allowedRoles.contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid staff role."));
        }

        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username or Email is already registered."));
        }

        User u = new User(username, passwordEncoder.encode(password), fullName, email, role);
        u = userRepository.save(u);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "ADMIN_CREATE_USER",
                "Admin created staff user: " + username + " (" + role + ")"));
        backupService.triggerAutoBackup("Staff user created: " + username);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Successfully registered new staff member: " + fullName + " (" + role + ")",
                "user", u
        ));
    }

    // ── Update User ───────────────────────────────────────────────────────────
    @RequestMapping(value = "/users/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> uOpt = userRepository.findById(id);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found"));
        }

        User u = uOpt.get();
        if (body.get("full_name") != null) u.setFullName(body.get("full_name"));
        if (body.get("email") != null) u.setEmail(body.get("email"));
        if (body.get("role") != null) u.setRole(body.get("role"));
        userRepository.save(u);

        backupService.triggerAutoBackup("User #" + id + " updated");
        return ResponseEntity.ok(Map.of("success", true, "message", "User #" + id + " updated successfully."));
    }

    // ── Delete User ───────────────────────────────────────────────────────────
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        backupService.triggerAutoBackup("User #" + id + " deleted");
        return ResponseEntity.ok(Map.of("success", true, "message", "User #" + id + " deleted successfully."));
    }

    // ── Get Audit Logs ────────────────────────────────────────────────────────
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findTop100ByOrderByTimestampDesc();
        for (AuditLog log : logs) {
            if (log.getUserId() != null) {
                userRepository.findById(log.getUserId()).ifPresent(u -> {
                    log.setUsername(u.getUsername());
                    log.setRole(u.getRole());
                });
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "count", logs.size(), "logs", logs));
    }

    // ── Get Account Deletion Requests ─────────────────────────────────────────
    @GetMapping("/deletion-requests")
    public ResponseEntity<?> getDeletionRequests() {
        List<AccountDeletionRequest> requests = deletionRequestRepository.findAllByOrderByRequestedAtDesc();

        for (AccountDeletionRequest req : requests) {
            if (req.getUserId() != null) {
                userRepository.findById(req.getUserId()).ifPresent(u -> req.setCurrentUserFullname(u.getFullName()));
            }
            if (req.getProcessedBy() != null) {
                userRepository.findById(req.getProcessedBy()).ifPresent(u -> req.setProcessedByName(u.getFullName()));
            }

            // Find citizen submitted applications
            List<Applicant> applicants = applicantRepository.findByEmail(req.getEmail());
            if (!applicants.isEmpty()) {
                List<Long> appIds = applicants.stream().map(Applicant::getApplicantId).toList();
                List<Application> apps = applicationRepository.findByApplicantIdIn(appIds);
                for (Application a : apps) {
                    a.setTrackingId("NEX-2026-" + a.getApplicationId());
                    applicantRepository.findById(a.getApplicantId()).ifPresent(applicant -> {
                        a.setFirstName(applicant.getFirstName());
                        a.setLastName(applicant.getLastName());
                        a.setFullNameEn(applicant.getFirstName() + " " + applicant.getLastName());
                        a.setNationalIdNumber(applicant.getNationalIdNumber());
                        a.setDob(applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : null);
                        a.setGender(applicant.getGender());
                        a.setPhoneNumber(applicant.getPhoneNumber());
                        a.setAddress(applicant.getAddress());
                    });
                    verificationRepository.findFirstByApplicationIdOrderByVerificationIdDesc(a.getApplicationId())
                            .ifPresent(v -> {
                                a.setBotVerified(v.getPassed());
                                a.setBotScore(v.getScore());
                            });
                }
                req.setSubmittedApplications(apps);
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "count", requests.size(), "requests", requests));
    }

    // ── Approve Deletion Request ──────────────────────────────────────────────
    @PutMapping("/deletion-requests/{id}/approve")
    public ResponseEntity<?> approveDeletionRequest(@PathVariable Long id) {
        Optional<AccountDeletionRequest> opt = deletionRequestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Deletion request not found."));
        }

        AccountDeletionRequest req = opt.get();
        if (!"Pending".equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Request is already " + req.getStatus()));
        }

        // Delete user
        if (req.getUserId() != null) {
            userRepository.deleteById(req.getUserId());
        }

        req.setStatus("Approved");
        req.setProcessedAt(LocalDateTime.now());
        req.setProcessedBy(UserContext.getCurrentUserId());
        deletionRequestRepository.save(req);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "ADMIN_APPROVE_ACCOUNT_DELETION",
                "Admin approved account deletion request #" + id + " for user " + req.getUsername() + " (" + req.getEmail() + "). User account removed."));
        backupService.triggerAutoBackup("Account deletion approved #" + id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Account deletion request #" + id + " approved. User account '" + req.getUsername() + "' has been deleted."
        ));
    }

    // ── Reject Deletion Request ───────────────────────────────────────────────
    @PutMapping("/deletion-requests/{id}/reject")
    public ResponseEntity<?> rejectDeletionRequest(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Optional<AccountDeletionRequest> opt = deletionRequestRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Deletion request not found."));
        }

        AccountDeletionRequest req = opt.get();
        if (!"Pending".equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Request is already " + req.getStatus()));
        }

        String notes = (body != null && body.get("admin_notes") != null) ? body.get("admin_notes") : "Account deletion request rejected by administration.";

        req.setStatus("Rejected");
        req.setAdminNotes(notes);
        req.setProcessedAt(LocalDateTime.now());
        req.setProcessedBy(UserContext.getCurrentUserId());
        deletionRequestRepository.save(req);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "ADMIN_REJECT_ACCOUNT_DELETION",
                "Admin rejected deletion request #" + id + " for user " + req.getUsername() + ". Reason: " + notes));
        backupService.triggerAutoBackup("Account deletion rejected #" + id);

        return ResponseEntity.ok(Map.of("success", true, "message", "Account deletion request #" + id + " rejected."));
    }
}
