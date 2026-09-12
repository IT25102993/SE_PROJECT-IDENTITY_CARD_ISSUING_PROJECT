package com.nexusgov.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

public class ApplicationDtos {

    @Data
    public static class ApplicationRequest {
        @NotBlank(message = "First name is required")
        private String first_name;

        @NotBlank(message = "Last name is required")
        private String last_name;

        @NotBlank(message = "Date of birth is required")
        private String dob;

        @NotBlank(message = "Gender is required")
        private String gender;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "Phone number is required")
        private String phone_number;

        private String email;

        private String application_type = "New";
    }

    @Data
    public static class StatusUpdateRequest {
        private String status;
        private String remarks;
    }

    @Data
    public static class ApproveRequest {
        private String remarks = "Application approved.";
    }

    @Data
    public static class RejectRequest {
        private String remarks = "Application rejected.";
    }

    @Data
    public static class ApplicationDto {
        private Long application_id;
        private String tracking_id;
        private String application_type;
        private String status;
        private String remarks;
        private String submitted_at;
        private String updated_at;
        private String first_name;
        private String last_name;
        private String fullNameEn;
        private String national_id_number;
        private String dob;
        private String gender;
        private String address;
        private String phone;
        private String email;
        private String processed_by_name;
    }
}
