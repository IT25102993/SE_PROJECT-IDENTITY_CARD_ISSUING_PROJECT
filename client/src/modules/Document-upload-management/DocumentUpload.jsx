import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export const DocumentUpload = ({ onDocumentUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFiles = (files) => {
    const fileList = Array.from(files).map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString()
    }));
    setUploadedFiles(prev => [...prev, ...fileList]);
    if (onDocumentUploaded) {
      onDocumentUploaded(fileList);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        <Upload size={32} style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }} />
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Drag & Drop Document Files
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Supports PDF, JPG, PNG up to 10MB per document
        </p>

        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          Browse Files
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            hidden
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>ATTACHED DOCUMENTS</div>
          {uploadedFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="var(--accent-cyan)" />
                <span>{file.name} ({file.size})</span>
              </div>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
