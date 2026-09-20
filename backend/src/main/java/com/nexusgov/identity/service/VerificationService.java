package com.nexusgov.identity.service;

import com.nexusgov.identity.model.Application;
import com.nexusgov.identity.model.ApplicationStatus;
import com.nexusgov.identity.model.Applicant;
import com.nexusgov.identity.model.AuditLog;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Verification service — triggers the automated AI bot verification (parser)
 * and persists the result. Java port of the Node.js verification-management module.
 */
@Service
public class VerificationService {

    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;
    private final BotVerificationService botVerificationService;

    public VerificationService(ApplicationRepository applicationRepository,
                               DocumentRepository documentRepository,
                               AuditLogRepository auditLogRepository,
                               BotVerificationService botVerificationService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.auditLogRepository = auditLogRepository;
        this.botVerificationService = botVerificationService;
    }

    public record BotVerifyResult(boolean success, String message, Map<String, Object> botResult) {}

    @Transactional
    public BotVerifyResult triggerBotVerification(String id, User currentUser) {
        Long appId = DocumentService.parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            return new BotVerifyResult(false, "Application not found.", null);
        }

        List<BotVerificationService.DocRef> docRefs = documentRepository
            .findAllByApplication_ApplicationId(appId)
            .stream()
            .map(d -> new BotVerificationService.DocRef(d.getDocumentType(), d.getFileName(), d.getFilePath(), null))
            .toList();

        Applicant applicant = app.getApplicant();
        BotVerificationService.BotResult bot = botVerificationService.evaluateBotVerification(
            applicant.getFirstName(),
            applicant.getLastName(),
            null,
            applicant.getDateOfBirth() != null ? applicant.getDateOfBirth().toString() : null,
            applicant.getGender() != null ? applicant.getGender().name() : null,
            applicant.getAddress(),
            docRefs);

        app.setBotVerified(bot.passed());
        app.setBotScore(bot.score());
        app.setBotNotes(bot.notes());
        app.setBotVerifiedAt(LocalDateTime.now());
        ApplicationStatus parsed = ApplicationStatus.parse(bot.status());
        if (parsed != null) {
            app.setStatus(parsed);
        }
        applicationRepository.save(app);

        if (currentUser != null) {
            auditLogRepository.save(AuditLog.builder()
                .user(currentUser)
                .action("BOT_VERIFICATION")
                .details("Bot verification completed for application #" + appId + " (score " + bot.score() + ").")
                .build());
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("passed", bot.passed());
        map.put("score", bot.score());
        map.put("status", bot.status());
        map.put("birthCertificateFound", bot.birthCertificateFound());
        map.put("matchDetails", bot.matchDetails());
        map.put("notes", bot.notes());
        map.put("verifiedAt", app.getBotVerifiedAt() != null ? app.getBotVerifiedAt().toString() : null);

        return new BotVerifyResult(true, "Bot verification completed successfully.", map);
    }
}