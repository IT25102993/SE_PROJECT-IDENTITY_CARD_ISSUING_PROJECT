package com.nexusgov.identity.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * All application-related DTOs matching the Node.js request/response shapes.
 */
public class ApplicationDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ApplicationRequest {
        private String first_name;
        private String last_name;
        private String dob;
        private String gender;
        private String address;
        private String phone_number;
        private String email;
        private String application_type = "New";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class StatusUpdateRequest {
        private String status;
        private String remarks;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ApproveRequest {
        private String remarks = "Application approved.";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RejectRequest {
        private String remarks = "Application rejected.";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
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
