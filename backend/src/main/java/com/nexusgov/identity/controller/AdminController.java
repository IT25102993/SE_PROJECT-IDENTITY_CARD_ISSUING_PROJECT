package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.AdminDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin REST Controller — exposes /api/admin/* endpoints (Admin only).
 * Mirrors the Node.js admin-management module.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── GET /api/admin/audit-logs ─────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> getAuditLogs() {
        List<AdminDtos.LogDto> logs = adminService.getAuditLogs();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", logs.size());
        response.put("logs", logs);
        return ResponseEntity.ok(response);
    }

    // ── GET /api/admin/deletion-requests ──────────────────────────────────────

    @GetMapping("/deletion-requests")
    public ResponseEntity<Map<String, Object>> getDeletionRequests() {
        List<AdminDtos.DeletionRequestDto> requests = adminService.getDeletionRequests();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", requests.size());
        response.put("requests", requests);
        return ResponseEntity.ok(response);
    }

    // ── PUT /api/admin/deletion-requests/:id/approve ──────────────────────────

    @PutMapping("/deletion-requests/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveDeletionRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok(adminService.approveDeletionRequest(id, currentUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── PUT /api/admin/deletion-requests/:id/reject ───────────────────────────

    @PutMapping("/deletion-requests/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectDeletionRequest(
            @PathVariable Long id,
            @RequestBody(required = false) AdminDtos.DeletionRejectRequest req,
            @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok(adminService.rejectDeletionRequest(id, req, currentUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }
}