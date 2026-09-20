package com.nexusgov.identity.dto;

import java.util.List;

/**
 * Operation/Dispatch related DTOs — matching the Node.js operationController.js response shapes.
 */
public class OperationDtos {

    public static class StatusUpdateRequest {
        private String status;
        private String remarks;

        public StatusUpdateRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public static class DispatchRequest {
        private String applicant_name;
        private String nic_number;
        private String dispatch_method;
        private String delivery_address;
        private String notes;

        public DispatchRequest() {}

        public String getApplicant_name() { return applicant_name; }
        public void setApplicant_name(String applicant_name) { this.applicant_name = applicant_name; }
        public String getNic_number() { return nic_number; }
        public void setNic_number(String nic_number) { this.nic_number = nic_number; }
        public String getDispatch_method() { return dispatch_method; }
        public void setDispatch_method(String dispatch_method) { this.dispatch_method = dispatch_method; }
        public String getDelivery_address() { return delivery_address; }
        public void setDelivery_address(String delivery_address) { this.delivery_address = delivery_address; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class PrintQueueItemDto {
        private Long application_id;
        private String tracking_id;
        private String status;
        private String application_type;
        private String first_name;
        private String last_name;
        private String fullNameEn;
        private String national_id_number;
        private String dob;
        private String gender;
        private String address;
        private String card_number;
        private String issue_date;
        private String expiry_date;

        public PrintQueueItemDto() {}

        public Long getApplication_id() { return application_id; }
        public void setApplication_id(Long application_id) { this.application_id = application_id; }
        public String getTracking_id() { return tracking_id; }
        public void setTracking_id(String tracking_id) { this.tracking_id = tracking_id; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
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
        public String getCard_number() { return card_number; }
        public void setCard_number(String card_number) { this.card_number = card_number; }
        public String getIssue_date() { return issue_date; }
        public void setIssue_date(String issue_date) { this.issue_date = issue_date; }
        public String getExpiry_date() { return expiry_date; }
        public void setExpiry_date(String expiry_date) { this.expiry_date = expiry_date; }
    }

    public static class DispatchRecordDto {
        private Long dispatch_id;
        private Long application_id;
        private String tracking_id;
        private String applicant_name;
        private String nic_number;
        private String dispatch_method;
        private String delivery_address;
        private Long dispatched_by;
        private String dispatched_by_name;
        private String dispatched_at;
        private String notes;

        public DispatchRecordDto() {}

        public Long getDispatch_id() { return dispatch_id; }
        public void setDispatch_id(Long dispatch_id) { this.dispatch_id = dispatch_id; }
        public Long getApplication_id() { return application_id; }
        public void setApplication_id(Long application_id) { this.application_id = application_id; }
        public String getTracking_id() { return tracking_id; }
        public void setTracking_id(String tracking_id) { this.tracking_id = tracking_id; }
        public String getApplicant_name() { return applicant_name; }
        public void setApplicant_name(String applicant_name) { this.applicant_name = applicant_name; }
        public String getNic_number() { return nic_number; }
        public void setNic_number(String nic_number) { this.nic_number = nic_number; }
        public String getDispatch_method() { return dispatch_method; }
        public void setDispatch_method(String dispatch_method) { this.dispatch_method = dispatch_method; }
        public String getDelivery_address() { return delivery_address; }
        public void setDelivery_address(String delivery_address) { this.delivery_address = delivery_address; }
        public Long getDispatched_by() { return dispatched_by; }
        public void setDispatched_by(Long dispatched_by) { this.dispatched_by = dispatched_by; }
        public String getDispatched_by_name() { return dispatched_by_name; }
        public void setDispatched_by_name(String dispatched_by_name) { this.dispatched_by_name = dispatched_by_name; }
        public String getDispatched_at() { return dispatched_at; }
        public void setDispatched_at(String dispatched_at) { this.dispatched_at = dispatched_at; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public record Analytics(long totalApplications, long pending, long approved, long rejected,
                            long botVerified, long totalUsers) {}

    public record PrintQueueResponse(boolean success, long count, List<PrintQueueItemDto> queue) {}

    public record DispatchRecordsResponse(boolean success, long count, List<DispatchRecordDto> records) {}
}