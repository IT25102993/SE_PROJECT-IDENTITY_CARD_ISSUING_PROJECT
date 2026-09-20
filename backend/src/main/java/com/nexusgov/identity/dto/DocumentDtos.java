package com.nexusgov.identity.dto;

import java.util.List;

/**
 * Document-related DTOs — matching the Node.js documentController.js response shapes.
 */
public class DocumentDtos {

    public static class DocumentUploadRequest {
        private String document_type;
        private String file_name;
        private String file_data;
        private String file_size;

        public DocumentUploadRequest() {}

        public String getDocument_type() { return document_type; }
        public void setDocument_type(String document_type) { this.document_type = document_type; }
        public String getFile_name() { return file_name; }
        public void setFile_name(String file_name) { this.file_name = file_name; }
        public String getFile_data() { return file_data; }
        public void setFile_data(String file_data) { this.file_data = file_data; }
        public String getFile_size() { return file_size; }
        public void setFile_size(String file_size) { this.file_size = file_size; }
    }

    public static class DocumentDto {
        private Long document_id;
        private Long application_id;
        private String tracking_id;
        private String document_type;
        private String file_name;
        private String file_path;
        private String file_size;
        private String uploaded_at;
        private String applicant_name;
        private String national_id_number;
        private String application_status;

        public DocumentDto() {}

        public Long getDocument_id() { return document_id; }
        public void setDocument_id(Long document_id) { this.document_id = document_id; }
        public Long getApplication_id() { return application_id; }
        public void setApplication_id(Long application_id) { this.application_id = application_id; }
        public String getTracking_id() { return tracking_id; }
        public void setTracking_id(String tracking_id) { this.tracking_id = tracking_id; }
        public String getDocument_type() { return document_type; }
        public void setDocument_type(String document_type) { this.document_type = document_type; }
        public String getFile_name() { return file_name; }
        public void setFile_name(String file_name) { this.file_name = file_name; }
        public String getFile_path() { return file_path; }
        public void setFile_path(String file_path) { this.file_path = file_path; }
        public String getFile_size() { return file_size; }
        public void setFile_size(String file_size) { this.file_size = file_size; }
        public String getUploaded_at() { return uploaded_at; }
        public void setUploaded_at(String uploaded_at) { this.uploaded_at = uploaded_at; }
        public String getApplicant_name() { return applicant_name; }
        public void setApplicant_name(String applicant_name) { this.applicant_name = applicant_name; }
        public String getNational_id_number() { return national_id_number; }
        public void setNational_id_number(String national_id_number) { this.national_id_number = national_id_number; }
        public String getApplication_status() { return application_status; }
        public void setApplication_status(String application_status) { this.application_status = application_status; }
    }

    public record DocumentsResponse(boolean success, long count, List<DocumentDto> documents) {}
}