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
  ArrowRight,
  Edit3,
  Save,
  X,
  ExternalLink,
  Info,
  User,
  Upload
} from 'lucide-react';

export const OfficerDashboard = () => {
  const {
    role,
    applications,
    updateApplication,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const currentStaffName = user?.full_name || (isApproverMode ? 'Senior Approver Jayawardena' : 'Officer Wickramasinghe');
  const currentOfficer = currentStaffName;

  const isPending = (s) => ['PENDING_VERIFICATION','Pending','Verification-Passed'].includes(s);

  const unassignedPoolApps = applications.filter(
    a => isPending(a.status) && (!a.assignedOfficer || a.assignedOfficer === '')
  );

  const myWorkbenchApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && isPending(a.status)
  );

  const completedApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && !isPending(a.status)
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

  // Officer: save notes without approving
  const handleSaveNotes = () => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp.application_id;
    triggerLoading({
      message: `Saving Officer Notes for #${appId}...`,
      subtext: 'Persisting verification notes to database',
      duration: 800,
      onComplete: async () => {
        await updateApplication(appId, { remarks: officerComment, officerNotes: officerComment });
        setSelectedApp(prev => ({ ...prev, officerNotes: officerComment, remarks: officerComment }));
      }
    });
  };

  // Officer: request applicant to re-upload documents
  const handleRequestReupload = () => {
    if (!selectedApp) return;
    if (!officerComment.trim()) {
      alert('Please specify which documents need to be re-uploaded in the Officer Notes before sending the request.');
      return;
    }
    const appId = selectedApp.id || selectedApp.application_id;
    triggerLoading({
      message: 'Sending Document Re-upload Request to Applicant...',
      subtext: 'Notifying applicant to re-upload the required documents via the citizen portal',
      duration: 1000,
      onComplete: async () => {
        await updateApplication(appId, {
          status: 'Documents-Required',
          remarks: officerComment,
          officerNotes: officerComment
        });
        setSelectedApp(null);
      }
    });
  };

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
      message: `Removing ${appId} from your Job Pool...`,
      subtext: 'Application stays in registry — only removed from your personal workbench',
      duration: 1000,
      onComplete: () => {
        unclaimJob(appId);
        if (selectedApp && (selectedApp.id === appId || selectedApp.application_id === appId)) {
          setSelectedApp(null);
          setIsEditing(false);
        }
      }
    });
  };

  const handleOpenReview = (app) => {
    const appId = app.id || app.application_id;
    if (!app.assignedOfficer && isPending(app.status)) {
      claimJob(appId, currentOfficer);
    }
    setSelectedApp(app);
    setIsEditing(false);
    setOfficerComment(app.officerNotes || app.remarks || '');
    setEditForm({
      first_name: app.first_name || '',
      last_name: app.last_name || '',
      dob: app.dob || app.date_of_birth || '',
      gender: app.gender || 'Male',
      address: app.address || '',
      phone_number: app.phone_number || app.phone || '',
      email: app.email || '',
      application_type: app.application_type || 'New',
      officerNotes: app.officerNotes || app.remarks || ''
    });
  };

  const handleSaveUpdate = () => {
    if (!selectedApp) return;
    const appId = selectedApp.id || selectedApp.application_id;
    triggerLoading({
      message: `Saving Application #${appId} Updates...`,
      subtext: 'Persisting corrected registry records to database',
      duration: 1200,
      onComplete: async () => {
        const res = await updateApplication(appId, { ...editForm, remarks: editForm.officerNotes });
        if (res && res.success) {
          setIsEditing(false);
          setSelectedApp(prev => ({
            ...prev,
            ...editForm,
            fullNameEn: `${editForm.first_name} ${editForm.last_name}`.trim(),
            remarks: editForm.officerNotes,
            officerNotes: editForm.officerNotes
          }));
          setOfficerComment(editForm.officerNotes);
        }
      }
    });
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
            onClick={() => setActiveTab('BOT_APPROVED')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'BOT_APPROVED' ? 'var(--accent-purple)' : 'var(--border-color)',
              background: activeTab === 'BOT_APPROVED' ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bot size={16} color="var(--accent-purple)" /> Bot Approved (AI)
              </span>
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(139, 92, 246, 0.2)',
                color: 'var(--accent-purple)',
                padding: '0.15rem 0.45rem',
                borderRadius: '6px',
                fontWeight: 700
              }}>
                ≥80% MATCH
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                {botApprovedApps.length}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                {pendingBotApps.length} pending sign-off
              </span>
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
        </di        )}

        {/* List Table View */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${activeTab === 'POOL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('POOL')}>
                Unassigned Pool ({unassignedPoolApps.length})
              </button>
              <button className={`btn btn-sm ${activeTab === 'WORKBENCH' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('WORKBENCH')}>
                My Workbench ({myWorkbenchApps.length})
              </button>
              <button className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('ALL')}>
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
                  <th style={{ padding: '0.75rem 1rem' }}>Applicant</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
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
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{app.email || app.phone || ''}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem' }}>
                        {app.assignedOfficer
                          ? <span style={{ color: app.assignedOfficer === currentOfficer ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>● {app.assignedOfficer === currentOfficer ? 'You' : app.assignedOfficer}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{app.submittedDate || app.submitted_at}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-pending">{app.status}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {activeTab === 'WORKBENCH' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleUnclaim(appId)} title="Remove from your workbench" style={{ gap: '0.3rem', fontSize: '0.78rem' }}>
                              <RotateCcw size={12} /> Remove
                            </button>
                          )}
                          {activeTab === 'POOL' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleClaimSingle(appId)} style={{ gap: '0.3rem', fontSize: '0.78rem' }}>
                              <Sparkles size={12} color="var(--accent-amber)" /> Claim
                            </button>
                          )}
                          <button className="btn btn-primary btn-sm" onClick={() => handleOpenReview(app)} style={{ gap: '0.3rem' }}>
                            <Eye size={14} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Detail, Update & Pool Management Modal */}
        {selectedApp && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <div className="glass-card animate-fade-in" style={{ maxWidth: '900px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>

              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Application Review & Management</h3>
                    <span className="badge badge-pending">{selectedApp.status}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedApp.id || `NEX-2026-${selectedApp.application_id}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn btn-sm ${isEditing ? 'btn-emerald' : 'btn-primary'}`}
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ gap: '0.35rem' }}
                  >
                    {isEditing ? <><Eye size={13}/> View Mode</> : <><Edit3 size={13}/> Edit / Correct</>}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedApp(null); setIsEditing(false); }} style={{ gap: '0.35rem' }}>
                    <X size={14} /> Close
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', minHeight: 0 }}>

                {isEditing ? (
                  /* ---- Edit / Correct Details Form ---- */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <strong>Record Correction Mode:</strong> Edit any discrepancies found during verification. All changes are saved to the database with an audit trail.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                      {[['first_name','First Name','text'],['last_name','Last Name','text'],['dob','Date of Birth','date'],['phone_number','Phone Number','text'],['email','Email','email']].map(([key, label, type]) => (
                        <div className="form-group" key={key}>
                          <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</label>
                          <input type={type} className="form-control" value={editForm[key] || ''} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })} />
                        </div>
                      ))}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gender</label>
                        <select className="form-control" value={editForm.gender || 'Male'} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Application Type</label>
                        <select className="form-control" value={editForm.application_type || 'New'} onChange={e => setEditForm({ ...editForm, application_type: e.target.value })}>
                          <option value="New">New NIC</option>
                          <option value="Renewal">Renewal</option>
                          <option value="Replacement">Replacement (Lost)</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Residential Address</label>
                      <textarea rows={2} className="form-control" value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Officer Notes & Remarks</label>
                      <textarea rows={3} className="form-control" value={editForm.officerNotes || ''} onChange={e => { setEditForm({ ...editForm, officerNotes: e.target.value }); setOfficerComment(e.target.value); }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                      <button className="btn btn-emerald" onClick={handleSaveUpdate} style={{ gap: '0.4rem' }}>
                        <Save size={15} /> Save Changes
                      </button>
                    </div>
                  </div>

                ) : (
                  /* ---- View Details Mode ---- */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
                      {/* Applicant Info */}
                      <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-nested)' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color="var(--accent-primary)" /> Applicant Information
                        </h4>
                        {[
                          ['Full Name', selectedApp.fullNameEn || `${selectedApp.first_name||''} ${selectedApp.last_name||''}`],
                          ['NIC Number', selectedApp.nicNumber || selectedApp.national_id_number || 'Pending Approval'],
                          ['Date of Birth', selectedApp.dob || selectedApp.date_of_birth || 'N/A'],
                          ['Gender', selectedApp.gender || 'N/A'],
                          ['Civil Status', selectedApp.marital_status || selectedApp.civilStatus || 'N/A'],
                          ['Reason', selectedApp.application_reason || 'N/A'],
                          ['Phone', selectedApp.phone || selectedApp.phone_number || 'N/A'],
                          ['Email', selectedApp.email || 'N/A'],
                          ['Address', selectedApp.address || 'N/A'],
                          ['Type', selectedApp.application_type || 'New'],
                          ['Submitted', selectedApp.submittedDate || selectedApp.submitted_at || 'Recent']
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.84rem', marginBottom: '0.45rem' }}>
                            <span style={{ color: 'var(--text-muted)', minWidth: '100px', flexShrink: 0 }}>{label}:</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: label === 'NIC Number' ? 700 : 400 }}>{value}</span>
                          </div>
                        ))}

                        {/* Delivery Method Banner */}
                        {(() => {
                          const sType = selectedApp.service_type || selectedApp.serviceType || 'Normal';
                          const is1Day = sType === '1-Day';
                          return (
                            <div style={{
                              marginTop: '0.75rem',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              background: is1Day ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.08)',
                              border: `1px solid ${is1Day ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.3)'}`,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                                  {is1Day ? '🚚 1-Day Priority — Courier Dispatch Required' : '📨 Normal Service — Postal Dispatch'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                  Operational Delivery: <strong>{is1Day ? 'Courier Service' : 'Sri Lanka Postal Service'}</strong>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                  Treasury Acc: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>1234 5678 9012 1234</strong> (Department of Identity Issuance)
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                                  Rs. {is1Day ? '1,500' : '500'}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                                  ✓ Fee Rate Verified
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Documents + Bot Verification */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-nested)' }}>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FileText size={15} color="var(--accent-amber)" /> Verification Documents & Teller Slip
                          </h4>
                          {Array.isArray(selectedApp.documents) && selectedApp.documents.length > 0 ? (
                            selectedApp.documents.map((doc, dIdx) => {
                              const isTellerSlip = (doc.document_type || '').includes('Deposit') || (doc.document_type || '').includes('Teller') || (doc.file_name || '').toLowerCase().includes('receipt') || (doc.file_name || '').toLowerCase().includes('teller');
                              return (
                              <div key={dIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', borderRadius: '8px', background: isTellerSlip ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)', border: `1px solid ${isTellerSlip ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)'}`, marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem' }}>
                                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {doc.document_type || `Document #${dIdx + 1}`}
                                    {isTellerSlip && (
                                      <span style={{ fontSize: '0.65rem', background: 'var(--accent-emerald)', color: '#fff', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                                        CDM SLIP
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{doc.file_name || ''} {doc.file_size ? `• ${doc.file_size}` : ''}</div>
                                </div>
                                {doc.file_path && (
                                  <a href={doc.file_path} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', gap: '0.25rem' }}>
                                    <ExternalLink size={11} /> View
                                  </a>
                                )}
                              </div>
                            );})
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '0.75rem' }}>Documents on file.</div>
                          )}
                        </div>


                      </div>
                    </div>

                    {/* Officer Notes */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>Officer Verification Notes</label>
                      <textarea rows={3} className="form-control" placeholder="Enter findings, Grama Niladhari confirmation, or rejection grounds..." value={officerComment} onChange={e => setOfficerComment(e.target.value)} style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.1rem', marginTop: '1.1rem' }}>
                <div>
                  {selectedApp.assignedOfficer === currentOfficer && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleUnclaim(selectedApp.id || selectedApp.application_id)}
                      title="Release this application back to general pool. It is NOT deleted from the system."
                      style={{ gap: '0.4rem', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.84rem' }}
                    >
                      <RotateCcw size={14} /> Remove from My Job Pool
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {!isEditing && (
                    <>
                      {/* Officer view: verify documents, save notes, request re-upload only */}
                      {!isApproverMode && (
                        <>
                          <button
                            className="btn btn-secondary"
                            onClick={handleSaveNotes}
                            style={{ gap: '0.4rem' }}
                          >
                            <Save size={15} /> Save Notes
                          </button>
                          <button
                            onClick={handleRequestReupload}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.6rem 1.1rem',
                              borderRadius: '10px',
                              fontWeight: 600,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: '#fff',
                              border: 'none',
                              boxShadow: '0 0 14px rgba(245, 158, 11, 0.35)'
                            }}
                          >
                            <Upload size={15} /> Request Document Re-upload
                          </button>
                        </>
                      )}

                      {/* Approver view: full approve / reject authority */}
                      {isApproverMode && (
                        <>
                          <button className="btn btn-rose" onClick={handleReject} style={{ gap: '0.4rem' }}>
                            <XCircle size={15} /> Reject
                          </button>
                          <button className="btn btn-primary" onClick={handleApprove} style={{ gap: '0.4rem' }}>
                            <CheckCircle2 size={15} /> Approve & Issue NIC
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Role Authority Notice */}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Info size={11} />
                {isApproverMode
                  ? 'Senior Approvers have full authority to approve or reject applications and issue NIC numbers.'
                  : 'Officers can review documents & request re-uploads. Approval authority is restricted to Senior Approvers only.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
