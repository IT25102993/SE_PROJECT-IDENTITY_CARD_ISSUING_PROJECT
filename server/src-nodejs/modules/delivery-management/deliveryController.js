import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';

// Delivery stage statuses a Delivery-Manager is allowed to set.
// 'Dispatched' is the hand-off status pushed by Operation Management (Printing Section).
export const DELIVERY_STATUSES = ['Dispatched', 'Delivered', 'Not-Delivered', 'Canceled'];

const normalizeId = (id) => String(id).replace(/^NEX-2026-/, '');

const STAFF_NAME_FALLBACK = 'Delivery Manager Fernando';

const resolveStaffName = (req) =>
  (req.user ? (req.user.full_name || req.user.username) : STAFF_NAME_FALLBACK);

const deliverySelect = `
  SELECT
    app.application_id,
    CONCAT('NEX-2026-', app.application_id) AS tracking_id,
    app.status,
    app.service_type,
    app.assigned_officer,
    app.remarks,
    app.submitted_at,
    app.updated_at,
    a.first_name,
    a.last_name,
    CONCAT(a.first_name, ' ', a.last_name) AS fullNameEn,
    a.national_id_number,
    a.date_of_birth AS dob,
    a.gender,
    a.address,
    a.phone_number AS phone,
    a.email,
    ic.card_number,
    ic.issue_date,
    ic.expiry_date,
    d.dispatch_method,
    d.delivery_address,
    d.tracking_id AS courier_tracking_id,
    d.dispatched_at
  FROM applications app
  JOIN applicants a ON app.applicant_id = a.applicant_id
  LEFT JOIN identity_cards ic ON app.application_id = ic.application_id
  LEFT JOIN dispatch_records d ON d.dispatch_id = (
    SELECT dispatch_id FROM dispatch_records
    WHERE application_id = app.application_id
    ORDER BY dispatch_id DESC LIMIT 1
  )
`;

// ── Get the Delivery Job Pool ────────────────────────────────────────────────
// Every order that Operation Management has pushed out of the printing section
// lands here, together with its current delivery status.
export const getDeliveryPool = async (req, res) => {
  try {
    if (getDbStatus()) {
      const placeholders = DELIVERY_STATUSES.map(() => '?').join(',');
      const rows = await queryDb(
        `${deliverySelect} WHERE app.status IN (${placeholders}) ORDER BY app.updated_at DESC`,
        DELIVERY_STATUSES
      );
      return res.status(200).json({ success: true, count: rows.length, jobs: rows });
    }

    const jobs = (inMemoryDb.applications || [])
      .filter(a => DELIVERY_STATUSES.includes(a.status))
      .map(a => ({
        ...a,
        fullNameEn: a.fullNameEn || `${a.first_name || ''} ${a.last_name || ''}`,
        card_number: a.national_id_number || null,
        delivery_address: a.address || null
      }));

    return res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error('getDeliveryPool error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update the delivery status of an order ───────────────────────────────────
export const updateDeliveryStatus = async (req, res) => {
  try {
    const cleanId = normalizeId(req.params.id);
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Delivery status field is required.' });
    }

    if (!DELIVERY_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery status. Allowed values: ${DELIVERY_STATUSES.join(', ')}`
      });
    }

    const staffId = req.user ? req.user.user_id : null;
    const staffName = resolveStaffName(req);

    if (getDbStatus()) {
      const existing = await queryDb(
        'SELECT application_id, status FROM applications WHERE application_id = ?',
        [cleanId]
      );
      if (!existing || existing.length === 0) {
        return res.status(404).json({ success: false, message: `Application #${cleanId} not found.` });
      }

      await queryDb(
        'UPDATE applications SET status = ?, remarks = COALESCE(?, remarks), updated_at = NOW() WHERE application_id = ?',
        [status, remarks || null, cleanId]
      );

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [staffId, 'DELIVERY_STATUS_UPDATE', `Order NEX-2026-${cleanId} delivery status changed from '${existing[0].status}' to '${status}' by ${staffName}`]
      );

      return res.status(200).json({
        success: true,
        message: `Order NEX-2026-${cleanId} delivery status updated to '${status}'.`,
        application_id: Number(cleanId),
        status
      });
    }

    const app = (inMemoryDb.applications || []).find(
      a => String(a.application_id) === cleanId || a.tracking_id === req.params.id
    );
    if (!app) {
      return res.status(404).json({ success: false, message: `Application #${cleanId} not found.` });
    }

    const previousStatus = app.status;
    app.status = status;
    if (remarks) app.remarks = remarks;

    if (!inMemoryDb.audit_logs) inMemoryDb.audit_logs = [];
    inMemoryDb.audit_logs.push({
      log_id: inMemoryDb.audit_logs.length + 1,
      user_id: staffId,
      action: 'DELIVERY_STATUS_UPDATE',
      details: `Order NEX-2026-${cleanId} delivery status changed from '${previousStatus}' to '${status}' by ${staffName}`,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Order NEX-2026-${cleanId} delivery status updated to '${status}'.`,
      application_id: Number(cleanId),
      status
    });
  } catch (error) {
    console.error('updateDeliveryStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delivery stage metrics for the dashboard KPI cards ───────────────────────
export const getDeliveryStats = async (req, res) => {
  try {
    const countBy = (status) =>
      getDbStatus()
        ? queryDb('SELECT COUNT(*) AS count FROM applications WHERE status = ?', [status])
        : Promise.resolve([
            [(inMemoryDb.applications || []).filter(a => a.status === status).length]
          ]);

    const entries = await Promise.all(DELIVERY_STATUSES.map(countBy));

    const stats = {};
    DELIVERY_STATUSES.forEach((s, i) => {
      stats[s] = Number(entries[i][0]?.count ?? 0);
    });
    stats['Total'] = DELIVERY_STATUSES.reduce((sum, s) => sum + stats[s], 0);

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('getDeliveryStats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
