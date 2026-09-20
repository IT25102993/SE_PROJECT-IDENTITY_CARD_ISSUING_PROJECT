package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * DispatchRecord entity — maps to the `dispatch_records` table.
 * Java port of the Node.js operation-management dispatch workflow.
 */
@Entity
@Table(name = "dispatch_records")
public class DispatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispatch_id")
    private Long dispatchId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "tracking_id", nullable = false, length = 30)
    private String trackingId;

    @Column(name = "applicant_name", nullable = false, length = 150)
    private String applicantName;

    @Column(name = "nic_number", length = 20)
    private String nicNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "dispatch_method", nullable = false)
    private DispatchMethod dispatchMethod;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "dispatched_by")
    private Long dispatchedBy;

    @Column(name = "dispatched_by_name", length = 100)
    private String dispatchedByName;

    @Column(name = "dispatched_at", nullable = false, updatable = false)
    private LocalDateTime dispatchedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public DispatchRecord() {}

    public DispatchRecord(Long dispatchId, Long applicationId, String trackingId, String applicantName,
                          String nicNumber, DispatchMethod dispatchMethod, String deliveryAddress,
                          Long dispatchedBy, String dispatchedByName, LocalDateTime dispatchedAt, String notes) {
        this.dispatchId = dispatchId;
        this.applicationId = applicationId;
        this.trackingId = trackingId;
        this.applicantName = applicantName;
        this.nicNumber = nicNumber;
        this.dispatchMethod = dispatchMethod;
        this.deliveryAddress = deliveryAddress;
        this.dispatchedBy = dispatchedBy;
        this.dispatchedByName = dispatchedByName;
        this.dispatchedAt = dispatchedAt;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        if (dispatchedAt == null) {
            dispatchedAt = LocalDateTime.now();
        }
    }

    public enum DispatchMethod {
        Courier, Postal
    }

    public Long getDispatchId() { return dispatchId; }
    public void setDispatchId(Long dispatchId) { this.dispatchId = dispatchId; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

    public String getNicNumber() { return nicNumber; }
    public void setNicNumber(String nicNumber) { this.nicNumber = nicNumber; }

    public DispatchMethod getDispatchMethod() { return dispatchMethod; }
    public void setDispatchMethod(DispatchMethod dispatchMethod) { this.dispatchMethod = dispatchMethod; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public Long getDispatchedBy() { return dispatchedBy; }
    public void setDispatchedBy(Long dispatchedBy) { this.dispatchedBy = dispatchedBy; }

    public String getDispatchedByName() { return dispatchedByName; }
    public void setDispatchedByName(String dispatchedByName) { this.dispatchedByName = dispatchedByName; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long dispatchId;
        private Long applicationId;
        private String trackingId;
        private String applicantName;
        private String nicNumber;
        private DispatchMethod dispatchMethod;
        private String deliveryAddress;
        private Long dispatchedBy;
        private String dispatchedByName;
        private LocalDateTime dispatchedAt;
        private String notes;

        public Builder dispatchId(Long dispatchId) { this.dispatchId = dispatchId; return this; }
        public Builder applicationId(Long applicationId) { this.applicationId = applicationId; return this; }
        public Builder trackingId(String trackingId) { this.trackingId = trackingId; return this; }
        public Builder applicantName(String applicantName) { this.applicantName = applicantName; return this; }
        public Builder nicNumber(String nicNumber) { this.nicNumber = nicNumber; return this; }
        public Builder dispatchMethod(DispatchMethod dispatchMethod) { this.dispatchMethod = dispatchMethod; return this; }
        public Builder deliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; return this; }
        public Builder dispatchedBy(Long dispatchedBy) { this.dispatchedBy = dispatchedBy; return this; }
        public Builder dispatchedByName(String dispatchedByName) { this.dispatchedByName = dispatchedByName; return this; }
        public Builder dispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }

        public DispatchRecord build() {
            return new DispatchRecord(dispatchId, applicationId, trackingId, applicantName, nicNumber,
                dispatchMethod, deliveryAddress, dispatchedBy, dispatchedByName, dispatchedAt, notes);
        }
    }
}