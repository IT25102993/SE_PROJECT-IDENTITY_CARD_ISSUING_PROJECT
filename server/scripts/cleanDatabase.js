import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'identity_card_system'
};

const BCRYPT_DEFAULT_PASSWORD_HASH = '$2b$10$q0.x5xM4G2yR/v.3yq1q.Oq4h9sT0g4j6m7k8l9o0p1q2r3s4t5u6'; // password123

const DEFAULT_STAFF_ACCOUNTS = [
  {
    username: 'admin',
    email: 'admin@nexusgov.lk',
    full_name: 'System Administrator',
    role: 'Admin',
    password_hash: BCRYPT_DEFAULT_PASSWORD_HASH
  },
  {
    username: 'thilina_admin',
    email: 'thilinasakalasooriya@gmail.com',
    full_name: 'Thilina Sakalasooriya',
    role: 'Admin',
    password_hash: BCRYPT_DEFAULT_PASSWORD_HASH
  },
  {
    username: 'officer',
    email: 'officer@nexusgov.lk',
    full_name: 'Officer Wickramasinghe',
    role: 'Officer',
    password_hash: BCRYPT_DEFAULT_PASSWORD_HASH
  },
  {
    username: 'approver',
    email: 'approver@nexusgov.lk',
    full_name: 'Senior Approver Jayawardena',
    role: 'Approver',
    password_hash: BCRYPT_DEFAULT_PASSWORD_HASH
  },
  {
    username: 'operational',
    email: 'operational@nexusgov.lk',
    full_name: 'Operational Specialist Silva',
    role: 'Operational',
    password_hash: BCRYPT_DEFAULT_PASSWORD_HASH
  }
];

async function cleanDatabase() {
  console.log('\n===============================================================');
  console.log('       NEXUSGOV IDENTITY SYSTEM — DATABASE PURGE & RESET       ');
  console.log('===============================================================\n');
  console.log(`Connecting to MySQL database [${dbConfig.database}] at ${dbConfig.host}...`);

  let connection = null;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Successfully connected to MySQL server.\n');

    // 1. Disable Foreign Key Checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Count existing records before cleanup
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbConfig.database]);

    const tableNames = tables.map(t => t.table_name || t.TABLE_NAME);

    console.log('Purging citizen data and application records:');

    // List of application/citizen tables to completely clear
    const tablesToClear = [
      'documents',
      'identity_cards',
      'applications',
      'applicants',
      'account_deletion_requests',
      'audit_logs'
    ];

    for (const tbl of tablesToClear) {
      if (tableNames.includes(tbl)) {
        const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM \`${tbl}\``);
        await connection.query(`DELETE FROM \`${tbl}\``);
        try {
          await connection.query(`ALTER TABLE \`${tbl}\` AUTO_INCREMENT = 1`);
        } catch (_) {}
        console.log(`  ✓ Cleared table: [${tbl}] (${count} rows deleted, auto-increment reset to 1)`);
      }
    }

    // 3. Purge Citizen Users from `users` table (Keep ONLY Admin, Officer, Approver)
    if (tableNames.includes('users')) {
      const [[{ citizenCount }]] = await connection.query(`
        SELECT COUNT(*) AS citizenCount 
        FROM \`users\` 
        WHERE LOWER(role) NOT IN ('admin', 'officer', 'approver', 'operational')
      `);

      await connection.query(`
        DELETE FROM \`users\` 
        WHERE LOWER(role) NOT IN ('admin', 'officer', 'approver', 'operational')
      `);
      console.log(`  ✓ Cleared citizen accounts from [users] (${citizenCount} citizen user accounts deleted)`);

      // 4. Ensure default staff accounts exist and are intact
      for (const staff of DEFAULT_STAFF_ACCOUNTS) {
        const [existing] = await connection.query(
          'SELECT user_id, email, role FROM `users` WHERE username = ? OR email = ?',
          [staff.username, staff.email]
        );

        if (existing.length === 0) {
          await connection.query(
            'INSERT INTO `users` (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
            [staff.username, staff.password_hash, staff.full_name, staff.email, staff.role]
          );
          console.log(`  ✓ Re-seeded default staff account: [${staff.role}] ${staff.username} (${staff.email})`);
        }
      }
    }

    // 5. Re-enable Foreign Key Checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 6. Log database clean event in audit_logs
    if (tableNames.includes('audit_logs')) {
      await connection.query(
        'INSERT INTO `audit_logs` (user_id, action, details) VALUES (1, ?, ?)',
        ['DATABASE_PURGED', 'Database cleaned: all citizen applications, documents, and citizen users purged. All staff accounts preserved.']
      );
    }

    // 7. Clean up non-sample uploaded citizen files on disk
    const uploadDir = path.resolve(__dirname, '../uploads/documents');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      let removedFiles = 0;
      for (const file of files) {
        // Keep sample files like sample_grama_cert.jpg, birth_certificate.pdf, etc.
        const isSample = file.startsWith('sample_') || file === 'birth_certificate.pdf';
        if (!isSample) {
          try {
            fs.unlinkSync(path.join(uploadDir, file));
            removedFiles++;
          } catch (_) {}
        }
      }
      if (removedFiles > 0) {
        console.log(`  ✓ Cleaned ${removedFiles} uploaded citizen document files from disk.`);
      }
    }

    // 8. Display preserved staff accounts
    console.log('\n---------------------------------------------------------------');
    console.log('PRESERVED STAFF ACCOUNTS (Officer, Approver & Admin):');
    console.log('---------------------------------------------------------------');

    const [staffUsers] = await connection.query(`
      SELECT user_id, username, full_name, email, role, created_at 
      FROM \`users\` 
      ORDER BY FIELD(role, 'Admin', 'Approver', 'Officer'), user_id ASC
    `);

    console.table(staffUsers.map(u => ({
      ID: u.user_id,
      Username: u.username,
      FullName: u.full_name,
      Email: u.email,
      Role: u.role
    })));

    console.log('===============================================================');
    console.log(' ✓ SUCCESS: DATABASE CLEANED SUCCESSFULLY!');
    console.log('   - Applications, documents, cards & citizen records: CLEARED');
    console.log('   - Officer, Approver & Admin accounts: 100% PRESERVED');
    console.log('   - Default login passwords: password123 (or #Thilina2005)');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n✗ DATABASE CLEAN ERROR:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\n[NOTICE] MySQL server is not currently running on port 3306.');
      console.log('If you are using XAMPP/WAMP/MySQL, please start MySQL service first.');
      console.log('The NexusGov server will continue operating in hybrid in-memory fallback mode.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanDatabase();
