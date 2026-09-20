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

    @Convert(converter = ApplicationStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ApplicationStatus status;

    @Column(name = "bot_verified")
    private Boolean botVerified;

    @Column(name = "bot_score")
    private Integer botScore;

    @Column(name = "bot_notes", columnDefinition = "TEXT")
    private String botNotes;

    @Column(name = "bot_verified_at")
    private LocalDateTime botVerifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private User processedBy;

    @Column(name = "assigned_officer", length = 100)
    private String assignedOfficer;

    @Column(name = "application_reason", length = 100)
    private String applicationReason;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "service_type", length = 50)
    private String serviceType;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Application() {}

    public Application(Long applicationId, Applicant applicant, ApplicationType applicationType,
                       ApplicationStatus status, Boolean botVerified, Integer botScore, String botNotes,
                       LocalDateTime botVerifiedAt, User processedBy, String assignedOfficer,
                       String applicationReason, String maritalStatus, String serviceType,
                       String remarks, LocalDateTime submittedAt, LocalDateTime updatedAt) {
        this.applicationId = applicationId;
        this.applicant = applicant;
        this.applicationType = applicationType;
        this.status = status;
        this.botVerified = botVerified;
        this.botScore = botScore;
        this.botNotes = botNotes;
        this.botVerifiedAt = botVerifiedAt;
        this.processedBy = processedBy;
        this.assignedOfficer = assignedOfficer;
        this.applicationReason = applicationReason;
        this.maritalStatus = maritalStatus;
        this.serviceType = serviceType;
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

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public ApplicationType getApplicationType() { return applicationType; }
    public void setApplicationType(ApplicationType applicationType) { this.applicationType = applicationType; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Boolean getBotVerified() { return botVerified; }
    public void setBotVerified(Boolean botVerified) { this.botVerified = botVerified; }

    public Integer getBotScore() { return botScore; }
    public void setBotScore(Integer botScore) { this.botScore = botScore; }

    public String getBotNotes() { return botNotes; }
    public void setBotNotes(String botNotes) { this.botNotes = botNotes; }

    public LocalDateTime getBotVerifiedAt() { return botVerifiedAt; }
    public void setBotVerifiedAt(LocalDateTime botVerifiedAt) { this.botVerifiedAt = botVerifiedAt; }

    public User getProcessedBy() { return processedBy; }
    public void setProcessedBy(User processedBy) { this.processedBy = processedBy; }

    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public String getApplicationReason() { return applicationReason; }
    public void setApplicationReason(String applicationReason) { this.applicationReason = applicationReason; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

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
        private Boolean botVerified;
        private Integer botScore;
        private String botNotes;
        private LocalDateTime botVerifiedAt;
        private User processedBy;
        private String assignedOfficer;
        private String applicationReason;
        private String maritalStatus;
        private String serviceType;
        private String remarks;
        private LocalDateTime submittedAt;
        private LocalDateTime updatedAt;

        public Builder applicationId(Long applicationId) { this.applicationId = applicationId; return this; }
        public Builder applicant(Applicant applicant) { this.applicant = applicant; return this; }
        public Builder applicationType(ApplicationType applicationType) { this.applicationType = applicationType; return this; }
        public Builder status(ApplicationStatus status) { this.status = status; return this; }
        public Builder botVerified(Boolean botVerified) { this.botVerified = botVerified; return this; }
        public Builder botScore(Integer botScore) { this.botScore = botScore; return this; }
        public Builder botNotes(String botNotes) { this.botNotes = botNotes; return this; }
        public Builder botVerifiedAt(LocalDateTime botVerifiedAt) { this.botVerifiedAt = botVerifiedAt; return this; }
        public Builder processedBy(User processedBy) { this.processedBy = processedBy; return this; }
        public Builder assignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; return this; }
        public Builder applicationReason(String applicationReason) { this.applicationReason = applicationReason; return this; }
        public Builder maritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; return this; }
        public Builder serviceType(String serviceType) { this.serviceType = serviceType; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder submittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Application build() {
            return new Application(applicationId, applicant, applicationType, status, botVerified, botScore, botNotes,
                botVerifiedAt, processedBy, assignedOfficer, applicationReason, maritalStatus, serviceType,
                remarks, submittedAt, updatedAt);
        }
    }
}