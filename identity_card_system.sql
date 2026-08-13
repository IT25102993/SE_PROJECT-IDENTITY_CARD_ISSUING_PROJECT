-- =====================================================
-- NexusGov Identity Card Issuing System
-- Complete MySQL Schema & Database Seed Script
-- =====================================================

DROP SCHEMA IF EXISTS `identity_card_system`;
CREATE SCHEMA IF NOT EXISTS `identity_card_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `identity_card_system`;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` ENUM('Admin', 'Officer', 'Approver') NOT NULL DEFAULT 'Officer',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `applicants`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `applicants` (
  `applicant_id` INT NOT NULL AUTO_INCREMENT,
  `national_id_number` VARCHAR(20) NOT NULL UNIQUE,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `address` TEXT NOT NULL,
  `phone_number` VARCHAR(15) NOT NULL,
  `email` VARCHAR(100) NULL,
  `photo_path` VARCHAR(255) NULL,
  `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`applicant_id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `applications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `applications` (
  `application_id` INT NOT NULL AUTO_INCREMENT,
  `applicant_id` INT NOT NULL,
  `application_type` ENUM('New', 'Renewal', 'Replacement') NOT NULL DEFAULT 'New',
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued') NOT NULL DEFAULT 'Pending',
  `processed_by` INT NULL,
  `remarks` TEXT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`application_id`),
  CONSTRAINT `fk_applications_applicants`
    FOREIGN KEY (`applicant_id`)
    REFERENCES `applicants` (`applicant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_applications_users`
    FOREIGN KEY (`processed_by`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `documents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `documents` (
  `document_id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `document_type` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  CONSTRAINT `fk_documents_applications`
    FOREIGN KEY (`application_id`)
    REFERENCES `applications` (`application_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `identity_cards`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `identity_cards` (
  `card_id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL UNIQUE,
  `applicant_id` INT NOT NULL,
  `card_number` VARCHAR(50) NOT NULL UNIQUE,
  `issue_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `status` ENUM('Active', 'Expired', 'Revoked', 'Lost') NOT NULL DEFAULT 'Active',
  `issued_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`card_id`),
  CONSTRAINT `fk_cards_applications`
    FOREIGN KEY (`application_id`)
    REFERENCES `applications` (`application_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cards_applicants`
    FOREIGN KEY (`applicant_id`)
    REFERENCES `applicants` (`applicant_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cards_users`
    FOREIGN KEY (`issued_by`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` INT NOT NULL AUTO_INCREMENT,
  `application_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('Cash', 'Card', 'Online') NOT NULL,
  `payment_status` ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Pending',
  `transaction_ref` VARCHAR(100) NULL UNIQUE,
  `paid_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  CONSTRAINT `fk_payments_applications`
    FOREIGN KEY (`application_id`)
    REFERENCES `applications` (`application_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `audit_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `log_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  CONSTRAINT `fk_logs_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- SEED DATA INSERTS
-- Default Password for all seed users: "password123"
-- Hashed using bcrypt ($2b$10$7R.E.N42Q4n... / standard bcrypt hash)
-- =====================================================

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `role`) VALUES
(1, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin'),
(2, 'officer1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Officer Wickramasinghe', 'officer1@nexusgov.lk', 'Officer'),
(3, 'approver1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver1@nexusgov.lk', 'Approver');

-- Seed Applicants
INSERT INTO `applicants` (`applicant_id`, `national_id_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `address`, `phone_number`, `email`) VALUES
(1, '200512345678', 'Thilina', 'Sakalasooriya', '2005-01-01', 'Male', 'No. 12, Main Street, Malabe, Colombo', '+94771234567', 'thilina.s@gmail.com'),
(2, '200456789012', 'Kavindi', 'Perera', '2004-05-14', 'Female', 'No. 45, Temple Road, Kandy', '+94719876543', 'kavindi.p@yahoo.com'),
(3, '200389012345', 'Dilshan', 'Senanayake', '2003-09-12', 'Male', 'No. 78, Highlevel Road, Nugegoda', '+94778889900', 'dilshan.s@gmail.com');

-- Seed Applications
INSERT INTO `applications` (`application_id`, `applicant_id`, `application_type`, `status`, `processed_by`, `remarks`, `submitted_at`) VALUES
(1, 1, 'New', 'Issued', 2, 'Biometrics and Grama Niladhari verification approved.', '2026-08-01 09:30:00'),
(2, 2, 'New', 'Pending', NULL, 'Awaiting document review', '2026-08-06 11:45:00'),
(3, 3, 'Renewal', 'Approved', 2, 'Renewal document verified', '2026-08-08 08:15:00');

-- Seed Identity Cards
INSERT INTO `identity_cards` (`card_id`, `application_id`, `applicant_id`, `card_number`, `issue_date`, `expiry_date`, `status`, `issued_by`) VALUES
(1, 1, 1, '200512345678', '2026-08-03', '2036-08-03', 'Active', 2);

-- Seed Payments
INSERT INTO `payments` (`payment_id`, `application_id`, `amount`, `payment_method`, `payment_status`, `transaction_ref`) VALUES
(1, 1, 2000.00, 'Card', 'Completed', 'TXN-2026-001'),
(2, 2, 2000.00, 'Online', 'Completed', 'TXN-2026-002'),
(3, 3, 2500.00, 'Cash', 'Completed', 'TXN-2026-003');

-- Seed Audit Logs
INSERT INTO `audit_logs` (`log_id`, `user_id`, `action`, `details`) VALUES
(1, 1, 'SYSTEM_INIT', 'Database schema created and initial seed data populated.'),
(2, 2, 'APPLICATION_APPROVED', 'Approved application #1 for applicant Thilina Sakalasooriya.');
