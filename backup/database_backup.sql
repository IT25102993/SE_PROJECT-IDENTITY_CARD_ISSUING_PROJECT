-- =============================================================
-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP
-- Generated / Synced: 2026-09-17T00:41:39.607Z
-- Total Applications: 0
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Table: users (5 records)
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (1, 'thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (2, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (17, 'officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Officer Wickramasinghe', 'officer@nexusgov.lk', 'Citizen', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (18, 'approver', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver@nexusgov.lk', 'Approver', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (23, 'citizen_thilina', '$2a$10$d7c4JYu9y3EDOZKTyxYnQe7tnvpbvFtAJxq4JT3txY6eE0K7gInza', 'Thilina new', 'sakaleyt@gmail.com', 'Citizen', '2026-09-17 00:41:39');

SET FOREIGN_KEY_CHECKS = 1;

-- ── RECENT UPDATE TRANSACTIONS (APPENDED LOG) ───────────────────────
-- [2026-09-17T00:32:20.156Z] System startup baseline sync
-- [2026-09-17T00:36:24.189Z] System startup baseline sync
-- [2026-09-17T00:37:12.690Z] UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, 
-- [2026-09-17T00:41:39.608Z] INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)
