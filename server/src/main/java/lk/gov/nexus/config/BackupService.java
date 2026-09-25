package lk.gov.nexus.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;

@Service
public class BackupService {

    private final Path backupDir;
    private final Path jsonBackupFile;
    private final Path sqlBackupFile;
    private final ObjectMapper objectMapper;

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private VerificationRepository verificationRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private IdentityCardRepository identityCardRepository;
    @Autowired private AccountDeletionRequestRepository deletionRequestRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    private final ScheduledExecutorService debounceExecutor = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> scheduledBackup = null;
    private String pendingAction = "Database state updated";

    public BackupService() {
        // Look for backup directory in project root or current directory
        Path p = Paths.get("..", "backup").toAbsolutePath().normalize();
        if (!Files.exists(p.getParent().resolve("identity_card_system.sql"))) {
            p = Paths.get("backup").toAbsolutePath().normalize();
        }
        this.backupDir = p;
        this.jsonBackupFile = backupDir.resolve("database_backup.json");
        this.sqlBackupFile = backupDir.resolve("database_backup.sql");

        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        try {
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }
        } catch (Exception ignored) {}
    }

    public synchronized void triggerAutoBackup(String actionDescription) {
        this.pendingAction = actionDescription != null ? actionDescription : "Database state updated";
        if (scheduledBackup != null && !scheduledBackup.isDone()) {
            scheduledBackup.cancel(false);
        }
        scheduledBackup = debounceExecutor.schedule(() -> {
            try {
                performBackup(pendingAction);
            } catch (Exception e) {
                System.err.println("[BACKUP NOTE] Auto-backup failed: " + e.getMessage());
            }
        }, 50, TimeUnit.MILLISECONDS);
    }

    public synchronized void performBackup(String actionDescription) {
        try {
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }

            Map<String, Object> backupData = new LinkedHashMap<>();
            backupData.put("version", "2.1");
            backupData.put("last_updated", LocalDateTime.now().toString());

            List<User> users = userRepository.findAll();
            List<Applicant> applicants = applicantRepository.findAll();
            List<Application> applications = applicationRepository.findAll();
            List<Verification> verifications = verificationRepository.findAll();
            List<Document> documents = documentRepository.findAll();
            List<IdentityCard> cards = identityCardRepository.findAll();
            List<AccountDeletionRequest> deletions = deletionRequestRepository.findAll();
            List<AuditLog> auditLogs = auditLogRepository.findTop100ByOrderByTimestampDesc();

            Map<String, Object> tables = new LinkedHashMap<>();
            tables.put("users", users);
            tables.put("applicants", applicants);
            tables.put("applications", applications);
            tables.put("verifications", verifications);
            tables.put("documents", documents);
            tables.put("identity_cards", cards);
            tables.put("account_deletion_requests", deletions);
            tables.put("audit_logs", auditLogs);
            backupData.put("tables", tables);

            // Read existing update history
            List<Map<String, String>> history = new ArrayList<>();
            if (Files.exists(jsonBackupFile)) {
                try {
                    JsonNode existingRoot = objectMapper.readTree(Files.readAllBytes(jsonBackupFile));
                    JsonNode histNode = existingRoot.get("update_history");
                    if (histNode != null && histNode.isArray()) {
                        for (JsonNode h : histNode) {
                            Map<String, String> item = new HashMap<>();
                            item.put("timestamp", h.has("timestamp") ? h.get("timestamp").asText() : "");
                            item.put("action", h.has("action") ? h.get("action").asText() : "");
                            history.add(item);
                        }
                    }
                } catch (Exception ignored) {}
            }

            Map<String, String> currentAction = new HashMap<>();
            currentAction.put("timestamp", LocalDateTime.now().toString());
            currentAction.put("action", actionDescription);
            history.add(currentAction);
            if (history.size() > 500) {
                history = history.subList(history.size() - 500, history.size());
            }
            backupData.put("update_history", history);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("total_users", users.size());
            summary.put("total_applicants", applicants.size());
            summary.put("total_applications", applications.size());
            summary.put("total_verifications", verifications.size());
            summary.put("total_documents", documents.size());
            summary.put("total_cards", cards.size());
            backupData.put("summary", summary);

            // 1. Write JSON backup
            objectMapper.writeValue(jsonBackupFile.toFile(), backupData);

            // 2. Generate SQL backup
            generateSqlBackup(backupData, users, applicants, applications, verifications, documents, cards);

            System.out.println("[INSTANT BACKUP] Database state backed up to " + jsonBackupFile.getFileName() + " (" + applications.size() + " applications, " + applicants.size() + " applicants). Action: " + actionDescription);
        } catch (Exception e) {
            System.err.println("[BACKUP ERROR] Error creating backup: " + e.getMessage());
        }
    }

    private void generateSqlBackup(Map<String, Object> backupData, List<User> users, List<Applicant> applicants,
                                   List<Application> applications, List<Verification> verifications,
                                   List<Document> documents, List<IdentityCard> cards) {
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("-- =============================================================\n");
            sql.append("-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP\n");
            sql.append("-- Generated / Synced: ").append(backupData.get("last_updated")).append("\n");
            sql.append("-- =============================================================\n\n");
            sql.append("SET FOREIGN_KEY_CHECKS = 0;\n\n");

            for (User u : users) {
                sql.append("INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (")
                        .append(u.getUserId()).append(", '")
                        .append(escapeSql(u.getUsername())).append("', '")
                        .append(escapeSql(u.getPasswordHash())).append("', '")
                        .append(escapeSql(u.getFullName())).append("', '")
                        .append(escapeSql(u.getEmail())).append("', '")
                        .append(escapeSql(u.getRole())).append("', NOW());\n");
            }

            for (Applicant a : applicants) {
                sql.append("INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`, `registered_at`) VALUES (")
                        .append(a.getApplicantId()).append(", '")
                        .append(escapeSql(a.getNationalIdNumber())).append("', '")
                        .append(escapeSql(a.getFirstName())).append("', '")
                        .append(escapeSql(a.getLastName())).append("', '")
                        .append(a.getDateOfBirth() != null ? a.getDateOfBirth() : "2005-01-01").append("', '")
                        .append(escapeSql(a.getGender())).append("', '")
                        .append(escapeSql(a.getAddress())).append("', '")
                        .append(escapeSql(a.getPhoneNumber())).append("', '")
                        .append(escapeSql(a.getEmail())).append("', NOW()) ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);\n");
            }

            for (Application app : applications) {
                sql.append("INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `assigned_officer`, `application_reason`, `marital_status`, `service_type`, `remarks`, `submitted_at`) VALUES (")
                        .append(app.getApplicationId()).append(", ")
                        .append(app.getApplicantId()).append(", '")
                        .append(escapeSql(app.getApplicationType())).append("', '")
                        .append(escapeSql(app.getStatus())).append("', ")
                        .append(app.getAssignedOfficer() != null ? "'" + escapeSql(app.getAssignedOfficer()) + "'" : "NULL").append(", '")
                        .append(escapeSql(app.getApplicationReason())).append("', '")
                        .append(escapeSql(app.getMaritalStatus())).append("', '")
                        .append(escapeSql(app.getServiceType())).append("', '")
                        .append(escapeSql(app.getRemarks())).append("', NOW()) ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);\n");
            }

            sql.append("\nSET FOREIGN_KEY_CHECKS = 1;\n");
            Files.writeString(sqlBackupFile, sql.toString());
        } catch (Exception ignored) {}
    }

    private String escapeSql(String str) {
        if (str == null) return "";
        return str.replace("'", "''");
    }

    public boolean restoreFromBackupIfEmpty() {
        if (!Files.exists(jsonBackupFile)) {
            System.out.println("[BACKUP SERVICE] Initializing fresh state (no prior backup file found).");
            return false;
        }

        try {
            long existingApps = applicationRepository.count();
            if (existingApps > 0) {
                System.out.println("[BACKUP SERVICE] Database already contains " + existingApps + " applications. Skipping restore.");
                return false;
            }

            JsonNode root = objectMapper.readTree(Files.readAllBytes(jsonBackupFile));
            JsonNode tables = root.get("tables");
            if (tables == null) return false;

            System.out.println("[BACKUP RESTORE] Populating database from backup file...");

            // 1. Restore Users
            JsonNode usersNode = tables.get("users");
            if (usersNode != null && usersNode.isArray()) {
                for (JsonNode u : usersNode) {
                    String username = u.has("username") ? u.get("username").asText() : "";
                    if (!userRepository.existsByUsername(username)) {
                        User user = new User();
                        if (u.has("user_id")) user.setUserId(u.get("user_id").asLong());
                        user.setUsername(username);
                        user.setPasswordHash(u.has("password_hash") ? u.get("password_hash").asText() : "$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy");
                        user.setFullName(u.has("full_name") ? u.get("full_name").asText() : "System User");
                        user.setEmail(u.has("email") ? u.get("email").asText() : username + "@nexusgov.lk");
                        user.setRole(u.has("role") ? u.get("role").asText() : "Citizen");
                        userRepository.save(user);
                    }
                }
            }

            // 2. Restore Applicants
            JsonNode applicantsNode = tables.get("applicants");
            if (applicantsNode != null && applicantsNode.isArray()) {
                for (JsonNode a : applicantsNode) {
                    Applicant app = new Applicant();
                    if (a.has("applicant_id")) app.setApplicantId(a.get("applicant_id").asLong());
                    app.setNationalIdNumber(a.has("national_id_number") ? a.get("national_id_number").asText() : null);
                    app.setFirstName(a.has("first_name") ? a.get("first_name").asText() : "");
                    app.setLastName(a.has("last_name") ? a.get("last_name").asText() : "");
                    String dobStr = a.has("date_of_birth") ? a.get("date_of_birth").asText() : "2005-01-01";
                    try { app.setDateOfBirth(LocalDate.parse(dobStr.substring(0, 10))); } catch (Exception e) { app.setDateOfBirth(LocalDate.of(2005, 1, 1)); }
                    app.setGender(a.has("gender") ? a.get("gender").asText() : "Male");
                    app.setAddress(a.has("address") ? a.get("address").asText() : "");
                    app.setPhoneNumber(a.has("phone_number") ? a.get("phone_number").asText() : "+94 77 123 4567");
                    app.setEmail(a.has("email") ? a.get("email").asText() : null);
                    app.setPhotoPath(a.has("photo_path") ? a.get("photo_path").asText() : null);
                    applicantRepository.save(app);
                }
            }

            // 3. Restore Applications
            JsonNode appsNode = tables.get("applications");
            if (appsNode != null && appsNode.isArray()) {
                for (JsonNode appNode : appsNode) {
                    Application app = new Application();
                    if (appNode.has("application_id")) app.setApplicationId(appNode.get("application_id").asLong());
                    app.setApplicantId(appNode.has("applicant_id") ? appNode.get("applicant_id").asLong() : 1L);
                    app.setApplicationType(appNode.has("application_type") ? appNode.get("application_type").asText() : "New");
                    app.setStatus(appNode.has("status") ? appNode.get("status").asText() : "Pending");
                    app.setAssignedOfficer(appNode.has("assigned_officer") && !appNode.get("assigned_officer").isNull() ? appNode.get("assigned_officer").asText() : null);
                    app.setApplicationReason(appNode.has("application_reason") ? appNode.get("application_reason").asText() : "G.C.E O/L");
                    app.setMaritalStatus(appNode.has("marital_status") ? appNode.get("marital_status").asText() : "Single");
                    app.setServiceType(appNode.has("service_type") ? appNode.get("service_type").asText() : "Normal");
                    app.setRemarks(appNode.has("remarks") ? appNode.get("remarks").asText() : "");
                    applicationRepository.save(app);
                }
            }

            // 4. Restore Verifications
            JsonNode verifsNode = tables.get("verifications");
            if (verifsNode != null && verifsNode.isArray()) {
                for (JsonNode v : verifsNode) {
                    Verification ver = new Verification();
                    if (v.has("verification_id")) ver.setVerificationId(v.get("verification_id").asLong());
                    ver.setApplicationId(v.has("application_id") ? v.get("application_id").asLong() : 1L);
                    ver.setApplicantId(v.has("applicant_id") ? v.get("applicant_id").asLong() : 1L);
                    ver.setMethod(v.has("method") ? v.get("method").asText() : "AI-BOT");
                    ver.setResult(v.has("result") ? v.get("result").asText() : "Verified");
                    ver.setPassed(v.has("passed") ? v.get("passed").asInt() : 1);
                    ver.setScore(v.has("score") ? v.get("score").asInt() : 90);
                    ver.setNotes(v.has("notes") ? v.get("notes").asText() : "");
                    verificationRepository.save(ver);
                }
            }

            // 5. Restore Documents
            JsonNode docsNode = tables.get("documents");
            if (docsNode != null && docsNode.isArray()) {
                for (JsonNode d : docsNode) {
                    Document doc = new Document();
                    if (d.has("document_id")) doc.setDocumentId(d.get("document_id").asLong());
                    doc.setApplicationId(d.has("application_id") ? d.get("application_id").asLong() : 1L);
                    doc.setDocumentType(d.has("document_type") ? d.get("document_type").asText() : "Supporting Document");
                    doc.setFileName(d.has("file_name") ? d.get("file_name").asText() : "document.pdf");
                    doc.setFilePath(d.has("file_path") ? d.get("file_path").asText() : "/uploads/documents/birth_certificate.pdf");
                    doc.setFileSize(d.has("file_size") ? d.get("file_size").asText() : "1.2 MB");
                    documentRepository.save(doc);
                }
            }

            // 6. Restore Identity Cards
            JsonNode cardsNode = tables.get("identity_cards");
            if (cardsNode != null && cardsNode.isArray()) {
                for (JsonNode c : cardsNode) {
                    IdentityCard card = new IdentityCard();
                    if (c.has("card_id")) card.setCardId(c.get("card_id").asLong());
                    card.setCardNumber(c.has("card_number") ? c.get("card_number").asText() : "200512345678");
                    card.setApplicationId(c.has("application_id") ? c.get("application_id").asLong() : 1L);
                    card.setApplicantId(c.has("applicant_id") ? c.get("applicant_id").asLong() : 1L);
                    card.setIssueDate(LocalDate.now());
                    card.setExpiryDate(LocalDate.now().plusYears(10));
                    card.setStatus(c.has("status") ? c.get("status").asText() : "Active");
                    identityCardRepository.save(card);
                }
            }

            System.out.println("[BACKUP RESTORE SUCCESS] Restored database successfully from backup JSON!");
            return true;
        } catch (Exception e) {
            System.err.println("[BACKUP RESTORE FAILED] " + e.getMessage());
            return false;
        }
    }
}
