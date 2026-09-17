-- =============================================================
-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP
-- Generated / Synced: 2026-09-17T00:48:31.207Z
-- Total Applications: 1
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Table: users (5 records)
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (1, 'thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (2, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (17, 'officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Officer Wickramasinghe', 'officer@nexusgov.lk', 'Citizen', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (18, 'approver', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver@nexusgov.lk', 'Approver', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (23, 'citizen_thilina', '$2a$10$d7c4JYu9y3EDOZKTyxYnQe7tnvpbvFtAJxq4JT3txY6eE0K7gInza', 'Thilina new', 'sakaleyt@gmail.com', 'Citizen', '2026-09-17 00:41:39');

-- Table: applicants (1 records)
INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`, `registered_at`) VALUES (1, '200509084440', 'Thilina', 'Sakalasooriya', '2005-03-30 18:00:00', 'Male', 'test address 1', '0712513663', 'kgnadunnimesh@gmail.com', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);

-- Table: applications (1 records)
INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `bot_verified`, `bot_score`, `bot_notes`, `assigned_officer`, `application_reason`, `marital_status`, `service_type`, `remarks`, `submitted_at`) VALUES (1, 1, 'New', 'Pending', 1, 95, 'Automated Bot Check: PASSED (Match Score: 95\%). Official Birth Certificate confirmed for Thilina Sakalasooriya.\n• Specimen Document: birthcerificate.pdf (Official Register of Births, Sri Lanka)\n• PDF Recorded Name: \"Thilina Srimal Sakalasooriya\" -> Applicant Name: \"Thilina Sakalasooriya\" (100\% match)\n• PDF Recorded Birth Date: 2005 May 31 (2005-05-31) -> Applicant DOB: \"2005-03-31\" (85\% match)\n• PDF Recorded Sex: Male -> Applicant Gender: \"Male\" (100\% match)\n• PDF Administrative Jurisdiction: District: Gampaha | Division: Ragama\n• Document Authenticity: 100\% Verified (Sri Lanka official registrar formatting, legal headings, and security criteria validated).', NULL, 'G.C.E O/L', 'Single', 'Normal', 'New citizen online submission.', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Table: documents (2 records)
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (1, 1, 'Birth Certificate (Original Scan)', 'birthcerificate.pdf', '/uploads/documents/1789605864300_birthcerificate.pdf', '170 KB', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (2, 1, 'Bank Deposit / CDM Teller Slip', 'download (26).png', '/uploads/documents/1789605864308_download__26_.png', '162 KB', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);

-- Table: identity_cards (1 records)
INSERT INTO `identity_cards` (`card_id`, `card_number`, `application_id`, `applicant_id`, `issue_date`, `expiry_date`, `status`, `issued_by`, `created_at`) VALUES (1, '200509084440', 1, 1, '2026-09-16 18:30:00', '2036-09-16 18:30:00', 'Active', 2, '2026-09-17 00:47:05') ON DUPLICATE KEY UPDATE `card_number`=VALUES(`card_number`);

SET FOREIGN_KEY_CHECKS = 1;

-- ── RECENT UPDATE TRANSACTIONS (APPENDED LOG) ───────────────────────
-- [2026-09-17T00:32:20.156Z] System startup baseline sync
-- [2026-09-17T00:36:24.189Z] System startup baseline sync
-- [2026-09-17T00:37:12.690Z] UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, 
-- [2026-09-17T00:41:39.608Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:44:24.378Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:46:17.614Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:46:19.191Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:46:20.780Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:46:24.922Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:47:05.631Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:48:15.215Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T00:48:31.208Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
