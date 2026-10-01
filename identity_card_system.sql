use identity_card_system;

-- =====================================================
-- NexusGov Identity Card Issuing System
-- Complete T-SQL Schema & Database Seed Script for SSMS
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'identity_card_system')
BEGIN
    CREATE DATABASE [identity_card_system];
END
GO

USE [identity_card_system];
GO

-- -----------------------------------------------------
-- Drop Tables if Exists (Order matters for Foreign Keys)
-- -----------------------------------------------------
IF OBJECT_ID('dbo.audit_logs', 'U') IS NOT NULL DROP TABLE dbo.audit_logs;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.identity_cards', 'U') IS NOT NULL DROP TABLE dbo.identity_cards;
IF OBJECT_ID('dbo.documents', 'U') IS NOT NULL DROP TABLE dbo.documents;
IF OBJECT_ID('dbo.verifications', 'U') IS NOT NULL DROP TABLE dbo.verifications;
IF OBJECT_ID('dbo.applications', 'U') IS NOT NULL DROP TABLE dbo.applications;
IF OBJECT_ID('dbo.applicants', 'U') IS NOT NULL DROP TABLE dbo.applicants;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- -----------------------------------------------------
-- Table [users]
-- -----------------------------------------------------
CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Citizen',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_users PRIMARY KEY CLUSTERED (user_id),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT CHK_users_role CHECK (role IN ('Admin', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Citizen'))
);
GO

-- -----------------------------------------------------
-- Table [applicants]
-- -----------------------------------------------------
CREATE TABLE dbo.applicants (
    applicant_id INT IDENTITY(1,1) NOT NULL,
    national_id_number VARCHAR(20) NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NULL,
    photo_path VARCHAR(255) NULL,
    registered_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_applicants PRIMARY KEY CLUSTERED (applicant_id),
    CONSTRAINT UQ_applicants_national_id UNIQUE (national_id_number),
    CONSTRAINT CHK_applicants_gender CHECK (gender IN ('Male', 'Female', 'Other'))
);
GO

-- -----------------------------------------------------
-- Table [applications]
-- -----------------------------------------------------
CREATE TABLE dbo.applications (
    application_id INT IDENTITY(1,1) NOT NULL,
    applicant_id INT NOT NULL,
    application_type VARCHAR(20) NOT NULL DEFAULT 'New',
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    processed_by INT NULL,
    remarks NVARCHAR(MAX) NULL,
    submitted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_applications PRIMARY KEY CLUSTERED (application_id),
    CONSTRAINT CHK_applications_type CHECK (application_type IN ('New', 'Renewal', 'Replacement')),
    CONSTRAINT CHK_applications_status CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued')),
    CONSTRAINT fk_applications_applicants FOREIGN KEY (applicant_id) REFERENCES dbo.applicants (applicant_id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_users FOREIGN KEY (processed_by) REFERENCES dbo.users (user_id) ON DELETE SET NULL
);
GO

-- Trigger to emulate MySQL's ON UPDATE CURRENT_TIMESTAMP
CREATE TRIGGER trg_applications_updated_at
ON dbo.applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.applications
    SET updated_at = GETDATE()
    FROM dbo.applications a
    INNER JOIN inserted i ON a.application_id = i.application_id;
END;
GO

-- -----------------------------------------------------
-- Table [verifications]
-- -----------------------------------------------------
CREATE TABLE dbo.verifications (
    verification_id INT IDENTITY(1,1) NOT NULL,
    application_id INT NOT NULL,
    applicant_id INT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'AI-BOT',
    result VARCHAR(20) NOT NULL DEFAULT 'Inconclusive',
    passed BIT NOT NULL DEFAULT 0,
    score INT NOT NULL DEFAULT 0,
    notes NVARCHAR(MAX) NULL,
    verified_by INT NULL,
    verified_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_verifications PRIMARY KEY CLUSTERED (verification_id),
    CONSTRAINT CHK_verifications_method CHECK (method IN ('AI-BOT', 'MANUAL')),
    CONSTRAINT CHK_verifications_result CHECK (result IN ('Verified', 'Flagged', 'Inconclusive')),
    CONSTRAINT fk_verifications_applications FOREIGN KEY (application_id) REFERENCES dbo.applications (application_id) ON DELETE CASCADE
);
GO

CREATE INDEX idx_ver_application_id ON dbo.verifications(application_id);
CREATE INDEX idx_ver_applicant_id ON dbo.verifications(applicant_id);
GO

-- -----------------------------------------------------
-- Table [documents]
-- -----------------------------------------------------
CREATE TABLE dbo.documents (
    document_id INT IDENTITY(1,1) NOT NULL,
    application_id INT NOT NULL,
    document_type NVARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_documents PRIMARY KEY CLUSTERED (document_id),
    CONSTRAINT fk_documents_applications FOREIGN KEY (application_id) REFERENCES dbo.applications (application_id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------
-- Table [identity_cards]
-- -----------------------------------------------------
CREATE TABLE dbo.identity_cards (
    card_id INT IDENTITY(1,1) NOT NULL,
    application_id INT NOT NULL,
    applicant_id INT NOT NULL,
    card_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'Active',
    issued_by INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_identity_cards PRIMARY KEY CLUSTERED (card_id),
    CONSTRAINT UQ_identity_cards_application_id UNIQUE (application_id),
    CONSTRAINT UQ_identity_cards_card_number UNIQUE (card_number),
    CONSTRAINT CHK_identity_cards_status CHECK (status IN ('Active', 'Expired', 'Revoked', 'Lost')),
    CONSTRAINT fk_cards_applications FOREIGN KEY (application_id) REFERENCES dbo.applications (application_id) ON DELETE CASCADE,
    CONSTRAINT fk_cards_applicants FOREIGN KEY (applicant_id) REFERENCES dbo.applicants (applicant_id) ON DELETE NO ACTION,
    CONSTRAINT fk_cards_users FOREIGN KEY (issued_by) REFERENCES dbo.users (user_id) ON DELETE SET NULL
);
GO

-- -----------------------------------------------------
-- Table [payments]
-- -----------------------------------------------------
CREATE TABLE dbo.payments (
    payment_id INT IDENTITY(1,1) NOT NULL,
    application_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(10) NOT NULL,
    payment_status VARCHAR(10) NOT NULL DEFAULT 'Pending',
    transaction_ref VARCHAR(100) NULL,
    paid_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_payments PRIMARY KEY CLUSTERED (payment_id),
    CONSTRAINT UQ_payments_transaction_ref UNIQUE (transaction_ref),
    CONSTRAINT CHK_payments_method CHECK (payment_method IN ('Cash', 'Card', 'Online')),
    CONSTRAINT CHK_payments_status CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
    CONSTRAINT fk_payments_applications FOREIGN KEY (application_id) REFERENCES dbo.applications (application_id) ON DELETE CASCADE
);
GO

-- -----------------------------------------------------
-- Table [audit_logs]
-- -----------------------------------------------------
CREATE TABLE dbo.audit_logs (
    log_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details NVARCHAR(MAX) NULL,
    timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_audit_logs PRIMARY KEY CLUSTERED (log_id),
    CONSTRAINT fk_logs_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE SET NULL
);
GO

-- =====================================================
-- SEED DATA INSERTS
-- =====================================================

-- Seed Users
SET IDENTITY_INSERT dbo.users ON;
INSERT INTO dbo.users (user_id, username, password_hash, full_name, email, role) VALUES
(1, 'admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'System Administrator', 'admin@nexusgov.lk', 'Admin'),
(2, 'thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin'),
(3, 'officer1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'Form Handling Officer Perera', 'officer1@nexusgov.lk', 'Form-Officer'),
(4, 'approver1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'Senior Approver Jayawardena', 'approver1@nexusgov.lk', 'Approver'),
(5, 'document_officer1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'Document Handling Officer Silva', 'document-officer@nexusgov.lk', 'Document-Officer'),
(6, 'operational1', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', N'Operational Specialist Silva', 'operational@nexusgov.lk', 'Operational');
SET IDENTITY_INSERT dbo.users OFF;
GO

-- Seed Applicants
SET IDENTITY_INSERT dbo.applicants ON;
INSERT INTO dbo.applicants (applicant_id, national_id_number, first_name, last_name, date_of_birth, gender, address, phone_number, email) VALUES
(1, '200512345678', N'Thilina', N'Sakalasooriya', '2005-01-01', 'Male', N'No. 12, Main Street, Malabe, Colombo', '+94771234567', 'thilina.s@gmail.com'),
(2, '200456789012', N'Kavindi', N'Perera', '2004-05-14', 'Female', N'No. 45, Temple Road, Kandy', '+94719876543', 'kavindi.p@yahoo.com'),
(3, '200389012345', N'Dilshan', N'Senanayake', '2003-09-12', 'Male', N'No. 78, Highlevel Road, Nugegoda', '+94778889900', 'dilshan.s@gmail.com');
SET IDENTITY_INSERT dbo.applicants OFF;
GO

-- Seed Applications
SET IDENTITY_INSERT dbo.applications ON;
INSERT INTO dbo.applications (application_id, applicant_id, application_type, status, processed_by, remarks, submitted_at) VALUES
(1, 1, 'New', 'Issued', 2, N'Biometrics and Grama Niladhari verification approved.', '2026-08-01 09:30:00'),
(2, 2, 'New', 'Pending', NULL, N'Awaiting document review', '2026-08-06 11:45:00'),
(3, 3, 'Renewal', 'Approved', 2, N'Renewal document verified', '2026-08-08 08:15:00');
SET IDENTITY_INSERT dbo.applications OFF;
GO

-- Seed Verifications
SET IDENTITY_INSERT dbo.verifications ON;
INSERT INTO dbo.verifications (verification_id, application_id, applicant_id, method, result, passed, score, notes, verified_by, verified_at) VALUES
(1, 1, 1, 'AI-BOT', 'Verified', 1, 96, N'Automated Bot Check: PASSED (Match Score: 96%). Birth Certificate cross-validated against the official civil registry.', 2, '2026-08-01 09:32:00'),
(2, 2, 2, 'AI-BOT', 'Flagged', 0, 63, N'Automated Bot Check: INCONCLUSIVE (Match Score: 63%). Discrepancies detected — forwarded for human officer review.', NULL, '2026-08-06 12:00:00'),
(3, 3, 3, 'AI-BOT', 'Verified', 1, 91, N'Renewal document verified by AI Bot against registrar criteria.', 2, '2026-08-08 08:16:00');
SET IDENTITY_INSERT dbo.verifications OFF;
GO

-- Seed Identity Cards
SET IDENTITY_INSERT dbo.identity_cards ON;
INSERT INTO dbo.identity_cards (card_id, application_id, applicant_id, card_number, issue_date, expiry_date, status, issued_by) VALUES
(1, 1, 1, '200512345678', '2026-08-03', '2036-08-03', 'Active', 2);
SET IDENTITY_INSERT dbo.identity_cards OFF;
GO

-- Seed Payments
SET IDENTITY_INSERT dbo.payments ON;
INSERT INTO dbo.payments (payment_id, application_id, amount, payment_method, payment_status, transaction_ref) VALUES
(1, 1, 2000.00, 'Card', 'Completed', 'TXN-2026-001'),
(2, 2, 2000.00, 'Online', 'Completed', 'TXN-2026-002'),
(3, 3, 2500.00, 'Cash', 'Completed', 'TXN-2026-003');
SET IDENTITY_INSERT dbo.payments OFF;
GO

-- Seed Audit Logs
SET IDENTITY_INSERT dbo.audit_logs ON;
INSERT INTO dbo.audit_logs (log_id, user_id, action, details) VALUES
(1, 1, 'SYSTEM_INIT', N'Database schema created and initial seed data populated.'),
(2, 2, 'APPLICATION_APPROVED', N'Approved application #1 for applicant Thilina Sakalasooriya.');
SET IDENTITY_INSERT dbo.audit_logs OFF;
GO