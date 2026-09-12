package com.nexusgov.identity.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Applicant entity — maps to the `applicants` table.
 */
@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "national_id_number", nullable = false, unique = true, length = 20)
    private String nationalIdNumber;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "photo_path", length = 255)
    private String photoPath;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    public Applicant() {}

    public Applicant(Long applicantId, String nationalIdNumber, String firstName, String lastName,
                     LocalDate dateOfBirth, Gender gender, String address, String phoneNumber,
                     String email, String photoPath, LocalDateTime registeredAt) {
        this.applicantId = applicantId;
        this.nationalIdNumber = nationalIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.photoPath = photoPath;
        this.registeredAt = registeredAt;
    }

    @PrePersist
    protected void onCreate() {
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }

    public enum Gender {
        Male, Female, Other
    }

    public Long getApplicantId() { return applicantId; }
    public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

    public String getNationalIdNumber() { return nationalIdNumber; }
    public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long applicantId;
        private String nationalIdNumber;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private Gender gender;
        private String address;
        private String phoneNumber;
        private String email;
        private String photoPath;
        private LocalDateTime registeredAt;

        public Builder applicantId(Long applicantId) { this.applicantId = applicantId; return this; }
        public Builder nationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; return this; }
        public Builder firstName(String firstName) { this.firstName = firstName; return this; }
        public Builder lastName(String lastName) { this.lastName = lastName; return this; }
        public Builder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public Builder gender(Gender gender) { this.gender = gender; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder photoPath(String photoPath) { this.photoPath = photoPath; return this; }
        public Builder registeredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; return this; }

        public Applicant build() {
            return new Applicant(applicantId, nationalIdNumber, firstName, lastName, dateOfBirth, gender, address, phoneNumber, email, photoPath, registeredAt);
        }
    }
}
