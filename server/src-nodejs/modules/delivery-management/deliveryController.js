import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';

// Delivery statuses that this module is allowed to write.
const DELIVERY_STATUSES = ['Dispatched', 'Delivered', 'Not-Delivered', 'Canceled'];

// Normalise the NEX-2026-xxxxx tracking prefix down to the raw application_id.
const cleanApplicationId = (id) => String(id).replace(/^NEX-2026-/, '');

// ── Get Delivery Job Pool ─────────────────────────────────────────────────────
// Every application that Operation Management has pushed out (status Dispatched)
// or that Delivery Management has already resolved. Unclaimed rows surface in
// the general queue; rows with an assigned_officer belong to that officer.
export const getDeliveryJobPool = async (req, res) => {
  try {
    const { search } = req.query;

    if (getDbStatus()) {
      const params = [];
      let where = `app.status IN ('Dispatched', 'Delivered', 'Not-Delivered', 'Canceled')`;

      if (search && String(search).trim()) {
        where += ` AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.national_id_number LIKE ? OR app.application_id LIKE ?)`;
        const term = `%${String(search).trim()}%`;
        params.push(term, term, term, term);
      }

      const rows = await queryDb(
        `SELECT
           app.application_id,
           CONCAT('NEX-2026-', app.application_id) AS tracking_id,
           app.status,
           app.assigned_officer,
           app.remarks,
           app.application_type,
           app.service_type,
           app.submitted_at,
           app.updated_at,
           a.first_name,
           a.last_name,
           CONCAT(a.first_name, ' ', a.last_name) AS fullNameEn,
           a.national_id_number,
           a.date_of_birth AS dob,
           a.gender,
           a.address,
           a.phone_number,
           ic.card_number,
           dr.dispatch_method,
           dr.delivery_address,
           dr.dispatched_at
         FROM applications app
         JOIN applicants a ON app.applicant_id = a.applicant_id
         LEFT JOIN identity_cards ic ON app.application_id = ic.application_id
         LEFT JOIN dispatch_records dr ON app.application_id = dr.application_id
         WHERE ${where}
         ORDER BY FIELD(app.status, 'Dispatched', 'Not-Delivered', 'Delivered', 'Canceled'), app.updated_at DESC`,
        params
      );

      return res.status(200).json({ success: true, count: rows.length, jobs: rows });
    }

    // In-memory fallback
    let jobs = (inMemoryDb.applications || []).filter(a =>
      DELIVERY_STATUSES.includes(a.status)
    );

    if (search && String(search).trim()) {
      const term = String(search).trim().toLowerCase();
      jobs = jobs.filter(a => {
        const name = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        const nic = (a.national_id_number || '').toLowerCase();
        const id = String(a.application_id);
        const tracking = (a.tracking_id || '').toLowerCase();
        return name.includes(term) || nic.includes(term) || id.includes(term) || tracking.includes(term);
      });
    }

    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('getDeliveryJobPool error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Delivery Statistics ───────────────────────────────────────────────────
export const getDeliveryStats = async (req, res) => {
  try {
    if (getDbStatus()) {
      const rows = await queryDb(
        `SELECT status, COUNT(*) AS count
         FROM applications
         WHERE status IN ('Dispatched', 'Delivered', 'Not-Delivered', 'Canceled')
         GROUP BY status`
      );

      const stats = { Dispatched: 0, Delivered: 0, 'Not-Delivered': 0, Canceled: 0 };
      rows.forEach(r => { stats[r.status] = r.count; });
      stats.total = Object.values(stats).reduce((a, b) => a + b, 0);

      const unclaimedRows = await queryDb(
        "SELECT COUNT(*) AS count FROM applications WHERE status IN ('Dispatched', 'Not-Delivered') AND assigned_officer IS NULL"
      );
      stats.unclaimed = (Array.isArray(unclaimedRows) && unclaimedRows[0] && unclaimedRows[0].count) || 0;

      return res.status(200).json({ success: true, stats });
    }

    const apps = inMemoryDb.applications || [];
    const stats = { Dispatched: 0, Delivered: 0, 'Not-Delivered': 0, Canceled: 0 };
    DELIVERY_STATUSES.forEach(s => {
      stats[s] = apps.filter(a => a.status === s).length;
    });
    stats.total = DELIVERY_STATUSES.reduce((acc, s) => acc + stats[s], 0);
    stats.unclaimed = apps.filter(
      a => ['Dispatched', 'Not-Delivered'].includes(a.status) && !a.assigned_officer
    ).length;

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('getDeliveryStats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Delivery Status ────────────────────────────────────────────────────
// Only moves an application between the four delivery statuses. The application
// must already be in the delivery pipeline (i.e. Operation Management dispatched
// it), otherwise this would let a delivery officer jump the queue.
export const updateDeliveryStatus = async (req, res) => {
  try {
    const cleanId = cleanApplicationId(req.params.id);
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status field is required.' });
    }

    if (!DELIVERY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Allowed: ${DELIVERY_STATUSES.join(', ')}`
      });
    }

    const staffId = req.user ? req.user.user_id : null;
    const staffName = req.user ? (req.user.full_name || req.user.username) : 'Delivery Manager';

    if (getDbStatus()) {
      // Confirm the application has actually entered the delivery pipeline
      const existingRows = await queryDb(
        'SELECT application_id, status FROM applications WHERE application_id = ?',
        [cleanId]
      );
      const existing = Array.isArray(existingRows) ? existingRows[0] : null;

      if (!existing) {
        return res.status(404).json({ success: false, message: `Application #${req.params.id} not found.` });
      }

      if (!DELIVERY_STATUSES.includes(existing.status)) {
        return res.status(400).json({
          success: false,
          message: `Application #${cleanId} is currently '${existing.status}'. Only dispatched applications can be given a delivery status.`
        });
      }

      if (remarks !== undefined) {
        await queryDb(
          'UPDATE applications SET status = ?, remarks = ?, updated_at = NOW() WHERE application_id = ?',
          [status, remarks, cleanId]
        );
      } else {
        await queryDb(
          'UPDATE applications SET status = ?, updated_at = NOW() WHERE application_id = ?',
          [status, cleanId]
        );
      }

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [staffId, 'DELIVERY_STATUS_UPDATE', `Application #${cleanId} delivery status set to '${status}' by ${staffName}`]
      );
    } else {
      const app = (inMemoryDb.applications || []).find(
        a => String(a.application_id) === String(cleanId) || a.tracking_id === req.params.id
      );

      if (!app) {
        return res.status(404).json({ success: false, message: `Application #${req.params.id} not found.` });
      }

      if (!DELIVERY_STATUSES.includes(app.status)) {
        return res.status(400).json({
          success: false,
          message: `Application #${cleanId} is currently '${app.status}'. Only dispatched applications can be given a delivery status.`
        });
      }

      app.status = status;
      if (remarks !== undefined) app.remarks = remarks;
    }

    return res.status(200).json({
      success: true,
      message: `Application #${cleanId} delivery status updated to ${status}.`
    });
  } catch (error) {
    console.error('updateDeliveryStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};