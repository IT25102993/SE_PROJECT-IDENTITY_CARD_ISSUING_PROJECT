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

// ── Record Dispatch: save to dispatch_records table + update application status ──
export const recordDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^NEX-2026-/, '');
    const trackingId = `NEX-2026-${cleanId}`;

    const {
      applicant_name,
      nic_number,
      dispatch_method,   // 'Courier' | 'Postal'
      delivery_address,
      notes
    } = req.body;

    const staffId   = req.user ? req.user.user_id : null;
    const staffName = req.user ? (req.user.full_name || req.user.username) : 'Operational Staff';

    if (getDbStatus()) {
      // 1. Update application status to Dispatched
      await queryDb(
        "UPDATE applications SET status = 'Dispatched' WHERE application_id = ?",
        [cleanId]
      );

      // 2. Insert dispatch record
      await queryDb(
        `INSERT INTO dispatch_records
          (application_id, tracking_id, applicant_name, nic_number, dispatch_method,
           delivery_address, dispatched_by, dispatched_by_name, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanId,
          trackingId,
          applicant_name || 'Unknown',
          nic_number || null,
          dispatch_method || 'Postal',
          delivery_address || null,
          staffId,
          staffName,
          notes || null
        ]
      );

      // 3. Audit log
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [staffId, 'DISPATCH', `Application ${trackingId} dispatched via ${dispatch_method || 'Postal'} by ${staffName}`]
      );
    } else {
      // In-memory fallback
      const app = (inMemoryDb.applications || []).find(
        a => String(a.application_id) === String(cleanId)
      );
      if (app) app.status = 'Dispatched';

      const nextId = (inMemoryDb.dispatch_records || []).length + 1;
      (inMemoryDb.dispatch_records = inMemoryDb.dispatch_records || []).push({
        dispatch_id:        nextId,
        application_id:     Number(cleanId),
        tracking_id:        trackingId,
        applicant_name:     applicant_name || 'Unknown',
        nic_number:         nic_number || null,
        dispatch_method:    dispatch_method || 'Postal',
        delivery_address:   delivery_address || null,
        dispatched_by:      staffId,
        dispatched_by_name: staffName,
        dispatched_at:      new Date().toISOString(),
        notes:              notes || null
      });
    }

    return res.status(200).json({
      success: true,
      message: `Application ${trackingId} dispatched successfully via ${dispatch_method || 'Postal'}.`
    });
  } catch (error) {
    console.error('recordDispatch error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get all Dispatch Records ───────────────────────────────────────────────────
export const getDispatchRecords = async (req, res) => {
  try {
    if (getDbStatus()) {
      const rows = await queryDb(
        `SELECT dispatch_id, application_id, tracking_id, applicant_name, nic_number,
                dispatch_method, delivery_address, dispatched_by, dispatched_by_name,
                dispatched_at, notes
         FROM dispatch_records
         ORDER BY dispatched_at DESC`
      );
      return res.status(200).json({ success: true, count: rows.length, records: rows });
    } else {
      const records = [...(inMemoryDb.dispatch_records || [])].reverse();
      return res.status(200).json({ success: true, count: records.length, records });
    }
  } catch (error) {
    console.error('getDispatchRecords error:', error);
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
