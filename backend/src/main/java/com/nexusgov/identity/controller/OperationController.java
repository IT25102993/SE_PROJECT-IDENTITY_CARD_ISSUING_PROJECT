package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.OperationDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.OperationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Operation REST Controller — print queue, status updates, dispatch and analytics.
 * Mirrors the Node.js operation-management module.
 */
@RestController
@RequestMapping("/api/operations")
public class OperationController {

    private final OperationService operationService;

    public OperationController(OperationService operationService) {
        this.operationService = operationService;
    }

    // ── GET /api/operations/print-queue ───────────────────────────────────────

    @GetMapping("/print-queue")
    @PreAuthorize("hasRole('OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> getPrintQueue() {
        List<OperationDtos.PrintQueueItemDto> queue = operationService.getPrintQueue();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", queue.size());
        response.put("queue", queue);
        return ResponseEntity.ok(response);
    }

    // ── GET /api/operations/dispatch-records ──────────────────────────────────

    @GetMapping("/dispatch-records")
    @PreAuthorize("hasRole('OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> getDispatchRecords() {
        List<OperationDtos.DispatchRecordDto> records = operationService.getDispatchRecords();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", records.size());
        response.put("records", records);
        return ResponseEntity.ok(response);
    }

    // ── PUT /api/operations/applications/:id/status ───────────────────────────

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody(required = false) OperationDtos.StatusUpdateRequest req,
            @AuthenticationPrincipal User currentUser) {
        try {
            String status = req != null ? req.getStatus() : null;
            String remarks = req != null ? req.getRemarks() : null;
            String msg = operationService.updateStatus(id, status, remarks, currentUser);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── POST /api/operations/applications/:id/dispatch ────────────────────────

    @PostMapping("/applications/{id}/dispatch")
    @PreAuthorize("hasRole('OPERATIONAL')")
    public ResponseEntity<Map<String, Object>> recordDispatch(
            @PathVariable Long id,
            @RequestBody(required = false) OperationDtos.DispatchRequest req,
            @AuthenticationPrincipal User currentUser) {
        try {
            OperationService.DispatchResult result = operationService.recordDispatch(id, req, currentUser);
            Map<String, Object> response = new HashMap<>();
            response.put("success", result.success());
            response.put("message", result.message());
            if (result.dispatchId() != null) response.put("dispatch_id", result.dispatchId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── GET /api/operations/analytics ─────────────────────────────────────────

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'FORM_OFFICER', 'DOCUMENT_OFFICER', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        OperationDtos.Analytics a = operationService.getAnalytics();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("totalApplications", a.totalApplications());
        response.put("pending", a.pending());
        response.put("approved", a.approved());
        response.put("rejected", a.rejected());
        response.put("botVerified", a.botVerified());
        response.put("totalUsers", a.totalUsers());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }
}