package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Application entity — maps to the `applications` table.
 */
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false)
    private ApplicationType applicationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private User processedBy;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Application() {}

    public Application(Long applicationId, Applicant applicant, ApplicationType applicationType,
                       ApplicationStatus status, User processedBy, String remarks,
                       LocalDateTime submittedAt, LocalDateTime updatedAt) {
        this.applicationId = applicationId;
        this.applicant = applicant;
        this.applicationType = applicationType;
        this.status = status;
        this.processedBy = processedBy;
        this.remarks = remarks;
        this.submittedAt = submittedAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ApplicationStatus.Pending;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ApplicationType {
        New, Renewal, Replacement
    }

    public enum ApplicationStatus {
        Pending, Approved, Rejected, Processing, Printed, Issued
    }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public ApplicationType getApplicationType() { return applicationType; }
    public void setApplicationType(ApplicationType applicationType) { this.applicationType = applicationType; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long applicationId;
        private Applicant applicant;
        private ApplicationType applicationType;
        private ApplicationStatus status;
        private User processedBy;
        private String remarks;
        private LocalDateTime submittedAt;
        private LocalDateTime updatedAt;

        public Builder applicationId(Long applicationId) { this.applicationId = applicationId; return this; }
        public Builder applicant(Applicant applicant) { this.applicant = applicant; return this; }
        public Builder applicationType(ApplicationType applicationType) { this.applicationType = applicationType; return this; }
        public Builder status(ApplicationStatus status) { this.status = status; return this; }
        public Builder processedBy(User processedBy) { this.processedBy = processedBy; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Application build() {
            return new Application(applicationId, applicant, applicationType, status, processedBy, remarks, submittedAt, updatedAt);
        }
    }
}
