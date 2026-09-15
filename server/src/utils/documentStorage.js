import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

// Path to the real birth_certificate.pdf example bundled in the project root
const PROJECT_ROOT_BIRTH_CERT = path.resolve(__dirname, '../../../../birth_certificate.pdf');

// Ensure directory exists
export const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Save a base64 data URL or buffer to a disk file in uploads/documents
 * @param {string} dataUrl - e.g. "data:image/jpeg;base64,/9j/4AAQSkZJRg..." or raw base64
 * @param {string} originalName - e.g. "birth_certificate.pdf"
 * @returns {string} public path e.g. "/uploads/documents/17263728192-birth_certificate.pdf"
 */
export const saveDocumentFile = async (dataUrl, originalName = 'document.pdf') => {
  ensureUploadDir();

  // If already a hosted path, return as is
  if (dataUrl && dataUrl.startsWith('/uploads/')) {
    return dataUrl;
  }

  // If not a data URL string, create a default file or return as is
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Extract base64 payload
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      await fs.promises.writeFile(filePath, buffer);
      return `/uploads/documents/${filename}`;
    } else if (dataUrl.length > 200) {
      // Raw base64 string
      const buffer = Buffer.from(dataUrl, 'base64');
      await fs.promises.writeFile(filePath, buffer);
      return `/uploads/documents/${filename}`;
    }

    return dataUrl;
  } catch (err) {
    console.error('Error saving document file to disk:', err);
    // Return original data URL as fallback
    return dataUrl;
  }
};

// Create initial sample document files so seed records don't 404
export const initSampleDocuments = () => {
  try {
    ensureUploadDir();
    const sampleBirthCert = path.join(UPLOAD_DIR, 'birth_certificate.pdf');
    const sampleGrama = path.join(UPLOAD_DIR, 'sample_grama_cert.jpg');

    if (!fs.existsSync(sampleBirthCert)) {
      // Use the real birth_certificate.pdf from the project root as the reference example
      if (fs.existsSync(PROJECT_ROOT_BIRTH_CERT)) {
        fs.copyFileSync(PROJECT_ROOT_BIRTH_CERT, sampleBirthCert);
        console.log('[DocumentStorage] Copied real birth_certificate.pdf as the example reference document.');
      } else {
        // Fallback: write a minimal valid PDF if the real file is not found
        const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 24 Tf 100 700 Td (NexusGov Official Birth Certificate Verification) Tj ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
427
%%EOF`;
        fs.writeFileSync(sampleBirthCert, minimalPdf, 'utf-8');
        console.warn('[DocumentStorage] birth_certificate.pdf not found at project root, wrote minimal placeholder.');
      }
    }

    if (!fs.existsSync(sampleGrama)) {
      // Minimal 1x1 transparent/colored JPEG or PNG placeholder
      const dummyJpg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
      fs.writeFileSync(sampleGrama, dummyJpg);
    }
  } catch (err) {
    console.warn('Sample documents initialization warning:', err.message);
  }
};
