package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.DocumentStorageUtil;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired private DocumentRepository documentRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private BackupService backupService;

    private Long parseId(String id) {
        if (id == null) return null;
        String clean = id.replaceAll("[^0-9]", "");
        return clean.isEmpty() ? null : Long.parseLong(clean);
    }

    // ── Get All Documents ─────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllDocuments(@RequestParam(required = false) String search) {
        List<Document> docs = documentRepository.findAllByOrderByUploadedAtDesc();

        for (Document d : docs) {
            d.setTrackingId("NEX-2026-" + d.getApplicationId());
            if (d.getApplicationId() != null) {
                applicationRepository.findById(d.getApplicationId()).ifPresent(app -> {
                    d.setApplicationStatus(app.getStatus());
                    if (app.getApplicantId() != null) {
                        applicantRepository.findById(app.getApplicantId()).ifPresent(applicant -> {
                            d.setApplicantName(applicant.getFirstName() + " " + applicant.getLastName());
                            d.setNationalIdNumber(applicant.getNationalIdNumber());
                        });
                    }
                });
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim().toLowerCase();
            docs = docs.stream().filter(d -> {
                String docType = (d.getDocumentType() != null ? d.getDocumentType() : "").toLowerCase();
                String fileName = (d.getFileName() != null ? d.getFileName() : "").toLowerCase();
                String trackingId = (d.getTrackingId() != null ? d.getTrackingId() : "").toLowerCase();
                String name = (d.getApplicantName() != null ? d.getApplicantName() : "").toLowerCase();
                String nic = (d.getNationalIdNumber() != null ? d.getNationalIdNumber() : "").toLowerCase();
                return docType.contains(term) || fileName.contains(term) || trackingId.contains(term) || name.contains(term) || nic.contains(term);
            }).toList();
        }

        return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
    }

    // ── Get Application Documents ─────────────────────────────────────────────
    @GetMapping({"/application/{id}", "/applications/{id}/documents"})
    public ResponseEntity<?> getApplicationDocuments(@PathVariable String id) {
        Long appId = parseId(id);
        List<Document> docs = appId != null ? documentRepository.findByApplicationIdOrderByUploadedAtAsc(appId) : Collections.emptyList();
        for (Document d : docs) {
            d.setTrackingId("NEX-2026-" + d.getApplicationId());
        }
        return ResponseEntity.ok(Map.of("success", true, "count", docs.size(), "documents", docs));
    }

    // ── Upload Document to Application ────────────────────────────────────────
    @PostMapping({"/application/{id}", "/applications/{id}/documents"})
    public ResponseEntity<?> uploadDocument(@PathVariable String id, @RequestBody Map<String, String> body) {
        Long appId = parseId(id);
        String docType = body.get("document_type");
        String fileName = body.get("file_name");
        String fileData = body.get("file_data");
        String fileSize = body.get("file_size");

        if (docType == null || fileName == null || fileData == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Missing required document fields."));
        }

        String savedPath = DocumentStorageUtil.saveDocumentFile(fileData, fileName);
        Document doc = new Document(appId, docType, fileName, savedPath, fileSize != null ? fileSize : "Unknown");
        doc = documentRepository.save(doc);

        auditLogRepository.save(new AuditLog(UserContext.getCurrentUserId(), "DOCUMENT_UPLOADED",
                "Document '" + fileName + "' uploaded for Application #" + appId));
        backupService.triggerAutoBackup("Document uploaded for Application #" + appId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Document uploaded successfully.",
                "document", doc
        ));
    }

    // ── Delete Document ───────────────────────────────────────────────────────
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        documentRepository.deleteById(documentId);
        backupService.triggerAutoBackup("Document deleted #" + documentId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document #" + documentId + " deleted successfully."));
    }
}
