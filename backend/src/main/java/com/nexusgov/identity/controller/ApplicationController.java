package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.ApplicationDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Application REST Controller — exposes /api/applications/* endpoints.
 * Mirrors applicationRoutes.js + applicationController.js in Node.js.
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ── GET /api/applications?search=... ─────────────────────────────────────

    @GetMapping
    public ResponseEntity<Map<String, Object>> getApplications(
            @RequestParam(required = false) String search) {
        List<ApplicationDtos.ApplicationDto> apps = applicationService.getApplications(search);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", apps.size(),
            "applications", apps
        ));
    }

    // ── POST /api/applications ────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Map<String, Object>> createApplication(
            @RequestBody ApplicationDtos.ApplicationRequest req,
            @AuthenticationPrincipal User currentUser) {

        ApplicationService.CreateResult result = applicationService.createApplication(req, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.applicationId() != null) response.put("applicationId", result.applicationId());
        if (result.trackingId() != null) response.put("trackingId", result.trackingId());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── PUT /api/applications/:id/approve ─────────────────────────────────────

    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveApplication(
            @PathVariable Long id,
            @RequestBody(required = false) ApplicationDtos.ApproveRequest req,
            @AuthenticationPrincipal User currentUser) {

        String remarks = (req != null) ? req.getRemarks() : "Application approved.";

        try {
            ApplicationService.ApproveResult result =
                applicationService.approveApplication(id, remarks, currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.success());
            response.put("message", result.message());
            response.put("nicNumber", result.nicNumber());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── PUT /api/applications/:id/reject ──────────────────────────────────────

    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectApplication(
            @PathVariable Long id,
            @RequestBody(required = false) ApplicationDtos.RejectRequest req,
            @AuthenticationPrincipal User currentUser) {

        String remarks = (req != null) ? req.getRemarks() : "Application rejected.";

        try {
            String msg = applicationService.rejectApplication(id, remarks, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── PATCH /api/applications/:id/status ───────────────────────────────────

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody ApplicationDtos.StatusUpdateRequest req) {

        try {
            String msg = applicationService.updateStatus(id, req.getStatus(), req.getRemarks());
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── DELETE /api/applications/:id ──────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteApplication(@PathVariable Long id) {
        try {
            String msg = applicationService.deleteApplication(id);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }
}
