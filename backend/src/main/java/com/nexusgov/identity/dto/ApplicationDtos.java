package com.nexusgov.identity.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * All application-related DTOs matching the Node.js request/response shapes.
 */
public class ApplicationDtos {

    public static class DocumentPayload {
        private String document_type;
        private String file_name;
        private String file_data;
        private String file_size;
        private String type;
        private String name;
        private String data;
        private String url;
        private String size;

        public DocumentPayload() {}

        public String getDocument_type() { return document_type; }
        public void setDocument_type(String document_type) { this.document_type = document_type; }
        public String getFile_name() { return file_name; }
        public void setFile_name(String file_name) { this.file_name = file_name; }
        public String getFile_data() { return file_data; }
        public void setFile_data(String file_data) { this.file_data = file_data; }
        public String getFile_size() { return file_size; }
        public void setFile_size(String file_size) { this.file_size = file_size; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }
    }

    public static class ApplicationRequest {
        private String first_name;
        private String last_name;
        private String dob;
        private String gender;
        private String civil_status;
        private String marital_status;
        private String application_reason = "G.C.E O/L";
        private String other_reason;
        private String service_type = "Normal";
        private String address;
        private String phone_number;
        private String email;
        private String application_type = "New";
        private String photo_url;
        private List<DocumentPayload> documents = new ArrayList<>();

        public ApplicationRequest() {}

        public String getFirst_name() { return first_name; }
        public void setFirst_name(String first_name) { this.first_name = first_name; }
        public String getLast_name() { return last_name; }
        public void setLast_name(String last_name) { this.last_name = last_name; }
        public String getDob() { return dob; }
        public void setDob(String dob) { this.dob = dob; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getCivil_status() { return civil_status; }
        public void setCivil_status(String civil_status) { this.civil_status = civil_status; }
        public String getMarital_status() { return marital_status; }
        public void setMarital_status(String marital_status) { this.marital_status = marital_status; }
        public String getApplication_reason() { return application_reason; }
        public void setApplication_reason(String application_reason) { this.application_reason = application_reason; }
        public String getOther_reason() { return other_reason; }
        public void setOther_reason(String other_reason) { this.other_reason = other_reason; }
        public String getService_type() { return service_type; }
        public void setService_type(String service_type) { this.service_type = service_type; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getPhone_number() { return phone_number; }
        public void setPhone_number(String phone_number) { this.phone_number = phone_number; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
        public String getPhoto_url() { return photo_url; }
        public void setPhoto_url(String photo_url) { this.photo_url = photo_url; }
        public List<DocumentPayload> getDocuments() { return documents; }
        public void setDocuments(List<DocumentPayload> documents) { this.documents = documents == null ? new ArrayList<>() : documents; }
    }

    public static class UpdateApplicationRequest {
        private String first_name;
        private String last_name;
        private String dob;
        private String gender;
        private String address;
        private String phone_number;
        private String phone;
        private String email;
        private String application_type;
        private String remarks;
        private String officerNotes;
        private String assigned_officer;
        private String status;

        public UpdateApplicationRequest() {}

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
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public String getOfficerNotes() { return officerNotes; }
        public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }
        public String getAssigned_officer() { return assigned_officer; }
        public void setAssigned_officer(String assigned_officer) { this.assigned_officer = assigned_officer; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ClaimRequest {
        private String officerName;

        public ClaimRequest() {}
        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }
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
        private String application_reason;
        private String marital_status;
        private String service_type;
        private String status;
        private String assigned_officer;
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
        private String photo_path;
        private String processed_by_name;
        private Boolean bot_verified;
        private Integer bot_score;
        private String bot_notes;
        private String bot_verified_at;
        private List<DocumentDtos.DocumentDto> documents = new ArrayList<>();

        public ApplicationDto() {}

        public Long getApplication_id() { return application_id; }
        public void setApplication_id(Long application_id) { this.application_id = application_id; }
        public String getTracking_id() { return tracking_id; }
        public void setTracking_id(String tracking_id) { this.tracking_id = tracking_id; }
        public String getApplication_type() { return application_type; }
        public void setApplication_type(String application_type) { this.application_type = application_type; }
        public String getApplication_reason() { return application_reason; }
        public void setApplication_reason(String application_reason) { this.application_reason = application_reason; }
        public String getMarital_status() { return marital_status; }
        public void setMarital_status(String marital_status) { this.marital_status = marital_status; }
        public String getService_type() { return service_type; }
        public void setService_type(String service_type) { this.service_type = service_type; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAssigned_officer() { return assigned_officer; }
        public void setAssigned_officer(String assigned_officer) { this.assigned_officer = assigned_officer; }
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
        public String getPhoto_path() { return photo_path; }
        public void setPhoto_path(String photo_path) { this.photo_path = photo_path; }
        public String getProcessed_by_name() { return processed_by_name; }
        public void setProcessed_by_name(String processed_by_name) { this.processed_by_name = processed_by_name; }
        public Boolean getBot_verified() { return bot_verified; }
        public void setBot_verified(Boolean bot_verified) { this.bot_verified = bot_verified; }
        public Integer getBot_score() { return bot_score; }
        public void setBot_score(Integer bot_score) { this.bot_score = bot_score; }
        public String getBot_notes() { return bot_notes; }
        public void setBot_notes(String bot_notes) { this.bot_notes = bot_notes; }
        public String getBot_verified_at() { return bot_verified_at; }
        public void setBot_verified_at(String bot_verified_at) { this.bot_verified_at = bot_verified_at; }
        public List<DocumentDtos.DocumentDto> getDocuments() { return documents; }
        public void setDocuments(List<DocumentDtos.DocumentDto> documents) { this.documents = documents == null ? new ArrayList<>() : documents; }
    }
}