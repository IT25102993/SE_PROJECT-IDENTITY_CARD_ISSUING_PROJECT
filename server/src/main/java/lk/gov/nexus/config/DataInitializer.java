package lk.gov.nexus.config;

import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.DocumentStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing NexusGov System Resources...");
        DocumentStorageUtil.initSampleDocuments();

        // 1. Try to restore from backup if database is empty
        boolean restored = backupService.restoreFromBackupIfEmpty();

        // 2. Ensure default staff accounts exist
        String defaultBcryptHash = passwordEncoder.encode("#Thilina2005");

        ensureUser("admin", "admin@nexusgov.lk", "System Administrator", "Admin", defaultBcryptHash);
        ensureUser("thilina_admin", "thilinasakalasooriya@gmail.com", "Thilina Sakalasooriya", "Admin", defaultBcryptHash);
        ensureUser("form_officer", "form-officer@nexusgov.lk", "Form Handling Officer Perera", "Form-Officer", defaultBcryptHash);
        ensureUser("document_officer", "document-officer@nexusgov.lk", "Document Handling Officer Silva", "Document-Officer", defaultBcryptHash);
        ensureUser("approver", "approver@nexusgov.lk", "Senior Approver Jayawardena", "Approver", defaultBcryptHash);
        ensureUser("operational", "operational@nexusgov.lk", "Operational Specialist Silva", "Operational", defaultBcryptHash);

        // 3. If still empty, seed baseline applications matching SQL schema
        if (applicationRepository.count() == 0) {
            System.out.println("Seeding baseline applications and registry records...");

            Applicant a1 = new Applicant();
            a1.setNationalIdNumber("200512345678");
            a1.setFirstName("Thilina");
            a1.setLastName("Sakalasooriya");
            a1.setDateOfBirth(LocalDate.of(2005, 1, 1));
            a1.setGender("Male");
            a1.setAddress("No. 12, Main Street, Malabe, Colombo");
            a1.setPhoneNumber("+94771234567");
            a1.setEmail("thilina.s@gmail.com");
            a1 = applicantRepository.save(a1);

            Application app1 = new Application();
            app1.setApplicantId(a1.getApplicantId());
            app1.setApplicationType("New");
            app1.setStatus("Verification-Passed");
            app1.setApplicationReason("G.C.E O/L");
            app1.setMaritalStatus("Single");
            app1.setServiceType("Normal");
            app1.setRemarks("All biometrics and Grama Niladhari verification approved.");
            app1 = applicationRepository.save(app1);

            Document d1 = new Document(app1.getApplicationId(), "Birth Certificate (Original Scan)", "birth_certificate.pdf", "/uploads/documents/birth_certificate.pdf", "1.42 MB");
            Document d2 = new Document(app1.getApplicationId(), "Grama Niladhari Certificate (Form DRP-1)", "sample_grama_cert.jpg", "/uploads/documents/sample_grama_cert.jpg", "890 KB");
            documentRepository.save(d1);
            documentRepository.save(d2);

            Verification v1 = new Verification();
            v1.setApplicationId(app1.getApplicationId());
            v1.setApplicantId(a1.getApplicantId());
            v1.setMethod("AI-BOT");
            v1.setResult("Verified");
            v1.setPassed(1);
            v1.setScore(96);
            v1.setNotes("Automated Bot Check: PASSED (Match Score: 96%). Official Birth Certificate confirmed for Thilina Sakalasooriya.");
            v1.setVerifiedBy(1L);
            verificationRepository.save(v1);

            IdentityCard c1 = new IdentityCard();
            c1.setCardNumber("200512345678");
            c1.setApplicationId(app1.getApplicationId());
            c1.setApplicantId(a1.getApplicantId());
            c1.setIssueDate(LocalDate.now());
            c1.setExpiryDate(LocalDate.now().plusYears(10));
            c1.setStatus("Active");
            c1.setIssuedBy(1L);
            identityCardRepository.save(c1);

            // Applicant 2
            Applicant a2 = new Applicant();
            a2.setNationalIdNumber("200456789012");
            a2.setFirstName("Kavindi");
            a2.setLastName("Perera");
            a2.setDateOfBirth(LocalDate.of(2004, 5, 14));
            a2.setGender("Female");
            a2.setAddress("No. 45, Temple Road, Kandy");
            a2.setPhoneNumber("+94719876543");
            a2.setEmail("kavindi.p@yahoo.com");
            a2 = applicantRepository.save(a2);

            Application app2 = new Application();
            app2.setApplicantId(a2.getApplicantId());
            app2.setApplicationType("New");
            app2.setStatus("Pending");
            app2.setApplicationReason("G.C.E O/L");
            app2.setMaritalStatus("Single");
            app2.setServiceType("1-Day");
            app2.setRemarks("Awaiting document review");
            app2 = applicationRepository.save(app2);

            Verification v2 = new Verification();
            v2.setApplicationId(app2.getApplicationId());
            v2.setApplicantId(a2.getApplicantId());
            v2.setMethod("AI-BOT");
            v2.setResult("Flagged");
            v2.setPassed(0);
            v2.setScore(63);
            v2.setNotes("Automated Bot Check: INCONCLUSIVE (Match Score: 63%). Discrepancies detected — forwarded for human officer review.");
            verificationRepository.save(v2);

            auditLogRepository.save(new AuditLog(1L, "SYSTEM_INIT", "Database schema initialized with baseline applications and accounts."));

            backupService.performBackup("Initial baseline sync");
        }
    }

    private void ensureUser(String username, String email, String fullName, String role, String passwordHash) {
        if (!userRepository.existsByUsername(username) && !userRepository.existsByEmail(email)) {
            User u = new User(username, passwordHash, fullName, email, role);
            userRepository.save(u);
            System.out.println("  ✓ Initialized default staff user: [" + role + "] " + username + " (" + email + ")");
        }
    }
}
