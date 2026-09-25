package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "identity_cards")
public class IdentityCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    @JsonProperty("card_id")
    private Long cardId;

    @Column(name = "card_number", nullable = false, unique = true, length = 50)
    @JsonProperty("card_number")
    private String cardNumber;

    @Column(name = "application_id", nullable = false, unique = true)
    @JsonProperty("application_id")
    private Long applicationId;

    @Column(name = "applicant_id", nullable = false)
    @JsonProperty("applicant_id")
    private Long applicantId;

    @Column(name = "issue_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("expiry_date")
    private LocalDate expiryDate;

    @Column(name = "status", nullable = false, length = 20)
    @JsonProperty("status")
    private String status = "Active";

    @Column(name = "issued_by")
    @JsonProperty("issued_by")
    private Long issuedBy;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public IdentityCard() {}

    public Long getCardId() {
        return cardId;
    }

    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getIssuedBy() {
        return issuedBy;
    }

    public void setIssuedBy(Long issuedBy) {
        this.issuedBy = issuedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
