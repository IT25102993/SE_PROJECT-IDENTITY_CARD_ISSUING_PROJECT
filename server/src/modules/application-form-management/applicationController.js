import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';
import { saveDocumentFile } from '../document-upload-management/documentStorage.js';
import { evaluateBotVerification } from '../verification-management/botVerification.js';
import { generateSriLankan12DigitNIC } from '../verification-management/verificationController.js';

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
          app.application_reason,
          app.marital_status,
          app.status,
          app.assigned_officer,
          app.bot_verified,
          app.bot_score,
          app.bot_notes,
          app.bot_verified_at,
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

      // Fetch attached documents for all retrieved applications
      if (rows && rows.length > 0) {
        const appIds = rows.map(r => r.application_id);
        const placeholders = appIds.map(() => '?').join(',');
        const docRows = await queryDb(
          `SELECT document_id, application_id, document_type, file_name, file_path, file_size, uploaded_at 
           FROM documents WHERE application_id IN (${placeholders}) ORDER BY uploaded_at ASC`,
          appIds
        );

        const docsByApp = {};
        if (docRows) {
          docRows.forEach(d => {
            if (!docsByApp[d.application_id]) docsByApp[d.application_id] = [];
            docsByApp[d.application_id].push(d);
          });
        }

        rows.forEach(r => {
          r.documents = docsByApp[r.application_id] || [];
        });
      }

      return res.status(200).json({ success: true, count: rows.length, applications: rows });
    } else {
      let apps = (inMemoryDb.applications || []).map(app => ({
        ...app,
        documents: (inMemoryDb.documents || []).filter(d => String(d.application_id) === String(app.application_id))
      }));

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
      civil_status,
      marital_status,
      application_reason = 'G.C.E O/L',
      other_reason,
      service_type = 'Normal',
      address,
      phone_number,
      email,
      application_type = 'New',
      documents = []
    } = req.body;

    const finalMaritalStatus = marital_status || civil_status || 'Single';
    const finalReason = application_reason === 'Other' && other_reason
      ? `Other: ${other_reason}`
      : application_reason;

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
        `INSERT INTO applications (applicant_id, application_type, status, remarks, application_reason, marital_status, service_type)
         VALUES (?, ?, 'Pending', 'New citizen online submission.', ?, ?, ?)`,
        [applicantId, application_type, finalReason, finalMaritalStatus, service_type]
      );

      const newApplicationId = applicationRes.insertId;

      // Save and insert uploaded documents if provided
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          const docType = doc.document_type || doc.type || 'Supporting Document';
          const fileName = doc.file_name || doc.name || 'document.pdf';
          const fileData = doc.file_data || doc.data || doc.url;
          const fileSize = doc.file_size || doc.size || 'Unknown';

          let savedPath = null;
          if (fileData) {
            savedPath = await saveDocumentFile(fileData, fileName);
          } else {
            savedPath = '/uploads/documents/birth_certificate.pdf';
          }

          await queryDb(
            `INSERT INTO documents (application_id, document_type, file_name, file_path, file_size, uploaded_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [newApplicationId, docType, fileName, savedPath, fileSize]
          );
        }
      }

      // Run Automated AI Bot Verification
      const botResult = evaluateBotVerification(
        { first_name, last_name, fullNameEn: `${first_name} ${last_name}`, dob, gender, address },
        documents
      );

      // Update application record with bot evaluation
      await queryDb(
        `UPDATE applications 
         SET status = ?, bot_verified = ?, bot_score = ?, bot_notes = ?, bot_verified_at = NOW() 
         WHERE application_id = ?`,
        [botResult.status, botResult.passed ? 1 : 0, botResult.score, botResult.notes, newApplicationId]
      );

      // Audit Log
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'APPLICATION_CREATED', `Application #${newApplicationId} created for ${first_name} ${last_name}. Bot Verification: ${botResult.status} (Score: ${botResult.score}%)`]
      );

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: newApplicationId,
        trackingId: `NEX-2026-${newApplicationId}`,
        botVerification: botResult
      });
    } else {
      if (!inMemoryDb.applications) inMemoryDb.applications = [];
      if (!inMemoryDb.documents) inMemoryDb.documents = [];

      const newAppId = inMemoryDb.applications.length + 1;
      const trackingId = `NEX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const savedDocs = [];
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          const docType = doc.document_type || doc.type || 'Supporting Document';
          const fileName = doc.file_name || doc.name || 'document.pdf';
          const fileData = doc.file_data || doc.data || doc.url;
          const fileSize = doc.file_size || doc.size || 'Unknown';

          let savedPath = null;
          if (fileData) {
            savedPath = await saveDocumentFile(fileData, fileName);
          } else {
            savedPath = '/uploads/documents/birth_certificate.pdf';
          }

          const docObj = {
            document_id: inMemoryDb.documents.length + 1,
            application_id: newAppId,
            document_type: docType,
            file_name: fileName,
            file_path: savedPath,
            file_size: fileSize,
            uploaded_at: new Date().toISOString()
          };
          inMemoryDb.documents.push(docObj);
          savedDocs.push(docObj);
        }
      }

      // Run Automated AI Bot Verification
      const botResult = evaluateBotVerification(
        { first_name, last_name, fullNameEn: `${first_name} ${last_name}`, dob, gender, address },
        savedDocs
      );

      const newApp = {
        application_id: newAppId,
        tracking_id: trackingId,
        first_name,
        last_name,
        fullNameEn: `${first_name} ${last_name}`,
        dob,
        gender,
        address,
        phone: phone_number,
        phone_number,
        email,
        status: botResult.status,
        application_type,
        application_reason: finalReason,
        marital_status: finalMaritalStatus,
        civilStatus: finalMaritalStatus,
        service_type,
        delivery_method: service_type === '1-Day' ? 'Courier Service' : 'Sri Lanka Postal Service',
        bot_verified: botResult.passed,
        bot_score: botResult.score,
        bot_notes: botResult.notes,
        bot_verified_at: new Date().toISOString(),
        submitted_at: new Date().toISOString().split('T')[0],
        documents: savedDocs
      };

      inMemoryDb.applications.unshift(newApp);

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: newApp.application_id,
        trackingId: newApp.tracking_id,
        botVerification: botResult
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Application & Applicant details (Accessible by Officer, Admin, Approver)
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      dob,
      gender,
      address,
      phone_number,
      phone,
      email,
      application_type,
      remarks,
      officerNotes,
      assigned_officer,
      status
    } = req.body;

    const finalPhone = phone_number || phone;
    const finalRemarks = officerNotes !== undefined ? officerNotes : remarks;

    if (getDbStatus()) {
      // Find applicant_id for this application
      const appRows = await queryDb('SELECT applicant_id FROM applications WHERE application_id = ?', [id]);
      if (!appRows || appRows.length === 0) {
        return res.status(404).json({ success: false, message: `Application #${id} not found.` });
      }
      const applicantId = appRows[0].applicant_id;

      // Update applicant profile details
      await queryDb(
        `UPDATE applicants 
         SET first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             date_of_birth = COALESCE(?, date_of_birth),
             gender = COALESCE(?, gender),
             address = COALESCE(?, address),
             phone_number = COALESCE(?, phone_number),
             email = COALESCE(?, email)
         WHERE applicant_id = ?`,
        [first_name || null, last_name || null, dob || null, gender || null, address || null, finalPhone || null, email || null, applicantId]
      );

      // Update application record
      let updateAppSql = 'UPDATE applications SET ';
      const updateAppParams = [];
      const clauses = [];

      if (application_type !== undefined) {
        clauses.push('application_type = ?');
        updateAppParams.push(application_type);
      }
      if (finalRemarks !== undefined) {
        clauses.push('remarks = ?');
        updateAppParams.push(finalRemarks);
      }
      if (status !== undefined) {
        clauses.push('status = ?');
        updateAppParams.push(status);
      }
      if (assigned_officer !== undefined) {
        clauses.push('assigned_officer = ?');
        updateAppParams.push(assigned_officer);
      }

      if (clauses.length > 0) {
        updateAppSql += clauses.join(', ') + ' WHERE application_id = ?';
        updateAppParams.push(id);
        await queryDb(updateAppSql, updateAppParams);
      }

      // Audit log
      const actorName = req.user ? (req.user.full_name || req.user.username) : 'Officer';
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'APPLICATION_UPDATED', `Application #${id} details updated by ${actorName}`]
      );

      return res.status(200).json({
        success: true,
        message: `Application #${id} updated successfully.`
      });
    } else {
      const app = (inMemoryDb.applications || []).find(a => String(a.application_id) === String(id) || a.tracking_id === id);
      if (!app) {
        return res.status(404).json({ success: false, message: `Application #${id} not found.` });
      }

      if (first_name !== undefined) app.first_name = first_name;
      if (last_name !== undefined) app.last_name = last_name;
      if (first_name !== undefined || last_name !== undefined) {
        app.fullNameEn = `${app.first_name || ''} ${app.last_name || ''}`.trim();
      }
      if (dob !== undefined) app.dob = dob;
      if (gender !== undefined) app.gender = gender;
      if (address !== undefined) app.address = address;
      if (finalPhone !== undefined) {
        app.phone = finalPhone;
        app.phone_number = finalPhone;
      }
      if (email !== undefined) app.email = email;
      if (application_type !== undefined) app.application_type = application_type;
      if (finalRemarks !== undefined) {
        app.remarks = finalRemarks;
        app.officerNotes = finalRemarks;
      }
      if (status !== undefined) app.status = status;
      if (assigned_officer !== undefined) app.assigned_officer = assigned_officer;

      return res.status(200).json({
        success: true,
        message: `Application #${id} updated successfully.`,
        application: app
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Claim application into officer's active workbench pool
export const claimApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const officerName = req.body.officerName || (req.user ? (req.user.full_name || req.user.username) : 'Officer Wickramasinghe');

    if (getDbStatus()) {
      await queryDb('UPDATE applications SET assigned_officer = ? WHERE application_id = ?', [officerName, id]);
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'JOB_CLAIMED', `Application #${id} claimed into active pool by ${officerName}`]
      );
    } else {
      const app = (inMemoryDb.applications || []).find(a => String(a.application_id) === String(id) || a.tracking_id === id);
      if (app) app.assigned_officer = officerName;
    }

    return res.status(200).json({
      success: true,
      message: `Application #${id} claimed into your active workbench.`,
      assigned_officer: officerName
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Remove application from officer's job pool (unclaim/release back to general pool)
export const unclaimApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const officerName = req.user ? (req.user.full_name || req.user.username) : 'Officer';

    if (getDbStatus()) {
      await queryDb('UPDATE applications SET assigned_officer = NULL WHERE application_id = ?', [id]);
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'JOB_REMOVED_FROM_POOL', `Application #${id} removed from job pool by ${officerName} and returned to unassigned queue`]
      );
    } else {
      const app = (inMemoryDb.applications || []).find(a => String(a.application_id) === String(id) || a.tracking_id === id);
      if (app) app.assigned_officer = null;
    }

    return res.status(200).json({
      success: true,
      message: `Application #${id} removed from your job pool and returned to general queue.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Application (Strictly reserved for Admin - Officers CANNOT delete applications from the system)
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Enforce role security: Officers cannot delete from the whole system
    if (req.user && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission Denied: Officer role cannot delete applications from the system. You can only remove applications from your job pool.'
      });
    }

    if (getDbStatus()) {
      await queryDb('DELETE FROM applications WHERE application_id = ?', [id]);
      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'APPLICATION_DELETED', `Application #${id} permanently deleted from registry by Admin`]
      );
    } else {
      const idx = (inMemoryDb.applications || []).findIndex(a => String(a.application_id) === String(id) || a.tracking_id === id);
      if (idx !== -1) inMemoryDb.applications.splice(idx, 1);
    }

    return res.status(200).json({ success: true, message: `Application #${id} deleted successfully from system.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

