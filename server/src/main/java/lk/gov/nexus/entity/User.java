package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    @JsonProperty("user_id")
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    @JsonProperty("username")
    private String username;

    @Column(name = "password_hash", nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    @JsonProperty("full_name")
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    @JsonProperty("email")
    private String email;

    @Column(name = "role", nullable = false, length = 30)
    @JsonProperty("role")
    private String role = "Citizen";

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String passwordHash, String fullName, String email, String role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.createdAt = LocalDateTime.now();
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

    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    @JsonProperty("password_hash")
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
