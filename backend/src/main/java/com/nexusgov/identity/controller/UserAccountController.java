package com.nexusgov.identity.controller;

import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.UserAccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Citizen account endpoints — mirrors the Node.js user-management module
 * ({@code /api/users/*}). Complements the AuthController.
 */
@RestController
@RequestMapping("/api/users")
public class UserAccountController {

    private final UserAccountService userAccountService;

    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    // ── GET /api/users/deletion-status ─────────────────────────────────────────

    @GetMapping("/deletion-status")
    public ResponseEntity<Map<String, Object>> getDeletionStatus(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error("Unauthorized"));
        }
        return ResponseEntity.ok(userAccountService.getDeletionStatus(currentUser));
    }

    // ── DELETE /api/users/me ───────────────────────────────────────────────────

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, Object>> deleteOwnAccount(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error("Unauthorized"));
        }

        UserAccountService.DeleteResult result = userAccountService.deleteOwnAccount(currentUser);
        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── POST /api/users/request-deletion ───────────────────────────────────────

    @PostMapping("/request-deletion")
    public ResponseEntity<Map<String, Object>> requestAccountDeletion(
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error("Unauthorized"));
        }

        String reason = body == null ? null : (String) body.get("reason");
        UserAccountService.RequestResult result = userAccountService.requestAccountDeletion(currentUser, reason);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.requestId() != null) {
            response.put("requestId", result.requestId());
        }
        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.badRequest().body(response);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }
}