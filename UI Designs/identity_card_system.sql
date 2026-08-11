-- MySQL Workbench Forward Engineering / Reverse Engineering Schema
-- Schema: identity_card_system
-- -----------------------------------------------------

DROP SCHEMA IF EXISTS `identity_card_system`;
CREATE SCHEMA IF NOT EXISTS `identity_card_system` DEFAULT CHARACTER SET utf8mb4 ;
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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;

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
) ENGINE = InnoDB;