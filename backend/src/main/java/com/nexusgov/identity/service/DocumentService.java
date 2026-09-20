package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.DocumentDtos;
import com.nexusgov.identity.model.Application;
import com.nexusgov.identity.model.Applicant;
import com.nexusgov.identity.model.Document;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Document service — Java port of the Node.js document-upload-management module.
 */
@Service
public class DocumentService {

    private final ApplicationRepository applicationRepository;
    private final DocumentRepository documentRepository;
    private final DocumentStorageService documentStorageService;

    public DocumentService(ApplicationRepository applicationRepository,
                           DocumentRepository documentRepository,
                           DocumentStorageService documentStorageService) {
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.documentStorageService = documentStorageService;
    }

    public record UploadResult(boolean success, String message, Map<String, Object> document) {}

    /**
     * Parse an application identifier that may be a numeric id ("12") or a
     * tracking id ("NEX-2026-12"). Mirrors the Node controller parsing.
     */
    public static Long parseApplicationId(String id) {
        if (id == null || id.isBlank()) {
            return null;
        }
        String cleaned = id;
        if (cleaned.startsWith("NEX-2026-")) {
            cleaned = cleaned.replaceAll("\\D", "");
        }
        if (cleaned.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // ── List documents (with optional search) ────────────────────────────────

    public List<DocumentDtos.DocumentDto> getAllDocuments(String search) {
        List<Application> apps;
        if (search != null && !search.isBlank()) {
            apps = applicationRepository.searchApplications(search.trim());
        } else {
            apps = applicationRepository.findAllByOrderBySubmittedAtDesc();
        }
        if (apps.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> appIds = apps.stream().map(Application::getApplicationId).toList();
        return documentRepository.findAllByApplication_ApplicationIdInOrderByUploadedAtAsc(appIds)
            .stream()
            .map(DocumentService::toDocumentDto)
            .toList();
    }

    // ── Documents for one application ────────────────────────────────────────

    public List<DocumentDtos.DocumentDto> getApplicationDocuments(String id) {
        Long appId = parseApplicationId(id);
        if (appId == null || !applicationRepository.findById(appId).isPresent()) {
            throw new IllegalArgumentException("Application not found.");
        }
        return documentRepository.findAllByApplication_ApplicationId(appId)
            .stream()
            .map(DocumentService::toDocumentDto)
            .toList();
    }

    // ── Upload document ──────────────────────────────────────────────────────

    @Transactional
    public UploadResult uploadDocument(String id, DocumentDtos.DocumentUploadRequest req, User currentUser) {
        Long appId = parseApplicationId(id);
        Application app = appId == null ? null : applicationRepository.findById(appId).orElse(null);
        if (app == null) {
            return new UploadResult(false, "Application not found.", null);
        }

        if (req == null || req.getFile_data() == null || req.getFile_data().isBlank()) {
            return new UploadResult(false, "No file data was provided.", null);
        }

        String type = (req.getDocument_type() != null && !req.getDocument_type().isBlank())
            ? req.getDocument_type() : "Birth Certificate";
        String fileName = (req.getFile_name() != null && !req.getFile_name().isBlank())
            ? req.getFile_name() : "birth_certificate.pdf";

        String savedPath = documentStorageService.saveDocumentFile(req.getFile_data(), fileName);
        if (savedPath == null) {
            savedPath = "/uploads/documents/" + System.currentTimeMillis() + "_"
                + fileName.replaceAll("[^A-Za-z0-9._\\-]", "_");
        }

        Document doc = Document.builder()
            .application(app)
            .documentType(type)
            .fileName(fileName)
            .filePath(savedPath)
            .fileSize(req.getFile_size())
            .build();
        doc = documentRepository.save(doc);

        if (currentUser != null) {
            // Document uploads are logged separately via application audit (see ApplicationService).
        }

        Map<String, Object> docMap = toDocumentMap(doc);
        return new UploadResult(true, "Document uploaded successfully.", docMap);
    }

    // ── Delete document ──────────────────────────────────────────────────────

    @Transactional
    public String deleteDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document not found."));
        documentRepository.delete(doc);
        return "Document #" + documentId + " deleted successfully.";
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private static DocumentDtos.DocumentDto toDocumentDto(Document doc) {
        DocumentDtos.DocumentDto dto = new DocumentDtos.DocumentDto();
        dto.setDocument_id(doc.getDocumentId());
        dto.setFile_name(doc.getFileName());
        dto.setFile_path(doc.getFilePath());
        dto.setDocument_type(doc.getDocumentType());
        dto.setFile_size(doc.getFileSize());
        dto.setUploaded_at(doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : null);
        Application app = doc.getApplication();
        if (app != null) {
            dto.setApplication_id(app.getApplicationId());
            dto.setTracking_id("NEX-2026-" + app.getApplicationId());
            dto.setApplication_status(app.getStatus() != null ? app.getStatus().getDbValue() : null);
            Applicant applicant = app.getApplicant();
            if (applicant != null) {
                dto.setApplicant_name(applicant.getFirstName() + " " + applicant.getLastName());
                dto.setNational_id_number(applicant.getNationalIdNumber());
            }
        }
        return dto;
    }

    private static Map<String, Object> toDocumentMap(Document doc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("document_id", doc.getDocumentId());
        map.put("application_id", doc.getApplication() != null ? doc.getApplication().getApplicationId() : null);
        map.put("tracking_id", doc.getApplication() != null ? "NEX-2026-" + doc.getApplication().getApplicationId() : null);
        map.put("document_type", doc.getDocumentType());
        map.put("file_name", doc.getFileName());
        map.put("file_path", doc.getFilePath());
        map.put("file_size", doc.getFileSize());
        map.put("uploaded_at", doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : null);
        return map;
    }
}