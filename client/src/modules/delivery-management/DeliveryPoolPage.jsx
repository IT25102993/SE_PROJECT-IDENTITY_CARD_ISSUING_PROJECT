import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AdminPanelLayout } from '../../components/AdminPanelLayout';
import {
  Truck,
  PackageCheck,
  PackageX,
  Ban,
  Eye,
  Search,
  Lock,
  X,
  Hand,
  MapPin,
  Phone,
  CalendarDays
} from 'lucide-react';

const DELIVERY_STATUSES = ['Dispatched', 'Delivered', 'Not-Delivered', 'Canceled'];

const STATUS_META = {
  Dispatched: { color: 'var(--accent-primary)', bg: 'rgba(59, 130, 246, 0.15)', icon: Truck },
  Delivered: { color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)', icon: PackageCheck },
  'Not-Delivered': { color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', icon: PackageX },
  Canceled: { color: 'var(--accent-rose)', bg: 'rgba(239, 68, 68, 0.15)', icon: Ban }
};

export const DeliveryPoolPage = () => {
  const { applications, role, claimJob, unclaimJob, getDeliveryJobs, updateDeliveryStatus } = useApp();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [remarkDraft, setRemarkDraft] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeRole = (user?.role || role || 'citizen').toLowerCase();
  const isDeliveryManager = activeRole === 'delivery-manager';
  // Admin gets read-only oversight of the pool; Delivery-Manager owns the workflow.
  const hasAccess = ['delivery-manager', 'admin'].includes(activeRole);
  const canAct = isDeliveryManager;
  const officerName = user?.full_name || user?.username || 'Delivery Manager';

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const fromApi = await getDeliveryJobs();
    if (fromApi.length) {
      setJobs(fromApi);
    } else {
      // Fall back to the shared application list when the API is unreachable
      setJobs(
        applications.filter(a => DELIVERY_STATUSES.includes(a.status))
      );
    }
    setLoading(false);
  }, [getDeliveryJobs, applications]);

  useEffect(() => {
    if (hasAccess) {
      loadJobs();
    }
  }, [hasAccess, loadJobs]);

  if (!hasAccess) {
    return (
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-rose)' }}>
              <Lock size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Delivery Personnel Only</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The <strong>Delivery Management</strong> workbench is strictly restricted to authorised <strong>Delivery-Manager</strong> staff
              and <strong>Admin</strong> oversight.
            </p>
            <button className="btn btn-primary" onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem' }}>
              ← Return Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchesSearch = (job) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = (job.fullNameEn || `${job.first_name || ''} ${job.last_name || ''}`).toLowerCase();
    const nic = (job.national_id_number || '').toLowerCase();
    const tracking = (job.tracking_id || `NEX-2026-${job.application_id}`).toLowerCase();
    const address = (job.address || job.delivery_address || '').toLowerCase();
    return name.includes(term) || nic.includes(term) || tracking.includes(term) || address.includes(term);
  };

  const visibleJobs = jobs.filter(matchesSearch);

  const countByStatus = (status) =>
    visibleJobs.filter(j => (j.status || '').toLowerCase() === status.toLowerCase()).length;

  const unclaimedJobs = visibleJobs.filter(j => {
    const inFlight = ['dispatched', 'not-delivered'].includes((j.status || '').toLowerCase());
    return inFlight && !j.assigned_officer;
  });

  const myJobs = visibleJobs.filter(j => j.assigned_officer);

  const resolvedJobs = visibleJobs.filter(j =>
    ['delivered', 'canceled'].includes((j.status || '').toLowerCase())
  );

  const handleClaim = async (job) => {
    const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
    setBusyId(appId);
    await claimJob(appId, officerName);
    await loadJobs();
    setBusyId(null);
  };

  const handleRelease = async (job) => {
    const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
    setBusyId(appId);
    await unclaimJob(appId);
    await loadJobs();
    setBusyId(null);
  };

  const handleStatusChange = async (job, status) => {
    const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
    setBusyId(appId);
    const result = await updateDeliveryStatus(appId, status, remarkDraft);
    if (result.success) {
      setRemarkDraft('');
      setSelectedJob(null);
      await loadJobs();
    }
    setBusyId(null);
  };

  const openDetail = (job) => {
    setSelectedJob(job);
    setRemarkDraft(job.remarks || '');
  };

  const navItems = [
    {
      key: 'delivery-pool',
      label: 'Delivery Job Pool',
      icon: Truck,
      to: '/delivery-jobpool',
      color: '#f97316',
      active: true,
      count: unclaimedJobs.length
    }
  ];

  const kpiCards = DELIVERY_STATUSES.map((status) => {
    const meta = STATUS_META[status];
    const subs = {
      Dispatched: 'Awaiting last-mile delivery',
      Delivered: 'Confirmed received by citizen',
      'Not-Delivered': 'Failed attempt · reattempt due',
      Canceled: 'Delivery stopped'
    };
    return {
      label: status,
      value: countByStatus(status),
      color: meta.color,
      sub: subs[status],
      icon: meta.icon
    };
  });

  return (
    <AdminPanelLayout
      brandTitle="NexusDeliverOps"
      brandIcon={Truck}
      accent="#f97316"
      pageTitle="Delivery Management · Last-Mile Tracking"
      pageSubtitle="Dispatched card handover, doorstep delivery confirmation & failed-delivery recovery"
      roleTag="DELIVERY"
      navItems={navItems}
    >
      {/* Admin oversight banner */}
      {!canAct && (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.8rem 1.1rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            background: 'rgba(249, 115, 22, 0.08)',
            color: '#f97316',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '12px'
          }}
        >
          <Eye size={16} /> Admin oversight — read-only view of the Delivery Job Pool. Claiming, releasing and delivery outcomes are handled by Delivery-Manager staff.
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
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

      {/* Search Bar */}
      <div
        className="glass-card"
        style={{
          maxWidth: '640px',
          margin: '0 0 1.75rem 0',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          className="form-control"
          placeholder="Filter by applicant name, tracking ID, NIC or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', background: 'transparent', padding: '0.4rem 0', boxShadow: 'none' }}
        />
        {searchTerm && (
          <button className="btn btn-sm btn-secondary" onClick={() => setSearchTerm('')} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
            Clear
          </button>
        )}
      </div>

      {/* General Queue + My Deliveries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Column 1: Unclaimed delivery queue */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Hand size={18} color="var(--accent-primary)" /> General Queue
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unclaimed orders handed over by Operation Management</div>
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', fontWeight: 800 }}>
              {unclaimedJobs.length}
            </span>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              Loading delivery queue…
            </div>
          ) : unclaimedJobs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No unclaimed deliveries. Operation Management has not dispatched any cards yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {unclaimedJobs.map((job, i) => {
                const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
                const name = job.fullNameEn || `${job.first_name || ''} ${job.last_name || ''}`;
                const meta = STATUS_META[job.status] || STATUS_META.Dispatched;
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <MapPin size={10} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                          {job.delivery_address || job.address || 'Sri Lanka'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.color}55`
                      }}>
                        {job.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(job)} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                        <Eye size={13} /> Details
                      </button>
                      {canAct && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleClaim(job)}
                          disabled={busyId === appId}
                          style={{ flex: 1.5, gap: '0.3rem', fontSize: '0.78rem' }}
                        >
                          <Hand size={13} /> Claim Delivery
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Claimed deliveries */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Truck size={18} color="var(--accent-amber)" /> Claimed Deliveries
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Orders assigned to a delivery officer</div>
            </div>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 800 }}>
              {myJobs.length}
            </span>
          </div>

          {myJobs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No deliveries are currently assigned to an officer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {myJobs.map((job, i) => {
                const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
                const name = job.fullNameEn || `${job.first_name || ''} ${job.last_name || ''}`;
                const meta = STATUS_META[job.status] || STATUS_META.Dispatched;
                const inFlight = ['dispatched', 'not-delivered'].includes((job.status || '').toLowerCase());
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: `1px solid ${meta.color}44`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: meta.color }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Officer: <strong style={{ color: 'var(--text-secondary)' }}>{job.assigned_officer}</strong>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.color}55`
                      }}>
                        {job.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(job)} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                        <Eye size={13} /> Update
                      </button>
                      {canAct && inFlight && (
                        <button
                          className="btn btn-amber btn-sm"
                          onClick={() => handleRelease(job)}
                          disabled={busyId === appId}
                          style={{ flex: 1.5, gap: '0.3rem', fontSize: '0.78rem' }}
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Resolved deliveries */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <PackageCheck size={18} color="var(--accent-emerald)" /> Delivery History
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed and closed delivery records</div>
            </div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
              {resolvedJobs.length}
            </span>
          </div>

          {resolvedJobs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No completed deliveries recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {resolvedJobs.map((job, i) => {
                const appId = job.tracking_id || `NEX-2026-${job.application_id}`;
                const name = job.fullNameEn || `${job.first_name || ''} ${job.last_name || ''}`;
                const meta = STATUS_META[job.status] || STATUS_META.Delivered;
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: meta.color }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        {job.remarks && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {job.remarks}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.color}55`
                      }}>
                        {job.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Officer: <strong style={{ color: 'var(--text-secondary)' }}>{job.assigned_officer || '—'}</strong>
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(job)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Detail Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '18px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last-Mile Delivery Record</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {selectedJob.fullNameEn || `${selectedJob.first_name || ''} ${selectedJob.last_name || ''}`}
                </h3>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                  {selectedJob.tracking_id || `NEX-2026-${selectedJob.application_id}`}
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                <X size={15} /> Close
              </button>
            </div>

            {/* Detail rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Status</span>
                <span style={{ fontWeight: 700, color: (STATUS_META[selectedJob.status] || STATUS_META.Dispatched).color }}>
                  {selectedJob.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>NIC Number</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedJob.national_id_number || selectedJob.card_number || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dispatch Channel</span>
                <span>{selectedJob.dispatch_method || (selectedJob.service_type === '1-Day' ? 'Courier' : 'Postal')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Officer</span>
                <span>{selectedJob.assigned_officer || 'Unclaimed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dispatched On</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CalendarDays size={12} /> {selectedJob.dispatched_at || selectedJob.updated_at || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={12} /> {selectedJob.phone_number || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Address</span>
                <span style={{ textAlign: 'right', maxWidth: '55%' }}>
                  {selectedJob.delivery_address || selectedJob.address || '—'}
                </span>
              </div>
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Delivery Remarks
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={remarkDraft}
                onChange={(e) => setRemarkDraft(e.target.value)}
                readOnly={!canAct}
                placeholder={canAct ? 'e.g. Handed to recipient and signed for. / Address unreachable, reattempt scheduled.' : 'Read-only oversight view'}
                style={{ width: '100%', resize: 'vertical', cursor: canAct ? 'text' : 'default' }}
              />
            </div>

            {/* Status actions */}
            {canAct ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(selectedJob, 'Dispatched')}
                disabled={busyId === (selectedJob.tracking_id || selectedJob.application_id)}
                style={{ gap: '0.3rem' }}
              >
                <Truck size={14} /> Mark In-Transit
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(selectedJob, 'Not-Delivered')}
                disabled={busyId === (selectedJob.tracking_id || selectedJob.application_id)}
                style={{ gap: '0.3rem' }}
              >
                <PackageX size={14} /> Not Delivered
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(selectedJob, 'Canceled')}
                disabled={busyId === (selectedJob.tracking_id || selectedJob.application_id)}
                style={{ gap: '0.3rem' }}
              >
                <Ban size={14} /> Cancel
              </button>
              <button
                className="btn btn-emerald btn-sm"
                onClick={() => handleStatusChange(selectedJob, 'Delivered')}
                disabled={busyId === (selectedJob.tracking_id || selectedJob.application_id)}
                style={{ gap: '0.3rem', fontWeight: 700 }}
              >
                <PackageCheck size={14} /> Confirm Delivered
              </button>
            </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                Read-only oversight view — only Delivery-Manager staff can claim, release or record delivery outcomes.
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPanelLayout>
  );
};

export default DeliveryPoolPage;