import { queryDb, getDbStatus, inMemoryDb } from '../../config/db.js';
import { saveDocumentFile } from './documentStorage.js';

// Get all documents across all applications (Admin / Officer overview)
export const getAllDocuments = async (req, res) => {
  try {
    const { search } = req.query;

    if (getDbStatus()) {
      let sql = `
        SELECT 
          d.document_id,
          d.application_id,
          CONCAT('NEX-2026-', app.application_id) AS tracking_id,
          d.document_type,
          d.file_name,
          d.file_path,
          d.file_size,
          d.uploaded_at,
          CONCAT(a.first_name, ' ', a.last_name) AS applicant_name,
          a.national_id_number,
          app.status AS application_status
        FROM documents d
        JOIN applications app ON d.application_id = app.application_id
        JOIN applicants a ON app.applicant_id = a.applicant_id
      `;

      const params = [];
      if (search) {
        sql += ` WHERE d.document_type LIKE ? 
                 OR d.file_name LIKE ? 
                 OR CONCAT('NEX-2026-', app.application_id) = ? 
                 OR a.national_id_number LIKE ? 
                 OR CONCAT(a.first_name, ' ', a.last_name) LIKE ?`;
        params.push(`%${search}%`, `%${search}%`, search.toUpperCase(), `%${search}%`, `%${search}%`);
      }

      sql += ` ORDER BY d.uploaded_at DESC`;
      const rows = await queryDb(sql, params);
      return res.status(200).json({ success: true, count: rows.length, documents: rows });
    } else {
      let docs = (inMemoryDb.documents || []).map(doc => {
        const app = inMemoryDb.applications.find(a => a.application_id === doc.application_id);
        return {
          ...doc,
          tracking_id: app ? (app.tracking_id || `NEX-2026-${app.application_id}`) : `NEX-2026-${doc.application_id}`,
          applicant_name: app ? (app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`) : 'Unknown Applicant',
          national_id_number: app ? (app.national_id_number || app.nicNumber || '') : '',
          application_status: app ? (app.status || 'Pending') : 'Pending'
        };
      });

      if (search) {
        const term = search.toLowerCase();
        docs = docs.filter(d =>
          (d.document_type && d.document_type.toLowerCase().includes(term)) ||
          (d.file_name && d.file_name.toLowerCase().includes(term)) ||
          (d.tracking_id && d.tracking_id.toLowerCase().includes(term)) ||
          (d.applicant_name && d.applicant_name.toLowerCase().includes(term)) ||
          (d.national_id_number && d.national_id_number.toLowerCase().includes(term))
        );
      }

      return res.status(200).json({
        success: true,
        count: docs.length,
        documents: docs
      });
    }
  } catch (error) {
    console.error('Error fetching all documents:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all documents for a specific application
export const getApplicationDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      let appId = id;
      if (typeof id === 'string' && id.toUpperCase().startsWith('NEX-2026-')) {
        appId = id.replace(/[^0-9]/g, '');
      }

      const sql = `
        SELECT 
          d.document_id,
          d.application_id,
          CONCAT('NEX-2026-', app.application_id) AS tracking_id,
          d.document_type,
          d.file_name,
          d.file_path,
          d.file_size,
          d.uploaded_at
        FROM documents d
        JOIN applications app ON d.application_id = app.application_id
        WHERE d.application_id = ? OR CONCAT('NEX-2026-', app.application_id) = ?
        ORDER BY d.uploaded_at ASC
      `;

      const rows = await queryDb(sql, [appId, id]);
      return res.status(200).json({ success: true, count: rows.length, documents: rows });
    } else {
      let appId = id;
      if (typeof id === 'string' && id.toUpperCase().startsWith('NEX-2026-')) {
        appId = id.replace(/[^0-9]/g, '');
      }

      const docs = (inMemoryDb.documents || []).filter(d => 
        String(d.application_id) === String(appId) || String(d.application_id) === String(id)
      );

      return res.status(200).json({
        success: true,
        count: docs.length,
        documents: docs
      });
    }
  } catch (error) {
    console.error('Error fetching application documents:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload / attach a new document to an application
export const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_type, file_name, file_data, file_size } = req.body;

    if (!document_type || !file_name || !file_data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required document fields (document_type, file_name, file_data).'
      });
    }

    let numericAppId = id;
    if (typeof id === 'string' && id.toUpperCase().startsWith('NEX-2026-')) {
      numericAppId = parseInt(id.replace(/[^0-9]/g, ''), 10);
    } else {
      numericAppId = parseInt(id, 10);
    }

    const savedPath = await saveDocumentFile(file_data, file_name);

    if (getDbStatus()) {
      const result = await queryDb(
        `INSERT INTO documents (application_id, document_type, file_name, file_path, file_size, uploaded_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [numericAppId, document_type, file_name, savedPath, file_size || 'Unknown']
      );

      await queryDb(
        'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.user ? req.user.user_id : null, 'DOCUMENT_UPLOADED', `Document '${file_name}' uploaded for Application #${numericAppId}`]
      );

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        document: {
          document_id: result.insertId,
          application_id: numericAppId,
          document_type,
          file_name,
          file_path: savedPath,
          file_size: file_size || 'Unknown',
          uploaded_at: new Date().toISOString()
        }
      });
    } else {
      if (!inMemoryDb.documents) inMemoryDb.documents = [];
      const newDoc = {
        document_id: inMemoryDb.documents.length + 1,
        application_id: numericAppId,
        document_type,
        file_name,
        file_path: savedPath,
        file_size: file_size || 'Unknown',
        uploaded_at: new Date().toISOString()
      };

      inMemoryDb.documents.push(newDoc);

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        document: newDoc
      });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a document (Admin only)
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (getDbStatus()) {
      await queryDb('DELETE FROM documents WHERE document_id = ?', [documentId]);
      return res.status(200).json({ success: true, message: `Document #${documentId} deleted successfully.` });
    } else {
      if (!inMemoryDb.documents) inMemoryDb.documents = [];
      const idx = inMemoryDb.documents.findIndex(d => String(d.document_id) === String(documentId));
      if (idx !== -1) {
        inMemoryDb.documents.splice(idx, 1);
      }
      return res.status(200).json({ success: true, message: `Document #${documentId} deleted successfully.` });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
