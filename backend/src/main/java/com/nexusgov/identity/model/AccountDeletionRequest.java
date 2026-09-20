package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AccountDeletionRequest entity — maps to the `account_deletion_requests` table.
 * Java port of the Node.js admin-management account deletion governance workflow.
 */
@Entity
@Table(name = "account_deletion_requests")
public class AccountDeletionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeletionStatus status;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private Long processedBy;

    public AccountDeletionRequest() {}

    public AccountDeletionRequest(Long requestId, Long userId, String username, String email, String reason,
                                  DeletionStatus status, String adminNotes, LocalDateTime requestedAt,
                                  LocalDateTime processedAt, Long processedBy) {
        this.requestId = requestId;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.reason = reason;
        this.status = status;
        this.adminNotes = adminNotes;
        this.requestedAt = requestedAt;
        this.processedAt = processedAt;
        this.processedBy = processedBy;
    }

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = DeletionStatus.Pending;
        }
    }

    public enum DeletionStatus {
        Pending, Approved, Rejected
    }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public DeletionStatus getStatus() { return status; }
    public void setStatus(DeletionStatus status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public Long getProcessedBy() { return processedBy; }
    public void setProcessedBy(Long processedBy) { this.processedBy = processedBy; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long requestId;
        private Long userId;
        private String username;
        private String email;
        private String reason;
        private DeletionStatus status;
        private String adminNotes;
        private LocalDateTime requestedAt;
        private LocalDateTime processedAt;
        private Long processedBy;

        public Builder requestId(Long requestId) { this.requestId = requestId; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder status(DeletionStatus status) { this.status = status; return this; }
        public Builder adminNotes(String adminNotes) { this.adminNotes = adminNotes; return this; }
        public Builder requestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; return this; }
        public Builder processedAt(LocalDateTime processedAt) { this.processedAt = processedAt; return this; }
        public Builder processedBy(Long processedBy) { this.processedBy = processedBy; return this; }

        public AccountDeletionRequest build() {
            return new AccountDeletionRequest(requestId, userId, username, email, reason, status, adminNotes,
                requestedAt, processedAt, processedBy);
        }
    }
}