-- ====================================================================
-- NexusGov Identity Card Issuing System
-- Data Reset Script (Preserving Staff Emails & Staff Accounts)
-- ====================================================================

USE `identity_card_system`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Clear all audit logs
DELETE FROM `audit_logs`;
ALTER TABLE `audit_logs` AUTO_INCREMENT = 1;

-- 2. Clear all issued identity cards
DELETE FROM `identity_cards`;
ALTER TABLE `identity_cards` AUTO_INCREMENT = 1;

-- 3. Clear all applications
DELETE FROM `applications`;
ALTER TABLE `applications` AUTO_INCREMENT = 1;

-- 4. Clear all applicants' personal information
DELETE FROM `applicants`;
ALTER TABLE `applicants` AUTO_INCREMENT = 1;

-- 5. Clear payments table if it exists
SET @has_payments = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'payments');
SET @sql_p1 = IF(@has_payments > 0, 'DELETE FROM `payments`', 'DO 0');
PREPARE stmt_p1 FROM @sql_p1;
EXECUTE stmt_p1;
DEALLOCATE PREPARE stmt_p1;

SET @sql_p2 = IF(@has_payments > 0, 'ALTER TABLE `payments` AUTO_INCREMENT = 1', 'DO 0');
PREPARE stmt_p2 FROM @sql_p2;
EXECUTE stmt_p2;
DEALLOCATE PREPARE stmt_p2;

-- 6. Clear documents table if it exists
SET @has_documents = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'documents');
SET @sql_d1 = IF(@has_documents > 0, 'DELETE FROM `documents`', 'DO 0');
PREPARE stmt_d1 FROM @sql_d1;
EXECUTE stmt_d1;
DEALLOCATE PREPARE stmt_d1;

SET @sql_d2 = IF(@has_documents > 0, 'ALTER TABLE `documents` AUTO_INCREMENT = 1', 'DO 0');
PREPARE stmt_d2 FROM @sql_d2;
EXECUTE stmt_d2;
DEALLOCATE PREPARE stmt_d2;

-- 7. Remove non-staff users (Citizens / citizen test accounts)
-- Preserving all staff accounts (Admin, Officer, Approver) and their emails intact
DELETE FROM `users` 
WHERE `role` = 'Citizen' 
   OR `username` LIKE 'Citizen%' 
   OR `role` NOT IN ('Admin', 'Officer', 'Approver');

SET FOREIGN_KEY_CHECKS = 1;
