package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    @JsonProperty("document_id")
    private Long documentId;

    @Column(name = "application_id", nullable = false)
    @JsonProperty("application_id")
    private Long applicationId;

    @Column(name = "document_type", nullable = false, length = 100)
    @JsonProperty("document_type")
    private String documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    @JsonProperty("file_name")
    private String fileName;

    @Column(name = "file_path", nullable = false, columnDefinition = "LONGTEXT")
    @JsonProperty("file_path")
    private String filePath;

    @Column(name = "file_size", length = 50)
    @JsonProperty("file_size")
    private String fileSize = "Unknown";

    @Column(name = "uploaded_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Transient
    @JsonProperty("tracking_id")
    private String trackingId;

    @Transient
    @JsonProperty("applicant_name")
    private String applicantName;

    @Transient
    @JsonProperty("national_id_number")
    private String nationalIdNumber;

    @Transient
    @JsonProperty("application_status")
    private String applicationStatus;

    public Document() {}

    public Document(Long applicationId, String documentType, String fileName, String filePath, String fileSize) {
        this.applicationId = applicationId;
        this.documentType = documentType;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = fileSize != null ? fileSize : "Unknown";
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
        if (applicationId != null) {
            this.trackingId = "NEX-2026-" + applicationId;
        }
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getTrackingId() {
        if (trackingId == null && applicationId != null) {
            return "NEX-2026-" + applicationId;
        }
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getNationalIdNumber() {
        return nationalIdNumber;
    }

    public void setNationalIdNumber(String nationalIdNumber) {
        this.nationalIdNumber = nationalIdNumber;
    }

    public String getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
}
