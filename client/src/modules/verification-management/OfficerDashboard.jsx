import React, { useState } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IDCard3D } from '../../components/IDCard3D';
import {
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
  Clock,
  Briefcase,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Check,
  Layers,
  ArrowRight
} from 'lucide-react';

export const OfficerDashboard = () => {
  const {
    role,
    setRole,
    applications,
    approveApplication,
    rejectApplication,
    claimJob,
    unclaimJob,
    claimNextJob,
    triggerLoading
  } = useApp();

  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const userRole = (user?.role || role || 'Officer');
  const isAdmin = userRole.toLowerCase() === 'admin' || role === 'admin';
  const isApproverUser = userRole.toLowerCase() === 'approver' || role === 'approver';
  const isOfficerUser = userRole.toLowerCase() === 'officer' || role === 'officer';
  const isCitizen = userRole.toLowerCase() === 'citizen' && !isAdmin && !isApproverUser && !isOfficerUser;

  const urlView = searchParams.get('view');
  const currentView = urlView || (isApproverUser ? 'approver' : 'officer');
  const isApproverMode = currentView === 'approver';

  const [activeTab, setActiveTab] = useState('POOL'); // 'POOL' | 'WORKBENCH' | 'ALL'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [officerComment, setOfficerComment] = useState('');

  const currentStaffName = user?.full_name || (isApproverMode ? 'Senior Approver Jayawardena' : 'Officer Wickramasinghe');

  const unassignedPoolApps = applications.filter(
    a => a.status === 'PENDING_VERIFICATION' && (!a.assignedOfficer || a.assignedOfficer === '')
  );

  const myWorkbenchApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status === 'PENDING_VERIFICATION'
  );

  const completedApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status !== 'PENDING_VERIFICATION'
  );

  const getDisplayedApplications = () => {
    let list = [];
    if (activeTab === 'POOL') {
      list = unassignedPoolApps;
    } else if (activeTab === 'WORKBENCH') {
      list = myWorkbenchApps;
    } else {
      list = applications.filter(app => filterStatus === 'ALL' || app.status === filterStatus);
    }

    return list.filter(app => {
      const term = searchTerm.toLowerCase();
      const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
      const appId = app.id || `NEX-2026-${app.application_id}`;
      return (
        appId.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term)
      );
    });
  };

  const displayedApps = getDisplayedApplications();

  const handleClaimSingle = (appId) => {
    triggerLoading({
      message: `Claiming Application ${appId}...`,
      subtext: 'Assigning record to your active workbench',
      duration: 1000,
      onComplete: () => claimJob(appId, currentOfficer)
    });
  };

  const handleClaimAndReviewNext = () => {
    triggerLoading({
      message: 'Claiming Next Priority Application...',
      subtext: 'Fetching highest priority unassigned record from job pool',
      duration: 1200,
      onComplete: () => {
        const nextApp = claimNextJob(currentOfficer);
        if (nextApp) {
          setSelectedApp(nextApp);
          setOfficerComment(nextApp.officerNotes || '');
        }
      }
    });
  };

  const handleUnclaim = (appId) => {
    triggerLoading({
      message: `Releasing ${appId} to Pool...`,
      subtext: 'Returning application to general verification queue',
      duration: 1000,
      onComplete: () => {
        unclaimJob(appId);
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(null);
        }
      }
    });
  };

  const handleOpenReview = (app) => {
    const appId = app.id || app.application_id;
    if (!app.assignedOfficer && app.status === 'PENDING_VERIFICATION') {
      claimJob(appId, currentOfficer);
    }
    setSelectedApp(app);
    setOfficerComment(app.officerNotes || '');
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp.application_id;
    triggerLoading({
      message: 'Generating Cryptographic NIC Number...',
      subtext: 'Validating biometrics & updating national identity registry',
      duration: 1500,
      onComplete: () => {
        approveApplication(appId, officerComment);
        setSelectedApp(null);
      }
    });
  };

  const handleReject = () => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp.application_id;
    if (!officerComment.trim()) {
      alert('Please specify rejection reason in officer notes before proceeding.');
      return;
    }
    triggerLoading({
      message: 'Processing Application Rejection...',
      subtext: 'Logging compliance audit trail',
      duration: 1200,
      onComplete: () => {
        rejectApplication(appId, officerComment);
        setSelectedApp(null);
      }
    });
  };

  const currentOfficer = currentStaffName;

  if (isCitizen) {
    return (
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-amber)' }}>
              <AlertTriangle size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Restricted Staff Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The Verification Officer and Senior Approver panels are reserved for authorized government staff. As an applicant, please use the citizen portals below.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <NavLink to="/apply" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                Apply Online <ArrowRight size={16} />
              </NavLink>
              <NavLink to="/track" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                Track Application Status
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Admin Multi-Panel Oversight Switcher */}
        {isAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
            background: 'var(--bg-nested)',
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-purple)'
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Administrator Oversight Mode
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  You have full executive clearance to view both Officer and Approver workflows
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSearchParams({ view: 'officer' })}
                className={`btn btn-sm ${!isApproverMode ? 'btn-emerald' : 'btn-secondary'}`}
                style={{ borderRadius: '8px', fontSize: '0.82rem', gap: '0.4rem' }}
              >
                <UserCheck size={15} /> Officer View
              </button>
              <button
                onClick={() => setSearchParams({ view: 'approver' })}
                className={`btn btn-sm ${isApproverMode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '8px', fontSize: '0.82rem', gap: '0.4rem' }}
              >
                <ShieldCheck size={15} /> Approver View
              </button>
              <NavLink
                to="/admin"
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '8px', fontSize: '0.82rem', gap: '0.4rem', border: '1px solid var(--border-color)' }}
              >
                Back to Admin Panel
              </NavLink>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {isApproverMode ? (
                <ShieldCheck size={32} color="var(--accent-cyan)" />
              ) : (
                <UserCheck size={32} color="var(--accent-emerald)" />
              )}
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>
                {isApproverMode ? 'Senior Approver Portal' : 'Verification Officer Portal'}
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              {isApproverMode
                ? 'Executive Authorization, Biometric Verification Sign-Off & Official Card Issuance.'
                : 'Central Verification Job Pool & Biometric Validation Workbench.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isApproverMode ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                boxShadow: `0 0 8px ${isApproverMode ? 'var(--accent-cyan)' : 'var(--accent-emerald)'}`
              }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentOfficer}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'System Administrator (Executive Oversight)' : isApproverMode ? 'Executive Sign-Off Authority' : 'Unit #04 • Senior Registrar'}
                </div>
              </div>
            </div>

            <button
              className={`btn ${isApproverMode ? 'btn-primary' : 'btn-emerald'} btn-lg`}
              onClick={handleClaimAndReviewNext}
              disabled={unassignedPoolApps.length === 0}
            >
              <Sparkles size={18} /> {isApproverMode ? 'Review Next for Approval' : 'Claim Next Priority Job'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div
            className="glass-card"
            onClick={() => setActiveTab('POOL')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'POOL' ? 'var(--accent-amber)' : 'var(--border-color)',
              background: activeTab === 'POOL' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Unassigned Pool</span>
              <Briefcase size={18} color="var(--accent-amber)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {unassignedPoolApps.length}
            </div>
          </div>

          <div
            className="glass-card"
            onClick={() => setActiveTab('WORKBENCH')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'WORKBENCH' ? 'var(--accent-primary)' : 'var(--border-color)',
              background: activeTab === 'WORKBENCH' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>My Active Workbench</span>
              <Clock size={18} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {myWorkbenchApps.length}
            </div>
          </div>

          <div
            className="glass-card"
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'ALL' ? 'var(--accent-emerald)' : 'var(--border-color)',
              background: activeTab === 'ALL' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>My Approved Total</span>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {completedApps.length}
            </div>
          </div>
        </div>

        {/* List Table View */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn btn-sm ${activeTab === 'POOL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('POOL')}
              >
                Unassigned Job Pool ({unassignedPoolApps.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'WORKBENCH' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('WORKBENCH')}
              >
                My Workbench ({myWorkbenchApps.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('ALL')}
              >
                All Applications ({applications.length})
              </button>
            </div>

            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search job pool..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Tracking ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Applicant Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Submitted Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedApps.map((app, idx) => {
                  const appId = app.id || `NEX-2026-${app.application_id}`;
                  const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{appId}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{app.submittedDate || app.submitted_at}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-pending">{app.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenReview(app)}
                          style={{ gap: '0.3rem' }}
                        >
                          <Eye size={14} /> Review & Verify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal / Detailed Verification Drawer */}
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Verification Workbench</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedApp.id || `NEX-2026-${selectedApp.application_id}`}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(null)}>
                  Close
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Applicant Details</h4>
                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Name:</strong> {selectedApp.fullNameEn || `${selectedApp.first_name || ''} ${selectedApp.last_name || ''}`}</div>
                    <div><strong>DOB:</strong> {selectedApp.dob || selectedApp.date_of_birth}</div>
                    <div><strong>Gender:</strong> {selectedApp.gender}</div>
                    <div><strong>Address:</strong> {selectedApp.address}</div>
                    <div><strong>Phone:</strong> {selectedApp.phone || selectedApp.phone_number}</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Officer Verification Notes</h4>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Enter verification notes or reason for rejection..."
                    value={officerComment}
                    onChange={e => setOfficerComment(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button className="btn btn-rose" onClick={handleReject}>
                  <XCircle size={16} /> Reject Application
                </button>
                <button className="btn btn-emerald" onClick={handleApprove}>
                  <CheckCircle2 size={16} /> Approve & Issue NIC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
