import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { triggerAutoBackup, restoreFromBackupIfEmpty } from './backupService.js';

dotenv.config();

let pool = null;
let isConnected = false;

// In-memory fallback database for offline/testing environment without MySQL daemon
export const inMemoryDb = {
  // NOTE: All staff passwords are '#Thilina2005' | Admin fallback also accepts 'admin123'
  // Citizen password is '#Thilina2005'
  users: [
    {
      user_id: 1,
      username: 'admin',
      email: 'admin@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'System Administrator',
      role: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      user_id: 2,
      username: 'thilina_admin',
      email: 'thilinasakalasooriya@gmail.com',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Thilina Sakalasooriya',
      role: 'Approver',
      created_at: new Date().toISOString()
    },
    {
      user_id: 3,
      username: 'Form_Officer_Thilina',
      email: 'form-officer@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Form Handling Officer Perera',
      role: 'Form-Officer',
      created_at: new Date().toISOString()
    },
    {
      user_id: 4,
      username: 'approver_nimesh',
      email: 'approver@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Senior Approver Jayawardena',
      role: 'Approver',
      created_at: new Date().toISOString()
    },
    {
      user_id: 7,
      username: 'Document_Officer_Silva',
      email: 'document-officer@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Document Handling Officer Silva',
      role: 'Document-Officer',
      created_at: new Date().toISOString()
    },
    {
      user_id: 6,
      username: 'operational',
      email: 'operational@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Operational Specialist Silva',
      role: 'Operational',
      created_at: new Date().toISOString()
    },
    {
      user_id: 8,
      username: 'delivery_manager',
      email: 'delivery-manager@nexusgov.lk',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Delivery Manager Fernando',
      role: 'Delivery-Manager',
      created_at: new Date().toISOString()
    },
    {
      user_id: 5,
      username: 'Citizen_Thilina',
      email: 'spokenengadamin@gmail.com',
      password_hash: '$2a$10$UecDKcSyKVxjBpxp1Pb.EOH4DAaobdPjNp8BsugMpRkDd9HcFTWoy', // bcrypt for #Thilina2005
      full_name: 'Thilina Citizen',
      role: 'Citizen',
      created_at: new Date().toISOString()
    }
  ],
  applications: [
    {
      application_id: 1,
      tracking_id: 'NEX-2026-90412',
      first_name: 'Thilina',
      last_name: 'Sakalasooriya',
      fullNameEn: 'Thilina Sakalasooriya',
      national_id_number: '200512345678',
      dob: '2005-01-01',
      gender: 'Male',
      address: 'No. 12, Main Street, Malabe, Colombo',
      phone_number: '+94 77 123 4567',
      phone: '+94 77 123 4567',
      email: 'thilina.s@gmail.com',
      status: 'Verification-Passed',
      application_type: 'New',
      remarks: 'All biometrics approved.',
      assigned_officer: null,
      application_reason: 'G.C.E O/L',
      marital_status: 'Single',
      service_type: 'Normal',
      bot_verified: true,
      bot_score: 92,
      bot_notes: 'Automated Bot Check: PASSED (Match Score: 92%). Official Birth Certificate confirmed for Thilina Sakalasooriya. Demographic data and registration format validated with official registrar criteria.',
      bot_verified_at: '2026-08-01 09:35:00',
      submitted_at: '2026-08-01'
    },
    {
      application_id: 2,
      tracking_id: 'NEX-2026-90415',
      first_name: 'Kavindu',
      last_name: 'Perera',
      fullNameEn: 'Kavindu Perera',
      national_id_number: '',
      dob: '2004-05-14',
      gender: 'Male',
      address: 'No. 45/A, Galle Road, Moratuwa',
      phone_number: '+94 71 987 6543',
      phone: '+94 71 987 6543',
      email: 'kavindu.p@gmail.com',
      status: 'Verification-Passed',
      application_type: 'New',
      remarks: 'Automated document scan complete. Ready for officer sign-off.',
      assigned_officer: null,
      application_reason: 'G.C.E O/L',
      marital_status: 'Single',
      service_type: '1-Day',
      bot_verified: true,
      bot_score: 96,
      bot_notes: 'Automated Bot Check: PASSED (Match Score: 96%). Official Birth Certificate confirmed for Kavindu Perera. Specimen Document validated against Sri Lanka civil registration criteria.',
      bot_verified_at: '2026-08-02 10:15:00',
      submitted_at: '2026-08-02'
    },
    {
      application_id: 3,
      tracking_id: 'NEX-2026-90421',
      first_name: 'Dinesh',
      last_name: 'Wijesinghe',
      fullNameEn: 'Dinesh Wijesinghe',
      national_id_number: '198812345678',
      dob: '1988-04-22',
      gender: 'Male',
      address: 'No. 78, Temple Lane, Kandy, Central Province',
      phone_number: '+94 70 555 1234',
      phone: '+94 70 555 1234',
      email: 'dinesh.w@example.com',
      status: 'Dispatched',
      application_type: 'New',
      remarks: 'Handed over to postal service. Awaiting last-mile delivery confirmation.',
      assigned_officer: null,
      application_reason: 'Identity replacement',
      marital_status: 'Married',
      service_type: 'Normal',
      bot_verified: true,
      bot_score: 94,
      bot_notes: 'Automated Bot Check: PASSED (Match Score: 94%).',
      bot_verified_at: '2026-08-04 08:20:00',
      submitted_at: '2026-08-04'
    },
    {
      application_id: 4,
      tracking_id: 'NEX-2026-90428',
      first_name: 'Chamari',
      last_name: 'Bandara',
      fullNameEn: 'Chamari Bandara',
      national_id_number: '199505678901',
      dob: '1995-11-03',
      gender: 'Female',
      address: 'No. 12/3, Hospital Road, Galle, Southern Province',
      phone_number: '+94 76 888 4321',
      phone: '+94 76 888 4321',
      email: 'chamari.b@example.com',
      status: 'Delivered',
      application_type: 'New',
      remarks: 'Card received and signed for by the applicant.',
      assigned_officer: 'Delivery Manager Fernando',
      application_reason: 'G.C.E O/L',
      marital_status: 'Married',
      service_type: '1-Day',
      bot_verified: true,
      bot_score: 97,
      bot_notes: 'Automated Bot Check: PASSED (Match Score: 97%).',
      bot_verified_at: '2026-08-05 09:05:00',
      submitted_at: '2026-08-05'
    },
    {
      application_id: 5,
      tracking_id: 'NEX-2026-90434',
      first_name: 'Ruwan',
      last_name: 'Ekanayake',
      fullNameEn: 'Ruwan Ekanayake',
      national_id_number: '197602345678',
      dob: '1976-07-19',
      gender: 'Male',
      address: 'No. 5, Station Road, Anuradhapura, North Central Province',
      phone_number: '+94 75 222 7788',
      phone: '+94 75 222 7788',
      email: 'ruwan.e@example.com',
      status: 'Not-Delivered',
      application_type: 'Renewal',
      remarks: 'First delivery attempt failed — address unreachable. Reattempt scheduled.',
      assigned_officer: 'Delivery Manager Fernando',
      application_reason: 'Annual renewal',
      marital_status: 'Married',
      service_type: 'Normal',
      bot_verified: true,
      bot_score: 91,
      bot_notes: 'Automated Bot Check: PASSED (Match Score: 91%).',
      bot_verified_at: '2026-08-06 11:40:00',
      submitted_at: '2026-08-06'
    }
  ],
  documents: [
    {
      document_id: 1,
      application_id: 1,
      document_type: 'Birth Certificate (Original Scan)',
      file_name: 'birth_certificate.pdf',
      file_path: '/uploads/documents/birth_certificate.pdf',
      file_size: '1.42 MB',
      uploaded_at: '2026-08-01 09:32:00'
    },
    {
      document_id: 2,
      application_id: 1,
      document_type: 'Grama Niladhari Certificate (Form DRP-1)',
      file_name: 'sample_grama_cert.jpg',
      file_path: '/uploads/documents/sample_grama_cert.jpg',
      file_size: '890 KB',
      uploaded_at: '2026-08-01 09:33:00'
    }
  ],
  verifications: [
    {
      verification_id: 1,
      application_id: 1,
      applicant_id: 1,
      method: 'AI-BOT',
      result: 'Verified',
      passed: 1,
      score: 96,
      notes: 'Automated Bot Check: PASSED (Match Score: 96%). Official Birth Certificate confirmed for Thilina Sakalasooriya. Demographic data and registration format validated with official registrar criteria.',
      verified_by: 1,
      verified_at: '2026-08-01 09:35:00'
    },
    {
      verification_id: 2,
      application_id: 2,
      applicant_id: 2,
      method: 'AI-BOT',
      result: 'Verified',
      passed: 1,
      score: 92,
      notes: 'Automated Bot Check: PASSED (Match Score: 92%). Official Birth Certificate confirmed for Kavindu Perera. Specimen Document validated against Sri Lanka civil registration criteria.',
      verified_by: 1,
      verified_at: '2026-08-02 10:15:00'
    }
  ],
  identity_cards: [
    {
      card_id: 1,
      card_number: '200512345678',
      application_id: 1,
      applicant_id: 1,
      issue_date: '2026-08-01',
      expiry_date: '2036-08-01',
      status: 'Active',
      issued_by: 1
    }
  ],
  audit_logs: [],
  account_deletion_requests: [],
  dispatch_records: []
};

export const initDb = async () => {
  try {
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    // First attempt server connection
    const tempConn = await mysql.createConnection(connectionConfig);

    // Ensure database exists
    const dbName = process.env.DB_NAME || 'identity_card_system';
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempConn.end();

    // Pool connection to database with resilient pooling & keep-alive
    pool = mysql.createPool({
      ...connectionConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      idleTimeout: 300000
    });

    pool.on('error', (err) => {
      console.warn('MySQL Pool Connection Error:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        isConnected = false;
      }
    });

    // Create Tables if not existing
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` INT NOT NULL AUTO_INCREMENT,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`role\` ENUM('Admin', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Delivery-Manager', 'Citizen') NOT NULL DEFAULT 'Citizen',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`user_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`applicants\` (
        \`applicant_id\` INT NOT NULL AUTO_INCREMENT,
        \`national_id_number\` VARCHAR(20) NOT NULL UNIQUE,
        \`first_name\` VARCHAR(50) NOT NULL,
        \`last_name\` VARCHAR(50) NOT NULL,
        \`date_of_birth\` DATE NOT NULL,
        \`gender\` ENUM('Male', 'Female', 'Other') NOT NULL,
        \`address\` TEXT NOT NULL,
        \`phone_number\` VARCHAR(15) NOT NULL,
        \`email\` VARCHAR(100) NULL,
        \`photo_path\` VARCHAR(255) NULL,
        \`registered_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`applicant_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`applications\` (
        \`application_id\` INT NOT NULL AUTO_INCREMENT,
        \`applicant_id\` INT NOT NULL,
        \`application_type\` ENUM('New', 'Renewal', 'Replacement') NOT NULL DEFAULT 'New',
        \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued', 'Dispatched', 'Delivered', 'Not-Delivered', 'Canceled', 'Verification-Passed', 'Documents-Required') NOT NULL DEFAULT 'Pending',
        \`processed_by\` INT NULL,
        \`assigned_officer\` VARCHAR(100) NULL,
        \`remarks\` TEXT NULL,
        \`submitted_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`application_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`verifications\` (
        \`verification_id\` INT NOT NULL AUTO_INCREMENT,
        \`application_id\` INT NOT NULL,
        \`applicant_id\` INT NULL,
        \`method\` ENUM('AI-BOT', 'MANUAL') NOT NULL DEFAULT 'AI-BOT',
        \`result\` ENUM('Verified', 'Flagged', 'Inconclusive') NOT NULL DEFAULT 'Inconclusive',
        \`passed\` TINYINT(1) NOT NULL DEFAULT 0,
        \`score\` INT NOT NULL DEFAULT 0,
        \`notes\` TEXT NULL,
        \`verified_by\` INT NULL,
        \`verified_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`verification_id\`),
        INDEX \`idx_ver_application_id\` (\`application_id\`),
        INDEX \`idx_ver_applicant_id\` (\`applicant_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`documents\` (
        \`document_id\` INT NOT NULL AUTO_INCREMENT,
        \`application_id\` INT NOT NULL,
        \`document_type\` VARCHAR(100) NOT NULL,
        \`file_name\` VARCHAR(255) NOT NULL,
        \`file_path\` LONGTEXT NOT NULL,
        \`file_size\` VARCHAR(50) NULL,
        \`uploaded_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`document_id\`),
        INDEX \`idx_doc_application_id\` (\`application_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`identity_cards\` (
        \`card_id\` INT NOT NULL AUTO_INCREMENT,
        \`card_number\` VARCHAR(50) NOT NULL UNIQUE,
        \`application_id\` INT NOT NULL UNIQUE,
        \`applicant_id\` INT NOT NULL,
        \`issue_date\` DATE NOT NULL,
        \`expiry_date\` DATE NOT NULL,
        \`status\` ENUM('Active', 'Expired', 'Lost', 'Revoked') NOT NULL DEFAULT 'Active',
        \`issued_by\` INT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`card_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`log_id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`details\` TEXT NULL,
        \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`log_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`account_deletion_requests\` (
        \`request_id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`username\` VARCHAR(50) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL,
        \`reason\` TEXT NULL,
        \`status\` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
        \`admin_notes\` TEXT NULL,
        \`requested_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`processed_at\` DATETIME NULL,
        \`processed_by\` INT NULL,
        PRIMARY KEY (\`request_id\`),
        INDEX \`idx_del_user_id\` (\`user_id\`),
        INDEX \`idx_del_status\` (\`status\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createTablesSQL);

    // Apply incremental schema migrations for pre-existing databases
    try {
      // Step 1: Add the new roles while keeping legacy 'Officer' so existing rows can migrate
      await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Officer', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Citizen') NOT NULL DEFAULT 'Citizen';`);
      // Step 2: Convert legacy Officer accounts to the new Form-Officer role
      await pool.query(`UPDATE users SET role = 'Form-Officer' WHERE LOWER(role) = 'officer';`);
      // Step 3: Retire the generic 'Officer' role from the schema
      await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Citizen') NOT NULL DEFAULT 'Citizen';`);
      // Step 4: Introduce the Delivery-Manager role for last-mile delivery tracking
      await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Delivery-Manager', 'Citizen') NOT NULL DEFAULT 'Citizen';`);
    } catch (e) { /* ignore if already updated */ }

    try {
      await pool.query(`ALTER TABLE applications MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued', 'Dispatched', 'Delivered', 'Not-Delivered', 'Canceled', 'Verification-Passed', 'Documents-Required') NOT NULL DEFAULT 'Pending';`);
    } catch (e) { /* ignore */ }

    // Create dispatch_records table if it does not exist (migration for pre-existing DBs)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`dispatch_records\` (
          \`dispatch_id\`        INT NOT NULL AUTO_INCREMENT,
          \`application_id\`     INT NOT NULL,
          \`tracking_id\`        VARCHAR(30) NOT NULL,
          \`applicant_name\`     VARCHAR(150) NOT NULL,
          \`nic_number\`         VARCHAR(20) NULL,
          \`dispatch_method\`    ENUM('Courier', 'Postal') NOT NULL DEFAULT 'Postal',
          \`delivery_address\`   TEXT NULL,
          \`dispatched_by\`      INT NULL,
          \`dispatched_by_name\` VARCHAR(100) NULL,
          \`dispatched_at\`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`notes\`              TEXT NULL,
          PRIMARY KEY (\`dispatch_id\`),
          INDEX \`idx_dispatch_app_id\` (\`application_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (e) { /* ignore if already exists */ }

    // Add photo_path column to applicants if missing
    try {
      await pool.query(`ALTER TABLE applicants ADD COLUMN photo_path VARCHAR(255) NULL;`);
    } catch (e) { /* ignore if already exists */ }

    // Migration: move bot verification data out of `applications` into the
    // dedicated `verifications` table owned by Verification Management
    const [cols] = await pool.query(`SHOW COLUMNS FROM applications;`);
    const colNames = cols.map(c => c.Field);

    if (colNames.includes('bot_verified') || colNames.includes('bot_score') ||
        colNames.includes('bot_notes') || colNames.includes('bot_verified_at')) {
      try {
        // Copy any leftover bot verification records into the verifications table
        await pool.query(`
          INSERT INTO verifications (application_id, applicant_id, method, result, passed, score, notes, verified_at)
          SELECT application_id, applicant_id, 'AI-BOT',
                 CASE WHEN bot_score >= 80 THEN 'Verified' WHEN bot_score > 0 THEN 'Flagged' ELSE 'Inconclusive' END,
                 COALESCE(bot_verified, 0), COALESCE(bot_score, 0), bot_notes, bot_verified_at
          FROM applications
          WHERE (bot_verified IS NOT NULL OR bot_score IS NOT NULL OR bot_notes IS NOT NULL OR bot_verified_at IS NOT NULL)
            AND application_id NOT IN (SELECT DISTINCT application_id FROM verifications);
        `);
      } catch (e) { /* ignore if migration already done */ }

      try {
        await pool.query(`ALTER TABLE applications DROP COLUMN bot_verified;`);
      } catch (e) { /* ignore if already dropped */ }
      try {
        await pool.query(`ALTER TABLE applications DROP COLUMN bot_score;`);
      } catch (e) { /* ignore if already dropped */ }
      try {
        await pool.query(`ALTER TABLE applications DROP COLUMN bot_notes;`);
      } catch (e) { /* ignore if already dropped */ }
      try {
        await pool.query(`ALTER TABLE applications DROP COLUMN bot_verified_at;`);
      } catch (e) { /* ignore if already dropped */ }
    }

    if (!colNames.includes('assigned_officer')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN assigned_officer VARCHAR(100) NULL;`);
    }
    if (!colNames.includes('application_reason')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN application_reason VARCHAR(100) NULL;`);
    }
    if (!colNames.includes('marital_status')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN marital_status VARCHAR(50) NULL;`);
    }
    if (!colNames.includes('service_type')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN service_type ENUM('Normal', '1-Day') NOT NULL DEFAULT 'Normal';`);
    }

    // Seed Admin User thilinasakalasooriya@gmail.com if not exists
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin');
    `);

    // Seed default admin
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'System Administrator', 'admin@nexusgov.lk', 'Admin');
    `);

    // Seed default form handling officer
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('form_officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Form Handling Officer Perera', 'form-officer@nexusgov.lk', 'Form-Officer');
    `);

    // Seed default document handling officer
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('document_officer', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Document Handling Officer Silva', 'document-officer@nexusgov.lk', 'Document-Officer');
    `);

    // Seed default senior approver
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('approver', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Senior Approver Jayawardena', 'approver@nexusgov.lk', 'Approver');
    `);

    // Seed default operational staff
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('operational', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Operational Specialist Silva', 'operational@nexusgov.lk', 'Operational');
    `);

    // Seed default delivery manager
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('delivery_manager', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Delivery Manager Fernando', 'delivery-manager@nexusgov.lk', 'Delivery-Manager');
    `);

    // Repair: databases restored from backup may have seeded staff accounts with an
    // empty role (INSERT IGNORE cannot overwrite the bad row). Without this, the
    // Delivery-Manager JWT carries role "" and every /api/delivery call returns 403.
    try {
      await pool.query(`
        UPDATE users
        SET role = CASE username
          WHEN 'admin' THEN 'Admin'
          WHEN 'thilina_admin' THEN 'Admin'
          WHEN 'form_officer' THEN 'Form-Officer'
          WHEN 'document_officer' THEN 'Document-Officer'
          WHEN 'approver' THEN 'Approver'
          WHEN 'operational' THEN 'Operational'
          WHEN 'delivery_manager' THEN 'Delivery-Manager'
        END
        WHERE username IN ('admin', 'thilina_admin',
                           'form_officer', 'document_officer', 'approver', 'operational', 'delivery_manager')
          AND CAST(role AS CHAR) NOT IN ('Admin', 'Form-Officer', 'Document-Officer', 'Approver', 'Operational', 'Delivery-Manager')
      `);
    } catch (e) { /* ignore if role column is not in expected shape */ }

    isConnected = true;
    console.log('Connected to MySQL Database successfully and schema migrations verified!');

    // Check if database is empty; if so, automatically restore all records from backup file
    await restoreFromBackupIfEmpty(pool, inMemoryDb);

    // Initial baseline sync to backup file
    triggerAutoBackup(pool, inMemoryDb, 'System startup baseline sync');
  } catch (error) {
    console.warn('MySQL Connection Note:', error.message);
    console.log('Operating in Full-Stack Hybrid SQL mode (In-Memory Database Ready).');
    isConnected = false;

    // Check if in-memory database is empty; if so, restore from backup file
    restoreFromBackupIfEmpty(null, inMemoryDb);
  }
};

export const queryDb = async (sql, params = [], retryCount = 1) => {
  if (isConnected && pool) {
    try {
      const [results] = await pool.query(sql, params);

      // Instantly back up whenever data is modified
      const upperSql = (sql || '').trim().toUpperCase();
      if (
        upperSql.startsWith('INSERT') ||
        upperSql.startsWith('UPDATE') ||
        upperSql.startsWith('DELETE') ||
        upperSql.startsWith('REPLACE') ||
        upperSql.startsWith('ALTER')
      ) {
        triggerAutoBackup(pool, inMemoryDb, sql.slice(0, 100).replace(/\s+/g, ' '));
      }

      return results;
    } catch (err) {
      const isTransient = [
        'PROTOCOL_CONNECTION_LOST',
        'ECONNRESET',
        'ETIMEDOUT',
        'EPIPE',
        'ER_LOCK_DEADLOCK',
        'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
      ].includes(err.code);

      if (isTransient && retryCount > 0) {
        console.warn(`Transient database error (${err.code}). Reconnecting & retrying query...`);
        try {
          await pool.query('SELECT 1');
        } catch (_) { /* ignore ping */ }
        return queryDb(sql, params, retryCount - 1);
      }
      console.error('MySQL query error:', err.message);
      throw err;
    }
  } else if (!isConnected && inMemoryDb) {
    // If running in offline hybrid in-memory mode, still back up changes
    const upperSql = (sql || '').trim().toUpperCase();
    if (
      upperSql.startsWith('INSERT') ||
      upperSql.startsWith('UPDATE') ||
      upperSql.startsWith('DELETE')
    ) {
      triggerAutoBackup(null, inMemoryDb, sql.slice(0, 100).replace(/\s+/g, ' '));
    }
  }
  return null;
};

export const triggerInstantBackup = (actionDesc = 'Database state updated') => {
  triggerAutoBackup(pool, inMemoryDb, actionDesc);
};

export const getDbStatus = () => isConnected;

export default {
  initDb,
  queryDb,
  getDbStatus,
  triggerInstantBackup,
  inMemoryDb
};
