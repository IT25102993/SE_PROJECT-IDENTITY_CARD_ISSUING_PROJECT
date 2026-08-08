import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IDCard3D } from '../components/IDCard3D';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { role, setRole, applications, approveApplication, rejectApplication } = useApp();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [officerComment, setOfficerComment] = useState('');

  const filteredApps = applications.filter(app => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (app.nicNumber && app.nicNumber.includes(searchTerm));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = applications.filter(a => a.status === 'PENDING_VERIFICATION').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED' || a.status === 'PRINTED' || a.status === 'DISPATCHED').length;

  const handleOpenReview = (app) => {
    setSelectedApp(app);
    setOfficerComment(app.officerNotes || '');
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    approveApplication(selectedApp.id, officerComment);
    setSelectedApp(null);
  };

  const handleReject = () => {
    if (!selectedApp) return;
    if (!officerComment.trim()) {
      alert('Please specify rejection reason in officer notes.');
      return;
    }
    rejectApplication(selectedApp.id, officerComment);
    setSelectedApp(null);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Role Banner Warning if not in Officer Mode */}
        {role !== 'officer' && role !== 'admin' && (
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderColor: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle color="var(--accent-amber)" size={24} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>You are currently viewing in Citizen Mode</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch to Verification Officer Mode to test approval and NIC generation functions.</div>
              </div>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={() => setRole('officer')}>
              Switch to Officer Mode
            </button>
          </div>
        )}

        {/* Dashboard Title */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={28} color="var(--accent-emerald)" />
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Verification Officer Portal</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Review citizen applications, validate uploaded biometrics, and approve identity issuance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Review</div>
            </div>
            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{approvedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved Cards</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search by Tracking ID, Name, or NIC..."
              className="form-control"
              style={{ padding: '0.5rem 0.85rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={18} color="var(--text-secondary)" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 1rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="PRINTED">Printed PVC</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Applicant Name</th>
                  <th>District / Secretariat</th>
                  <th>DOB</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No applications found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {app.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{app.fullNameEn}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.fullNameSi}</div>
                      </td>
                      <td>
                        {app.district}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.divisionalSecretariat}</div>
                      </td>
                      <td>{app.dob}</td>
                      <td>{app.submittedDate}</td>
                      <td>
                        {app.status === 'PENDING_VERIFICATION' && <span className="badge badge-pending">Pending</span>}
                        {app.status === 'APPROVED' && <span className="badge badge-approved">Approved</span>}
                        {app.status === 'PRINTED' && <span className="badge badge-printed">Printed</span>}
                        {app.status === 'DISPATCHED' && <span className="badge badge-dispatched">Dispatched</span>}
                        {app.status === 'REJECTED' && <span className="badge badge-rejected">Rejected</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenReview(app)}
                        >
                          <Eye size={14} /> Review & Validate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE-BY-SIDE VERIFICATION MODAL */}
        {selectedApp && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                width: '100%',
                maxWidth: '960px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                border: '1px solid var(--border-glow)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Applicant Document & Identity Review</h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Tracking Ref: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedApp.id}</span>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedApp(null)}
                >
                  Close (✕)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Left Form Specs */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                    Application Payload Data
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                    <div><strong>English Name:</strong> {selectedApp.fullNameEn}</div>
                    <div><strong>Sinhala Name:</strong> {selectedApp.fullNameSi}</div>
                    <div><strong>Tamil Name:</strong> {selectedApp.fullNameTa}</div>
                    <div><strong>DOB & Gender:</strong> {selectedApp.dob} ({selectedApp.gender})</div>
                    <div><strong>Civil Status:</strong> {selectedApp.civilStatus}</div>
                    <div><strong>Address:</strong> {selectedApp.address}</div>
                    <div><strong>Grama Niladhari Division:</strong> {selectedApp.gnDivision}</div>
                    <div><strong>Phone:</strong> {selectedApp.phone}</div>
                    <div><strong>Email:</strong> {selectedApp.email}</div>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Attached Proof Documents:</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    {selectedApp.documents?.map((doc, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                        <FileText size={16} /> {doc} (Verified)
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Digital Card Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-amber)' }}>
                    Generated Physical Card Layout
                  </h3>
                  <div style={{ width: '100%', maxWidth: '440px' }}>
                    <IDCard3D cardData={selectedApp} />
                  </div>
                </div>
              </div>

              {/* Officer Notes & Action Bar */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Verification Officer Notes / Audit Comment:</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Enter approval verification details or rejection reasons..."
                    value={officerComment}
                    onChange={(e) => setOfficerComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    className="btn btn-danger"
                    onClick={handleReject}
                  >
                    <XCircle size={18} /> Reject Application
                  </button>
                  <button
                    className="btn btn-emerald btn-lg"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 size={20} /> Approve & Issue Cryptographic NIC
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
