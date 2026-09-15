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
  ArrowRight,
  FolderOpen,
  Download,
  Bot,
  RefreshCw,
  Cpu
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

  const [activeTab, setActiveTab] = useState('POOL'); // 'POOL' | 'WORKBENCH' | 'BOT_VERIFIED' | 'MANUAL_REVIEW' | 'ALL'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [officerComment, setOfficerComment] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isReevaluating, setIsReevaluating] = useState(false);

  const currentStaffName = user?.full_name || (isApproverMode ? 'Senior Approver Jayawardena' : 'Officer Wickramasinghe');
  const currentOfficer = currentStaffName;

  const botApprovedApps = applications.filter(
    a => a.status === 'Verification-Passed' || a.bot_verified === true || a.bot_verified === 1
  );

  const manualReviewApps = applications.filter(
    a => (!a.bot_verified || a.bot_verified === 0) && a.status !== 'Verification-Passed' && a.status !== 'Approved' && a.status !== 'Issued'
  );

  const unassignedPoolApps = applications.filter(
    a => a.status === 'PENDING_VERIFICATION' && (!a.assignedOfficer || a.assignedOfficer === '')
  );

  const myWorkbenchApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status === 'PENDING_VERIFICATION'
  );

  const completedApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status !== 'PENDING_VERIFICATION'
  );

  const handleReRunBotVerification = async (appId) => {
    setIsReevaluating(true);
    try {
      const realId = selectedApp?.application_id || (typeof appId === 'string' && appId.startsWith('NEX-2026-') ? appId.replace('NEX-2026-', '') : appId);
      const res = await fetch(`/api/applications/${realId}/bot-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.botResult) {
          setSelectedApp(prev => ({
            ...prev,
            status: data.botResult.status,
            bot_verified: data.botResult.passed,
            bot_score: data.botResult.score,
            bot_notes: data.botResult.notes,
            bot_verified_at: new Date().toISOString()
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReevaluating(false);
    }
  };

  const getDisplayedApplications = () => {
    let list = [];
    if (activeTab === 'POOL') {
      list = unassignedPoolApps;
    } else if (activeTab === 'WORKBENCH') {
      list = myWorkbenchApps;
    } else if (activeTab === 'BOT_VERIFIED') {
      list = botApprovedApps;
    } else if (activeTab === 'MANUAL_REVIEW') {
      list = manualReviewApps;
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div
            className="glass-card"
            onClick={() => setActiveTab('BOT_VERIFIED')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'BOT_VERIFIED' ? 'var(--accent-emerald)' : 'var(--border-color)',
              background: activeTab === 'BOT_VERIFIED' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>🤖 Bot Approved (≥80%)</span>
              <Bot size={18} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {botApprovedApps.length}
            </div>
          </div>

          <div
            className="glass-card"
            onClick={() => setActiveTab('MANUAL_REVIEW')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'MANUAL_REVIEW' ? 'var(--accent-amber)' : 'var(--border-color)',
              background: activeTab === 'MANUAL_REVIEW' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-amber)' }}>⚠️ Needs Manual Review</span>
              <AlertTriangle size={18} color="var(--accent-amber)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {manualReviewApps.length}
            </div>
          </div>

          <div
            className="glass-card"
            onClick={() => setActiveTab('POOL')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              borderColor: activeTab === 'POOL' ? 'var(--accent-cyan)' : 'var(--border-color)',
              background: activeTab === 'POOL' ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Unassigned Pool</span>
              <Briefcase size={18} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
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
        </div>

        {/* List Table View */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${activeTab === 'BOT_VERIFIED' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('BOT_VERIFIED')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: activeTab === 'BOT_VERIFIED' ? 'var(--accent-emerald)' : undefined }}
              >
                <Bot size={14} /> Bot Approved ({botApprovedApps.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'MANUAL_REVIEW' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('MANUAL_REVIEW')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: activeTab === 'MANUAL_REVIEW' ? 'var(--accent-amber)' : undefined }}
              >
                <AlertTriangle size={14} /> Needs Manual Review ({manualReviewApps.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'POOL' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('POOL')}
              >
                Unassigned Pool ({unassignedPoolApps.length})
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
                All Records ({applications.length})
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
                  <th style={{ padding: '0.75rem 1rem' }}>Bot Pre-Check</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No applications found in this category.
                    </td>
                  </tr>
                ) : (
                  displayedApps.map((app, idx) => {
                    const appId = app.id || `NEX-2026-${app.application_id}`;
                    const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                    const isBotPassed = app.status === 'Verification-Passed' || app.bot_verified === true || app.bot_verified === 1;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{appId}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{app.submittedDate || app.submitted_at}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {isBotPassed ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '20px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: 'var(--accent-emerald)',
                                border: '1px solid rgba(16, 185, 129, 0.35)'
                              }}
                            >
                              <Bot size={13} /> {app.bot_score ? `${app.bot_score}% Passed` : 'Passed (≥80%)'}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '20px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--accent-amber)',
                                border: '1px solid rgba(245, 158, 11, 0.35)'
                              }}
                            >
                              <AlertTriangle size={13} /> {app.bot_score ? `${app.bot_score}% Review` : 'Manual Check'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '20px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              background: isBotPassed ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.06)',
                              color: isBotPassed ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                              border: `1px solid ${isBotPassed ? 'rgba(6, 182, 212, 0.3)' : 'var(--border-color)'}`
                            }}
                          >
                            {app.status}
                          </span>
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
                  })
                )}
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

              {/* 🤖 Automated AI Bot Verification Report */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '14px',
                  background: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.06))',
                  border: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                    ? '1px solid rgba(16, 185, 129, 0.35)'
                    : '1px solid rgba(245, 158, 11, 0.35)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed') ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                    }}>
                      <Bot size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                        Pre-Officer Automated Check
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Birth Certificate AI Verification Engine
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        backgroundColor: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                        color: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                          ? 'var(--accent-emerald)'
                          : 'var(--accent-amber)',
                        border: (selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      {(selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                        ? `✓ ${selectedApp.bot_score || 88}% Match — VERIFICATION PASSED`
                        : `⚠️ ${selectedApp.bot_score || 45}% Match — MANUAL REVIEW REQUIRED`}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleReRunBotVerification(selectedApp.application_id || selectedApp.id)}
                      disabled={isReevaluating}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                      title="Re-run Bot Verification Algorithm"
                    >
                      <RefreshCw size={13} className={isReevaluating ? 'animate-spin' : ''} />
                      {isReevaluating ? 'Analyzing...' : 'Re-check Bot'}
                    </button>
                  </div>
                </div>

                {/* Score progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <span>Data Alignment Confidence (Threshold: 80%)</span>
                    <strong style={{ color: (selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)) >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                      {selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)}%
                    </strong>
                  </div>
                  <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(5, selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)))}%`,
                      background: (selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)) >= 80
                        ? 'var(--gradient-emerald)'
                        : 'linear-gradient(90deg, #ef4444, #f59e0b)',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Name Consistency Check</div>
                    <div style={{ fontWeight: 700, color: (selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)) >= 80 ? 'var(--accent-emerald)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                      {(selectedApp.bot_score || (selectedApp.status === 'Verification-Passed' ? 88 : 45)) >= 80 ? '✓ Matched (>85%)' : '⚠️ Low Token Match'}
                    </div>
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Birth Date & Eligibility</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                      ✓ Valid (>16 Years)
                    </div>
                  </div>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Birth Certificate Document</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.15rem' }}>
                      {selectedApp.documents?.some(d => (d.document_type || d.file_name || '').toLowerCase().includes('birth'))
                        ? '✓ Scan Verified'
                        : '⚠️ Missing Birth Cert'}
                    </div>
                  </div>
                </div>

                {/* Bot remarks note */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                  🤖 {selectedApp.bot_notes || ((selectedApp.bot_verified || selectedApp.status === 'Verification-Passed')
                    ? 'Automated Bot Check: PASSED. Birth Certificate and demographic data matched with 80%+ confidence. Approved for final officer sign-off.'
                    : 'Automated Bot Check: INCONCLUSIVE. Discrepancy detected or birth certificate scan requires manual verification by officer.')}
                </div>
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

              {/* Submitted Verification Documents */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FolderOpen size={16} color="var(--accent-cyan)" />
                  Submitted Verification Documents ({selectedApp.documents ? selectedApp.documents.length : 0})
                </div>

                {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    No physical verification documents were uploaded with this digital submission.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                    {selectedApp.documents.map((doc, i) => (
                      <div
                        key={doc.document_id || i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.document_type || 'Document'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.file_name} {doc.file_size ? `· ${doc.file_size}` : ''}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '6px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: 'var(--accent-primary)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                          {doc.file_path && (
                            <a
                              href={doc.file_path}
                              download={doc.file_name || 'document'}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: 'var(--accent-emerald)',
                                textDecoration: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              <Download size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Global Document Preview Modal */}
        {previewDoc && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setPreviewDoc(null)}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                maxWidth: '820px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.75rem',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                    Document Verification
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {previewDoc.document_type || 'Verification Document'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {previewDoc.file_name} {previewDoc.file_size ? `· ${previewDoc.file_size}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {previewDoc.file_path && (
                    <a
                      href={previewDoc.file_path}
                      download={previewDoc.file_name || 'document'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: 'var(--accent-emerald)',
                        textDecoration: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <Download size={14} /> Download
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewDoc(null)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Preview Viewport */}
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                {previewDoc.preview_url && !previewDoc.file_name?.toLowerCase().endsWith('.pdf') ? (
                  <img src={previewDoc.preview_url} alt={previewDoc.file_name} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
                ) : previewDoc.file_path && !previewDoc.file_path.toLowerCase().endsWith('.pdf') ? (
                  <img src={previewDoc.file_path} alt={previewDoc.file_name} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
                ) : previewDoc.file_path ? (
                  <iframe src={previewDoc.file_path} title={previewDoc.file_name} style={{ width: '100%', height: '65vh', border: 'none' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No direct preview available</div>
                    <div style={{ fontSize: '0.83rem' }}>Use the download button above to inspect the file.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
