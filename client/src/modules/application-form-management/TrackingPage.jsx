import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IDCard3D } from '../../components/IDCard3D';
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  AlertCircle,
  UserCheck,
  XCircle,
  FileText
} from 'lucide-react';

const STATUS_STAGE_MAP = {
  'Pending': 0,
  'PENDING_VERIFICATION': 0,
  'Processing': 1,
  'Approved': 2,
  'APPROVED': 2,
  'Issued': 2,
  'Printed': 3,
  'PRINTED': 3,
  'Dispatched': 4,
  'DISPATCHED': 4,
  'Rejected': -1,
  'REJECTED': -1
};

const STAGES = [
  { key: 'Submitted',    label: 'Submitted',     icon: FileText },
  { key: 'Verification', label: 'Verification',  icon: UserCheck },
  { key: 'Approved',     label: 'Approved',      icon: CheckCircle2 },
  { key: 'Printed',      label: 'Card Printed',  icon: Printer },
  { key: 'Dispatched',   label: 'Dispatched',    icon: Truck }
];

export const TrackingPage = () => {
  const { applications, fetchApplications } = useApp();
  const location = useLocation();

  const [searchId, setSearchId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const performSearch = async (term) => {
    if (!term.trim()) return;
    setHasSearched(true);
    setIsSearching(true);
    setErrorMsg('');
    setSelectedApp(null);

    try {
      // 1. Try to search in backend API by tracking ID or NIC
      const res = await fetch(`/api/applications?search=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        const apps = data.applications || [];
        const found = apps.find(a =>
          (a.tracking_id && a.tracking_id.toLowerCase() === term.toLowerCase()) ||
          (String(a.application_id) === term) ||
          (a.national_id_number && a.national_id_number.toLowerCase() === term.toLowerCase())
        );
        if (found) {
          setSelectedApp({
            id: found.tracking_id || `NEX-2026-${found.application_id}`,
            application_id: found.application_id,
            fullNameEn: found.fullNameEn || `${found.first_name || ''} ${found.last_name || ''}`.trim(),
            nicNumber: found.national_id_number || found.nicNumber || '',
            dob: found.date_of_birth || found.dob || '',
            gender: found.gender || 'Male',
            address: found.address || '',
            phone: found.phone_number || found.phone || '',
            email: found.email || '',
            district: found.district || '',
            status: found.status || 'Pending',
            submittedDate: found.submitted_at || '',
            officerNotes: found.remarks || '',
            trackingHistory: found.trackingHistory || [
              { status: 'Submitted', date: found.submitted_at || 'Recent', note: 'Application filed online via citizen portal.' }
            ]
          });
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      // fall through to local search
    }

    // 2. Fall back to local applications state (in-memory or already fetched)
    const localFound = applications.find(a =>
      (a.id && a.id.toLowerCase() === term.toLowerCase()) ||
      (a.application_id && String(a.application_id) === term) ||
      (a.nicNumber && a.nicNumber.toLowerCase() === term.toLowerCase()) ||
      (a.national_id_number && a.national_id_number.toLowerCase() === term.toLowerCase())
    );

    if (localFound) {
      setSelectedApp(localFound);
    } else {
      setErrorMsg(`No application found matching "${term}". Please check the tracking ID or NIC number.`);
    }
    setIsSearching(false);
  };

  // Auto-search from URL param ?id=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get('id');
    if (queryId) {
      setSearchId(queryId);
      performSearch(queryId);
    }
  }, [location.search]);

  // Refresh data and re-search when applications list loads
  useEffect(() => {
    if (fetchApplications) fetchApplications();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchId);
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
      case 'issued':
        return <span className="badge badge-approved">✓ Approved &amp; NIC Issued</span>;
      case 'printed':
        return <span className="badge badge-printed">🖨 PVC Card Printed</span>;
      case 'dispatched':
        return <span className="badge badge-dispatched">🚚 Dispatched via Post</span>;
      case 'rejected':
        return <span className="badge badge-rejected">✗ Application Rejected</span>;
      default:
        return <span className="badge badge-pending">⏳ Pending Verification</span>;
    }
  };

  const currentStage = selectedApp ? (STATUS_STAGE_MAP[selectedApp.status] ?? 0) : 0;
  const isRejected = selectedApp && (selectedApp.status === 'Rejected' || selectedApp.status === 'REJECTED');

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>Real-Time Tracking</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Track Application Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Enter your Tracking ID or NIC Number to check your application's progress in real time.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto 3rem auto', padding: '1.25rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. NEX-2026-12345 or your 12-digit NIC number..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? <Clock size={18} /> : <Search size={18} />}
              {isSearching ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {isSearching && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto', width: 36, height: 36, border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p>Searching national registry database...</p>
          </div>
        )}

        {!isSearching && selectedApp && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
            {/* Left — Status & History */}
            <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tracking Reference</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedApp.id || `NEX-2026-${selectedApp.application_id}`}
                  </div>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              {/* Progress Stage Bar */}
              {!isRejected ? (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
                    Processing Stage
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Progress line */}
                    <div style={{
                      position: 'absolute',
                      top: '17px',
                      left: '18px',
                      right: '18px',
                      height: '2px',
                      background: 'var(--border-color)',
                      zIndex: 0
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '17px',
                      left: '18px',
                      height: '2px',
                      width: `${Math.max(0, Math.min(currentStage / (STAGES.length - 1), 1)) * 100}%`,
                      background: 'var(--gradient-emerald)',
                      zIndex: 1,
                      transition: 'width 0.6s ease'
                    }} />
                    {STAGES.map((stg, i) => {
                      const Icon = stg.icon;
                      const done = i <= currentStage;
                      const active = i === currentStage;
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 2, flex: 1 }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: done ? 'var(--gradient-emerald)' : 'rgba(255,255,255,0.08)',
                            border: active ? '2px solid var(--accent-emerald)' : '2px solid transparent',
                            color: done ? '#fff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: active ? '0 0 12px rgba(16,185,129,0.4)' : 'none'
                          }}>
                            {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: done ? 700 : 400, textAlign: 'center', color: done ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2rem', padding: '1.25rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <XCircle size={24} color="var(--accent-rose)" />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>Application Rejected</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedApp.officerNotes || 'Please re-apply with correct documents.'}</div>
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Applicant Name', value: selectedApp.fullNameEn || `${selectedApp.first_name || ''} ${selectedApp.last_name || ''}`.trim() || 'N/A' },
                  { label: 'NIC Number', value: selectedApp.nicNumber || selectedApp.national_id_number || 'Pending Assignment', mono: true, highlight: true },
                  { label: 'Date of Birth', value: selectedApp.dob || 'N/A' },
                  { label: 'Gender', value: selectedApp.gender || 'N/A' },
                  { label: 'District', value: selectedApp.district || 'N/A' },
                  { label: 'Submitted', value: selectedApp.submittedDate || selectedApp.submitted_at || 'Recent' }
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}:</span>
                    <span style={{
                      fontWeight: row.highlight ? 800 : 600,
                      color: row.highlight ? '#fbbf24' : 'var(--text-primary)',
                      fontFamily: row.mono ? 'var(--font-mono)' : 'inherit'
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracking History Timeline */}
              {selectedApp.trackingHistory && selectedApp.trackingHistory.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Activity Timeline
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {selectedApp.trackingHistory.map((event, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginTop: '5px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.83rem', fontWeight: 700 }}>{event.status}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{event.date}</div>
                          {event.note && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{event.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — 3D Card Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" /> Issued Digital NIC Card Preview
              </div>
              <div style={{ width: '100%', maxWidth: '480px' }}>
                <IDCard3D cardData={selectedApp} />
              </div>
            </div>
          </div>
        )}

        {!isSearching && hasSearched && !selectedApp && (
          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Record Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {errorMsg || `We couldn't find an application matching "${searchId}". Please check the tracking ID or NIC number and try again.`}
            </p>
          </div>
        )}

        {!hasSearched && !selectedApp && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your Tracking ID (e.g. <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>NEX-2026-12345</strong>) or 12-digit NIC number above.
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default TrackingPage;
