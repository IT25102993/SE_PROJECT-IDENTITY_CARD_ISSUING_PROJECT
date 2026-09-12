package com.nexusgov.identity.dto;

/**
 * All application-related DTOs matching the Node.js request/response shapes.
 */
public class ApplicationDtos {

    public static class ApplicationRequest {
        private String first_name;
        private String last_name;
        private String dob;
        private String gender;
        private String address;
        private String phone_number;
        private String email;
        private String application_type = "New";

        public ApplicationRequest() {}

        public String getFirst_name() { return first_name; }
        public void setFirst_name(String first_name) { this.first_name = first_name; }
        public String getLast_name() { return last_name; }
        public void setLast_name(String last_name) { this.last_name = last_name; }
        public String getDob() { return dob; }
        public void setDob(String dob) { this.dob = dob; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone_number() { return phone_number; }
        public void setPhone_number(String phone_number) { this.phone_number = phone_number; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
    }

    public static class StatusUpdateRequest {
        private String status;
        private String remarks;

        public StatusUpdateRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class ApproveRequest {
        private String remarks = "Application approved.";

        public ApproveRequest() {}
        public ApproveRequest(String remarks) { this.remarks = remarks; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class RejectRequest {
        private String remarks = "Application rejected.";

        public RejectRequest() {}
        public RejectRequest(String remarks) { this.remarks = remarks; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

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

        public ApplicationDto() {}

        public Long getApplication_id() { return application_id; }
        public void setApplication_id(Long application_id) { this.application_id = application_id; }
        public String getTracking_id() { return tracking_id; }
        public void setTracking_id(String tracking_id) { this.tracking_id = tracking_id; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public String getSubmitted_at() { return submitted_at; }
        public void setSubmitted_at(String submitted_at) { this.submitted_at = submitted_at; }
        public String getUpdated_at() { return updated_at; }
        public void setUpdated_at(String updated_at) { this.updated_at = updated_at; }
        public String getFirst_name() { return first_name; }
        public void setFirst_name(String first_name) { this.first_name = first_name; }
        public String getLast_name() { return last_name; }
        public void setLast_name(String last_name) { this.last_name = last_name; }
        public String getFullNameEn() { return fullNameEn; }
        public void setFullNameEn(String fullNameEn) { this.fullNameEn = fullNameEn; }
        public String getNational_id_number() { return national_id_number; }
        public void setNational_id_number(String national_id_number) { this.national_id_number = national_id_number; }
        public String getDob() { return dob; }
        public void setDob(String dob) { this.dob = dob; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getProcessed_by_name() { return processed_by_name; }
        public void setProcessed_by_name(String processed_by_name) { this.processed_by_name = processed_by_name; }
    }
}
