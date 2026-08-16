import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { IDCard3D } from '../../components/IDCard3D';
import {
  Printer,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';

export const PrintQueuePage = () => {
  const { role, setRole, applications, markAsPrinted, markAsDispatched } = useApp();
  const [selectedApp, setSelectedApp] = useState(null);

  const approvedList = applications.filter(a => a.status === 'APPROVED' || a.status === 'Approved');
  const printedList = applications.filter(a => a.status === 'PRINTED' || a.status === 'Printed');
  const dispatchedList = applications.filter(a => a.status === 'DISPATCHED' || a.status === 'Dispatched');

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
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {role !== 'officer' && role !== 'admin' && (
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderColor: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle color="var(--accent-amber)" size={24} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Viewing in Citizen Mode</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch to Officer Mode to operate print queue and postal dispatches.</div>
              </div>
            </div>
            <button className="btn btn-emerald btn-sm" onClick={() => setRole('officer')}>
              Switch to Officer Mode
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>Production Queue</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>PVC Card Print & Postal Dispatch</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage thermal PVC printing queue, barcode encoding, and registered postal dispatches.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Awaiting Print ({approvedList.length})</h3>
              <Printer size={20} color="var(--accent-amber)" />
            </div>
            {approvedList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No approved cards waiting to print.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approvedList.map((app, i) => {
                  const appId = app.id || app.application_id;
                  const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                  return (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{appId}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{name}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handlePrintCard(appId)}>
                        <Printer size={14} /> Print PVC
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Printed & Ready ({printedList.length})</h3>
              <Truck size={20} color="var(--accent-primary)" />
            </div>
            {printedList.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No printed cards waiting for postal dispatch.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {printedList.map((app, i) => {
                  const appId = app.id || app.application_id;
                  const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`;
                  return (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{appId}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{name}</div>
                      </div>
                      <button className="btn btn-emerald btn-sm" onClick={() => handleDispatchCard(appId)}>
                        <Truck size={14} /> Dispatch Post
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintQueuePage;
