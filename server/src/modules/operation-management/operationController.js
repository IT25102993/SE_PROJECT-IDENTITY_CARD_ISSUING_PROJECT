import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';

// Update Application Status (Printed, Dispatched, Pending, etc.)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^NEX-2026-/, '');
    const { status, remarks } = req.body;

    if (getDbStatus()) {
      await queryDb(
        'UPDATE applications SET status = COALESCE(?, status), remarks = COALESCE(?, remarks) WHERE application_id = ?',
        [status, remarks, cleanId]
      );

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'STATUS_UPDATE', `Application #${cleanId} status updated to ${status || 'unchanged'}`]
      );
    } else {
      const app = (inMemoryDb.applications || []).find(a => String(a.application_id) === String(cleanId) || a.tracking_id === id);
      if (app) {
        if (status) app.status = status;
        if (remarks) app.remarks = remarks;
      }
    }

    return res.status(200).json({ success: true, message: `Application #${cleanId} status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Print Queue (Applications with status Approved or Processing)
export const getPrintQueue = async (req, res) => {
  try {
    if (getDbStatus()) {
      const rows = await queryDb(`
        SELECT 
          app.application_id,
          CONCAT('NEX-2026-', app.application_id) AS tracking_id,
          app.status,
          app.application_type,
          a.first_name,
          a.last_name,
          CONCAT(a.first_name, ' ', a.last_name) AS fullNameEn,
          a.national_id_number,
          a.date_of_birth AS dob,
          a.gender,
          a.address,
          ic.card_number,
          ic.issue_date,
          ic.expiry_date
        FROM applications app
        JOIN applicants a ON app.applicant_id = a.applicant_id
        LEFT JOIN identity_cards ic ON app.application_id = ic.application_id
        WHERE app.status IN ('Approved', 'Processing', 'Printed')
        ORDER BY app.updated_at DESC
      `);
      return res.status(200).json({ success: true, count: rows.length, queue: rows });
    } else {
      const queue = (inMemoryDb.applications || [])
        .filter(a => ['Approved', 'Processing', 'Printed'].includes(a.status))
        .map(a => ({
          ...a,
          fullNameEn: a.fullNameEn || `${a.first_name || ''} ${a.last_name || ''}`,
          card_number: a.national_id_number || a.nicNumber || 'Pending Issuance'
        }));
      return res.status(200).json({ success: true, count: queue.length, queue });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get System Analytics & Operational Metrics
export const getAnalytics = async (req, res) => {
  try {
    if (getDbStatus()) {
      const [totalApps] = await queryDb('SELECT COUNT(*) AS total FROM applications');
      const [pendingApps] = await queryDb("SELECT COUNT(*) AS count FROM applications WHERE status = 'Pending'");
      const [approvedApps] = await queryDb("SELECT COUNT(*) AS count FROM applications WHERE status = 'Approved'");
      const [rejectedApps] = await queryDb("SELECT COUNT(*) AS count FROM applications WHERE status = 'Rejected'");
      const [botVerified] = await queryDb("SELECT COUNT(*) AS count FROM applications WHERE bot_verified = 1");
      const [totalUsers] = await queryDb('SELECT COUNT(*) AS count FROM users');

      return res.status(200).json({
        success: true,
        analytics: {
          totalApplications: totalApps[0]?.total || 0,
          pending: pendingApps[0]?.count || 0,
          approved: approvedApps[0]?.count || 0,
          rejected: rejectedApps[0]?.count || 0,
          botVerified: botVerified[0]?.count || 0,
          totalUsers: totalUsers[0]?.count || 0
        }
      });
    } else {
      const apps = inMemoryDb.applications || [];
      return res.status(200).json({
        success: true,
        analytics: {
          totalApplications: apps.length,
          pending: apps.filter(a => a.status === 'Pending').length,
          approved: apps.filter(a => a.status === 'Approved').length,
          rejected: apps.filter(a => a.status === 'Rejected').length,
          botVerified: apps.filter(a => a.bot_verified).length,
          totalUsers: (inMemoryDb.users || []).length
        }
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
