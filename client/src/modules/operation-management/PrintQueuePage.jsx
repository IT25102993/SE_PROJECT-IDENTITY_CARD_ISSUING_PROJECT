import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { IDCard3D } from '../../components/IDCard3D';
import { AdminPanelLayout } from '../../components/AdminPanelLayout';
import {
  Printer,
  Truck,
  Eye,
  Send,
  PackageCheck,
  X,
  Search,
  Lock
} from 'lucide-react';

export const PrintQueuePage = () => {
  const { role, applications, markAsPrinted, markAsDispatched } = useApp();
  const { user } = useAuth();
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const activeRole = (user?.role || role || 'citizen').toLowerCase();
  const isOperational = activeRole === 'operational';
  const canManage = isOperational; // strictly Operational role only

  const approvedList = applications.filter(a => a.status === 'APPROVED' || a.status === 'Approved');
  const printedList = applications.filter(a => a.status === 'PRINTED' || a.status === 'Printed');
  const dispatchedList = applications.filter(a =>
    a.status === 'DISPATCHED' || a.status === 'Dispatched' || a.status === 'Issued' || a.status === 'ISSUED'
  );

  const handlePrintCard = (appId) => {
    markAsPrinted(appId);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleDispatchCard = (appId) => {
    markAsDispatched(appId);
    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (e) {}
  };

  const is1DayService = (app) => {
    const s = app.service_type || app.serviceType || 'Normal';
    return s === '1-Day' || s === '1-day';
  };

  if (!isOperational) {
    return (
      <div style={{ position: 'relative', zIndex: 1, padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--accent-rose)' }}>
              <Lock size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Operational Personnel Only</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The <strong>Print Queue &amp; Dispatch Management</strong> workbench is strictly restricted to authorized <strong>Operational</strong> personnel.
            </p>
            <button className="btn btn-primary" onClick={() => window.history.back()} style={{ padding: '0.75rem 1.5rem' }}>
              ← Return Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const navItems = [
    {
      key: 'print-queue',
      label: 'Print & Dispatch Queue',
      icon: Printer,
      to: '/print-queue',
      color: '#3b82f6',
      active: true,
      count: approvedList.length
    }
  ];

  const kpiCards = [
    {
      label: 'Approved · Awaiting Print',
      value: approvedList.length,
      color: 'var(--accent-amber)',
      sub: 'Queued for PVC thermal press',
      icon: Printer,
      onClick: () => {}
    },
    {
      label: 'Printed · Ready to Ship',
      value: printedList.length,
      color: 'var(--accent-cyan)',
      sub: 'Cards waiting logistics handover',
      icon: Truck,
      onClick: () => {}
    },
    {
      label: 'Dispatched · In Transit',
      value: dispatchedList.length,
      color: 'var(--accent-emerald)',
      sub: 'Cards en route to citizens',
      icon: PackageCheck,
      onClick: () => {}
    }
  ];

  return (
    <AdminPanelLayout
      brandTitle="NexusPrintOps"
      brandIcon={Printer}
      accent="#3b82f6"
      pageTitle="Operation Management · Print & Dispatch"
      pageSubtitle="Thermal smart-card encoding, security chip verification & dual-channel logistics"
      roleTag="OPERATIONS"
      navItems={navItems}
    >
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
          placeholder="Filter queue by applicant name, tracking ID or NIC..."
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

      {/* 3-Stage Operational Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Column 1: Awaiting Print */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Printer size={18} color="var(--accent-amber)" /> Awaiting Print
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved cards queued for PVC press</div>
            </div>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontWeight: 800 }}>
              {approvedList.length}
            </span>
          </div>

          {filterApps(approvedList).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No approved cards awaiting printing.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filterApps(approvedList).map((app, i) => {
                const appId = app.id || `NEX-2026-${app.application_id}`;
                const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                const is1Day = is1DayService(app);
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          NIC: {app.nicNumber || app.national_id_number || 'Generated on approval'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: is1Day ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                        color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                        border: `1px solid ${is1Day ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {is1Day ? '1-Day Priority' : 'Normal Post'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(app)} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                        <Eye size={13} /> Preview
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => handlePrintCard(appId)} style={{ flex: 1.5, gap: '0.3rem', fontSize: '0.78rem' }}>
                        <Printer size={13} /> Print PVC Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Printed & Ready for Dispatch */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Truck size={18} color="var(--accent-cyan)" /> Printed &amp; Ready
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cards printed, waiting logistics handover</div>
            </div>
            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', fontWeight: 800 }}>
              {printedList.length}
            </span>
          </div>

          {filterApps(printedList).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No printed cards awaiting dispatch.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filterApps(printedList).map((app, i) => {
                const appId = app.id || `NEX-2026-${app.application_id}`;
                const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                const is1Day = is1DayService(app);
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Address: {app.address || 'Sri Lanka'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: is1Day ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                        color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                        border: `1px solid ${is1Day ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                          {is1Day ? 'Courier Delivery' : 'Postal Delivery'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(app)} style={{ flex: 1, gap: '0.3rem', fontSize: '0.78rem' }}>
                        <Eye size={13} /> View Card
                      </button>
                      {is1Day ? (
                        <button
                          className="btn btn-amber btn-sm"
                          onClick={() => handleDispatchCard(appId)}
                          style={{ flex: 1.8, gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <Truck size={13} /> Dispatch via Courier
                        </button>
                      ) : (
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => handleDispatchCard(appId)}
                          style={{ flex: 1.8, gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          <Send size={13} /> Dispatch via Post
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Dispatched & In Transit */}
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <PackageCheck size={18} color="var(--accent-emerald)" /> Dispatched &amp; In Transit
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cards en route to citizen address</div>
            </div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', fontWeight: 800 }}>
              {dispatchedList.length}
            </span>
          </div>

          {filterApps(dispatchedList).length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
              No dispatched cards recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
              {filterApps(dispatchedList).map((app, i) => {
                const appId = app.id || `NEX-2026-${app.application_id}`;
                const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                const is1Day = is1DayService(app);
                return (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{appId}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          NIC: {app.nicNumber || app.national_id_number || 'Issued'}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '6px',
                        background: is1Day ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                        color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                        border: `1px solid ${is1Day ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                          {is1Day ? 'Courier Priority' : 'Sri Lanka Post'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Logistics: <strong style={{ color: 'var(--text-primary)' }}>{is1Day ? 'Express Courier Doorstep' : 'Registered Postal Mail'}</strong>
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedApp(app)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                        <Eye size={12} /> Card
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 3D Smart Card Preview Modal */}
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>National PVC Identity Specimen</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {selectedApp.fullNameEn || `${selectedApp.first_name || ''} ${selectedApp.last_name || ''}`}
                </h3>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                  {selectedApp.id || `NEX-2026-${selectedApp.application_id}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <X size={15} /> Close
              </button>
            </div>

            {/* Card 3D Component */}
            <div style={{ margin: '1rem 0 1.5rem 0', display: 'flex', justifyContent: 'center' }}>
              <IDCard3D cardData={selectedApp} />
            </div>

            {/* Delivery Specification Banner */}
            {(() => {
              const is1Day = is1DayService(selectedApp);
              return (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: is1Day ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${is1Day ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: is1Day ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                      {is1Day ? '1-Day Priority Service • Courier Dispatch' : 'Normal Service • Sri Lanka Postal Service'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Delivery Destination: <strong>{selectedApp.address || 'Sri Lanka'}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.75rem', fontWeight: 700 }}>
                      Status: {selectedApp.status}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              {(selectedApp.status === 'Approved' || selectedApp.status === 'APPROVED') && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handlePrintCard(selectedApp.id || selectedApp.application_id);
                    setSelectedApp(null);
                  }}
                >
                  <Printer size={15} /> Print Thermal PVC Card
                </button>
              )}
              {(selectedApp.status === 'Printed' || selectedApp.status === 'PRINTED') && (
                is1DayService(selectedApp) ? (
                  <button
                    className="btn btn-amber"
                    onClick={() => {
                      handleDispatchCard(selectedApp.id || selectedApp.application_id);
                      setSelectedApp(null);
                    }}
                    style={{ fontWeight: 700 }}
                  >
                    <Truck size={15} /> Dispatch via Courier
                  </button>
                ) : (
                  <button
                    className="btn btn-emerald"
                    onClick={() => {
                      handleDispatchCard(selectedApp.id || selectedApp.application_id);
                      setSelectedApp(null);
                    }}
                    style={{ fontWeight: 700 }}
                  >
                    <Send size={15} /> Dispatch via Postal Service
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </AdminPanelLayout>
  );
};

export default PrintQueuePage;