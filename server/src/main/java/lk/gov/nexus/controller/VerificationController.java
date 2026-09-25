package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.BotVerificationEngine;
import lk.gov.nexus.util.NicGenerator;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;

    private Long parseId(String id) {
        if (id == null) return null;
        String clean = id.replaceAll("[^0-9]", "");
        return clean.isEmpty() ? null : Long.parseLong(clean);
    }

    // ── Trigger Bot Verification On-Demand ────────────────────────────────────
    @PostMapping({"/applications/{id}/bot-verify", "/{id}/bot-verify"})
    public ResponseEntity<?> triggerBotVerification(@PathVariable String id) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        Optional<Applicant> applicantOpt = applicantRepository.findById(app.getApplicantId());
        if (applicantOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Applicant not found"));

        Applicant applicant = applicantOpt.get();
        List<Document> docs = documentRepository.findByApplicationIdOrderByUploadedAtAsc(appId);

        BotVerificationEngine.BotResult botResult = BotVerificationEngine.evaluate(
                applicant.getFirstName(),
                applicant.getLastName(),
                applicant.getFirstName() + " " + applicant.getLastName(),
                applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : "",
                applicant.getGender(),
                applicant.getAddress(),
                docs
        );

        Verification ver = new Verification();
        ver.setApplicationId(app.getApplicationId());
        ver.setApplicantId(applicant.getApplicantId());
        ver.setMethod("AI-BOT");
        ver.setResult(botResult.passed ? "Verified" : "Flagged");
        ver.setPassed(botResult.passed ? 1 : 0);
        ver.setScore(botResult.score);
        ver.setNotes(botResult.notes);
        ver.setVerifiedBy(UserContext.getCurrentUserId());
        ver.setVerifiedAt(LocalDateTime.now());
        verificationRepository.save(ver);

        app.setStatus(botResult.status);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        backupService.triggerAutoBackup("Bot verification run for Application #" + appId);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", "Bot verification completed: " + botResult.status);
        res.put("botResult", botResult.toMap());
        return ResponseEntity.ok(res);
    }

    // ── Get Verification History for Application ──────────────────────────────
    @GetMapping({"/applications/{id}/verifications", "/{id}/verifications"})
    public ResponseEntity<?> getApplicationVerifications(@PathVariable String id) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        List<Verification> list = verificationRepository.findByApplicationIdOrderByVerificationIdDesc(appId);
        Optional<Application> appOpt = applicationRepository.findById(appId);
        String applicantName = "Unknown";
        if (appOpt.isPresent() && appOpt.get().getApplicantId() != null) {
            Optional<Applicant> applicantOpt = applicantRepository.findById(appOpt.get().getApplicantId());
            if (applicantOpt.isPresent()) {
                applicantName = applicantOpt.get().getFirstName() + " " + applicantOpt.get().getLastName();
            }
        }

        for (Verification v : list) {
            v.setTrackingId("NEX-2026-" + v.getApplicationId());
            v.setApplicantName(applicantName);
            if (v.getVerifiedBy() != null) {
                userRepository.findById(v.getVerifiedBy()).ifPresent(u -> v.setVerifiedByName(u.getFullName()));
            }
        }

        return ResponseEntity.ok(Map.of("success", true, "count", list.size(), "verifications", list));
    }

    // ── Approve Application ───────────────────────────────────────────────────
    @PutMapping({"/applications/{id}/approve", "/{id}/approve"})
    public ResponseEntity<?> approveApplication(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        String remarks = (body != null && body.get("remarks") != null) ? body.get("remarks") : "Application approved.";
        Long userId = UserContext.getCurrentUserId() != null ? UserContext.getCurrentUserId() : 1L;

        String dob = "2005-01-01";
        String gender = "Male";
        Optional<Applicant> applicantOpt = applicantRepository.findById(app.getApplicantId());
        if (applicantOpt.isPresent()) {
            Applicant applicant = applicantOpt.get();
            if (applicant.getDateOfBirth() != null) dob = applicant.getDateOfBirth().toString();
            if (applicant.getGender() != null) gender = applicant.getGender();
        }

        String officialNic = NicGenerator.generateSriLankan12DigitNIC(dob, gender);

        app.setStatus("Approved");
        app.setRemarks(remarks);
        app.setProcessedBy(userId);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        if (applicantOpt.isPresent()) {
            Applicant applicant = applicantOpt.get();
            applicant.setNationalIdNumber(officialNic);
            applicantRepository.save(applicant);

            IdentityCard card = identityCardRepository.findByApplicationId(appId).orElse(new IdentityCard());
            card.setApplicationId(appId);
            card.setApplicantId(applicant.getApplicantId());
            card.setCardNumber(officialNic);
            card.setIssueDate(LocalDate.now());
            card.setExpiryDate(LocalDate.now().plusYears(10));
            card.setStatus("Active");
            card.setIssuedBy(userId);
            identityCardRepository.save(card);
        }

        auditLogRepository.save(new AuditLog(userId, "APPLICATION_APPROVED",
                "Application #" + appId + " approved. Official 12-digit NIC " + officialNic + " generated."));
        backupService.triggerAutoBackup("Application #" + appId + " approved");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application #" + appId + " approved! Issued Official 12-Digit NIC Number: " + officialNic,
                "nicNumber", officialNic
        ));
    }

    // ── Reject Application ────────────────────────────────────────────────────
    @PutMapping({"/applications/{id}/reject", "/{id}/reject"})
    public ResponseEntity<?> rejectApplication(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        String remarks = (body != null && body.get("remarks") != null) ? body.get("remarks") : "Application rejected.";
        Long userId = UserContext.getCurrentUserId() != null ? UserContext.getCurrentUserId() : 1L;

        app.setStatus("Rejected");
        app.setRemarks(remarks);
        app.setProcessedBy(userId);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(userId, "APPLICATION_REJECTED",
                "Application #" + appId + " rejected. Reason: " + remarks));
        backupService.triggerAutoBackup("Application #" + appId + " rejected");

        return ResponseEntity.ok(Map.of("success", true, "message", "Application #" + appId + " rejected."));
    }
}
