package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * AuditLog entity — maps to the `audit_logs` table.
 */
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private User user;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(Long logId, User user, String action, String details, LocalDateTime timestamp) {
        this.logId = logId;
        this.user = user;
        this.action = action;
        this.details = details;
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long logId;
        private User user;
        private String action;
        private String details;
        private LocalDateTime timestamp;

        public Builder logId(Long logId) { this.logId = logId; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder details(String details) { this.details = details; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public AuditLog build() {
            return new AuditLog(logId, user, action, details, timestamp);
        }
    }
}
