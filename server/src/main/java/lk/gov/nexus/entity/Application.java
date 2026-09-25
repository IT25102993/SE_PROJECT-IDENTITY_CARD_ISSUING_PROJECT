package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    @JsonProperty("application_id")
    private Long applicationId;

    @Column(name = "applicant_id", nullable = false)
    @JsonProperty("applicant_id")
    private Long applicantId;

    @Column(name = "application_type", nullable = false, length = 30)
    @JsonProperty("application_type")
    private String applicationType = "New";

    @Column(name = "status", nullable = false, length = 50)
    @JsonProperty("status")
    private String status = "Pending";

    @Column(name = "processed_by")
    @JsonProperty("processed_by")
    private Long processedBy;

    @Column(name = "assigned_officer", length = 100)
    @JsonProperty("assigned_officer")
    private String assignedOfficer;

    @Column(name = "application_reason", length = 100)
    @JsonProperty("application_reason")
    private String applicationReason = "G.C.E O/L";

    @Column(name = "marital_status", length = 50)
    @JsonProperty("marital_status")
    private String maritalStatus = "Single";

    @Column(name = "service_type", length = 30)
    @JsonProperty("service_type")
    private String serviceType = "Normal";

    @Column(name = "remarks", columnDefinition = "TEXT")
    @JsonProperty("remarks")
    private String remarks;

    @Column(name = "submitted_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Transient fields returned by getApplications to match Node.js API
    @Transient
    @JsonProperty("tracking_id")
    private String trackingId;

    @Transient
    @JsonProperty("first_name")
    private String firstName;

    @Transient
    @JsonProperty("last_name")
    private String lastName;

    @Transient
    @JsonProperty("fullNameEn")
    private String fullNameEn;

    @Transient
    @JsonProperty("national_id_number")
    private String nationalIdNumber;

    @Transient
    @JsonProperty("dob")
    private String dob;

    @Transient
    @JsonProperty("gender")
    private String gender;

    @Transient
    @JsonProperty("address")
    private String address;

    @Transient
    @JsonProperty("phone")
    private String phone;

    @Transient
    @JsonProperty("phone_number")
    private String phoneNumber;

    @Transient
    @JsonProperty("email")
    private String email;

    @Transient
    @JsonProperty("photo_path")
    private String photoPath;

    @Transient
    @JsonProperty("processed_by_name")
    private String processedByName;

    @Transient
    @JsonProperty("bot_verified")
    private Integer botVerified = 0;

    @Transient
    @JsonProperty("bot_score")
    private Integer botScore = 0;

    @Transient
    @JsonProperty("bot_notes")
    private String botNotes;

    @Transient
    @JsonProperty("bot_verified_at")
    private String botVerifiedAt;

    @Transient
    @JsonProperty("documents")
    private List<Document> documents = new ArrayList<>();

    public Application() {}

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
        if (applicationId != null) {
            this.trackingId = "NEX-2026-" + applicationId;
        }
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(String applicationType) {
        this.applicationType = applicationType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(Long processedBy) {
        this.processedBy = processedBy;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public String getApplicationReason() {
        return applicationReason;
    }

    public void setApplicationReason(String applicationReason) {
        this.applicationReason = applicationReason;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(String maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullNameEn() {
        if (fullNameEn == null && (firstName != null || lastName != null)) {
            return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }
        return fullNameEn;
    }

    public void setFullNameEn(String fullNameEn) {
        this.fullNameEn = fullNameEn;
    }

    public String getNationalIdNumber() {
        return nationalIdNumber;
    }

    public void setNationalIdNumber(String nationalIdNumber) {
        this.nationalIdNumber = nationalIdNumber;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone != null ? phone : phoneNumber;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        this.phoneNumber = phone;
    }

    public String getPhoneNumber() {
        return phoneNumber != null ? phoneNumber : phone;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.phone = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhotoPath() {
        return photoPath;
    }

    public void setPhotoPath(String photoPath) {
        this.photoPath = photoPath;
    }

    public String getProcessedByName() {
        return processedByName;
    }

    public void setProcessedByName(String processedByName) {
        this.processedByName = processedByName;
    }

    public Integer getBotVerified() {
        return botVerified;
    }

    public void setBotVerified(Integer botVerified) {
        this.botVerified = botVerified;
    }

    public Integer getBotScore() {
        return botScore;
    }

    public void setBotScore(Integer botScore) {
        this.botScore = botScore;
    }

    public String getBotNotes() {
        return botNotes;
    }

    public void setBotNotes(String botNotes) {
        this.botNotes = botNotes;
    }

    public String getBotVerifiedAt() {
        return botVerifiedAt;
    }

    public void setBotVerifiedAt(String botVerifiedAt) {
        this.botVerifiedAt = botVerifiedAt;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents != null ? documents : new ArrayList<>();
    }
}
