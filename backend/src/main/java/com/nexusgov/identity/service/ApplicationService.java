package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.ApplicationDtos;
import com.nexusgov.identity.model.*;
import com.nexusgov.identity.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * Application service — handles CRUD for ID card applications and NIC generation.
 * Java port of applicationController.js.
 */
@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository applicationRepository;
    private final ApplicantRepository applicantRepository;
    private final IdentityCardRepository identityCardRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    private final Random random = new Random();

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicantRepository applicantRepository,
                              IdentityCardRepository identityCardRepository,
                              AuditLogRepository auditLogRepository,
                              UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.applicantRepository = applicantRepository;
        this.identityCardRepository = identityCardRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    // ── NIC Generator ─────────────────────────────────────────────────────────

    /**
     * Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C).
     * Direct Java port of generateSriLankan12DigitNIC in applicationController.js.
     *
     * @param dobString Date of birth as "YYYY-MM-DD"
     * @param gender    "Male", "Female", or "Other"
     * @return 12-character NIC string
     */
    public String generateSriLankan12DigitNIC(String dobString, String gender) {
        LocalDate dob;
        try {
            dob = LocalDate.parse(dobString);
        } catch (Exception e) {
            dob = LocalDate.of(2005, 1, 1);
        }

        // 1. Year (YYYY - 4 digits)
        int yyyy = dob.getYear();

        // 2. Day of year (DDD - 3 digits); females add 500
        int dayOfYear = dob.getDayOfYear();
        String genderLower = (gender != null) ? gender.toLowerCase() : "";
        boolean isFemale = genderLower.contains("female");
        int dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
        String ddd = String.format("%03d", dddVal);

        // 3. Serial number (SSSS - 4 digits)
        int serialVal = 1000 + random.nextInt(9000);
        String ssss = String.format("%04d", serialVal);

        // 4. Check digit (C - 1 digit)
        String rawBase = yyyy + ddd + ssss;
        int checkSum = 0;
        for (int i = 0; i < rawBase.length(); i++) {
            checkSum += Character.getNumericValue(rawBase.charAt(i)) * (i + 1);
        }
        int c = checkSum % 10;

        return yyyy + ddd + ssss + c;
    }

    // ── Helper: Entity → DTO ──────────────────────────────────────────────────

    private ApplicationDtos.ApplicationDto toDto(Application app) {
        ApplicationDtos.ApplicationDto dto = new ApplicationDtos.ApplicationDto();
        dto.setApplication_id(app.getApplicationId());
        dto.setTracking_id("NEX-2026-" + app.getApplicationId());
        dto.setApplication_type(app.getApplicationType().name());
        dto.setStatus(app.getStatus().name());
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
        }

        if (app.getProcessedBy() != null) {
            dto.setProcessed_by_name(app.getProcessedBy().getFullName());
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

    // ── Create Application ────────────────────────────────────────────────────

    @Transactional
    public record CreateResult(boolean success, String message, Long applicationId, String trackingId) {}

    public CreateResult createApplication(ApplicationDtos.ApplicationRequest req, User currentUser) {
        if (req.getFirst_name() == null || req.getLast_name() == null ||
            req.getDob() == null || req.getGender() == null ||
            req.getAddress() == null || req.getPhone_number() == null) {
            return new CreateResult(false, "Missing required applicant fields.", null, null);
        }

        // Generate provisional NIC
        String officialNic = generateSriLankan12DigitNIC(req.getDob(), req.getGender());

        // Ensure uniqueness
        while (applicantRepository.existsByNationalIdNumber(officialNic)) {
            officialNic = generateSriLankan12DigitNIC(req.getDob(), req.getGender());
        }

        LocalDate dob;
        try {
            dob = LocalDate.parse(req.getDob());
        } catch (Exception e) {
            dob = LocalDate.of(2000, 1, 1);
        }

        Applicant applicant = Applicant.builder()
            .nationalIdNumber(officialNic)
            .firstName(req.getFirst_name())
            .lastName(req.getLast_name())
            .dateOfBirth(dob)
            .gender(Applicant.Gender.valueOf(req.getGender()))
            .address(req.getAddress())
            .phoneNumber(req.getPhone_number())
            .email(req.getEmail())
            .build();

        applicant = applicantRepository.save(applicant);

        String appType = req.getApplication_type() != null ? req.getApplication_type() : "New";
        Application application = Application.builder()
            .applicant(applicant)
            .applicationType(Application.ApplicationType.valueOf(appType))
            .status(Application.ApplicationStatus.Pending)
            .remarks("New citizen online submission.")
            .build();

        application = applicationRepository.save(application);

        // Audit log
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
            "NEX-2026-" + application.getApplicationId());
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

        // Update application status
        app.setStatus(Application.ApplicationStatus.Approved);
        app.setRemarks(remarks != null ? remarks : "Application approved.");
        app.setProcessedBy(officer);
        applicationRepository.save(app);

        // Update NIC on applicant
        applicant.setNationalIdNumber(generatedNic);
        applicantRepository.save(applicant);

        // Issue identity card
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

        // Use merge pattern for idempotency (ON DUPLICATE KEY equivalent)
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

        app.setStatus(Application.ApplicationStatus.Rejected);
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

        if (status != null) app.setStatus(Application.ApplicationStatus.valueOf(status));
        if (remarks != null) app.setRemarks(remarks);
        applicationRepository.save(app);

        return "Application #" + id + " status updated to " + status + ".";
    }

    // ── Delete Application ────────────────────────────────────────────────────

    @Transactional
    public String deleteApplication(Long id) {
        applicationRepository.deleteById(id);
        return "Application #" + id + " deleted successfully.";
    }
}
