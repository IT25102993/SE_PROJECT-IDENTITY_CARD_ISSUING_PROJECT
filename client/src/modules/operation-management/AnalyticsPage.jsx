import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  MapPin
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { applications } = useApp();

  const total = applications.length;
  const pending = applications.filter(a => a.status === 'PENDING_VERIFICATION' || a.status === 'Pending').length;
  const approved = applications.filter(a => a.status === 'APPROVED' || a.status === 'Approved').length;
  const printed = applications.filter(a => a.status === 'PRINTED' || a.status === 'Printed').length;
  const dispatched = applications.filter(a => a.status === 'DISPATCHED' || a.status === 'Dispatched' || a.status === 'Issued').length;
  const rejected = applications.filter(a => a.status === 'REJECTED' || a.status === 'Rejected').length;

  const approvalPercentage = total > 0 ? Math.round(((approved + printed + dispatched) / total) * 100) : 100;

  const districtCounts = applications.reduce((acc, app) => {
    const dist = app.district || 'Colombo';
    acc[dist] = (acc[dist] || 0) + 1;
    return acc;
  }, {});

  const auditLogs = [
    { time: '2026-08-08 11:20 AM', event: 'Cryptographic NIC 200512345678 assigned', user: 'Officer Wickramasinghe (OFF-402)', status: 'Success' },
    { time: '2026-08-08 10:45 AM', event: 'PVC Thermal Print Batch #982 started', user: 'Tech Perera (PRT-109)', status: 'Info' },
    { time: '2026-08-08 09:15 AM', event: 'New Online Registration NEX-2026-92410', user: 'Citizen Self-Service', status: 'Success' },
    { time: '2026-08-07 04:30 PM', event: 'Dispatched 45 cards via Sri Lanka Post', user: 'System Dispatch Engine', status: 'Success' },
    { time: '2026-08-07 02:10 PM', event: 'Document Mismatch Rejection NEX-2026-8812', user: 'Senior Officer Jayawardena', status: 'Warning' }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>System Performance</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>National Identity Analytics & Audit</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time telemetry, issuance statistics, district distributions, and ISO compliance logs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL APPLICATIONS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{total}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PENDING VERIFICATION</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{pending}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>APPROVAL RATE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{approvalPercentage}%</div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>REJECTED RECORDS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-rose)', fontFamily: 'var(--font-mono)' }}>{rejected}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-emerald)" /> System Audit Log Stream
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{log.event}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.user}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{log.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
