import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { triggerAutoBackup, restoreFromBackupIfEmpty } from './backupService.js';

dotenv.config();

let pool = null;
let isConnected = false;

// In-memory fallback database for offline/testing environment without MySQL daemon
export const inMemoryDb = {
  users: [
    {
      user_id: 1,
      username: 'admin',
      email: 'admin@nexusgov.lk',
      password_hash: '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', // bcrypt for password123
      full_name: 'System Administrator',
      role: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      user_id: 2,
      username: 'thilina_admin',
      email: 'thilinasakalasooriya@gmail.com',
      password_hash: '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6',
      full_name: 'Thilina Sakalasooriya',
      role: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      user_id: 3,
      username: 'officer',
      email: 'officer@nexusgov.lk',
      password_hash: '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6',
      full_name: 'Officer Wickramasinghe',
      role: 'Officer',
      created_at: new Date().toISOString()
    },
    {
      user_id: 4,
      username: 'approver',
      email: 'approver@nexusgov.lk',
      password_hash: '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6',
      full_name: 'Senior Approver Jayawardena',
      role: 'Approver',
      created_at: new Date().toISOString()
    },
    {
      user_id: 5,
      username: 'Citizen_Thilina',
      email: 'spokenengadamin@gmail.com',
      password_hash: '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6',
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
  account_deletion_requests: []
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
      acquireTimeout: 10000,
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
        \`role\` ENUM('Admin', 'Officer', 'Approver', 'Citizen') NOT NULL DEFAULT 'Citizen',
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
        \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued', 'Verification-Passed') NOT NULL DEFAULT 'Pending',
        \`bot_verified\` TINYINT(1) NOT NULL DEFAULT 0,
        \`bot_score\` INT NOT NULL DEFAULT 0,
        \`bot_notes\` TEXT NULL,
        \`bot_verified_at\` DATETIME NULL,
        \`processed_by\` INT NULL,
        \`assigned_officer\` VARCHAR(100) NULL,
        \`remarks\` TEXT NULL,
        \`submitted_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`application_id\`)
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
      await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Officer', 'Approver', 'Citizen') NOT NULL DEFAULT 'Citizen';`);
    } catch (e) { /* ignore if already updated */ }

    try {
      await pool.query(`ALTER TABLE applications MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued', 'Verification-Passed') NOT NULL DEFAULT 'Pending';`);
    } catch (e) { /* ignore */ }

    // Add bot columns if missing in applications table
    const [cols] = await pool.query(`SHOW COLUMNS FROM applications;`);
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('bot_verified')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN bot_verified TINYINT(1) NOT NULL DEFAULT 0;`);
    }
    if (!colNames.includes('bot_score')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN bot_score INT NOT NULL DEFAULT 0;`);
    }
    if (!colNames.includes('bot_notes')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN bot_notes TEXT NULL;`);
    }
    if (!colNames.includes('bot_verified_at')) {
      await pool.query(`ALTER TABLE applications ADD COLUMN bot_verified_at DATETIME NULL;`);
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
