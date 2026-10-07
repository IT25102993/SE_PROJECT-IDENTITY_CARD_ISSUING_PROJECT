package lk.gov.nexus.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "applicant_id")
    @JsonProperty("applicant_id")
    private Long applicantId;

    @Column(name = "national_id_number", length = 20)
    @JsonProperty("national_id_number")
    private String nationalIdNumber;

    @Column(name = "first_name", nullable = false, length = 50)
    @JsonProperty("first_name")
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    @JsonProperty("last_name")
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", nullable = false, length = 10)
    @JsonProperty("gender")
    private String gender;

    @Column(name = "address", columnDefinition = "TEXT")
    @JsonProperty("address")
    private String address;

    @Column(name = "phone_number", nullable = false, length = 20)
    @JsonProperty("phone_number")
    private String phoneNumber;

    @Column(name = "email", length = 100)
    @JsonProperty("email")
    private String email;

    @Column(name = "photo_path", length = 255)
    @JsonProperty("photo_path")
    private String photoPath;

    @Column(name = "registered_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("registered_at")
    private LocalDateTime registeredAt = LocalDateTime.now();

    public Applicant() {}

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public String getNationalIdNumber() {
        return nationalIdNumber;
    }

    public void setNationalIdNumber(String nationalIdNumber) {
        this.nationalIdNumber = nationalIdNumber;
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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
}
