import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IDCard3D } from '../components/IDCard3D';
import {
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Truck,
  AlertCircle,
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react';

export const TrackingPage = () => {
  const { applications, triggerLoading } = useApp();
  const location = useLocation();

  const [searchId, setSearchId] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryId = params.get('id');
    if (queryId) {
      setSearchId(queryId);
      performSearch(queryId);
    } else if (applications.length > 0) {
      setSelectedApp(applications[0]);
    }
  }, [location.search, applications]);

  const performSearch = (term) => {
    setHasSearched(true);
    const found = applications.find(
      a => a.id.toLowerCase() === term.toLowerCase() ||
           (a.nicNumber && a.nicNumber.toLowerCase() === term.toLowerCase())
    );
    setSelectedApp(found || null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      triggerLoading({
        message: `Searching Registry for "${searchId.trim()}"...`,
        subtext: 'Central Department of Registration Database',
        duration: 3000,
        onComplete: () => performSearch(searchId.trim())
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-approved">Approved & NIC Issued</span>;
      case 'PRINTED':
        return <span className="badge badge-printed">PVC Card Printed</span>;
      case 'DISPATCHED':
        return <span className="badge badge-dispatched">Dispatched via Post</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Application Rejected</span>;
      default:
        return <span className="badge badge-pending">Pending Verification</span>;
    }
  };

  const STAGES = [
    { key: 'Submitted', label: '1. Submitted', icon: Clock },
    { key: 'Document Verification', label: '2. Verification', icon: UserCheck },
    { key: 'Approved & NIC Issued', label: '3. Approved', icon: CheckCircle2 },
    { key: 'Printed PVC', label: '4. Card Printed', icon: Printer },
    { key: 'Dispatched', label: '5. Dispatched', icon: Truck }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Page Title */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>Real-Time Tracking</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Track Application Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Check the processing stage, verification updates, and delivery dispatch details of your NIC.
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass-card" style={{ maxWidth: '650px', margin: '0 auto 3rem auto', padding: '1.25rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Tracking ID (e.g. NEX-2026-90412) or NIC..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Search size={18} /> Search
            </button>
          </form>
        </div>

        {/* Results View */}
        {selectedApp ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem' }}>
            {/* Left Status & Timeline */}
            <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TRACKING REFERENCE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {selectedApp.id}
                  </div>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              {/* Progress Timeline Indicator */}
              <div style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  Lifecycle Progress Stage
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {STAGES.map((stg, i) => {
                    const Icon = stg.icon;
                    const historyFound = selectedApp.trackingHistory?.some(h => h.status.includes(stg.key.split(' ')[0]));
                    const isCompleted = historyFound || (selectedApp.status === 'DISPATCHED');

                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 2, opacity: isCompleted ? 1 : 0.4 }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isCompleted ? 'var(--gradient-emerald)' : 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, textAlign: 'center' }}>{stg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Applicant Profile Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Applicant Name:</span>
                  <span style={{ fontWeight: 600 }}>{selectedApp.fullNameEn}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Issued NIC Number:</span>
                  <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                    {selectedApp.nicNumber || 'Pending Assignment'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>District & Secretariat:</span>
                  <span style={{ fontWeight: 600 }}>{selectedApp.district} ({selectedApp.divisionalSecretariat})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Submitted Date:</span>
                  <span style={{ fontWeight: 600 }}>{selectedApp.submittedDate}</span>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--accent-primary)" /> Verification & Dispatch Activity Trail
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedApp.trackingHistory?.map((h, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        <span>{h.status}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{h.date}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {h.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card Digital Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Issued Digital NIC Card Preview
              </h3>
              <div style={{ width: '100%', maxWidth: '480px' }}>
                <IDCard3D cardData={selectedApp} />
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--accent-rose)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Record Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We couldn't find an application matching tracking ID or NIC "{searchId}". Please verify and try again.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
