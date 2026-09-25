import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target root folder: backup/
const ROOT_BACKUP_DIR = path.resolve(__dirname, '../../../backup');
const BACKUP_JSON_FILE = path.join(ROOT_BACKUP_DIR, 'database_backup.json');
const BACKUP_SQL_FILE = path.join(ROOT_BACKUP_DIR, 'database_backup.sql');

// Ensure backup folder exists
const ensureBackupDir = () => {
  if (!fs.existsSync(ROOT_BACKUP_DIR)) {
    fs.mkdirSync(ROOT_BACKUP_DIR, { recursive: true });
  }
};

let backupDebounceTimer = null;
let isBackingUp = false;
let pendingBackupAction = null;

/**
 * Format a JavaScript date string / object into MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
 */
const formatSqlDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Perform the instant backup of all database tables into one backup file
 */
export const performBackup = async (pool, inMemoryDb, actionDescription = 'Database updated') => {
  ensureBackupDir();

  try {
    let backupData = {
      version: '2.1',
      last_updated: new Date().toISOString(),
      tables: {
        users: [],
        applicants: [],
        applications: [],
        verifications: [],
        documents: [],
        identity_cards: [],
        account_deletion_requests: [],
        audit_logs: []
      },
      update_history: []
    };

    // Load existing backup file to preserve and append update_history
    if (fs.existsSync(BACKUP_JSON_FILE)) {
      try {
        const raw = fs.readFileSync(BACKUP_JSON_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.update_history)) {
          backupData.update_history = parsed.update_history;
        }
      } catch (_) {
        backupData.update_history = [];
      }
    }

    // Append current update action to the history log
    backupData.update_history.push({
      timestamp: new Date().toISOString(),
      action: actionDescription
    });

    // Keep history manageable (latest 1000 transactions)
    if (backupData.update_history.length > 1000) {
      backupData.update_history = backupData.update_history.slice(-1000);
    }

    if (pool) {
      // ── Backup from MySQL Server ──
      const [users] = await pool.query('SELECT user_id, username, password_hash, full_name, email, role, created_at FROM users ORDER BY user_id ASC');
      const [applicants] = await pool.query('SELECT applicant_id, national_id_number, first_name, last_name, date_of_birth, gender, address, phone_number, email, photo_path, registered_at FROM applicants ORDER BY applicant_id ASC');
      const [applications] = await pool.query('SELECT application_id, applicant_id, application_type, status, processed_by, assigned_officer, application_reason, marital_status, service_type, remarks, submitted_at, updated_at FROM applications ORDER BY application_id ASC');
      const [verifications] = await pool.query('SELECT verification_id, application_id, applicant_id, method, result, passed, score, notes, verified_by, verified_at FROM verifications ORDER BY verification_id ASC');
      const [documents] = await pool.query('SELECT document_id, application_id, document_type, file_name, file_path, file_size, uploaded_at FROM documents ORDER BY document_id ASC');
      const [cards] = await pool.query('SELECT card_id, card_number, application_id, applicant_id, issue_date, expiry_date, status, issued_by, created_at FROM identity_cards ORDER BY card_id ASC');
      const [deletionRequests] = await pool.query('SELECT request_id, user_id, username, email, reason, status, admin_notes, requested_at, processed_at, processed_by FROM account_deletion_requests ORDER BY request_id ASC');
      const [auditLogs] = await pool.query('SELECT log_id, user_id, action, details, timestamp FROM audit_logs ORDER BY log_id DESC LIMIT 500');

      backupData.tables = {
        users: users || [],
        applicants: applicants || [],
        applications: applications || [],
        verifications: verifications || [],
        documents: documents || [],
        identity_cards: cards || [],
        account_deletion_requests: deletionRequests || [],
        audit_logs: auditLogs || []
      };
    } else if (inMemoryDb) {
      // ── Backup from In-Memory Hybrid Database ──
      backupData.tables = {
        users: inMemoryDb.users || [],
        applicants: inMemoryDb.applicants || [],
        applications: inMemoryDb.applications || [],
        verifications: inMemoryDb.verifications || [],
        documents: inMemoryDb.documents || [],
        identity_cards: inMemoryDb.identity_cards || [],
        account_deletion_requests: inMemoryDb.account_deletion_requests || [],
        audit_logs: inMemoryDb.audit_logs || []
      };
    }

    backupData.summary = {
      total_users: backupData.tables.users.length,
      total_applicants: backupData.tables.applicants.length,
      total_applications: backupData.tables.applications.length,
      total_verifications: (backupData.tables.verifications || []).length,
      total_documents: backupData.tables.documents.length,
      total_cards: backupData.tables.identity_cards.length
    };

    // 1. Write the main JSON backup file
    fs.writeFileSync(BACKUP_JSON_FILE, JSON.stringify(backupData, null, 2), 'utf8');

    // 2. Generate and append to SQL backup file
    generateSqlBackupFile(backupData);

    console.log(`[INSTANT BACKUP] Database state backed up to ${BACKUP_JSON_FILE} (${backupData.summary.total_applications} applications, ${backupData.summary.total_applicants} applicants). Action: ${actionDescription}`);
  } catch (err) {
    console.warn('[BACKUP WARNING] Failed to persist instant backup:', err.message);
  }
};

/**
 * Generate and write the executable SQL backup script
 */
const generateSqlBackupFile = (backupData) => {
  try {
    let sql = `-- =============================================================\n`;
    sql += `-- NEXUSGOV IDENTITY ISSUANCE SYSTEM — AUTOMATIC DATABASE BACKUP\n`;
    sql += `-- Generated / Synced: ${backupData.last_updated}\n`;
    sql += `-- Total Applications: ${backupData.tables.applications.length}\n`;
    sql += `-- =============================================================\n\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    const escapeSql = (val) => {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (val instanceof Date) return `'${formatSqlDate(val)}'`;
      return `'${String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
        switch (char) {
          case "\0": return "\\0";
          case "\x08": return "\\b";
          case "\x09": return "\\t";
          case "\x1a": return "\\z";
          case "\n": return "\\n";
          case "\r": return "\\r";
          case "\"":
          case "'":
          case "\\":
          case "%":
            return "\\" + char;
          default:
            return char;
        }
      })}'`;
    };

    // Insert Users
    if (backupData.tables.users.length > 0) {
      sql += `-- Table: users (${backupData.tables.users.length} records)\n`;
      for (const u of backupData.tables.users) {
        sql += `INSERT IGNORE INTO \`users\` (\`user_id\`, \`username\`, \`password_hash\`, \`full_name\`, \`email\`, \`role\`, \`created_at\`) VALUES (${escapeSql(u.user_id)}, ${escapeSql(u.username)}, ${escapeSql(u.password_hash)}, ${escapeSql(u.full_name)}, ${escapeSql(u.email)}, ${escapeSql(u.role)}, ${escapeSql(formatSqlDate(u.created_at))});\n`;
      }
      sql += `\n`;
    }

    // Insert Applicants
    if (backupData.tables.applicants.length > 0) {
      sql += `-- Table: applicants (${backupData.tables.applicants.length} records)\n`;
      for (const a of backupData.tables.applicants) {
        sql += `INSERT INTO \`applicants\` (\`applicant_id\`, \`national_id_number\`, \`first_name\`, \`last_name\`, \`date_of_birth\`, \`gender\`, \`address\`, \`phone_number\`, \`email\`, \`registered_at\`) VALUES (${escapeSql(a.applicant_id)}, ${escapeSql(a.national_id_number)}, ${escapeSql(a.first_name)}, ${escapeSql(a.last_name)}, ${escapeSql(a.date_of_birth)}, ${escapeSql(a.gender)}, ${escapeSql(a.address)}, ${escapeSql(a.phone_number)}, ${escapeSql(a.email)}, ${escapeSql(formatSqlDate(a.registered_at))}) ON DUPLICATE KEY UPDATE \`first_name\`=VALUES(\`first_name\`);\n`;
      }
      sql += `\n`;
    }

    // Insert Applications
    if (backupData.tables.applications.length > 0) {
      sql += `-- Table: applications (${backupData.tables.applications.length} records)\n`;
      for (const app of backupData.tables.applications) {
        sql += `INSERT INTO \`applications\` (\`application_id\`, \`applicant_id\`, \`application_type\`, \`status\`, \`assigned_officer\`, \`application_reason\`, \`marital_status\`, \`service_type\`, \`remarks\`, \`submitted_at\`) VALUES (${escapeSql(app.application_id)}, ${escapeSql(app.applicant_id)}, ${escapeSql(app.application_type || 'New')}, ${escapeSql(app.status || 'Pending')}, ${escapeSql(app.assigned_officer)}, ${escapeSql(app.application_reason || 'G.C.E O/L')}, ${escapeSql(app.marital_status || 'Single')}, ${escapeSql(app.service_type || 'Normal')}, ${escapeSql(app.remarks || '')}, ${escapeSql(formatSqlDate(app.submitted_at))}) ON DUPLICATE KEY UPDATE \`status\`=VALUES(\`status\`);\n`;
      }
      sql += `\n`;
    }

    // Insert Verifications
    if (backupData.tables.verifications.length > 0) {
      sql += `-- Table: verifications (${backupData.tables.verifications.length} records)\n`;
      for (const v of backupData.tables.verifications) {
        sql += `INSERT INTO \`verifications\` (\`verification_id\`, \`application_id\`, \`applicant_id\`, \`method\`, \`result\`, \`passed\`, \`score\`, \`notes\`, \`verified_by\`, \`verified_at\`) VALUES (${escapeSql(v.verification_id)}, ${escapeSql(v.application_id)}, ${escapeSql(v.applicant_id)}, ${escapeSql(v.method || 'AI-BOT')}, ${escapeSql(v.result || (v.passed ? 'Verified' : 'Flagged'))}, ${escapeSql(v.passed ? 1 : 0)}, ${escapeSql(v.score || 0)}, ${escapeSql(v.notes || '')}, ${escapeSql(v.verified_by)}, ${escapeSql(formatSqlDate(v.verified_at))}) ON DUPLICATE KEY UPDATE \`passed\`=VALUES(\`passed\`);\n`;
      }
      sql += `\n`;
    }

    // Insert Documents
    if (backupData.tables.documents.length > 0) {
      sql += `-- Table: documents (${backupData.tables.documents.length} records)\n`;
      for (const d of backupData.tables.documents) {
        sql += `INSERT INTO \`documents\` (\`document_id\`, \`application_id\`, \`document_type\`, \`file_name\`, \`file_path\`, \`file_size\`, \`uploaded_at\`) VALUES (${escapeSql(d.document_id)}, ${escapeSql(d.application_id)}, ${escapeSql(d.document_type)}, ${escapeSql(d.file_name)}, ${escapeSql(d.file_path)}, ${escapeSql(d.file_size)}, ${escapeSql(formatSqlDate(d.uploaded_at))}) ON DUPLICATE KEY UPDATE \`document_type\`=VALUES(\`document_type\`);\n`;
      }
      sql += `\n`;
    }

    // Insert Identity Cards
    if (backupData.tables.identity_cards.length > 0) {
      sql += `-- Table: identity_cards (${backupData.tables.identity_cards.length} records)\n`;
      for (const c of backupData.tables.identity_cards) {
        sql += `INSERT INTO \`identity_cards\` (\`card_id\`, \`card_number\`, \`application_id\`, \`applicant_id\`, \`issue_date\`, \`expiry_date\`, \`status\`, \`issued_by\`, \`created_at\`) VALUES (${escapeSql(c.card_id)}, ${escapeSql(c.card_number)}, ${escapeSql(c.application_id)}, ${escapeSql(c.applicant_id)}, ${escapeSql(c.issue_date)}, ${escapeSql(c.expiry_date)}, ${escapeSql(c.status)}, ${escapeSql(c.issued_by)}, ${escapeSql(formatSqlDate(c.created_at))}) ON DUPLICATE KEY UPDATE \`card_number\`=VALUES(\`card_number\`);\n`;
      }
      sql += `\n`;
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;

    // Append Transaction Update History at bottom
    sql += `-- ── RECENT UPDATE TRANSACTIONS (APPENDED LOG) ───────────────────────\n`;
    const recent = backupData.update_history.slice(-30);
    for (const h of recent) {
      sql += `-- [${h.timestamp}] ${h.action}\n`;
    }

    fs.writeFileSync(BACKUP_SQL_FILE, sql, 'utf8');
  } catch (sqlErr) {
    console.warn('[BACKUP SQL NOTE]:', sqlErr.message);
  }
};

/**
 * Trigger instant backup (non-blocking, debounced at 40ms to batch simultaneous multi-table inserts)
 */
export const triggerAutoBackup = (pool, inMemoryDb, action = 'Database update executed') => {
  pendingBackupAction = action;
  if (backupDebounceTimer) {
    clearTimeout(backupDebounceTimer);
  }
  backupDebounceTimer = setTimeout(() => {
    performBackup(pool, inMemoryDb, pendingBackupAction);
  }, 40);
};

/**
 * Check if the database has data, and if empty, restore from the backup file
 */
export const restoreFromBackupIfEmpty = async (pool, inMemoryDb) => {
  ensureBackupDir();

  if (!fs.existsSync(BACKUP_JSON_FILE)) {
    console.log('[BACKUP SERVICE] Initializing fresh state (no prior backup file found).');
    return false;
  }

  let backup = null;
  try {
    const raw = fs.readFileSync(BACKUP_JSON_FILE, 'utf8');
    backup = JSON.parse(raw);
  } catch (err) {
    console.warn('[BACKUP RESTORE ERROR] Could not read backup file:', err.message);
    return false;
  }

  if (!backup || !backup.tables) return false;

  const backupAppCount = (backup.tables.applications || []).length;
  const backupApplicantCount = (backup.tables.applicants || []).length;

  // If backup has no records, nothing to restore
  if (backupAppCount === 0 && backupApplicantCount === 0) {
    return false;
  }

  console.log(`[BACKUP RESTORE] Found backup file with ${backupAppCount} applications and ${backupApplicantCount} applicants.`);

  if (pool) {
    // ── Restore into MySQL Server ──
    try {
      const [appRows] = await pool.query('SELECT COUNT(*) AS count FROM applications;');
      const currentAppCount = appRows[0]?.count || 0;

      // Only restore if database currently has 0 applications
      if (currentAppCount > 0) {
        console.log(`[BACKUP SERVICE] MySQL database already has ${currentAppCount} applications. Skipping restore.`);
        return false;
      }

      console.log('[BACKUP RESTORE] MySQL database is empty. Restoring full data from backup file...');

      await pool.query('SET FOREIGN_KEY_CHECKS = 0;');

      // 1. Restore Users
      if (Array.isArray(backup.tables.users) && backup.tables.users.length > 0) {
        for (const u of backup.tables.users) {
          await pool.query(
            `INSERT IGNORE INTO users (user_id, username, password_hash, full_name, email, role, created_at)
             VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))`,
            [u.user_id, u.username, u.password_hash, u.full_name, u.email, u.role, formatSqlDate(u.created_at)]
          );
        }
      }

      // 2. Restore Applicants
      if (Array.isArray(backup.tables.applicants) && backup.tables.applicants.length > 0) {
        for (const a of backup.tables.applicants) {
          await pool.query(
            `INSERT INTO applicants (applicant_id, national_id_number, first_name, last_name, date_of_birth, gender, address, phone_number, email, registered_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE first_name = VALUES(first_name)`,
            [a.applicant_id, a.national_id_number, a.first_name, a.last_name, a.date_of_birth, a.gender, a.address, a.phone_number, a.email, formatSqlDate(a.registered_at)]
          );
        }
      }

      // 3. Restore Applications
      if (Array.isArray(backup.tables.applications) && backup.tables.applications.length > 0) {
        for (const app of backup.tables.applications) {
          await pool.query(
            `INSERT INTO applications (application_id, applicant_id, application_type, status, assigned_officer, application_reason, marital_status, service_type, remarks, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [
              app.application_id,
              app.applicant_id,
              app.application_type || 'New',
              app.status || 'Pending',
              app.assigned_officer || null,
              app.application_reason || 'G.C.E O/L',
              app.marital_status || 'Single',
              app.service_type || 'Normal',
              app.remarks || '',
              formatSqlDate(app.submitted_at)
            ]
          );
        }
      }

      // 3b. Restore Verifications (Verification Management records)
      if (Array.isArray(backup.tables.verifications) && backup.tables.verifications.length > 0) {
        for (const v of backup.tables.verifications) {
          await pool.query(
            `INSERT INTO verifications (verification_id, application_id, applicant_id, method, result, passed, score, notes, verified_by, verified_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE passed = VALUES(passed)`,
            [
              v.verification_id,
              v.application_id,
              v.applicant_id || null,
              v.method || 'AI-BOT',
              v.result || (v.passed ? 'Verified' : 'Flagged'),
              v.passed ? 1 : 0,
              v.score || 0,
              v.notes || '',
              v.verified_by || null,
              formatSqlDate(v.verified_at)
            ]
          );
        }
      }

      // 4. Restore Documents
      if (Array.isArray(backup.tables.documents) && backup.tables.documents.length > 0) {
        for (const d of backup.tables.documents) {
          await pool.query(
            `INSERT INTO documents (document_id, application_id, document_type, file_name, file_path, file_size, uploaded_at)
             VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE document_type = VALUES(document_type)`,
            [d.document_id, d.application_id, d.document_type, d.file_name, d.file_path, d.file_size, formatSqlDate(d.uploaded_at)]
          );
        }
      }

      // 5. Restore Identity Cards
      if (Array.isArray(backup.tables.identity_cards) && backup.tables.identity_cards.length > 0) {
        for (const c of backup.tables.identity_cards) {
          await pool.query(
            `INSERT INTO identity_cards (card_id, card_number, application_id, applicant_id, issue_date, expiry_date, status, issued_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE card_number = VALUES(card_number)`,
            [c.card_id, c.card_number, c.application_id, c.applicant_id, c.issue_date, c.expiry_date, c.status, c.issued_by, formatSqlDate(c.created_at)]
          );
        }
      }

      // 6. Restore Deletion Requests
      if (Array.isArray(backup.tables.account_deletion_requests) && backup.tables.account_deletion_requests.length > 0) {
        for (const del of backup.tables.account_deletion_requests) {
          await pool.query(
            `INSERT INTO account_deletion_requests (request_id, user_id, username, email, reason, status, admin_notes, requested_at, processed_at, processed_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [del.request_id, del.user_id, del.username, del.email, del.reason, del.status, del.admin_notes, formatSqlDate(del.requested_at), formatSqlDate(del.processed_at), del.processed_by]
          );
        }
      }

      // 7. Restore Audit Logs
      if (Array.isArray(backup.tables.audit_logs) && backup.tables.audit_logs.length > 0) {
        for (const log of backup.tables.audit_logs) {
          await pool.query(
            `INSERT INTO audit_logs (log_id, user_id, action, details, timestamp)
             VALUES (?, ?, ?, ?, COALESCE(?, NOW()))
             ON DUPLICATE KEY UPDATE action = VALUES(action)`,
            [log.log_id, log.user_id, log.action, log.details, formatSqlDate(log.timestamp)]
          );
        }
      }

      await pool.query('SET FOREIGN_KEY_CHECKS = 1;');

      console.log(`[BACKUP RESTORE SUCCESS] Restored ${backupAppCount} applications, ${backupApplicantCount} applicants, and ${backup.tables.documents.length} documents into MySQL!`);
      return true;
    } catch (restoreErr) {
      console.error('[BACKUP RESTORE FAILED]:', restoreErr.message);
      try { await pool.query('SET FOREIGN_KEY_CHECKS = 1;'); } catch (_) {}
      return false;
    }
  } else if (inMemoryDb) {
    // ── Restore into In-Memory Hybrid DB ──
    try {
      if ((inMemoryDb.applications || []).length === 0 && backupAppCount > 0) {
        console.log('[BACKUP RESTORE] Populating in-memory database from backup file...');
        if (backup.tables.users) inMemoryDb.users = backup.tables.users;
        if (backup.tables.applicants) inMemoryDb.applicants = backup.tables.applicants;
        if (backup.tables.applications) inMemoryDb.applications = backup.tables.applications;
        if (backup.tables.verifications) inMemoryDb.verifications = backup.tables.verifications;
        if (backup.tables.documents) inMemoryDb.documents = backup.tables.documents;
        if (backup.tables.identity_cards) inMemoryDb.identity_cards = backup.tables.identity_cards;
        if (backup.tables.account_deletion_requests) inMemoryDb.account_deletion_requests = backup.tables.account_deletion_requests;
        if (backup.tables.audit_logs) inMemoryDb.audit_logs = backup.tables.audit_logs;

        console.log(`[BACKUP RESTORE SUCCESS] In-memory database initialized from backup with ${backupAppCount} applications!`);
        return true;
      }
    } catch (memErr) {
      console.warn('[BACKUP RESTORE MEM NOTE]:', memErr.message);
    }
  }

  return false;
};
