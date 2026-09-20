package com.nexusgov.identity.dto;

import java.util.List;

/**
 * Admin-management DTOs — matching the Node.js adminController.js response shapes.
 */
public class AdminDtos {

    public static class DeletionRejectRequest {
        private String admin_notes = "Account deletion request rejected by administration.";

        public DeletionRejectRequest() {}

        public String getAdmin_notes() { return admin_notes; }
        public void setAdmin_notes(String admin_notes) { this.admin_notes = admin_notes; }
    }

    public static class LogDto {
        private Long log_id;
        private Long user_id;
        private String username;
        private String role;
        private String action;
        private String details;
        private String timestamp;

        public LogDto() {}

        public Long getLog_id() { return log_id; }
        public void setLog_id(Long log_id) { this.log_id = log_id; }
        public Long getUser_id() { return user_id; }
        public void setUser_id(Long user_id) { this.user_id = user_id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    public static class DeletionRequestDto {
        private Long request_id;
        private Long user_id;
        private String username;
        private String email;
        private String reason;
        private String status;
        private String admin_notes;
        private String requested_at;
        private String processed_at;
        private Long processed_by;
        private String current_user_fullname;
        private String processed_by_name;
        private long application_count;
        private List<Object> submitted_applications;

        public DeletionRequestDto() {}

        public Long getRequest_id() { return request_id; }
        public void setRequest_id(Long request_id) { this.request_id = request_id; }
        public Long getUser_id() { return user_id; }
        public void setUser_id(Long user_id) { this.user_id = user_id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAdmin_notes() { return admin_notes; }
        public void setAdmin_notes(String admin_notes) { this.admin_notes = admin_notes; }
        public String getRequested_at() { return requested_at; }
        public void setRequested_at(String requested_at) { this.requested_at = requested_at; }
        public String getProcessed_at() { return processed_at; }
        public void setProcessed_at(String processed_at) { this.processed_at = processed_at; }
        public Long getProcessed_by() { return processed_by; }
        public void setProcessed_by(Long processed_by) { this.processed_by = processed_by; }
        public String getCurrent_user_fullname() { return current_user_fullname; }
        public void setCurrent_user_fullname(String current_user_fullname) { this.current_user_fullname = current_user_fullname; }
        public String getProcessed_by_name() { return processed_by_name; }
        public void setProcessed_by_name(String processed_by_name) { this.processed_by_name = processed_by_name; }
        public long getApplication_count() { return application_count; }
        public void setApplication_count(long application_count) { this.application_count = application_count; }
        public List<Object> getSubmitted_applications() { return submitted_applications; }
        public void setSubmitted_applications(List<Object> submitted_applications) { this.submitted_applications = submitted_applications; }
    }
}