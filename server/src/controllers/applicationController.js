import { queryDb, getDbStatus, inMemoryDb } from '../config/db.js';

// Get all applications (with optional search query ?search=trackingId or NIC)
export const getApplications = async (req, res) => {
  try {
    const { search } = req.query;

    if (getDbStatus()) {
      let sql = `
        SELECT 
          app.application_id,
          CONCAT('NEX-2026-', app.application_id) AS tracking_id,
          app.application_type,
          app.status,
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
          u.full_name AS processed_by_name
        FROM applications app
        JOIN applicants a ON app.applicant_id = a.applicant_id
        LEFT JOIN users u ON app.processed_by = u.user_id
      `;

      const params = [];
      if (search) {
        sql += ` WHERE a.national_id_number LIKE ? 
                 OR CONCAT('NEX-2026-', app.application_id) = ? 
                 OR CAST(app.application_id AS CHAR) = ?`;
        params.push(`%${search}%`, search.toUpperCase(), search);
      }

      sql += ` ORDER BY app.submitted_at DESC`;
      const rows = await queryDb(sql, params);
      return res.status(200).json({ success: true, count: rows.length, applications: rows });
    } else {
      let apps = inMemoryDb.applications;
      if (search) {
        const term = search.toLowerCase();
        apps = apps.filter(a =>
          (a.tracking_id && a.tracking_id.toLowerCase().includes(term)) ||
          (a.national_id_number && a.national_id_number.toLowerCase().includes(term)) ||
          (String(a.application_id) === search)
        );
      }
      return res.status(200).json({
        success: true,
        count: apps.length,
        applications: apps
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// Create new citizen application
export const createApplication = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      gender,
      address,
      phone_number,
      email,
      application_type = 'New'
    } = req.body;

    if (!first_name || !last_name || !dob || !gender || !address || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Missing required applicant fields.'
      });
    }

    const officialNic = generateSriLankan12DigitNIC(dob, gender);

    if (getDbStatus()) {
      // Insert into applicants
      const appRes = await queryDb(
        `INSERT INTO applicants (national_id_number, first_name, last_name, date_of_birth, gender, address, phone_number, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [officialNic, first_name, last_name, dob, gender, address, phone_number, email]
      );

      const applicantId = appRes.insertId;

      // Insert into applications
      const applicationRes = await queryDb(
        `INSERT INTO applications (applicant_id, application_type, status, remarks)
         VALUES (?, ?, 'Pending', 'New citizen online submission.')`,
        [applicantId, application_type]
      );

      // Audit Log
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'APPLICATION_CREATED', `Application #${applicationRes.insertId} created for ${first_name} ${last_name}`]
      );

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: applicationRes.insertId,
        trackingId: `NEX-2026-${applicationRes.insertId}`
      });
    } else {
      const newApp = {
        application_id: inMemoryDb.applications.length + 1,
        tracking_id: `NEX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        first_name,
        last_name,
        fullNameEn: `${first_name} ${last_name}`,
        dob,
        gender,
        address,
        phone,
        email,
        status: 'Pending',
        application_type,
        submitted_at: new Date().toISOString().split('T')[0]
      };

      inMemoryDb.applications.unshift(newApp);

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: newApp.application_id,
        trackingId: newApp.tracking_id
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Approve application & issue NIC number
// ── Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C) ─────────────────
export const generateSriLankan12DigitNIC = (dobString, gender = 'Male', serialNum = null) => {
  let dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    dob = new Date('2005-01-01');
  }

  // 1. Year of Birth (YYYY - 4 Digits)
  const yyyy = dob.getFullYear();

  // 2. Day of Year (DDD - 3 Digits): 001 to 366. For Females: add 500
  const startOfYear = new Date(yyyy, 0, 1);
  const diffInMs = dob - startOfYear;
  const dayOfYear = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  const isFemale = (gender || '').toLowerCase().includes('female') || (gender || '').toLowerCase().includes('ස්ත්‍රී') || (gender || '').toLowerCase().includes('பெண்');
  const dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
  const ddd = String(dddVal).padStart(3, '0');

  // 3. Serial Number (SSSS - 4 Digits)
  const serialVal = serialNum ? serialNum : Math.floor(1000 + Math.random() * 9000);
  const ssss = String(serialVal).padStart(4, '0');

  // 4. Check Digit (C - 1 Digit)
  const rawBase = `${yyyy}${ddd}${ssss}`;
  let checkSum = 0;
  for (let i = 0; i < rawBase.length; i++) {
    checkSum += parseInt(rawBase[i], 10) * (i + 1);
  }
  const c = checkSum % 10;

  return `${yyyy}${ddd}${ssss}${c}`;
};

// Approve application & issue NIC number
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks = 'Application approved.' } = req.body;
    const userId = req.user ? req.user.user_id : 1;

    let dob = '2005-01-01';
    let gender = 'Male';

    if (getDbStatus()) {
      const applicantRows = await queryDb(
        `SELECT a.date_of_birth, a.gender FROM applicants a 
         JOIN applications app ON a.applicant_id = app.applicant_id 
         WHERE app.application_id = ?`,
        [id]
      );
      if (applicantRows && applicantRows.length > 0) {
        dob = applicantRows[0].date_of_birth || '2005-01-01';
        gender = applicantRows[0].gender || 'Male';
      }
    } else {
      const memApp = inMemoryDb.applications.find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (memApp) {
        dob = memApp.dob || '2005-01-01';
        gender = memApp.gender || 'Male';
      }
    }

    const generatedNic = generateSriLankan12DigitNIC(dob, gender);

    if (getDbStatus()) {
      await queryDb(
        'UPDATE applications SET status = "Approved", remarks = ?, processed_by = ? WHERE application_id = ?',
        [remarks, userId, id]
      );

      // Fetch applicant_id
      const rows = await queryDb('SELECT applicant_id FROM applications WHERE application_id = ?', [id]);
      if (rows && rows.length > 0) {
        const applicantId = rows[0].applicant_id;
        await queryDb('UPDATE applicants SET national_id_number = ? WHERE applicant_id = ?', [generatedNic, applicantId]);
        
        // Insert identity card record
        await queryDb(
          `INSERT INTO identity_cards (application_id, applicant_id, card_number, issue_date, expiry_date, status, issued_by)
           VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 10 YEAR), 'Active', ?)
           ON DUPLICATE KEY UPDATE card_number = VALUES(card_number)`,
          [id, applicantId, generatedNic, userId]
        );
      }

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [userId, 'APPLICATION_APPROVED', `Application #${id} approved. Official 12-digit NIC ${generatedNic} generated.`]
      );
    } else {
      const app = inMemoryDb.applications.find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (app) {
        app.status = 'Approved';
        app.nicNumber = generatedNic;
        app.national_id_number = generatedNic;
        app.remarks = remarks;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application #${id} approved! Issued Official 12-Digit NIC Number: ${generatedNic}`,
      nicNumber: generatedNic
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reject Application
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks = 'Application rejected.' } = req.body;

    if (getDbStatus()) {
      await queryDb('UPDATE applications SET status = "Rejected", remarks = ? WHERE application_id = ?', [remarks, id]);
    } else {
      const app = inMemoryDb.applications.find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (app) app.status = 'Rejected';
    }

    return res.status(200).json({ success: true, message: `Application #${id} rejected.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Application Status (Printed, Dispatched, Pending, etc.)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (getDbStatus()) {
      await queryDb(
        'UPDATE applications SET status = COALESCE(?, status), remarks = COALESCE(?, remarks) WHERE application_id = ?',
        [status, remarks, id]
      );
    } else {
      const app = inMemoryDb.applications.find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (app) {
        if (status) app.status = status;
        if (remarks) app.remarks = remarks;
      }
    }

    return res.status(200).json({ success: true, message: `Application #${id} status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      await queryDb('DELETE FROM applications WHERE application_id = ?', [id]);
    } else {
      const idx = inMemoryDb.applications.findIndex(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (idx !== -1) inMemoryDb.applications.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: `Application #${id} deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

