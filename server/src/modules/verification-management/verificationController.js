import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';
import { evaluateBotVerification } from './botVerification.js';

// ── Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C) ─────────────────
export const generateSriLankan12DigitNIC = (dobString, gender = 'Male', serialNum = null) => {
  let dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    dob = new Date('2005-01-01');
  }

  const yyyy = dob.getFullYear();

  const startOfYear = new Date(yyyy, 0, 1);
  const diffInMs = dob - startOfYear;
  const dayOfYear = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  const isFemale = (gender || '').toLowerCase().includes('female') || (gender || '').toLowerCase().includes('ස්ත්‍රී') || (gender || '').toLowerCase().includes('பெண்');
  const dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
  const ddd = String(dddVal).padStart(3, '0');

  const serialVal = serialNum ? serialNum : Math.floor(1000 + Math.random() * 9000);
  const ssss = String(serialVal).padStart(4, '0');

  const rawBase = `${yyyy}${ddd}${ssss}`;
  let checkSum = 0;
  for (let i = 0; i < rawBase.length; i++) {
    checkSum += parseInt(rawBase[i], 10) * (i + 1);
  }
  const c = checkSum % 10;

  return `${yyyy}${ddd}${ssss}${c}`;
};

// Re-run automated bot verification on demand
export const triggerBotVerification = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const rows = await queryDb(
        `SELECT app.application_id, a.first_name, a.last_name, a.date_of_birth AS dob, a.gender, a.address, app.status
         FROM applications app
         JOIN applicants a ON app.applicant_id = a.applicant_id
         WHERE app.application_id = ?`,
        [id]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const appData = rows[0];
      const docs = await queryDb(
        `SELECT * FROM documents WHERE application_id = ?`,
        [id]
      );

      const botResult = evaluateBotVerification(
        {
          first_name: appData.first_name,
          last_name: appData.last_name,
          fullNameEn: `${appData.first_name} ${appData.last_name}`,
          dob: appData.dob,
          gender: appData.gender,
          address: appData.address
        },
        docs || []
      );

      await queryDb(
        `UPDATE applications 
         SET status = ?, bot_verified = ?, bot_score = ?, bot_notes = ?, bot_verified_at = NOW() 
         WHERE application_id = ?`,
        [botResult.status, botResult.passed ? 1 : 0, botResult.score, botResult.notes, id]
      );

      return res.status(200).json({
        success: true,
        message: `Bot verification completed: ${botResult.status}`,
        botResult
      });
    } else {
      const app = (inMemoryDb.applications || []).find(a => String(a.application_id) === String(id) || a.tracking_id === id);
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const docs = (inMemoryDb.documents || []).filter(d => String(d.application_id) === String(app.application_id));
      const botResult = evaluateBotVerification(
        {
          first_name: app.first_name,
          last_name: app.last_name,
          fullNameEn: app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`,
          dob: app.dob,
          gender: app.gender,
          address: app.address
        },
        docs
      );

      app.status = botResult.status;
      app.bot_verified = botResult.passed;
      app.bot_score = botResult.score;
      app.bot_notes = botResult.notes;
      app.bot_verified_at = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: `Bot verification completed: ${botResult.status}`,
        botResult,
        application: app
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
    const cleanId = String(id).replace(/^NEX-2026-/, '');
    const { remarks = 'Application approved.' } = req.body;
    const userId = req.user ? req.user.user_id : 1;

    let dob = '2005-01-01';
    let gender = 'Male';

    if (getDbStatus()) {
      const applicantRows = await queryDb(
        `SELECT a.date_of_birth, a.gender FROM applicants a 
         JOIN applications app ON a.applicant_id = app.applicant_id 
         WHERE app.application_id = ?`,
        [cleanId]
      );
      if (applicantRows && applicantRows.length > 0) {
        dob = applicantRows[0].date_of_birth || '2005-01-01';
        gender = applicantRows[0].gender || 'Male';
      }
    } else {
      const memApp = (inMemoryDb.applications || []).find(a => a.application_id === parseInt(id) || a.tracking_id === id);
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

      const rows = await queryDb('SELECT applicant_id FROM applications WHERE application_id = ?', [id]);
      if (rows && rows.length > 0) {
        const applicantId = rows[0].applicant_id;
        await queryDb('UPDATE applicants SET national_id_number = ? WHERE applicant_id = ?', [generatedNic, applicantId]);
        
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
      const app = (inMemoryDb.applications || []).find(a => a.application_id === parseInt(id) || a.tracking_id === id);
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
    const userId = req.user ? req.user.user_id : 1;

    if (getDbStatus()) {
      await queryDb('UPDATE applications SET status = "Rejected", remarks = ?, processed_by = ? WHERE application_id = ?', [remarks, userId, id]);
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [userId, 'APPLICATION_REJECTED', `Application #${id} rejected. Reason: ${remarks}`]
      );
    } else {
      const app = (inMemoryDb.applications || []).find(a => a.application_id === parseInt(id) || a.tracking_id === id);
      if (app) {
        app.status = 'Rejected';
        app.remarks = remarks;
      }
    }

    return res.status(200).json({ success: true, message: `Application #${id} rejected.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
