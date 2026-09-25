import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AdminPanelLayout } from '../../components/AdminPanelLayout';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Printer,
  MapPin,
  FileText,
  UserCheck,
  PackageCheck
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { applications } = useApp();
  const { user } = useAuth();

  const realRole = (user?.role || '').toLowerCase();
  const isAdmin = realRole === 'admin';
  const isApproverUser = realRole === 'approver';
  const isOfficerUser = realRole === 'form-officer' || realRole === 'document-officer';
  const isOperationalUser = realRole === 'operational';

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
    { time: '2026-08-08 11:20 AM', event: 'Cryptographic NIC 200512345678 assigned', user: 'Form Handling Officer Perera (FOM-401)', status: 'Success' },
    { time: '2026-08-08 10:45 AM', event: 'PVC Thermal Print Batch #982 started', user: 'Tech Perera (PRT-109)', status: 'Info' },
    { time: '2026-08-08 09:15 AM', event: 'New Online Registration NEX-2026-92410', user: 'Citizen Self-Service', status: 'Success' },
    { time: '2026-08-07 04:30 PM', event: 'Dispatched 45 cards via Sri Lanka Post', user: 'System Dispatch Engine', status: 'Success' },
    { time: '2026-08-07 02:10 PM', event: 'Document Mismatch Rejection NEX-2026-8812', user: 'Senior Officer Jayawardena', status: 'Warning' }
  ];

  const navItems = [
    {
      key: 'analytics',
      label: 'National Analytics',
      icon: BarChart3,
      color: '#f59e0b',
      active: true
    }
  ];

  if (isOfficerUser || isApproverUser || isAdmin) {
    if (isApproverUser || isAdmin) {
      navItems.unshift({
        key: 'approver',
        label: 'Approver Job Pool',
        icon: ShieldCheck,
        to: '/approver-jobpool',
        color: '#8b5cf6',
        active: false
      });
    }
    if (isOfficerUser || isAdmin) {
      navItems.unshift({
        key: 'officer',
        label: realRole === 'document-officer' ? 'Document Officer Job Pool' : 'Form Officer Job Pool',
        icon: UserCheck,
        to: realRole === 'document-officer' ? '/document-jobpool' : '/officer-jobpool',
        color: '#10b981',
        active: false
      });
    }
  }
  if (isOperationalUser) {
    navItems.unshift({
      key: 'print-queue',
      label: 'Print & Dispatch Queue',
      icon: Printer,
      to: '/print-queue',
      color: '#3b82f6',
      active: false
    });
  }
  if (isAdmin) {
    navItems.push({
      key: 'admin',
      label: 'Admin Portal',
      icon: UserCheck,
      to: '/admin',
      color: '#8b5cf6',
      active: false
    });
  }

  const kpiCards = [
    { label: 'Total Applications', value: total, color: 'var(--accent-primary)', icon: FileText, sub: 'All citizen records in registry' },
    { label: 'Pending Verification', value: pending, color: 'var(--accent-amber)', icon: Clock, sub: 'Awaiting officer or approver action' },
    { label: 'Approval Rate', value: `${approvalPercentage}%`, color: 'var(--accent-emerald)', icon: CheckCircle2, sub: `${approved} approved · ${rejected} rejected` },
    { label: 'Cards Dispatched', value: dispatched, color: 'var(--accent-cyan)', icon: PackageCheck, sub: `${printed} printed and ready` }
  ];

  return (
    <AdminPanelLayout
      brandTitle="NexusAnalytics"
      brandIcon={BarChart3}
      accent="#f59e0b"
      pageTitle="National Identity Analytics & Audit"
      pageSubtitle="Real-time telemetry, issuance statistics, district distributions & compliance logs"
      roleTag={isAdmin ? 'ADMIN' : isApproverUser ? 'APPROVER' : isOperationalUser ? 'OPERATIONS' : isOfficerUser ? 'OFFICER' : 'ANALYTICS'}
      navItems={navItems}
    >
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '1.4rem',
              border: `1px solid ${kpi.color}55`,
              background: 'var(--bg-card)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kpi.label}
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${kpi.color}26`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: kpi.color, fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* District Distribution */}
        <div className="glass-card" style={{ borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--accent-primary)" /> Regional Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).map(([district, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={district}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{district}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} · {pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-cyan), var(--accent-emerald))', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval funnel + audit */}
        <div className="glass-card" style={{ borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-emerald)" /> Issuance Funnel
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.9rem', height: '140px' }}>
            {[
              { label: 'Submitted', count: total, color: 'var(--accent-primary)' },
              { label: 'Approved', count: approved, color: 'var(--accent-emerald)' },
              { label: 'Printed', count: printed, color: 'var(--accent-amber)' },
              { label: 'Dispatched', count: dispatched, color: 'var(--accent-cyan)' }
            ].map((item) => {
              const max = Math.max(total, 1);
              const height = Math.max((item.count / max) * 130, 8);
              return (
                <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.count}</div>
                  <div style={{ height: `${height}px`, background: `linear-gradient(180deg, ${item.color}, transparent)`, border: `1px solid ${item.color}88`, borderRadius: '8px 8px 0 0', marginTop: '0.3rem' }} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card" style={{ borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--border-color)' }}>
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
    </AdminPanelLayout>
  );
};

export default AnalyticsPage;