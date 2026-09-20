package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.ApplicationDtos;
import com.nexusgov.identity.dto.DocumentDtos;
import com.nexusgov.identity.model.*;
import com.nexusgov.identity.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

/**
 * Application service — handles CRUD for ID card applications, NIC generation,
 * document storage and bot verification. Java port of applicationController.js.
 */
@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private static final Set<ApplicationStatus> ALLOWED_STATUSES = Set.of(
        ApplicationStatus.Approved, ApplicationStatus.Rejected, ApplicationStatus.Processing,
        ApplicationStatus.Printed, ApplicationStatus.Issued, ApplicationStatus.Dispatched,
        ApplicationStatus.Verification_Passed, ApplicationStatus.Documents_Required
    );

    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final IdentityCardRepository identityCardRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final BotVerificationService botVerificationService;
    private final DocumentStorageService documentStorageService;

    private final Random random = new Random();

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicantRepository applicantRepository,
                              IdentityCardRepository identityCardRepository,
                              AuditLogRepository auditLogRepository,
                              UserRepository userRepository,
                              DocumentRepository documentRepository,
                              BotVerificationService botVerificationService,
                              DocumentStorageService documentStorageService) {
        this.applicationRepository = applicationRepository;
        this.applicantRepository = applicantRepository;
        this.identityCardRepository = identityCardRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.botVerificationService = botVerificationService;
        this.documentStorageService = documentStorageService;
    }

    // ── NIC Generator ─────────────────────────────────────────────────────────

    /**
     * Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C).
     * Direct Java port of generateSriLankan12DigitNIC in applicationController.js.
     */
    public String generateSriLankan12DigitNIC(String dobString, String gender) {
        LocalDate dob;
        try {
            dob = LocalDate.parse(dobString);
        } catch (Exception e) {
            dob = LocalDate.of(2005, 1, 1);
        }

        int yyyy = dob.getYear();
        int dayOfYear = dob.getDayOfYear();
        String genderLower = (gender != null) ? gender.toLowerCase() : "";
        boolean isFemale = genderLower.contains("female");
        int dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
        String ddd = String.format("%03d", dddVal);

        int serialVal = 1000 + random.nextInt(9000);
        String ssss = String.format("%04d", serialVal);

        String rawBase = yyyy + ddd + ssss;
        int checkSum = 0;
        for (int i = 0; i < rawBase.length(); i++) {
            checkSum += Character.getNumericValue(rawBase.charAt(i)) * (i + 1);
        }
        int c = checkSum % 10;

        return yyyy + ddd + ssss + c;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Applicant.Gender parseGender(String gender) {
        if (gender == null) {
            return null;
        }
        for (Applicant.Gender g : Applicant.Gender.values()) {
            if (g.name().equalsIgnoreCase(gender)) {
                return g;
            }
        }
        return null;
    }

    private LocalDate parseDob(String dob) {
        try {
            return dob != null ? LocalDate.parse(dob) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String trackingId(Application app) {
        return "NEX-2026-" + app.getApplicationId();
    }

    private ApplicationDtos.ApplicationDto toDto(Application app) {
        ApplicationDtos.ApplicationDto dto = new ApplicationDtos.ApplicationDto();
        dto.setApplication_id(app.getApplicationId());
        dto.setTracking_id(trackingId(app));
        dto.setApplication_type(app.getApplicationType() != null ? app.getApplicationType().name() : null);
        dto.setApplication_reason(app.getApplicationReason());
        dto.setMarital_status(app.getMaritalStatus());
        dto.setService_type(app.getServiceType());
        dto.setStatus(app.getStatus() != null ? app.getStatus().getDbValue() : null);
        dto.setAssigned_officer(app.getAssignedOfficer());
        dto.setRemarks(app.getRemarks());
        dto.setSubmitted_at(app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : null);
        dto.setUpdated_at(app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : null);

        Applicant a = app.getApplicant();
        if (a != null) {
            dto.setFirst_name(a.getFirstName());
            dto.setLast_name(a.getLastName());
            dto.setFullNameEn(a.getFirstName() + " " + a.getLastName());
            dto.setNational_id_number(a.getNationalIdNumber());
            dto.setDob(a.getDateOfBirth() != null ? a.getDateOfBirth().toString() : null);
            dto.setGender(a.getGender() != null ? a.getGender().name() : null);
            dto.setAddress(a.getAddress());
            dto.setPhone(a.getPhoneNumber());
            dto.setEmail(a.getEmail());
            dto.setPhoto_path(a.getPhotoPath());
        }

        if (app.getProcessedBy() != null && app.getProcessedBy().getFullName() != null) {
            dto.setProcessed_by_name(app.getProcessedBy().getFullName());
        }

        dto.setBot_verified(app.getBotVerified());
        dto.setBot_score(app.getBotScore());
        dto.setBot_notes(app.getBotNotes());
        dto.setBot_verified_at(app.getBotVerifiedAt() != null ? app.getBotVerifiedAt().toString() : null);

        dto.setDocuments(
            documentRepository.findAllByApplication_ApplicationId(app.getApplicationId())
                .stream()
                .map(ApplicationService::toDocumentDto)
                .toList()
        );

        return dto;
    }

    private static DocumentDtos.DocumentDto toDocumentDto(Document doc) {
        DocumentDtos.DocumentDto dto = new DocumentDtos.DocumentDto();
        dto.setDocument_id(doc.getDocumentId());
        dto.setFile_name(doc.getFileName());
        dto.setFile_path(doc.getFilePath());
        dto.setDocument_type(doc.getDocumentType());
        dto.setFile_size(doc.getFileSize());
        dto.setUploaded_at(doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : null);
        Application app = doc.getApplication();
        if (app != null) {
            dto.setApplication_id(app.getApplicationId());
            dto.setTracking_id("NEX-2026-" + app.getApplicationId());
            dto.setApplication_status(app.getStatus() != null ? app.getStatus().getDbValue() : null);
            Applicant applicant = app.getApplicant();
            if (applicant != null) {
                dto.setApplicant_name(applicant.getFirstName() + " " + applicant.getLastName());
                dto.setNational_id_number(applicant.getNationalIdNumber());
            }
        }
        return dto;
    }

    // ── Get Applications ──────────────────────────────────────────────────────

    public List<ApplicationDtos.ApplicationDto> getApplications(String search) {
        List<Application> apps;
        if (search != null && !search.isBlank()) {
            apps = applicationRepository.searchApplications(search.trim());
        } else {
            apps = applicationRepository.findAllByOrderBySubmittedAtDesc();
        }
        return apps.stream().map(this::toDto).toList();
    }

    public ApplicationDtos.ApplicationDto getApplication(String id) {
        Long appId = DocumentService.parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found.");
        }
        return toDto(app);
    }

    // ── Create Application ────────────────────────────────────────────────────

    @Transactional
    public record CreateResult(boolean success, String message, Long applicationId,
                               String trackingId, Map<String, Object> botVerification) {}

    public CreateResult createApplication(ApplicationDtos.ApplicationRequest req, User currentUser) {
        if (req.getFirst_name() == null || req.getLast_name() == null ||
            req.getDob() == null || req.getGender() == null ||
            req.getAddress() == null || req.getPhone_number() == null) {
            return new CreateResult(false, "Missing required applicant fields.", null, null, null);
        }

        String officialNic = generateSriLankan12DigitNIC(req.getDob(), req.getGender());
        while (applicantRepository.existsByNationalIdNumber(officialNic)) {
            officialNic = generateSriLankan12DigitNIC(req.getDob(), req.getGender());
        }

        LocalDate dob = parseDob(req.getDob());
        if (dob == null) {
            dob = LocalDate.of(2000, 1, 1);
        }

        Applicant applicant = Applicant.builder()
            .nationalIdNumber(officialNic)
            .firstName(req.getFirst_name())
            .lastName(req.getLast_name())
            .dateOfBirth(dob)
            .gender(parseGender(req.getGender()) != null ? parseGender(req.getGender()) : Applicant.Gender.Other)
            .address(req.getAddress())
            .phoneNumber(req.getPhone_number())
            .email(req.getEmail())
            .build();

        applicant = applicantRepository.save(applicant);

        String appType = req.getApplication_type() != null ? req.getApplication_type() : "New";
        Application application = Application.builder()
            .applicant(applicant)
            .applicationType(Application.ApplicationType.valueOf(appType))
            .status(ApplicationStatus.Pending)
            .applicationReason(req.getApplication_reason())
            .maritalStatus(req.getMarital_status())
            .serviceType(req.getService_type())
            .remarks("New citizen online submission.")
            .build();

        application = applicationRepository.save(application);

        // ── Persist uploaded documents ─────────────────────────────────────
        if (req.getDocuments() != null) {
            for (ApplicationDtos.DocumentPayload payload : req.getDocuments()) {
                String type = payload.getDocument_type() != null ? payload.getDocument_type() : payload.getType();
                String name = payload.getFile_name() != null ? payload.getFile_name() : payload.getName();
                String data = payload.getFile_data() != null ? payload.getFile_data() : payload.getData();
                String url = payload.getUrl();
                String size = payload.getFile_size() != null ? payload.getFile_size() : payload.getSize();

                String path = null;
                if (data != null && !data.isBlank()) {
                    path = documentStorageService.saveDocumentFile(data, name != null ? name : "document.bin");
                }
                if (path == null && url != null && !url.isBlank()) {
                    path = url;
                }
                if (path == null) {
                    continue;
                }

                Document doc = Document.builder()
                    .application(application)
                    .documentType(type != null && !type.isBlank() ? type : "Birth Certificate")
                    .fileName(name != null && !name.isBlank() ? name : "birth_certificate.pdf")
                    .filePath(path)
                    .fileSize(size)
                    .build();
                documentRepository.save(doc);
            }
        }

        // ── Run automated bot verification ────────────────────────────────
        Map<String, Object> botMap = new LinkedHashMap<>();
        List<BotVerificationService.DocRef> docRefs = documentRepository
            .findAllByApplication_ApplicationId(application.getApplicationId())
            .stream()
            .map(d -> new BotVerificationService.DocRef(d.getDocumentType(), d.getFileName(), d.getFilePath(), null))
            .toList();

        BotVerificationService.BotResult bot = botVerificationService.evaluateBotVerification(
            req.getFirst_name(), req.getLast_name(), null,
            req.getDob(), req.getGender(), req.getAddress(), docRefs);

        application.setBotVerified(bot.passed());
        application.setBotScore(bot.score());
        application.setBotNotes(bot.notes());
        application.setBotVerifiedAt(LocalDateTime.now());
        ApplicationStatus botStatus = ApplicationStatus.parse(bot.status());
        if (botStatus != null) {
            application.setStatus(botStatus);
        }
        applicationRepository.save(application);

        botMap.put("passed", bot.passed());
        botMap.put("score", bot.score());
        botMap.put("status", bot.status());
        botMap.put("birthCertificateFound", bot.birthCertificateFound());
        botMap.put("matchDetails", bot.matchDetails());
        botMap.put("notes", bot.notes());

        if (currentUser != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(currentUser)
                .action("APPLICATION_CREATED")
                .details("Application #" + application.getApplicationId() + " created for " +
                    req.getFirst_name() + " " + req.getLast_name())
                .build());
        }

        return new CreateResult(true, "Application submitted successfully!",
            application.getApplicationId(),
            "NEX-2026-" + application.getApplicationId(),
            botMap);
    }

    // ── Update Application ────────────────────────────────────────────────────

    @Transactional
    public String updateApplication(String id, ApplicationDtos.UpdateApplicationRequest req, User currentUser) {
        Long appId = DocumentService.parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found.");
        }

        Applicant applicant = app.getApplicant();
        if (req.getFirst_name() != null) applicant.setFirstName(req.getFirst_name());
        if (req.getLast_name() != null) applicant.setLastName(req.getLast_name());
        if (req.getAddress() != null) applicant.setAddress(req.getAddress());
        if (req.getEmail() != null) applicant.setEmail(req.getEmail());
        String phone = req.getPhone_number() != null ? req.getPhone_number() : req.getPhone();
        if (phone != null) applicant.setPhoneNumber(phone);
        LocalDate dob = parseDob(req.getDob());
        if (dob != null) applicant.setDateOfBirth(dob);
        Applicant.Gender gender = parseGender(req.getGender());
        if (gender != null) applicant.setGender(gender);
        if (req.getApplication_type() != null) {
            app.setApplicationType(Application.ApplicationType.valueOf(req.getApplication_type()));
        }
        if (req.getAssigned_officer() != null) app.setAssignedOfficer(req.getAssigned_officer());
        String remarks = req.getRemarks() != null ? req.getRemarks() : req.getOfficerNotes();
        if (remarks != null) app.setRemarks(remarks);
        ApplicationStatus status = ApplicationStatus.parse(req.getStatus());
        if (status != null) app.setStatus(status);

        applicantRepository.save(applicant);
        applicationRepository.save(app);

        if (currentUser != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(currentUser)
                .action("APPLICATION_UPDATED")
                .details("Application #" + app.getApplicationId() + " updated by " + currentUser.getFullName())
                .build());
        }

        return "Application #" + app.getApplicationId() + " updated successfully.";
    }

    // ── Claim / Unclaim ───────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> claimApplication(String id, ApplicationDtos.ClaimRequest req, User currentUser) {
        Long appId = DocumentService.parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found.");
        }

        Map<String, Object> response = new LinkedHashMap<>();
        if (app.getAssignedOfficer() != null && !app.getAssignedOfficer().isBlank()) {
            response.put("success", false);
            response.put("message", "This application has already been claimed by " + app.getAssignedOfficer() + ".");
            return response;
        }

        String officerName = req != null && req.getOfficerName() != null && !req.getOfficerName().isBlank()
            ? req.getOfficerName()
            : (currentUser != null ? currentUser.getFullName() : "Officer");

        app.setAssignedOfficer(officerName);
        applicationRepository.save(app);

        if (currentUser != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(currentUser)
                .action("APPLICATION_CLAIMED")
                .details("Application #" + app.getApplicationId() + " claimed by " + officerName)
                .build());
        }

        response.put("success", true);
        response.put("message", "Application claimed successfully.");
        response.put("assigned_officer", officerName);
        return response;
    }

    @Transactional
    public String unclaimApplication(String id, User currentUser) {
        Long appId = DocumentService.parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found.");
        }
        app.setAssignedOfficer(null);
        applicationRepository.save(app);

        if (currentUser != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(currentUser)
                .action("APPLICATION_UNCLAIMED")
                .details("Application #" + app.getApplicationId() + " unclaimed by " + currentUser.getFullName())
                .build());
        }

        return "Application unclaimed successfully.";
    }

    // ── Approve Application ───────────────────────────────────────────────────

    @Transactional
    public record ApproveResult(boolean success, String message, String nicNumber) {}

    public ApproveResult approveApplication(Long id, String remarks, User officer) {
        Application app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application #" + id + " not found."));

        Applicant applicant = app.getApplicant();
        String generatedNic = generateSriLankan12DigitNIC(
            applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : "2005-01-01",
            applicant.getGender() != null ? applicant.getGender().name() : "Male"
        );

        app.setStatus(ApplicationStatus.Approved);
        app.setRemarks(remarks != null ? remarks : "Application approved.");
        app.setProcessedBy(officer);
        applicationRepository.save(app);

        applicant.setNationalIdNumber(generatedNic);
        applicantRepository.save(applicant);

        LocalDate today = LocalDate.now();
        IdentityCard card = IdentityCard.builder()
            .application(app)
            .applicant(applicant)
            .cardNumber(generatedNic)
            .issueDate(today)
            .expiryDate(today.plusYears(10))
            .status(IdentityCard.CardStatus.Active)
            .issuedBy(officer)
            .build();

        identityCardRepository.findByApplication_ApplicationId(id)
            .ifPresentOrElse(
                existing -> {
                    existing.setCardNumber(generatedNic);
                    identityCardRepository.save(existing);
                },
                () -> identityCardRepository.save(card)
            );

        if (officer != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(officer)
                .action("APPLICATION_APPROVED")
                .details("Application #" + id + " approved. Official 12-digit NIC " + generatedNic + " generated.")
                .build());
        }

        return new ApproveResult(true,
            "Application #" + id + " approved! Issued Official 12-Digit NIC Number: " + generatedNic,
            generatedNic);
    }

    // ── Reject Application ────────────────────────────────────────────────────

    @Transactional
    public String rejectApplication(Long id, String remarks, User officer) {
        Application app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application #" + id + " not found."));

        app.setStatus(ApplicationStatus.Rejected);
        app.setRemarks(remarks != null ? remarks : "Application rejected.");
        app.setProcessedBy(officer);
        applicationRepository.save(app);

        if (officer != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(officer)
                .action("APPLICATION_REJECTED")
                .details("Application #" + id + " rejected. Remarks: " + remarks)
                .build());
        }

        return "Application #" + id + " rejected.";
    }

    // ── Update Status ─────────────────────────────────────────────────────────

    @Transactional
    public String updateStatus(Long id, String status, String remarks) {
        Application app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application #" + id + " not found."));

        ApplicationStatus parsed = ApplicationStatus.parse(status);
        if (parsed == null || !ALLOWED_STATUSES.contains(parsed)) {
            throw new RuntimeException("Invalid or disallowed status transition: " + status);
        }

        app.setStatus(parsed);
        if (remarks != null) app.setRemarks(remarks);
        applicationRepository.save(app);

        return "Application #" + id + " status updated to " + parsed.getDbValue() + ".";
    }

    // ── Delete Application ────────────────────────────────────────────────────

    @Transactional
    public String deleteApplication(Long id) {
        identityCardRepository.findByApplication_ApplicationId(id)
            .ifPresent(identityCardRepository::delete);

        List<Document> docs = documentRepository.findAllByApplication_ApplicationId(id);
        if (!docs.isEmpty()) {
            documentRepository.deleteAll(docs);
        }

        applicationRepository.deleteById(id);
        return "Application #" + id + " deleted successfully.";
    }
}