-- =============================================================
-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP
-- Generated / Synced: 2026-09-17T00:32:20.156Z
-- Total Applications: 0
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Table: users (4 records)
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (1, 'thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (2, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin', '2026-09-16 08:56:11');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (17, 'officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Officer Wickramasinghe', 'officer@nexusgov.lk', 'Officer', '2026-09-17 00:22:14');
INSERT IGNORE INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`, `created_at`) VALUES (18, 'approver', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver@nexusgov.lk', 'Approver', '2026-09-17 00:22:14');

SET FOREIGN_KEY_CHECKS = 1;

-- ── RECENT UPDATE TRANSACTIONS (APPENDED LOG) ───────────────────────
-- [2026-09-17T00:32:20.156Z] System startup baseline sync
