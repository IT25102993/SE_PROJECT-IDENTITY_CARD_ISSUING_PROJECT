package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.DocumentDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Document REST Controller — exposes /api/documents/* endpoints.
 * Mirrors the Node.js document-upload-management module.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // ── GET /api/documents?search=... ─────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> getAllDocuments(
            @RequestParam(required = false) String search) {
        List<DocumentDtos.DocumentDto> docs = documentService.getAllDocuments(search);
        return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
    }

    // ── GET /api/documents/application/:id ────────────────────────────────────

    @GetMapping("/application/{id}")
    public ResponseEntity<Map<String, Object>> getApplicationDocuments(@PathVariable String id) {
        try {
            List<DocumentDtos.DocumentDto> docs = documentService.getApplicationDocuments(id);
            return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(e.getMessage()));
        }
    }

    // ── POST /api/documents/applications/:id/documents ────────────────────────

    @PostMapping("/applications/{id}/documents")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable String id,
            @RequestBody(required = false) DocumentDtos.DocumentUploadRequest req,
            @AuthenticationPrincipal User currentUser) {

        DocumentService.UploadResult result =
            documentService.uploadDocument(id, req, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.document() != null) response.put("document", result.document());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ── DELETE /api/documents/:documentId ─────────────────────────────────────

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER', 'APPROVER')")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable Long documentId) {
        try {
            String msg = documentService.deleteDocument(documentId);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
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