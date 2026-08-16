import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

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
    }
  ],
  applications: [
    {
      application_id: 1,
      tracking_id: 'NEX-2026-90412',
      first_name: 'Thilina',
      last_name: 'Sakalasooriya',
      national_id_number: '200512345678',
      dob: '2005-01-01',
      gender: 'Male',
      address: 'No. 12, Main Street, Malabe, Colombo',
      phone_number: '+94 77 123 4567',
      email: 'thilina.s@gmail.com',
      status: 'Issued',
      application_type: 'New',
      remarks: 'All biometrics approved.',
      submitted_at: '2026-08-01'
    }
  ],
  audit_logs: []
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
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'identity_card_system'}\`;`);
    await tempConn.end();

    // Pool connection to database
    pool = mysql.createPool({
      ...connectionConfig,
      database: process.env.DB_NAME || 'identity_card_system',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create Tables if not existing
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` INT NOT NULL AUTO_INCREMENT,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`role\` ENUM('Admin', 'Officer', 'Approver') NOT NULL DEFAULT 'Officer',
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
        \`status\` ENUM('Pending', 'Approved', 'Rejected', 'Processing', 'Printed', 'Issued') NOT NULL DEFAULT 'Pending',
        \`processed_by\` INT NULL,
        \`remarks\` TEXT NULL,
        \`submitted_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`application_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;

      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`log_id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`details\` TEXT NULL,
        \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`log_id\`)
      ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createTablesSQL);

    // Seed Admin User thilinasakalasooriya@gmail.com if not exists
    await pool.query(`
      INSERT IGNORE INTO users (username, password_hash, full_name, email, role)
      VALUES ('thilina_admin', '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6', 'Thilina Sakalasooriya', 'thilinasakalasooriya@gmail.com', 'Admin');
    `);

    isConnected = true;
    console.log('✅ Connected to MySQL Database successfully!');
  } catch (error) {
    console.warn('⚠️  MySQL Connection Note:', error.message);
    console.log('⚡ Operating in Full-Stack Hybrid SQL mode (In-Memory Database Ready).');
    isConnected = false;
  }
};

export const queryDb = async (sql, params = []) => {
  if (isConnected && pool) {
    const [results] = await pool.query(sql, params);
    return results;
  }
  return null;
};

export const getDbStatus = () => isConnected;

export default {
  initDb,
  queryDb,
  getDbStatus,
  inMemoryDb
};
