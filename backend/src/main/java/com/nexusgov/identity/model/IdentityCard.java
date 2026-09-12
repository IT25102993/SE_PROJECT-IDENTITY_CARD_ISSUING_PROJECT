package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * IdentityCard entity — maps to the `identity_cards` table.
 */
@Entity
@Table(name = "identity_cards")
public class IdentityCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Column(name = "card_number", nullable = false, unique = true, length = 50)
    private String cardNumber;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CardStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public IdentityCard() {}

    public IdentityCard(Long cardId, Application application, Applicant applicant, String cardNumber,
                        LocalDate issueDate, LocalDate expiryDate, CardStatus status,
                        User issuedBy, LocalDateTime createdAt) {
        this.cardId = cardId;
        this.application = application;
        this.applicant = applicant;
        this.cardNumber = cardNumber;
        this.issueDate = issueDate;
        this.expiryDate = expiryDate;
        this.status = status;
        this.issuedBy = issuedBy;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = CardStatus.Active;
    }

    public enum CardStatus {
        Active, Expired, Revoked, Lost
    }

    public Long getCardId() { return cardId; }
    public void setCardId(Long cardId) { this.cardId = cardId; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public Applicant getApplicant() { return applicant; }
    public void setApplicant(Applicant applicant) { this.applicant = applicant; }

    public String getCardNumber() { return cardNumber; }
    public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public CardStatus getStatus() { return status; }
    public void setStatus(CardStatus status) { this.status = status; }

    public User getIssuedBy() { return issuedBy; }
    public void setIssuedBy(User issuedBy) { this.issuedBy = issuedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long cardId;
        private Application application;
        private Applicant applicant;
        private String cardNumber;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private CardStatus status;
        private User issuedBy;
        private LocalDateTime createdAt;

        public Builder cardId(Long cardId) { this.cardId = cardId; return this; }
        public Builder application(Application application) { this.application = application; return this; }
        public Builder applicant(Applicant applicant) { this.applicant = applicant; return this; }
        public Builder cardNumber(String cardNumber) { this.cardNumber = cardNumber; return this; }
        public Builder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public Builder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public Builder status(CardStatus status) { this.status = status; return this; }
        public Builder issuedBy(User issuedBy) { this.issuedBy = issuedBy; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IdentityCard build() {
            return new IdentityCard(cardId, application, applicant, cardNumber, issueDate, expiryDate, status, issuedBy, createdAt);
        }
    }
}
