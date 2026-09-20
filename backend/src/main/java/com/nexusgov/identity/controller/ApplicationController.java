package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.ApplicationDtos;
import com.nexusgov.identity.dto.DocumentDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.ApplicationService;
import com.nexusgov.identity.service.DocumentService;
import com.nexusgov.identity.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Application REST Controller — exposes /api/applications/* endpoints.
 * Mirrors applicationRoutes.js + applicationController.js in Node.js.
 */
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final DocumentService documentService;
    private final VerificationService verificationService;

    public ApplicationController(ApplicationService applicationService,
                                 DocumentService documentService,
                                 VerificationService verificationService) {
        this.applicationService = applicationService;
        this.documentService = documentService;
        this.verificationService = verificationService;
    }

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

    // ── GET /api/applications/:id (tracking status lookup) ───────────────────

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getApplication(@PathVariable String id) {
        try {
            ApplicationDtos.ApplicationDto app = applicationService.getApplication(id);
            return ResponseEntity.ok(Map.of("success", true, "application", app));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(e.getMessage()));
        }
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
        if (result.botVerification() != null) response.put("botVerification", result.botVerification());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── GET /api/applications/:id/documents ───────────────────────────────────

    @GetMapping("/{id}/documents")
    public ResponseEntity<Map<String, Object>> getApplicationDocuments(@PathVariable String id) {
        try {
            List<DocumentDtos.DocumentDto> docs = documentService.getApplicationDocuments(id);
            return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Application not found."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── POST /api/applications/:id/documents ──────────────────────────────────

    @PostMapping("/{id}/documents")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable String id,
            @RequestBody(required = false) DocumentDtos.DocumentUploadRequest req,
            @AuthenticationPrincipal User currentUser) {

        DocumentDtos.DocumentUploadRequest body = (req != null) ? req : new DocumentDtos.DocumentUploadRequest();
        DocumentService.UploadResult result = documentService.uploadDocument(id, body, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.document() != null) response.put("document", result.document());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ── POST /api/applications/:id/bot-verify ─────────────────────────────────

    @PostMapping("/{id}/bot-verify")
    public ResponseEntity<Map<String, Object>> triggerBotVerification(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {

        VerificationService.BotVerifyResult result = verificationService.triggerBotVerification(id, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.botResult() != null) response.put("botResult", result.botResult());

        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ── PUT /api/applications/:id (Officer / Admin / Approver) ────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FORM_OFFICER', 'ADMIN', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> updateApplication(
            @PathVariable String id,
            @RequestBody ApplicationDtos.UpdateApplicationRequest req,
            @AuthenticationPrincipal User currentUser) {
        try {
            String msg = applicationService.updateApplication(id, req, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── POST /api/applications/:id/claim ──────────────────────────────────────

    @PostMapping("/{id}/claim")
    @PreAuthorize("hasAnyRole('FORM_OFFICER', 'DOCUMENT_OFFICER', 'ADMIN', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> claimApplication(
            @PathVariable String id,
            @RequestBody(required = false) ApplicationDtos.ClaimRequest req,
            @AuthenticationPrincipal User currentUser) {
        try {
            return ResponseEntity.ok(applicationService.claimApplication(id, req, currentUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── POST /api/applications/:id/unclaim ────────────────────────────────────

    @PostMapping("/{id}/unclaim")
    @PreAuthorize("hasAnyRole('FORM_OFFICER', 'DOCUMENT_OFFICER', 'ADMIN', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> unclaimApplication(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        try {
            String msg = applicationService.unclaimApplication(id, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── PATCH / PUT /api/applications/:id/status ──────────────────────────────

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FORM_OFFICER', 'DOCUMENT_OFFICER', 'ADMIN', 'APPROVER', 'OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> patchStatus(
            @PathVariable Long id,
            @RequestBody ApplicationDtos.StatusUpdateRequest req) {
        try {
            String msg = applicationService.updateStatus(id, req.getStatus(), req.getRemarks());
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FORM_OFFICER', 'DOCUMENT_OFFICER', 'ADMIN', 'APPROVER', 'OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> putStatus(
            @PathVariable Long id,
            @RequestBody ApplicationDtos.StatusUpdateRequest req) {
        return patchStatus(id, req);
    }

    // ── PUT /api/applications/:id/approve ─────────────────────────────────────

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> approveApplication(
            @PathVariable String id,
            @RequestBody(required = false) ApplicationDtos.ApproveRequest req,
            @AuthenticationPrincipal User currentUser) {

        String remarks = (req != null) ? req.getRemarks() : "Application approved.";

        try {
            Long appId = com.nexusgov.identity.service.DocumentService.parseApplicationId(id);
            ApplicationService.ApproveResult result =
                applicationService.approveApplication(appId, remarks, currentUser);

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
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectApplication(
            @PathVariable String id,
            @RequestBody(required = false) ApplicationDtos.RejectRequest req,
            @AuthenticationPrincipal User currentUser) {

        String remarks = (req != null) ? req.getRemarks() : "Application rejected.";

        try {
            Long appId = com.nexusgov.identity.service.DocumentService.parseApplicationId(id);
            String msg = applicationService.rejectApplication(appId, remarks, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── DELETE /api/applications/:id (Admin only) ─────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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