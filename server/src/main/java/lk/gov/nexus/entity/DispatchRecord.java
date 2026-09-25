package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispatch_records")
public class DispatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dispatch_id")
    @JsonProperty("dispatch_id")
    private Long dispatchId;

    @Column(name = "application_id", nullable = false)
    @JsonProperty("application_id")
    private Long applicationId;

    @Column(name = "tracking_id", nullable = false, length = 30)
    @JsonProperty("tracking_id")
    private String trackingId;

    @Column(name = "applicant_name", nullable = false, length = 150)
    @JsonProperty("applicant_name")
    private String applicantName;

    @Column(name = "nic_number", length = 20)
    @JsonProperty("nic_number")
    private String nicNumber;

    @Column(name = "dispatch_method", nullable = false, length = 20)
    @JsonProperty("dispatch_method")
    private String dispatchMethod = "Postal";

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    @JsonProperty("delivery_address")
    private String deliveryAddress;

    @Column(name = "dispatched_by")
    @JsonProperty("dispatched_by")
    private Long dispatchedBy;

    @Column(name = "dispatched_by_name", length = 100)
    @JsonProperty("dispatched_by_name")
    private String dispatchedByName;

    @Column(name = "dispatched_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("dispatched_at")
    private LocalDateTime dispatchedAt = LocalDateTime.now();

    @Column(name = "notes", columnDefinition = "TEXT")
    @JsonProperty("notes")
    private String notes;

    public DispatchRecord() {}

    public Long getDispatchId() {
        return dispatchId;
    }

    public void setDispatchId(Long dispatchId) {
        this.dispatchId = dispatchId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getTrackingId() {
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

    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public String getDispatchMethod() {
        return dispatchMethod;
    }

    public void setDispatchMethod(String dispatchMethod) {
        this.dispatchMethod = dispatchMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public Long getDispatchedBy() {
        return dispatchedBy;
    }

    public void setDispatchedBy(Long dispatchedBy) {
        this.dispatchedBy = dispatchedBy;
    }

    public String getDispatchedByName() {
        return dispatchedByName;
    }

    public void setDispatchedByName(String dispatchedByName) {
        this.dispatchedByName = dispatchedByName;
    }

    public LocalDateTime getDispatchedAt() {
        return dispatchedAt;
    }

    public void setDispatchedAt(LocalDateTime dispatchedAt) {
        this.dispatchedAt = dispatchedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
