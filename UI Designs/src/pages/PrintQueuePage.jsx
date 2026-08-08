import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { IDCard3D } from '../components/IDCard3D';
import {
  Printer,
  Truck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

export const PrintQueuePage = () => {
  const { role, setRole, applications, markAsPrinted, markAsDispatched } = useApp();
  const [selectedApp, setSelectedApp] = useState(null);

  const approvedList = applications.filter(a => a.status === 'APPROVED');
  const printedList = applications.filter(a => a.status === 'PRINTED');
  const dispatchedList = applications.filter(a => a.status === 'DISPATCHED');

  const handlePrintCard = (appId) => {
    markAsPrinted(appId);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDispatchCard = (appId) => {
    markAsDispatched(appId);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Role Warning Banner */}
        {role !== 'printer' && role !== 'admin' && (
          <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderColor: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle color="var(--accent-cyan)" size={24} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>You are currently viewing in Citizen Mode</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Switch to Printing Tech Mode to manage PVC card printers and dispatch batches.</div>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setRole('printer')}>
              Switch to Printing Tech Mode
            </button>
          </div>
        )}

        {/* Header Title */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={28} color="var(--accent-primary)" />
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>PVC Card Production & Batch Queue</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Thermal PVC card printer queue, vector layout export, and delivery dispatch management.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{approvedList.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for Print</div>
            </div>
            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{printedList.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Printed in Batch</div>
            </div>
            <div className="glass-card" style={{ padding: '0.6rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{dispatchedList.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dispatched</div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {/* Left Queue List */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} color="var(--accent-emerald)" /> Approved Cards Print Queue
            </h3>

            {approvedList.length === 0 && printedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No cards currently in print queue. Approve applications in Officer Portal to populate queue.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {approvedList.map(app => (
                  <div key={app.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24', fontSize: '0.95rem' }}>
                        NIC: {app.nicNumber}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.fullNameEn}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ref: {app.id}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye size={14} /> Layout
                      </button>
                      <button
                        className="btn btn-emerald btn-sm"
                        onClick={() => handlePrintCard(app.id)}
                      >
                        <Printer size={14} /> Print PVC
                      </button>
                    </div>
                  </div>
                ))}

                {printedList.map(app => (
                  <div key={app.id} style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span className="badge badge-printed" style={{ marginBottom: '0.3rem' }}>PRINTED PVC</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        NIC: {app.nicNumber}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.fullNameEn}</div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDispatchCard(app.id)}
                    >
                      <Truck size={14} /> Dispatch Mail
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Print Layout Generator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                  PVC Print Sheet Alignment Preview
                </h3>
                <span className="badge badge-printed">85.60 x 53.98 mm</span>
              </div>

              {selectedApp ? (
                <div>
                  <IDCard3D cardData={selectedApp} />

                  <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Exporting high-resolution vector PDF payload for NIC ${selectedApp.nicNumber}...`)}
                    >
                      <Download size={14} /> Export Vector PDF
                    </button>
                    <button
                      className="btn btn-emerald btn-sm"
                      onClick={() => handlePrintCard(selectedApp.id)}
                    >
                      <Printer size={14} /> Print Now
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Select an application from the print queue on the left to preview alignment specifications.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
