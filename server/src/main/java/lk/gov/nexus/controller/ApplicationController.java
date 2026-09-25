package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.BotVerificationEngine;
import lk.gov.nexus.util.DocumentStorageUtil;
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
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;

    private Long parseId(String id) {
        if (id == null) return null;
        String clean = id.replaceAll("[^0-9]", "");
        return clean.isEmpty() ? null : Long.parseLong(clean);
    }

    // ── Get All Applications ──────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getApplications(@RequestParam(required = false) String search) {
        List<Application> apps = applicationRepository.findAllByOrderBySubmittedAtDesc();

        // Populate joined data
        for (Application app : apps) {
            populateApplicationData(app);
        }

        // Filter if search query is present
        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim().toLowerCase();
            apps = apps.stream().filter(a -> {
                String tid = (a.getTrackingId() != null ? a.getTrackingId() : "").toLowerCase();
                String nic = (a.getNationalIdNumber() != null ? a.getNationalIdNumber() : "").toLowerCase();
                String name = (a.getFullNameEn() != null ? a.getFullNameEn() : "").toLowerCase();
                String idStr = String.valueOf(a.getApplicationId());
                return tid.contains(term) || nic.contains(term) || name.contains(term) || idStr.equals(term);
            }).toList();
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("count", apps.size());
        res.put("applications", apps);
        return ResponseEntity.ok(res);
    }

    private void populateApplicationData(Application app) {
        app.setTrackingId("NEX-2026-" + app.getApplicationId());

        if (app.getApplicantId() != null) {
            applicantRepository.findById(app.getApplicantId()).ifPresent(applicant -> {
                app.setFirstName(applicant.getFirstName());
                app.setLastName(applicant.getLastName());
                app.setFullNameEn(applicant.getFirstName() + " " + applicant.getLastName());
                app.setNationalIdNumber(applicant.getNationalIdNumber());
                app.setDob(applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : null);
                app.setGender(applicant.getGender());
                app.setAddress(applicant.getAddress());
                app.setPhone(applicant.getPhoneNumber());
                app.setPhoneNumber(applicant.getPhoneNumber());
                app.setEmail(applicant.getEmail());
                app.setPhotoPath(applicant.getPhotoPath());
            });
        }

        // Attached documents
        List<Document> docs = documentRepository.findByApplicationIdOrderByUploadedAtAsc(app.getApplicationId());
        app.setDocuments(docs);

        // Latest verification
        Optional<Verification> latestVer = verificationRepository
                .findFirstByApplicationIdOrderByVerificationIdDesc(app.getApplicationId());
        if (latestVer.isPresent()) {
            Verification v = latestVer.get();
            app.setBotVerified(v.getPassed());
            app.setBotScore(v.getScore());
            app.setBotNotes(v.getNotes());
            app.setBotVerifiedAt(v.getVerifiedAt() != null ? v.getVerifiedAt().toString() : null);
        }
    }

    // ── Create New Citizen Application ────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody Map<String, Object> body) {
        try {
            String firstName = (String) body.get("first_name");
            String lastName = (String) body.get("last_name");
            String dob = (String) body.get("dob");
            String gender = (String) body.get("gender");
            String address = (String) body.get("address");
            String phoneNumber = (String) body.get("phone_number");
            if (phoneNumber == null) phoneNumber = (String) body.get("phone");
            String email = (String) body.get("email");

            String maritalStatus = (String) body.get("marital_status");
            if (maritalStatus == null) maritalStatus = (String) body.get("civil_status");
            if (maritalStatus == null) maritalStatus = "Single";

            String appReason = (String) body.get("application_reason");
            if (appReason == null) appReason = "G.C.E O/L";
            if ("Other".equalsIgnoreCase(appReason) && body.get("other_reason") != null) {
                appReason = "Other: " + body.get("other_reason");
            }

            String serviceType = (String) body.get("service_type");
            if (serviceType == null) serviceType = "Normal";

            String appType = (String) body.get("application_type");
            if (appType == null) appType = "New";

            String photoUrl = (String) body.get("photo_url");

            if (firstName == null || lastName == null || dob == null || gender == null || address == null || phoneNumber == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required applicant fields."));
            }

            String officialNic = NicGenerator.generateSriLankan12DigitNIC(dob, gender);

            // Save Photo if base64 provided
            String savedPhotoPath = null;
            if (photoUrl != null && !photoUrl.trim().isEmpty()) {
                savedPhotoPath = DocumentStorageUtil.saveDocumentFile(photoUrl, "passport_photo_" + System.currentTimeMillis() + ".jpg");
            }

            // 1. Save Applicant
            Applicant applicant = new Applicant();
            applicant.setNationalIdNumber(officialNic);
            applicant.setFirstName(firstName);
            applicant.setLastName(lastName);
            try {
                applicant.setDateOfBirth(LocalDate.parse(dob.substring(0, 10)));
            } catch (Exception e) {
                applicant.setDateOfBirth(LocalDate.of(2005, 1, 1));
            }
            applicant.setGender(gender);
            applicant.setAddress(address);
            applicant.setPhoneNumber(phoneNumber);
            applicant.setEmail(email);
            applicant.setPhotoPath(savedPhotoPath);
            applicant = applicantRepository.save(applicant);

            // 2. Save Application
            Application app = new Application();
            app.setApplicantId(applicant.getApplicantId());
            app.setApplicationType(appType);
            app.setStatus("Pending");
            app.setRemarks("New citizen online submission.");
            app.setApplicationReason(appReason);
            app.setMaritalStatus(maritalStatus);
            app.setServiceType(serviceType);
            app = applicationRepository.save(app);

            // 3. Save Uploaded Documents
            List<Document> savedDocs = new ArrayList<>();
            Object rawDocs = body.get("documents");
            if (rawDocs instanceof List<?> docList) {
                for (Object item : docList) {
                    if (item instanceof Map<?, ?> m) {
                        String docType = (String) m.get("document_type");
                        if (docType == null) docType = (String) m.get("type");
                        if (docType == null) docType = "Supporting Document";

                        String fileName = (String) m.get("file_name");
                        if (fileName == null) fileName = (String) m.get("name");
                        if (fileName == null) fileName = "document.pdf";

                        String fileData = (String) m.get("file_data");
                        if (fileData == null) fileData = (String) m.get("data");
                        if (fileData == null) fileData = (String) m.get("url");

                        String fileSize = (String) m.get("file_size");
                        if (fileSize == null) fileSize = (String) m.get("size");

                        String savedPath = "/uploads/documents/birth_certificate.pdf";
                        if (fileData != null && !fileData.trim().isEmpty()) {
                            savedPath = DocumentStorageUtil.saveDocumentFile(fileData, fileName);
                        }

                        Document doc = new Document(app.getApplicationId(), docType, fileName, savedPath, fileSize);
                        doc = documentRepository.save(doc);
                        savedDocs.add(doc);
                    }
                }
            }

            // 4. Run Automated AI Bot Verification
            BotVerificationEngine.BotResult botResult = BotVerificationEngine.evaluate(
                    firstName, lastName, firstName + " " + lastName, dob, gender, address, savedDocs
            );

            // Save Verification Record
            Verification ver = new Verification();
            ver.setApplicationId(app.getApplicationId());
            ver.setApplicantId(applicant.getApplicantId());
            ver.setMethod("AI-BOT");
            ver.setResult(botResult.passed ? "Verified" : "Flagged");
            ver.setPassed(botResult.passed ? 1 : 0);
            ver.setScore(botResult.score);
            ver.setNotes(botResult.notes);
            ver.setVerifiedBy(UserContext.getCurrentUserId());
            verificationRepository.save(ver);

            // Update application status to bot status
            app.setStatus(botResult.status);
            applicationRepository.save(app);

            // Audit Log
            auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "APPLICATION_CREATED",
                    "Application #" + app.getApplicationId() + " created for " + firstName + " " + lastName +
                            ". Bot Verification: " + botResult.status + " (Score: " + botResult.score + "%)"));

            backupService.triggerAutoBackup("Application #" + app.getApplicationId() + " created");

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("message", "Application submitted successfully!");
            res.put("applicationId", app.getApplicationId());
            res.put("trackingId", "NEX-2026-" + app.getApplicationId());
            res.put("botVerification", botResult.toMap());

            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Update Application Details ────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Long appId = parseId(id);
        if (appId == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid application ID"));
        }

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application #" + id + " not found."));
        }

        Application app = appOpt.get();

        // Update Applicant details if provided
        if (app.getApplicantId() != null) {
            applicantRepository.findById(app.getApplicantId()).ifPresent(applicant -> {
                if (body.get("first_name") != null) applicant.setFirstName((String) body.get("first_name"));
                if (body.get("last_name") != null) applicant.setLastName((String) body.get("last_name"));
                if (body.get("dob") != null) {
                    try { applicant.setDateOfBirth(LocalDate.parse(((String) body.get("dob")).substring(0, 10))); } catch (Exception ignored) {}
                }
                if (body.get("gender") != null) applicant.setGender((String) body.get("gender"));
                if (body.get("address") != null) applicant.setAddress((String) body.get("address"));
                if (body.get("phone_number") != null) applicant.setPhoneNumber((String) body.get("phone_number"));
                else if (body.get("phone") != null) applicant.setPhoneNumber((String) body.get("phone"));
                if (body.get("email") != null) applicant.setEmail((String) body.get("email"));
                applicantRepository.save(applicant);
            });
        }

        // Update Application fields
        if (body.get("application_type") != null) app.setApplicationType((String) body.get("application_type"));
        if (body.get("remarks") != null) app.setRemarks((String) body.get("remarks"));
        else if (body.get("officerNotes") != null) app.setRemarks((String) body.get("officerNotes"));
        if (body.get("status") != null) app.setStatus((String) body.get("status"));
        if (body.get("assigned_officer") != null) app.setAssignedOfficer((String) body.get("assigned_officer"));

        app.setUpdatedAt(LocalDateTime.now());
        app = applicationRepository.save(app);

        String actorName = UserContext.getCurrentUser() != null ? UserContext.getCurrentUser().getFullName() : "Form Officer";
        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "APPLICATION_UPDATED",
                "Application #" + appId + " details updated by " + actorName));
        backupService.triggerAutoBackup("Application #" + appId + " updated");

        populateApplicationData(app);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application #" + id + " updated successfully.",
                "application", app
        ));
    }

    // ── Claim Application ─────────────────────────────────────────────────────
    @PostMapping("/{id}/claim")
    public ResponseEntity<?> claimApplication(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        String officerName = (body != null && body.get("officerName") != null) ? body.get("officerName") :
                (UserContext.getCurrentUser() != null ? UserContext.getCurrentUser().getFullName() : "Form Handling Officer Perera");

        app.setAssignedOfficer(officerName);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "JOB_CLAIMED",
                "Application #" + appId + " claimed into active pool by " + officerName));
        backupService.triggerAutoBackup("Application #" + appId + " claimed by " + officerName);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application #" + id + " claimed into your active workbench.",
                "assigned_officer", officerName
        ));
    }

    // ── Unclaim Application ───────────────────────────────────────────────────
    @PostMapping("/{id}/unclaim")
    public ResponseEntity<?> unclaimApplication(@PathVariable String id) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));

        Application app = appOpt.get();
        String officerName = UserContext.getCurrentUser() != null ? UserContext.getCurrentUser().getFullName() : "Form Officer";

        app.setAssignedOfficer(null);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "JOB_REMOVED_FROM_POOL",
                "Application #" + appId + " removed from job pool by " + officerName + " and returned to unassigned queue"));
        backupService.triggerAutoBackup("Application #" + appId + " unclaimed");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application #" + id + " removed from your job pool and returned to general queue."
        ));
    }

    // ── Update Application Status ─────────────────────────────────────────────
    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Status field is required."));
        }

        Optional<Application> appOpt = applicationRepository.findById(appId);
        if (appOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application #" + id + " not found."));

        Application app = appOpt.get();
        app.setStatus(status);
        if (body.get("remarks") != null) {
            app.setRemarks(body.get("remarks"));
        }
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "STATUS_UPDATED",
                "Application #" + appId + " status set to '" + status + "'"));
        backupService.triggerAutoBackup("Application #" + appId + " status set to " + status);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application #" + appId + " status updated to '" + status + "' successfully."
        ));
    }

    // ── Approve Application ───────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
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
    @PutMapping("/{id}/reject")
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

    // ── Delete Application (Admin Only) ───────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable String id) {
        Long appId = parseId(id);
        if (appId == null) return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid ID"));

        String role = UserContext.getCurrentUserRole();
        if (role != null && !role.equalsIgnoreCase("Admin")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Permission Denied: Officer roles cannot delete applications from the system. You can only remove applications from your job pool."
            ));
        }

        applicationRepository.deleteById(appId);
        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "APPLICATION_DELETED",
                "Application #" + appId + " permanently deleted from registry by Admin"));
        backupService.triggerAutoBackup("Application #" + appId + " deleted");

        return ResponseEntity.ok(Map.of("success", true, "message", "Application #" + id + " deleted successfully from system."));
    }

    // ── Application Documents Sub-routes ──────────────────────────────────────
    @GetMapping("/{id}/documents")
    public ResponseEntity<?> getApplicationDocuments(@PathVariable String id) {
        Long appId = parseId(id);
        List<Document> docs = appId != null ? documentRepository.findByApplicationIdOrderByUploadedAtAsc(appId) : Collections.emptyList();
        for (Document d : docs) {
            d.setTrackingId("NEX-2026-" + d.getApplicationId());
        }
        return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<?> uploadDocument(@PathVariable String id, @RequestBody Map<String, String> body) {
        Long appId = parseId(id);
        String docType = body.get("document_type");
        String fileName = body.get("file_name");
        String fileData = body.get("file_data");
        String fileSize = body.get("file_size");

        if (docType == null || fileName == null || fileData == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required document fields."));
        }

        String savedPath = DocumentStorageUtil.saveDocumentFile(fileData, fileName);
        Document doc = new Document(appId, docType, fileName, savedPath, fileSize != null ? fileSize : "Unknown");
        doc = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "DOCUMENT_UPLOADED",
                "Document '" + fileName + "' uploaded for Application #" + appId));
        backupService.triggerAutoBackup("Document uploaded for Application #" + appId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Document uploaded successfully.",
                "document", doc
        ));
    }
}
