package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verifications")
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "verification_id")
    @JsonProperty("verification_id")
    private Long verificationId;

    @Column(name = "application_id", nullable = false)
    @JsonProperty("application_id")
    private Long applicationId;

    @Column(name = "applicant_id")
    @JsonProperty("applicant_id")
    private Long applicantId;

    @Column(name = "method", nullable = false, length = 20)
    @JsonProperty("method")
    private String method = "AI-BOT";

    @Column(name = "result", nullable = false, length = 30)
    @JsonProperty("result")
    private String result = "Inconclusive";

    @Column(name = "passed", nullable = false)
    @JsonProperty("passed")
    private Integer passed = 0;

    @Column(name = "score", nullable = false)
    @JsonProperty("score")
    private Integer score = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    @JsonProperty("notes")
    private String notes;

    @Column(name = "verified_by")
    @JsonProperty("verified_by")
    private Long verifiedBy;

    @Column(name = "verified_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("verified_at")
    private LocalDateTime verifiedAt = LocalDateTime.now();

    @Transient
    @JsonProperty("tracking_id")
    private String trackingId;

    @Transient
    @JsonProperty("applicant_name")
    private String applicantName;

    @Transient
    @JsonProperty("verified_by_name")
    private String verifiedByName;

    public Verification() {}

    public Long getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(Long verificationId) {
        this.verificationId = verificationId;
    }

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

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public Integer getPassed() {
        return passed;
    }

    public void setPassed(Integer passed) {
        this.passed = passed;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(Long verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
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

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }
}
