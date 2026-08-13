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
  Clock,
  Briefcase,
  Sparkles,
  ArrowRight,
  RotateCcw,
  PlusCircle,
  Tag,
  ShieldCheck,
  Check
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

  const [activeTab, setActiveTab] = useState('POOL'); // 'POOL' | 'WORKBENCH' | 'ALL'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [officerComment, setOfficerComment] = useState('');

  const currentOfficer = 'Officer Wickramasinghe';

  // Job Pool Categorizations
  const unassignedPoolApps = applications.filter(
    a => a.status === 'PENDING_VERIFICATION' && (!a.assignedOfficer || a.assignedOfficer === '')
  );

  const myWorkbenchApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status === 'PENDING_VERIFICATION'
  );

  const completedApps = applications.filter(
    a => a.assignedOfficer === currentOfficer && a.status !== 'PENDING_VERIFICATION'
  );

  const expressCount = unassignedPoolApps.filter(
    a => a.priority === 'HIGH' || a.priority === 'EXPRESS'
  ).length;

  // Filtered List based on Active Tab
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
      return (
        app.id.toLowerCase().includes(term) ||
        app.fullNameEn.toLowerCase().includes(term) ||
        (app.district && app.district.toLowerCase().includes(term)) ||
        (app.nicNumber && app.nicNumber.includes(term))
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
    if (!app.assignedOfficer && app.status === 'PENDING_VERIFICATION') {
      claimJob(app.id, currentOfficer);
    }
    setSelectedApp(app);
    setOfficerComment(app.officerNotes || '');
  };

  const handleApprove = () => {
    if (!selectedApp) return;
    triggerLoading({
      message: 'Generating Cryptographic NIC Number...',
      subtext: 'Validating biometrics & updating national identity registry',
      duration: 1500,
      onComplete: () => {
        approveApplication(selectedApp.id, officerComment);
        setSelectedApp(null);
      }
    });
  };

  const handleReject = () => {
    if (!selectedApp) return;
    if (!officerComment.trim()) {
      alert('Please specify rejection reason in officer notes before proceeding.');
      return;
    }
    triggerLoading({
      message: 'Processing Application Rejection...',
      subtext: 'Logging compliance audit trail',
      duration: 1200,
      onComplete: () => {
        rejectApplication(selectedApp.id, officerComment);
        setSelectedApp(null);
      }
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'EXPRESS':
        return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>⚡ Express</span>;
      case 'HIGH':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>🔥 High Priority</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Standard</span>;
    }
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
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch to Verification Officer Mode to claim job pool items and issue NIC cards.</div>
              </div>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={() => setRole('officer')}>
              Switch to Officer Mode
            </button>
          </div>
        )}

        {/* Dashboard Title & Officer Identity Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UserCheck size={32} color="var(--accent-emerald)" />
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Verification Officer Portal</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Central Verification Job Pool & Biometric Validation Workbench.
            </p>
          </div>

          {/* Quick Action & Officer Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentOfficer}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unit #04 • Senior Registrar</div>
              </div>
            </div>

            <button
              className="btn btn-emerald btn-lg"
              onClick={handleClaimAndReviewNext}
              disabled={unassignedPoolApps.length === 0}
              style={{ boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)' }}
            >
              <Sparkles size={18} /> Claim Next Priority Job
            </button>
          </div>
        </div>

        {/* Job Pool Statistics KPI Bar */}
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Applications awaiting officer claim
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
              <UserCheck size={18} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {myWorkbenchApps.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Claimed by you for verification
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Express & High Priority</span>
              <Sparkles size={18} color="var(--accent-rose)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>
              {expressCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Require immediate processing
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
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Reviews</span>
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {completedApps.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Approved / Issued identity records
            </div>
          </div>
        </div>

        {/* View Tabs & Search Controls */}
        <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'POOL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('POOL')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Briefcase size={16} /> Job Pool ({unassignedPoolApps.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'WORKBENCH' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('WORKBENCH')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserCheck size={16} /> My Workbench ({myWorkbenchApps.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ALL')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> All Archive
            </button>
          </div>

          {/* Search Input & Status Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search Tracking ID, Name, District..."
                className="form-control"
                style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === 'ALL' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PRINTED">Printed</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}
          </div>
        </div>

        {/* Table of Applications */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Priority</th>
                  <th>Applicant Name</th>
                  <th>District / Secretariat</th>
                  <th>Assigned Officer</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                      <Briefcase size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>No Applications in this View</div>
                      <div style={{ fontSize: '0.82rem' }}>
                        {activeTab === 'POOL'
                          ? 'All pending jobs have been claimed! Check back later or view your active workbench.'
                          : 'Try adjusting your search query or tab selection.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedApps.map(app => {
                    const isClaimedByMe = app.assignedOfficer === currentOfficer;
                    const isUnassigned = !app.assignedOfficer;

                    return (
                      <tr key={app.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                          {app.id}
                        </td>
                        <td>{getPriorityBadge(app.priority)}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{app.fullNameEn}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.fullNameSi}</div>
                        </td>
                        <td>
                          {app.district}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.divisionalSecretariat}</div>
                        </td>
                        <td>
                          {isUnassigned ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={12} /> Unassigned Pool
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isClaimedByMe ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                              {app.assignedOfficer} {isClaimedByMe && '(You)'}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{app.submittedDate}</td>
                        <td>
                          {app.status === 'PENDING_VERIFICATION' && <span className="badge badge-pending">Pending</span>}
                          {app.status === 'APPROVED' && <span className="badge badge-approved">Approved</span>}
                          {app.status === 'PRINTED' && <span className="badge badge-printed">Printed</span>}
                          {app.status === 'DISPATCHED' && <span className="badge badge-dispatched">Dispatched</span>}
                          {app.status === 'REJECTED' && <span className="badge badge-rejected">Rejected</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {isUnassigned && (
                              <button
                                className="btn btn-emerald btn-sm"
                                onClick={() => handleClaimSingle(app.id)}
                                title="Claim job to your workbench"
                              >
                                <PlusCircle size={14} /> Claim
                              </button>
                            )}

                            {isClaimedByMe && app.status === 'PENDING_VERIFICATION' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleUnclaim(app.id)}
                                title="Release job back to pool"
                                style={{ color: 'var(--accent-rose)' }}
                              >
                                <RotateCcw size={14} /> Release
                              </button>
                            )}

                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenReview(app)}
                            >
                              <Eye size={14} /> Validate
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(12px)',
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
                maxWidth: '980px',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: '2rem',
                border: '1px solid var(--border-glow)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Biometric & Document Validation</h2>
                    {getPriorityBadge(selectedApp.priority)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Tracking Ref: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedApp.id}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    Assigned Officer: <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>{selectedApp.assignedOfficer || currentOfficer}</span>
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
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={18} /> Application Details & Payload
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                    <div><strong>English Name:</strong> {selectedApp.fullNameEn}</div>
                    <div><strong>Sinhala Name:</strong> {selectedApp.fullNameSi}</div>
                    <div><strong>Tamil Name:</strong> {selectedApp.fullNameTa}</div>
                    <div><strong>DOB & Gender:</strong> {selectedApp.dob} ({selectedApp.gender})</div>
                    <div><strong>Civil Status:</strong> {selectedApp.civilStatus}</div>
                    <div><strong>Residential Address:</strong> {selectedApp.address}</div>
                    <div><strong>Secretariat & District:</strong> {selectedApp.divisionalSecretariat}, {selectedApp.district}</div>
                    <div><strong>GN Division:</strong> {selectedApp.gnDivision}</div>
                    <div><strong>Mobile Contact:</strong> {selectedApp.phone}</div>
                    <div><strong>Email:</strong> {selectedApp.email}</div>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', marginTop: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} color="var(--accent-emerald)" /> Attached Verification Proofs:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    {selectedApp.documents?.map((doc, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <Check size={14} /> {doc} (Validated)
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Digital Card Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} /> 3D PVC Card Preview
                  </h3>
                  <div style={{ width: '100%', maxWidth: '440px' }}>
                    <IDCard3D cardData={selectedApp} />
                  </div>
                </div>
              </div>

              {/* Officer Notes & Action Bar */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Verification Audit Comment / Officer Log:</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Enter validation audit comments, biometric approval details, or rejection reasons..."
                    value={officerComment}
                    onChange={(e) => setOfficerComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUnclaim(selectedApp.id)}
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <RotateCcw size={16} /> Return to Job Pool
                  </button>

                  <div style={{ display: 'flex', gap: '1rem' }}>
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
          </div>
        )}
      </div>
    </div>
  );
};
