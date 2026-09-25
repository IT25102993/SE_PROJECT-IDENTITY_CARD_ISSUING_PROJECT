package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "account_deletion_requests")
public class AccountDeletionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    @JsonProperty("request_id")
    private Long requestId;

    @Column(name = "user_id", nullable = false)
    @JsonProperty("user_id")
    private Long userId;

    @Column(name = "username", nullable = false, length = 50)
    @JsonProperty("username")
    private String username;

    @Column(name = "email", nullable = false, length = 100)
    @JsonProperty("email")
    private String email;

    @Column(name = "reason", columnDefinition = "TEXT")
    @JsonProperty("reason")
    private String reason;

    @Column(name = "status", nullable = false, length = 20)
    @JsonProperty("status")
    private String status = "Pending";

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    @JsonProperty("admin_notes")
    private String adminNotes;

    @Column(name = "requested_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "processed_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    @JsonProperty("processed_by")
    private Long processedBy;

    @Transient
    @JsonProperty("current_user_fullname")
    private String currentUserFullname;

    @Transient
    @JsonProperty("processed_by_name")
    private String processedByName;

    @Transient
    @JsonProperty("submitted_applications")
    private List<Application> submittedApplications = new ArrayList<>();

    @Transient
    @JsonProperty("application_count")
    private Integer applicationCount = 0;

    public AccountDeletionRequest() {}

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public Long getProcessedBy() {
        return processedBy;
    }

    public void setProcessedBy(Long processedBy) {
        this.processedBy = processedBy;
    }

    public String getCurrentUserFullname() {
        return currentUserFullname;
    }

    public void setCurrentUserFullname(String currentUserFullname) {
        this.currentUserFullname = currentUserFullname;
    }

    public String getProcessedByName() {
        return processedByName;
    }

    public void setProcessedByName(String processedByName) {
        this.processedByName = processedByName;
    }

    public List<Application> getSubmittedApplications() {
        return submittedApplications;
    }

    public void setSubmittedApplications(List<Application> submittedApplications) {
        this.submittedApplications = submittedApplications != null ? submittedApplications : new ArrayList<>();
        this.applicationCount = this.submittedApplications.size();
    }

    public Integer getApplicationCount() {
        return applicationCount != null ? applicationCount : (submittedApplications != null ? submittedApplications.size() : 0);
    }

    public void setApplicationCount(Integer applicationCount) {
        this.applicationCount = applicationCount;
    }
}
