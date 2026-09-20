package com.nexusgov.identity.config;

import com.nexusgov.identity.model.Applicant;
import com.nexusgov.identity.model.Application;
import com.nexusgov.identity.model.ApplicationStatus;
import com.nexusgov.identity.model.AuditLog;
import com.nexusgov.identity.model.DispatchRecord;
import com.nexusgov.identity.model.Document;
import com.nexusgov.identity.model.IdentityCard;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.repository.ApplicantRepository;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.DispatchRecordRepository;
import com.nexusgov.identity.repository.DocumentRepository;
import com.nexusgov.identity.repository.IdentityCardRepository;
import com.nexusgov.identity.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Seeds the baseline NexusGov demo data (the Java equivalent of the Node.js
 * seed script), used only when the database is empty and no backup exists.
 */
public class SeedService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final IdentityCardRepository identityCardRepository;
    private final DispatchRecordRepository dispatchRecordRepository;
    private final AuditLogRepository auditLogRepository;

    public SeedService(PasswordEncoder passwordEncoder,
                       UserRepository userRepository,
                       ApplicantRepository applicantRepository,
                       ApplicationRepository applicationRepository,
                       DocumentRepository documentRepository,
                       IdentityCardRepository identityCardRepository,
                       DispatchRecordRepository dispatchRecordRepository,
                       AuditLogRepository auditLogRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.applicantRepository = applicantRepository;
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.identityCardRepository = identityCardRepository;
        this.dispatchRecordRepository = dispatchRecordRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void seedBaseline() {
        String pwd = passwordEncoder.encode("#Thilina2005");

        // ── Users ─────────────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
            .username("admin").email("admin@nexusgov.lk").passwordHash(pwd)
            .fullName("System Administrator").role(User.UserRole.Admin).build());
        User thilinaAdmin = userRepository.save(User.builder()
            .username("thilina_admin").email("thilinasakalasooriya@gmail.com").passwordHash(pwd)
            .fullName("Thilina Sakalasooriya").role(User.UserRole.Admin).build());
        User formOfficer = userRepository.save(User.builder()
            .username("form_officer").email("form-officer@nexusgov.lk").passwordHash(pwd)
            .fullName("Form Handling Officer Perera").role(User.UserRole.FORM_OFFICER).build());
        User documentOfficer = userRepository.save(User.builder()
            .username("document_officer").email("document-officer@nexusgov.lk").passwordHash(pwd)
            .fullName("Document Handling Officer Silva").role(User.UserRole.DOCUMENT_OFFICER).build());
        User approver = userRepository.save(User.builder()
            .username("approver").email("approver@nexusgov.lk").passwordHash(pwd)
            .fullName("Senior Approver Fernando").role(User.UserRole.Approver).build());
        User operational = userRepository.save(User.builder()
            .username("operational").email("operational@nexusgov.lk").passwordHash(pwd)
            .fullName("Operations Officer Hamza").role(User.UserRole.Operational).build());
        User citizenThilina = userRepository.save(User.builder()
            .username("Citizen_Thilina").email("thilina.sakalasooriya@gmail.com").passwordHash(pwd)
            .fullName("Thilina Sakalasooriya").role(User.UserRole.Citizen).build());

        // ── Applicants ─────────────────────────────────────────────────────────
        Applicant thilina = applicantRepository.save(Applicant.builder()
            .nationalIdNumber("200116000789").firstName("Thilina").lastName("Sakalasooriya")
            .dateOfBirth(LocalDate.of(2001, 6, 9)).gender(Applicant.Gender.Male)
            .address("12 Temple Road, Kandy").phoneNumber("0712345678")
            .email("thilina.sakalasooriya@gmail.com").photoPath("uploads/citizen/thilina.jpg").build());
        Applicant kavindu = applicantRepository.save(Applicant.builder()
            .nationalIdNumber("200031800476").firstName("Kavindu").lastName("Perera")
            .dateOfBirth(LocalDate.of(2000, 11, 13)).gender(Applicant.Gender.Male)
            .address("45 Galle Road, Colombo 03").phoneNumber("0778901234")
            .email("kavindu.perera@gmail.com").build());
        Applicant nimesh = applicantRepository.save(Applicant.builder()
            .nationalIdNumber("199887500432").firstName("Nimesh").lastName("Nannamuga")
            .dateOfBirth(LocalDate.of(1998, 3, 29)).gender(Applicant.Gender.Male)
            .address("8 Lake Drive, Nuwara Eliya").phoneNumber("0765558899")
            .email("nimesh.nannamuga@gmail.com").build());

        // ── Applications ───────────────────────────────────────────────────────
        Application app1 = applicationRepository.save(Application.builder()
            .applicant(thilina).applicationType(Application.ApplicationType.New)
            .status(ApplicationStatus.Verification_Passed).botVerified(true).botScore(92)
            .botNotes("All documents recognized by the verification engine.")
            .processedBy(formOfficer).assignedOfficer("Form Handling Officer Perera")
            .applicationReason("G.C.E O/L").maritalStatus("Single").serviceType("Normal")
            .remarks("Documents verified. Waiting for senior approval.").build());

        Application app2 = applicationRepository.save(Application.builder()
            .applicant(thilina).applicationType(Application.ApplicationType.Replacement)
            .status(ApplicationStatus.Documents_Required).botVerified(false).botScore(61)
            .botNotes("Birth certificate is unclear.")
            .processedBy(documentOfficer).assignedOfficer("Document Handling Officer Silva")
            .applicationReason("Damaged original NIC").maritalStatus("Single").serviceType("Normal")
            .remarks("Birth certificate is unclear. Please resubmit a clear copy.").build());

        Application app3 = applicationRepository.save(Application.builder()
            .applicant(kavindu).applicationType(Application.ApplicationType.New)
            .status(ApplicationStatus.Approved).botVerified(true).botScore(88)
            .botNotes("Identity verification passed.")
            .processedBy(approver).assignedOfficer("Senior Approver Fernando")
            .applicationReason("G.C.E O/L").maritalStatus("Single").serviceType("Normal")
            .remarks("Approved by Senior Approver. Sent for card printing.").build());

        Application app4 = applicationRepository.save(Application.builder()
            .applicant(nimesh).applicationType(Application.ApplicationType.Renewal)
            .status(ApplicationStatus.Dispatched).botVerified(true).botScore(85)
            .botNotes("Renewal request processed successfully.")
            .processedBy(operational).assignedOfficer("Operations Officer")
            .applicationReason("Card renewal").maritalStatus("Married").serviceType("Normal")
            .remarks("Card dispatched via courier.").build());

        // ── Documents ──────────────────────────────────────────────────────────
        documentRepository.save(Document.builder()
            .application(app1).documentType("Birth Certificate")
            .fileName("birth-certificate-thilina.pdf")
            .filePath("uploads/birth-certificate-thilina.pdf").fileSize("245 KB").build());
        documentRepository.save(Document.builder()
            .application(app2).documentType("Birth Certificate")
            .fileName("birth-certificate-thilina-resubmission.pdf")
            .filePath("uploads/birth-certificate-thilina-resubmission.pdf").fileSize("310 KB").build());
        documentRepository.save(Document.builder()
            .application(app3).documentType("Birth Certificate")
            .fileName("birth-certificate-kavindu.pdf")
            .filePath("uploads/birth-certificate-kavindu.pdf").fileSize("220 KB").build());
        documentRepository.save(Document.builder()
            .application(app4).documentType("Birth Certificate")
            .fileName("birth-certificate-nimesh.pdf")
            .filePath("uploads/birth-certificate-nimesh.pdf").fileSize("260 KB").build());
        documentRepository.save(Document.builder()
            .application(app4).documentType("School Leaving Certificate")
            .fileName("school-leaving-nimesh.pdf")
            .filePath("uploads/school-leaving-nimesh.pdf").fileSize("190 KB").build());

        // ── Identity Card + Dispatch record (for the dispatched application) ───
        identityCardRepository.save(IdentityCard.builder()
            .application(app4).applicant(nimesh)
            .cardNumber("200314000987")
            .issueDate(LocalDate.of(2026, 9, 10)).expiryDate(LocalDate.of(2036, 9, 10))
            .status(IdentityCard.CardStatus.Active).issuedBy(approver).build());

        dispatchRecordRepository.save(DispatchRecord.builder()
            .applicationId(app4.getApplicationId()).trackingId("NEX-2026-" + app4.getApplicationId())
            .applicantName("Nimesh Nannamuga").nicNumber(nimesh.getNationalIdNumber())
            .dispatchMethod(DispatchRecord.DispatchMethod.Courier)
            .deliveryAddress(nimesh.getAddress())
            .dispatchedBy(operational.getUserId()).dispatchedByName("Operations Officer")
            .notes("Dispatched via courier — 3 day delivery.").build());

        // ── Audit logs ─────────────────────────────────────────────────────────
        auditLogRepository.save(AuditLog.builder()
            .user(admin).action("SYSTEM_SEED")
            .details("NexusGov database seeded with baseline demo data by DatabaseBackupService.").build());
        auditLogRepository.save(AuditLog.builder()
            .user(formOfficer).action("USER_SEED")
            .details("Baseline seed account: Form Handling Officer Perera (Form-Officer).").build());
        auditLogRepository.save(AuditLog.builder()
            .user(approver).action("APPLICATION_APPROVED")
            .details("Baseline seed: Approved application NEX-2026-" + app3.getApplicationId()
                + " (Kavindu Perera).").build());
        auditLogRepository.save(AuditLog.builder()
            .user(citizenThilina).action("USER_SEED")
            .details("Baseline seed account: Citizen (Citizen).").build());
    }
}