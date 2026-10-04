import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IDCard3D } from '../../components/IDCard3D';
import { AdminPanelLayout } from '../../components/AdminPanelLayout';
import {
  Truck,
  PackageCheck,
  PackageX,
  Ban,
  Search,
  Eye,
  X,
  Lock,
  Briefcase,
  UserCheck,
  MapPin,
  Layers
} from 'lucide-react';

// Delivery statuses a Delivery-Manager is allowed to set
export const DELIVERY_STATUS_OPTIONS = [
  { value: 'Dispatched', label: 'Dispatched', color: 'var(--accent-primary)', icon: Truck },
  { value: 'Delivered', label: 'Delivered', color: 'var(--accent-emerald)', icon: PackageCheck },
  { value: 'Not-Delivered', label: 'Not Delivered', color: 'var(--accent-amber)', icon: PackageX },
  { value: 'Canceled', label: 'Canceled', color: 'var(--accent-rose)', icon: Ban }
];

const DELIVERY_STATUSES = DELIVERY_STATUS_OPTIONS.map(o => o.value);

export const DeliveryPoolPage = () => {
  const {
    role,
    applications,
    claimJob,
    unclaimJob,
    updateDeliveryStatus
  } = useApp();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const activeRole = (user?.role || role || 'citizen').toLowerCase();
  const isDeliveryManager = activeRole === 'delivery-manager';
  const currentOfficer = user?.full_name || 'Delivery Manager Fernando';

  // Orders that Operation Management pushed out of the printing section
  const deliveryJobs = applications.filter(a => DELIVERY_STATUSES.includes(a.status));

  const unclaimedPoolApps = deliveryJobs.filter(
    a => (!a.assignedOfficer || a.assignedOfficer === '') && a.status === 'Dispatched'
  );

  const myWorkbenchApps = deliveryJobs.filter(a => a.assignedOfficer === currentOfficer);

  const closedJobs = deliveryJobs.filter(
    a => a.status === 'Delivered' || a.status === 'Canceled'
  );

  const countByStatus = (status) => deliveryJobs.filter(a => a.status === status).length;

  const kpiCards = [
    {
      label: 'Awaiting Pickup',
      value: countByStatus('Dispatched'),
      color: 'var(--accent-primary)',
      sub: 'Dispatched orders in the general pool',
      icon: Truck
    },
    {
      label: 'Delivered',
      value: countByStatus('Delivered'),
      color: 'var(--accent-emerald)',
      sub: 'Successfully handed to citizen',
      icon: PackageCheck
    },
    {
      label: 'Not Delivered',
      value: countByStatus('Not-Delivered'),
      color: 'var(--accent-amber)',
      sub: 'Failed attempt — reattempt required',
      icon: PackageX
    },
    {
      label: 'Canceled',
      value: countByStatus('Canceled'),
      color: 'var(--accent-rose)',
      sub: 'Delivery cancelled at branch',
      icon: Ban
    }
  ];

  const is1DayService = (app) => {
    const s = app.service_type || app.serviceType || 'Normal';
    return s === '1-Day' || s === '1-day';
  };

  const filterApps = (list) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(app => {
      const appId = (app.id || `NEX-2026-${app.application_id}` || '').toLowerCase();
      const name = (app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`).toLowerCase();
      const nic = (app.nicNumber || app.national_id_number || '').toLowerCase();
      return appId.includes(term) || name.includes(term) || nic.includes(term);
    });
  };

  const handleStatusChange = async (appId, status) => {
    const notes = noteDraft.trim();
    await updateDeliveryStatus(appId, status, notes);
    setNoteDraft('');
    setSelectedApp(null);
    if (status === 'Delivered') {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 } });
      } catch (e) {}
    }
  };

  const openDetail = (app) => {
    setSelectedApp(app);
    setNoteDraft(app.remarks || app.officerNotes || '');
  };

  if (!isDeliveryManager) {
    return (
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-rose)' }}>
              <Lock size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Delivery Managers Only</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The <strong>Delivery Management Job Pool</strong> is strictly restricted to authorized <strong>Delivery-Manager</strong> personnel.
            </p>
            <button className="btn btn-primary" onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem' }}>
              ← Return Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      key: 'delivery-jobpool',
      label: 'Delivery Job Pool',
      icon: Truck,
      to: '/delivery-jobpool',
      color: '#f97316',
      active: true,
      count: deliveryJobs.length
    }
  ];

  const renderJobCard = (app, { showClaim, showUnclaim }) => {
    const appId = app.id || `NEX-2026-${app.application_id}`;
    const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
    const is1Day = is1DayService(app);
    const current = DELIVERY_STATUS_OPTIONS.find(o => o.value === app.status);

    return (
      <div
        key={appId}
        style={{
          padding: '0.85rem',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '10px',
          border: `1px solid ${current ? `${current.color}44` : 'var(--border-color)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{appId}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
              <MapPin size={11} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '210px' }}>
                {app.delivery_address || app.address || 'Sri Lanka'}
              </span>
            </div>
          </div>
          {current && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              background: `${current.color}22`,
              color: current.color,
              border: `1px solid ${current.color}55`,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <current.icon size={11} /> {current.label}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>
            Channel: <strong style={{ color: 'var(--text-primary)' }}>
              {app.dispatch_method || (is1Day ? 'Courier' : 'Postal')}
            </strong>
          </span>
          <span>
            NIC: <strong style={{ color: 'var(--text-primary)' }}>{app.nicNumber || app.national_id_number || 'Pending'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => openDetail(app)} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
            <Eye size={13} /> Details
          </button>

          {showClaim && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => claimJob(appId, currentOfficer)}
              style={{ flex: 1.6, gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <Briefcase size={13} /> Claim Job
            </button>
          )}

          {showUnclaim && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => unclaimJob(appId)}
              style={{ flex: 1.6, gap: '0.3rem', fontSize: '0.78rem' }}
            >
              Release
            </button>
          )}
        </div>

        {showUnclaim && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)' }}>
            {DELIVERY_STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="btn btn-sm"
                onClick={() => handleStatusChange(appId, opt.value)}
                disabled={app.status === opt.value}
                style={{
                  flex: '1 1 calc(50% - 0.35rem)',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: app.status === opt.value ? 'var(--text-muted)' : opt.color,
                  border: `1px solid ${app.status === opt.value ? 'var(--border-color)' : `${opt.color}66`}`,
                  background: app.status === opt.value ? 'transparent' : `${opt.color}15`,
                  opacity: app.status === opt.value ? 0.6 : 1,
                  cursor: app.status === opt.value ? 'not-allowed' : 'pointer'
                }}
              >
                <opt.icon size={12} /> {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderColumn = (title, subtitle, color, Icon, list, options, emptyText) => (
    <div className="glass-card" style={{ padding: '1.5rem', borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ color, display: 'inline-flex' }}><Icon size={18} /></span> {title}
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>
        </div>
        <span className="badge" style={{ background: `${color}22`, color, fontWeight: 800 }}>
          {list.length}
        </span>
      </div>

      {filterApps(list).length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
          {filterApps(list).map(app => renderJobCard(app, options))}
        </div>
      )}
    </div>
  );

  return (
    <AdminPanelLayout
      brandTitle="NexusDeliverOps"
      brandIcon={Truck}
      accent="#f97316"
      pageTitle="Delivery Management · Job Pool"
      pageSubtitle="Order tracking, courier handover confirmation & last-mile delivery outcomes"
      roleTag="DELIVERY"
      navItems={navItems}
    >
      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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

      {/* Global Search Bar */}
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
          placeholder="Filter delivery orders by applicant name, tracking ID or NIC..."
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

      {/* 3-Stage Delivery Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {renderColumn(
          'General Delivery Pool',
          'Orders pushed by Operation Management, not yet claimed',
          'var(--accent-primary)',
          Layers,
          unclaimedPoolApps,
          { showClaim: true, showUnclaim: false },
          'No unclaimed delivery orders. Operation Management has not pushed any new orders yet.'
        )}

        {renderColumn(
          'My Active Deliveries',
          'Jobs claimed into your delivery workbench',
          '#f97316',
          UserCheck,
          myWorkbenchApps,
          { showClaim: false, showUnclaim: true },
          'You have not claimed any delivery jobs yet. Claim one from the general pool to begin.'
        )}

        {renderColumn(
          'Closed Deliveries',
          'Delivered or cancelled outcomes',
          'var(--accent-emerald)',
          PackageCheck,
          closedJobs,
          { showClaim: false, showUnclaim: true },
          'No completed deliveries recorded yet.'
        )}
      </div>

      {/* Delivery Detail Modal */}
      {selectedApp && (
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
          onClick={() => setSelectedApp(null)}
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
                  {selectedApp.fullNameEn || `${selectedApp.first_name || ''} ${selectedApp.last_name || ''}`}
                </h3>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                  {selectedApp.id || `NEX-2026-${selectedApp.application_id}`}
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
                <X size={15} /> Close
              </button>
            </div>

            <div style={{ margin: '1rem 0 1.5rem 0', display: 'flex', justifyContent: 'center' }}>
              <IDCard3D cardData={selectedApp} />
            </div>

            {/* Delivery destination banner */}
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#f97316' }}>
                Delivery Destination
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {selectedApp.delivery_address || selectedApp.address || 'Sri Lanka'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Channel: <strong style={{ color: 'var(--text-primary)' }}>{selectedApp.dispatch_method || (is1DayService(selectedApp) ? 'Courier' : 'Postal')}</strong>
                {selectedApp.courier_tracking_id ? ` · Tracking: ${selectedApp.courier_tracking_id}` : ''}
              </div>
            </div>

            {/* Delivery status selector */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Set Delivery Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {DELIVERY_STATUS_OPTIONS.map(opt => {
                  const isActive = selectedApp.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className="btn btn-sm"
                      onClick={() => handleStatusChange(selectedApp.id || selectedApp.application_id, opt.value)}
                      style={{
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: isActive ? '#fff' : opt.color,
                        background: isActive ? opt.color : `${opt.color}15`,
                        border: `1px solid ${opt.color}66`
                      }}
                    >
                      <opt.icon size={13} /> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery remarks */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Delivery Remarks
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. Handed over to recipient at Malabe residence."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                Remarks are saved to the application record when you set a new status.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                Close
              </button>
              {(!selectedApp.assignedOfficer || selectedApp.assignedOfficer === '') && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    claimJob(selectedApp.id || selectedApp.application_id, currentOfficer);
                    setSelectedApp(null);
                  }}
                  style={{ gap: '0.35rem', fontWeight: 700 }}
                >
                  <Briefcase size={15} /> Claim Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPanelLayout>
  );
};

export default DeliveryPoolPage;
