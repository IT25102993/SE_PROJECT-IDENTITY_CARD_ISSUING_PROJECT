-- =============================================================
-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP
-- Generated / Synced: 2026-09-17T06:21:52.843Z
-- Total Applications: 3
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Table: users (7 records)
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (1, 'thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (2, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (17, 'officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Officer Wickramasinghe', 'officer@nexusgov.lk', 'Officer', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (18, 'approver', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver@nexusgov.lk', 'Approver', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (23, 'citizen_thilina', '$2a$10$d7c4JYu9y3EDOZKTyxYnQe7tnvpbvFtAJxq4JT3txY6eE0K7gInza', 'Thilina new', 'sakaleyt@gmail.com', 'Citizen', '2026-09-17 00:41:39');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (28, 'nadun_nimesh', '$2a$10$Jo47Byg7bXaPR9LxrXqOUOsXevk.rRLQMcgpRg2N1kbEjuTGgUwq.', 'Nadun Nimesh', 'kgnadunnimesh@gmail.com', 'Citizen', '2026-09-17 03:20:06');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (29, 'thilinapak', '$2a$10$TngWAqpOyLk2Zlc.Ri8hs.bcFHdTmhcggfjg/gTMBbG4FRmV6ugDK', 'thilinapak', 'thilinapak@gmail.com', 'Citizen', '2026-09-17 03:40:58');

-- Table: applicants (3 records)
INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`, `registered_at`) VALUES (1, '200509055367', 'Thilina', 'Sakalasooriya', '2005-03-30 18:00:00', 'Male', 'test address 1', '0712513663', 'kgnadunnimesh@gmail.com', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);
INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`, `registered_at`) VALUES (2, '200200476386', 'KULASINGHA', 'GAMAGE NADUN NIMESH', '2002-01-03 18:00:00', 'Male', '65/6,siyambalape waththa,dewala rd,delgoda', '0703064656', 'kgnadunnimesh@gmail.com', '2026-09-17 03:30:50') ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);
INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`, `registered_at`) VALUES (3, '200015775429', 'Nimesh', 'namnugama', '2000-06-03 18:00:00', 'Male', 'test address', '071 251 3663', 'sakaleyt@gmail.com', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `first_name`=VALUES(`first_name`);

-- Table: applications (3 records)
INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `bot_verified`, `bot_score`, `bot_notes`, `assigned_officer`, `application_reason`, `marital_status`, `service_type`, `remarks`, `submitted_at`) VALUES (1, 1, 'New', 'Pending', 1, 95, 'Automated Bot Check: PASSED (Match Score: 95\%). Official Birth Certificate confirmed for Thilina Sakalasooriya.\n• Specimen Document: birthcerificate.pdf (Official Register of Births, Sri Lanka)\n• PDF Recorded Name: \"Thilina Srimal Sakalasooriya\" -> Applicant Name: \"Thilina Sakalasooriya\" (100\% match)\n• PDF Recorded Birth Date: 2005 May 31 (2005-05-31) -> Applicant DOB: \"2005-03-31\" (85\% match)\n• PDF Recorded Sex: Male -> Applicant Gender: \"Male\" (100\% match)\n• PDF Administrative Jurisdiction: District: Gampaha | Division: Ragama\n• Document Authenticity: 100\% Verified (Sri Lanka official registrar formatting, legal headings, and security criteria validated).', NULL, 'G.C.E O/L', 'Single', 'Normal', 'Fast-Track Approved by thilinapak. Validated by AI Bot Verification Engine (Score: 95\%).', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);
INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `bot_verified`, `bot_score`, `bot_notes`, `assigned_officer`, `application_reason`, `marital_status`, `service_type`, `remarks`, `submitted_at`) VALUES (2, 2, 'New', 'Pending', 0, 62, 'Automated Bot Check: INCONCLUSIVE (Match Score: 62\%). Below 80\% threshold.\n• Specimen Document: birth_certificate.pdf\n• Discrepancies detected between submitted data (\"KULASINGHA GAMAGE NADUN NIMESH\", DOB: \"2002-01-04\") and official register details (\"Thilina Srimal Sakalasooriya\", DOB: \"2005 May 31\"). Forwarded for human officer review.', 'thilinapak', 'G.C.E O/L', 'Single', 'Normal', 'New citizen online submission.', '2026-09-17 03:30:50') ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);
INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `bot_verified`, `bot_score`, `bot_notes`, `assigned_officer`, `application_reason`, `marital_status`, `service_type`, `remarks`, `submitted_at`) VALUES (3, 3, 'New', 'Pending', 0, 63, 'Automated Bot Check: INCONCLUSIVE (Match Score: 63\%). Below 80\% threshold.\n• Specimen Document: birthcerificate.pdf\n• Discrepancies detected between submitted data (\"Nimesh namnugama\", DOB: \"2004-02-03\") and official register details (\"Thilina Srimal Sakalasooriya\", DOB: \"2005 May 31\"). Forwarded for human officer review.', 'Officer Wickramasinghe', 'Wallet Got Stolen', 'Single', '1-Day', 'New citizen online submission.', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- Table: documents (9 records)
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (1, 1, 'Birth Certificate (Original Scan)', 'birthcerificate.pdf', '/uploads/documents/1789605864300_birthcerificate.pdf', '170 KB', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (2, 1, 'Bank Deposit / CDM Teller Slip', 'download (26).png', '/uploads/documents/1789605864308_download__26_.png', '162 KB', '2026-09-17 00:44:24') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (3, 2, 'Birth Certificate (Original Scan)', 'birth_certificate.pdf', '/uploads/documents/1789615850418_birth_certificate.pdf', '69 KB', '2026-09-17 03:30:50') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (4, 2, 'Grama Niladhari Certificate (Form DRP-1)', 'download (3).png', '/uploads/documents/1789615850424_download__3_.png', '813 KB', '2026-09-17 03:30:50') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (5, 2, 'Bank Deposit / CDM Teller Slip', 'light_cyan_apple_inc__lines_abstraction_4k_5k_hd_abstract-3840x2160.jpg', '/uploads/documents/1789615850431_light_cyan_apple_inc__lines_abstraction_4k_5k_hd_abstract-3840x2160.jpg', '439 KB', '2026-09-17 03:30:50') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (6, 3, 'Birth Certificate (Original Scan)', 'birthcerificate.pdf', '/uploads/documents/1789620345725_birthcerificate.pdf', '170 KB', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (7, 3, 'Grama Niladhari Certificate (Form DRP-1)', 'birthcerificate.pdf', '/uploads/documents/1789620345731_birthcerificate.pdf', '170 KB', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (8, 3, 'Bank Deposit / CDM Teller Slip', 'light_cyan_apple_inc__lines_abstraction_4k_5k_hd_abstract-3840x2160.jpg', '/uploads/documents/1789620345735_light_cyan_apple_inc__lines_abstraction_4k_5k_hd_abstract-3840x2160.jpg', '439 KB', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);
INSERT INTO `documents` (`document_id`, `application_id`, `document_type`, `file_name`, `file_path`, `file_size`, `uploaded_at`) VALUES (9, 3, 'Police Report (Wallet Stolen)', '5.png', '/uploads/documents/1789620345739_5.png', '16 KB', '2026-09-17 04:45:45') ON DUPLICATE KEY UPDATE `document_type`=VALUES(`document_type`);

-- Table: identity_cards (3 records)
INSERT INTO `identity_cards` (`card_id`, `card_number`, `application_id`, `applicant_id`, `issue_date`, `expiry_date`, `status`, `issued_by`, `created_at`) VALUES (1, '200509055367', 1, 1, '2026-09-16 18:30:00', '2036-09-16 18:30:00', 'Active', 2, '2026-09-17 00:47:05') ON DUPLICATE KEY UPDATE `card_number`=VALUES(`card_number`);
INSERT INTO `identity_cards` (`card_id`, `card_number`, `application_id`, `applicant_id`, `issue_date`, `expiry_date`, `status`, `issued_by`, `created_at`) VALUES (2, '200200476386', 2, 2, '2026-09-16 18:30:00', '2036-09-16 18:30:00', 'Active', 29, '2026-09-17 04:24:49') ON DUPLICATE KEY UPDATE `card_number`=VALUES(`card_number`);
INSERT INTO `identity_cards` (`card_id`, `card_number`, `application_id`, `applicant_id`, `issue_date`, `expiry_date`, `status`, `issued_by`, `created_at`) VALUES (4, '200015775429', 3, 3, '2026-09-16 18:30:00', '2036-09-16 18:30:00', 'Active', 17, '2026-09-17 05:16:03') ON DUPLICATE KEY UPDATE `card_number`=VALUES(`card_number`);

SET FOREIGN_KEY_CHECKS = 1;

-- ── RECENT UPDATE TRANSACTIONS (APPENDED LOG) ───────────────────────
-- [2026-09-17T04:21:49.431Z] UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, 
-- [2026-09-17T04:24:49.723Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:27:12.052Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:31:00.828Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:31:37.380Z] UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, 
-- [2026-09-17T04:31:44.070Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:32:15.475Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:45:45.806Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:53:53.091Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:54:17.083Z] UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, 
-- [2026-09-17T04:54:37.737Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:55:04.687Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T04:55:13.410Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:05:55.757Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:12:07.951Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:15:23.608Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:16:03.095Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:18:33.294Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:20:11.178Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:20:37.431Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:21:16.637Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T05:31:29.526Z] System startup baseline sync
-- [2026-09-17T05:31:53.897Z] System startup baseline sync
-- [2026-09-17T05:50:19.334Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:26.090Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:33.759Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:41.657Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:43.952Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:48.692Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
-- [2026-09-17T06:21:52.846Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
