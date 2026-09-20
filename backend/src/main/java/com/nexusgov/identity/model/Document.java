package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Document entity — maps to the `documents` table.
 * Java port of the Node.js document-upload-management module.
 */
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, columnDefinition = "LONGTEXT")
    private String filePath;

    @Column(name = "file_size", length = 50)
    private String fileSize;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    public Document() {}

    public Document(Long documentId, Application application, String documentType, String fileName,
                    String filePath, String fileSize, LocalDateTime uploadedAt) {
        this.documentId = documentId;
        this.application = application;
        this.documentType = documentType;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long documentId;
        private Application application;
        private String documentType;
        private String fileName;
        private String filePath;
        private String fileSize;
        private LocalDateTime uploadedAt;

        public Builder documentId(Long documentId) { this.documentId = documentId; return this; }
        public Builder application(Application application) { this.application = application; return this; }
        public Builder documentType(String documentType) { this.documentType = documentType; return this; }
        public Builder fileName(String fileName) { this.fileName = fileName; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder fileSize(String fileSize) { this.fileSize = fileSize; return this; }
        public Builder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public Document build() {
            return new Document(documentId, application, documentType, fileName, filePath, fileSize, uploadedAt);
        }
    }
}