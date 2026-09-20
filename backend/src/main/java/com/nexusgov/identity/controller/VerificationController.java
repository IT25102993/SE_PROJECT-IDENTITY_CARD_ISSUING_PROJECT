package com.nexusgov.identity.controller;

import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Verification REST Controller — exposes /api/verification/* endpoints.
 * Mirrors the Node.js verification-management module.
 */
@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    // ── POST /api/verification/applications/:id/bot-verify ────────────────────

    @PostMapping("/applications/{id}/bot-verify")
    public ResponseEntity<Map<String, Object>> botVerifyApplication(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        return runBotVerification(id, currentUser);
    }

    // ── POST /api/verification/:id/bot-verify (alias) ─────────────────────────

    @PostMapping("/{id}/bot-verify")
    public ResponseEntity<Map<String, Object>> botVerifyApplicationShort(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        return runBotVerification(id, currentUser);
    }

    private ResponseEntity<Map<String, Object>> runBotVerification(String id, User currentUser) {
        VerificationService.BotVerifyResult result = verificationService.triggerBotVerification(id, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.botResult() != null) response.put("botResult", result.botResult());

        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}