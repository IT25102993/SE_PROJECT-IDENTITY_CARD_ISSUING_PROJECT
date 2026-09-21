package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * User entity — maps to the `users` table.
 * Roles: Admin, Form Officer, Document Officer, Approver, Operational, Citizen
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Convert(converter = UserRoleConverter.class)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public User() {}

    public User(Long userId, String username, String passwordHash, String fullName, String email, UserRole role, LocalDateTime createdAt) {
        this.userId = userId;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum UserRole {
        Admin, FORM_OFFICER, DOCUMENT_OFFICER, Approver, Operational, Citizen;

        // DB stores hyphenated values ('Form-Officer') for Node.js compatibility.
        public String dbValue() {
            return switch (this) {
                case FORM_OFFICER -> "Form-Officer";
                case DOCUMENT_OFFICER -> "Document-Officer";
                default -> name();
            };
        }
    }

    @Converter
    public static class UserRoleConverter implements AttributeConverter<UserRole, String> {

        @Override
        public String convertToDatabaseColumn(UserRole role) {
            return role == null ? null : role.dbValue();
        }

        @Override
        public UserRole convertToEntityAttribute(String dbValue) {
            if (dbValue == null || dbValue.isBlank()) {
                return null;
            }
            // Match canonical DB values ("Form-Officer", "Admin", ...) and enum
            // constant names case-insensitively so legacy/mixed-case values load.
            String target = dbValue.replace('_', '-');
            for (UserRole r : UserRole.values()) {
                if (r.dbValue().equalsIgnoreCase(target) || r.name().equalsIgnoreCase(dbValue)) {
                    return r;
                }
            }
            throw new IllegalArgumentException("Unknown UserRole value: " + dbValue);
        }
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long userId;
        private String username;
        private String passwordHash;
        private String fullName;
        private String email;
        private UserRole role;
        private LocalDateTime createdAt;

        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(UserRole role) { this.role = role; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(userId, username, passwordHash, fullName, email, role, createdAt);
        }
    }
}
