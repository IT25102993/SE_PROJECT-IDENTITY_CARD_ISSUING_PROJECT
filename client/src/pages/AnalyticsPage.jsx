import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  Users,
  MapPin
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { applications } = useApp();

  const total = applications.length;
  const pending = applications.filter(a => a.status === 'PENDING_VERIFICATION').length;
  const approved = applications.filter(a => a.status === 'APPROVED').length;
  const printed = applications.filter(a => a.status === 'PRINTED').length;
  const dispatched = applications.filter(a => a.status === 'DISPATCHED').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;

  const approvalPercentage = total > 0 ? Math.round(((approved + printed + dispatched) / total) * 100) : 0;

  const districtCounts = applications.reduce((acc, app) => {
    const dist = app.district || 'Other';
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
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={28} color="var(--accent-purple)" />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>System Analytics & Executive Overview</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time monitoring of application processing velocity, regional distribution, and audit compliance.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Registered</span>
              <Users size={20} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {total}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              ↑ 12% increase this week
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Approval Rate</span>
              <TrendingUp size={20} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              {approvalPercentage}%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              High verification quality
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Turnaround</span>
              <Clock size={20} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              3.2 Days
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
              Target: &lt; 7 Days
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Security Auditing</span>
              <ShieldCheck size={20} color="var(--accent-gold)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Zero tamper incidents
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Status Distribution */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} color="var(--accent-primary)" /> Application Status Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                { label: 'Dispatched via Post', count: dispatched, color: '#8b5cf6' },
                { label: 'Printed PVC', count: printed, color: '#3b82f6' },
                { label: 'Approved & Issued', count: approved, color: '#10b981' },
                { label: 'Pending Verification', count: pending, color: '#f59e0b' },
                { label: 'Rejected', count: rejected, color: '#f43f5e' }
              ].map((item, i) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{item.count} ({percent}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percent}%`, background: item.color, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--accent-cyan)" /> Regional Submissions by District
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(districtCounts).map(([district, count], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{district}</span>
                  <span className="badge badge-printed">{count} Submissions</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Audit Trail Feed */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--accent-emerald)" /> System Cryptographic Audit Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-primary)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{log.event}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {log.user}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
