import bcrypt from 'bcryptjs';
import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';

// ── Admin: Register Staff / Officers ──────────────────────────────────────────
export const registerStaff = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, full name, and role are required.'
      });
    }

    if (!['Admin', 'Officer', 'Approver', 'Operational'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff role. Admin, Officer, Approver, and Operational roles are the only roles that can be registered by an Admin.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    let newUser = null;

    if (getDbStatus()) {
      const existing = await queryDb('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Username or Email is already registered.' });
      }

      const result = await queryDb(
        'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        [username, password_hash, full_name, email, role]
      );

      newUser = { user_id: result.insertId, username, email, full_name, role, created_at: new Date().toISOString() };

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'ADMIN_CREATE_USER', `Admin created staff user: ${username} (${role})`]
      );
    } else {
      const existing = (inMemoryDb.users || []).find(u => u.username === username || u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username or Email is already registered.' });
      }

      newUser = {
        user_id: (inMemoryDb.users || []).length + 1,
        username, email, password_hash, full_name, role,
        created_at: new Date().toISOString()
      };
      if (!inMemoryDb.users) inMemoryDb.users = [];
      inMemoryDb.users.push(newUser);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully registered new staff member: ${full_name} (${role})`,
      user: newUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Get All Users ──────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    if (getDbStatus()) {
      const users = await queryDb('SELECT user_id, username, full_name, email, role, created_at FROM users ORDER BY user_id DESC');
      return res.status(200).json({ success: true, count: users.length, users });
    } else {
      const users = (inMemoryDb.users || []).map(({ password_hash, ...u }) => u);
      return res.status(200).json({ success: true, count: users.length, users });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Update User ────────────────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role } = req.body;

    if (getDbStatus()) {
      await queryDb(
        'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE user_id = ?',
        [full_name, email, role, id]
      );
    } else {
      const user = (inMemoryDb.users || []).find(u => u.user_id === parseInt(id));
      if (user) {
        if (full_name) user.full_name = full_name;
        if (email) user.email = email;
        if (role) user.role = role;
      }
    }

    return res.status(200).json({ success: true, message: `User #${id} updated successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Delete User ────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      await queryDb('DELETE FROM users WHERE user_id = ?', [id]);
    } else {
      const index = (inMemoryDb.users || []).findIndex(u => u.user_id === parseInt(id));
      if (index !== -1) inMemoryDb.users.splice(index, 1);
    }

    return res.status(200).json({ success: true, message: `User #${id} deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Audit Logs ─────────────────────────────────────────────────────────
export const getAuditLogs = async (req, res) => {
  try {
    if (getDbStatus()) {
      const logs = await queryDb(`
        SELECT l.log_id, l.user_id, u.username, u.role, l.action, l.details, l.timestamp
        FROM audit_logs l
        LEFT JOIN users u ON l.user_id = u.user_id
        ORDER BY l.timestamp DESC LIMIT 100
      `);
      return res.status(200).json({ success: true, count: logs.length, logs });
    } else {
      return res.status(200).json({
        success: true,
        count: (inMemoryDb.audit_logs || []).length,
        logs: inMemoryDb.audit_logs || []
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin: Account Deletion Requests ──────────────────────────────────────────

export const getDeletionRequests = async (req, res) => {
  try {
    if (getDbStatus()) {
      const requests = await queryDb(`
        SELECT r.request_id, r.user_id, r.username, r.email, r.reason, r.status,
               r.admin_notes, r.requested_at, r.processed_at, r.processed_by,
               u.full_name AS current_user_fullname,
               admin_u.full_name AS processed_by_name
        FROM account_deletion_requests r
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN users admin_u ON r.processed_by = admin_u.user_id
        ORDER BY FIELD(r.status, 'Pending', 'Approved', 'Rejected'), r.requested_at DESC
      `);

      // For each request, retrieve citizen submitted data & application status
      for (const reqItem of requests) {
        const apps = await queryDb(`
          SELECT app.application_id, 
                 CONCAT('NEX-2026-', app.application_id) AS tracking_id,
                 app.application_type, 
                 app.status AS application_status, 
                 app.bot_verified,
                 app.bot_score,
                 app.submitted_at, 
                 app.remarks,
                 a.first_name, 
                 a.last_name, 
                 CONCAT(a.first_name, ' ', a.last_name) AS full_name, 
                 a.national_id_number, 
                 a.date_of_birth, 
                 a.gender, 
                 a.phone_number, 
                 a.address
          FROM applications app
          JOIN applicants a ON app.applicant_id = a.applicant_id
          WHERE a.email = ?
          ORDER BY app.submitted_at DESC
        `, [reqItem.email]);

        reqItem.submitted_applications = apps || [];
        reqItem.application_count = apps ? apps.length : 0;
      }

      return res.status(200).json({ success: true, count: requests.length, requests });
    } else {
      const requests = (inMemoryDb.account_deletion_requests || []).map(r => {
        const apps = (inMemoryDb.applications || []).filter(
          a => a.email && a.email.toLowerCase() === r.email.toLowerCase()
        );
        return {
          ...r,
          submitted_applications: apps,
          application_count: apps.length
        };
      });

      return res.status(200).json({ success: true, count: requests.length, requests });
    }
  } catch (error) {
    console.error('Error fetching deletion requests:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDeletionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user ? req.user.user_id : null;

    if (getDbStatus()) {
      const rows = await queryDb('SELECT * FROM account_deletion_requests WHERE request_id = ?', [id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Deletion request not found.' });
      }

      const request = rows[0];
      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
      }

      // Delete user account
      await queryDb('DELETE FROM users WHERE user_id = ?', [request.user_id]);

      // Update request record
      await queryDb(
        `UPDATE account_deletion_requests 
         SET status = 'Approved', processed_at = NOW(), processed_by = ? 
         WHERE request_id = ?`,
        [adminUserId, id]
      );

      // Audit log
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [adminUserId, 'ADMIN_APPROVE_ACCOUNT_DELETION', `Admin approved account deletion request #${id} for user ${request.username} (${request.email}). User account removed.`]
      );

      return res.status(200).json({
        success: true,
        message: `Account deletion request #${id} approved. User account '${request.username}' has been deleted.`
      });
    } else {
      const reqItem = (inMemoryDb.account_deletion_requests || []).find(r => r.request_id === parseInt(id));
      if (!reqItem) {
        return res.status(404).json({ success: false, message: 'Deletion request not found.' });
      }

      reqItem.status = 'Approved';
      reqItem.processed_at = new Date().toISOString();
      reqItem.processed_by = adminUserId;

      const userIdx = (inMemoryDb.users || []).findIndex(u => u.user_id === reqItem.user_id);
      if (userIdx !== -1) {
        inMemoryDb.users.splice(userIdx, 1);
      }

      return res.status(200).json({
        success: true,
        message: `Account deletion request #${id} approved. User account '${reqItem.username}' has been deleted.`
      });
    }
  } catch (error) {
    console.error('Error approving deletion request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectDeletionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes = 'Account deletion request rejected by administration.' } = req.body;
    const adminUserId = req.user ? req.user.user_id : null;

    if (getDbStatus()) {
      const rows = await queryDb('SELECT * FROM account_deletion_requests WHERE request_id = ?', [id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Deletion request not found.' });
      }

      const request = rows[0];
      if (request.status !== 'Pending') {
        return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
      }

      await queryDb(
        `UPDATE account_deletion_requests 
         SET status = 'Rejected', admin_notes = ?, processed_at = NOW(), processed_by = ? 
         WHERE request_id = ?`,
        [admin_notes, adminUserId, id]
      );

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [adminUserId, 'ADMIN_REJECT_ACCOUNT_DELETION', `Admin rejected deletion request #${id} for user ${request.username}. Reason: ${admin_notes}`]
      );

      return res.status(200).json({
        success: true,
        message: `Account deletion request #${id} rejected.`
      });
    } else {
      const reqItem = (inMemoryDb.account_deletion_requests || []).find(r => r.request_id === parseInt(id));
      if (!reqItem) {
        return res.status(404).json({ success: false, message: 'Deletion request not found.' });
      }

      reqItem.status = 'Rejected';
      reqItem.admin_notes = admin_notes;
      reqItem.processed_at = new Date().toISOString();
      reqItem.processed_by = adminUserId;

      return res.status(200).json({
        success: true,
        message: `Account deletion request #${id} rejected.`
      });
    }
  } catch (error) {
    console.error('Error rejecting deletion request:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

