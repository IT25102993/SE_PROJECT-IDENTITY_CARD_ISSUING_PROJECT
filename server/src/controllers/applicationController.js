import { queryDb, getDbStatus, inMemoryDb } from '../config/db.js';

// Get all applications
export const getApplications = async (req, res) => {
  try {
    if (getDbStatus()) {
      const sql = `
        SELECT 
          app.application_id,
          app.application_type,
          app.status,
          app.remarks,
          app.submitted_at,
          app.updated_at,
          a.first_name,
          a.last_name,
          CONCAT(a.first_name, ' ', a.last_name) AS fullNameEn,
          a.national_id_number AS nicNumber,
          a.date_of_birth AS dob,
          a.gender,
          a.address,
          a.phone_number AS phone,
          a.email,
          u.full_name AS processed_by_name
        FROM applications app
        JOIN applicants a ON app.applicant_id = a.applicant_id
        LEFT JOIN users u ON app.processed_by = u.user_id
        ORDER BY app.submitted_at DESC
      `;
      const rows = await queryDb(sql);
      return res.status(200).json({ success: true, count: rows.length, applications: rows });
    } else {
      return res.status(200).json({
        success: true,
        count: inMemoryDb.applications.length,
        applications: inMemoryDb.applications
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

    const tempNic = `TEMP-${Math.floor(100000000 + Math.random() * 900000000)}`;

    if (getDbStatus()) {
      // Insert into applicants
      const appRes = await queryDb(
        `INSERT INTO applicants (national_id_number, first_name, last_name, date_of_birth, gender, address, phone_number, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tempNic, first_name, last_name, dob, gender, address, phone_number, email]
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
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks = 'Application approved.' } = req.body;
    const userId = req.user ? req.user.user_id : 1;

    const generatedNic = `2005${Math.floor(10000000 + Math.random() * 90000000)}`;

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
        [userId, 'APPLICATION_APPROVED', `Application #${id} approved. NIC ${generatedNic} generated.`]
      );
    } else {
      const app = inMemoryDb.applications.find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (app) {
        app.status = 'Approved';
        app.nicNumber = generatedNic;
        app.remarks = remarks;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application #${id} approved! Issued NIC Number: ${generatedNic}`,
      nicNumber: generatedNic
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
