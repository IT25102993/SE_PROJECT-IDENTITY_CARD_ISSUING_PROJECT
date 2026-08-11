import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IDCard3D } from '../components/IDCard3D';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FilePlus,
  RotateCw,
  Search,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  Lock,
  CheckCircle2,
  Sparkles,
  Users,
  Building
} from 'lucide-react';

export const HomePage = () => {
  const [quickTrackId, setQuickTrackId] = useState('');
  const { applications } = useApp();
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim())}`);
    }
  };

  const processedCount = applications.filter(a => a.status === 'PRINTED' || a.status === 'DISPATCHED').length + 15480;

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* HERO SECTION */}
      <section style={{ padding: '3.5rem 0 2rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            {/* Left Content */}
            <div className="animate-fade-in">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '20px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem'
                }}
              >
                <ShieldCheck size={16} />
                <span>Official Sri Lanka Government Identity Portal</span>
              </div>

              <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1.25rem', lineHeight: 1.15 }}>
                Web-Based <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>National Identity</span> Card System
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Apply for, renew, or track your National Identity Card securely and conveniently — all from your browser. Fast, transparent, and fully paperless.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <NavLink to="/apply" className="btn btn-primary btn-lg">
                  <FilePlus size={20} />
                  Submit Application
                </NavLink>
                <NavLink to="/track" className="btn btn-secondary btn-lg">
                  <Search size={20} />
                  Track Status
                </NavLink>
              </div>

              {/* Quick Status Bar */}
              <form onSubmit={handleQuickSearch} className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. NEX-2026-90412) or NIC..."
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Track <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* Right Interactive 3D Card */}
            <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <Sparkles size={14} color="#eab308" /> Interactive 3D NIC Card Preview (Hover & Move Cursor)
                </div>
                <IDCard3D />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ padding: '2rem 0', margin: '2rem 0' }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '1.75rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {processedCount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Applications Processed</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                3-5 Days
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Turnaround Time</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Secure Cryptographic Audit</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                24/7
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Online Self-Service Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>Our Digital Services</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Everything You Need, In One Place.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FilePlus size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>01</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>New Application</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Apply for your first National Identity Card online. Upload digital photo, signature, and Grama Niladhari documents without waiting in queue.
              </p>
              <NavLink to="/apply" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                Apply Now <ArrowRight size={16} />
              </NavLink>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <RotateCw size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>02</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Card Renewal</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Renew an expired, damaged, or lost identity card. Provide existing NIC details for fast-track processing and update address details.
              </p>
              <NavLink to="/apply?type=renewal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                Renew Card <ArrowRight size={16} />
              </NavLink>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Search size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>03</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Track Application</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Check the real-time status of your submitted application. Monitor verification, approval, PVC printing, and post office dispatch.
              </p>
              <NavLink to="/track" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                Track Progress <ArrowRight size={16} />
              </NavLink>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <FileSpreadsheet size={24} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>04</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Data Correction</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Request official corrections to your registered name, date of birth, civil status, or permanent residential address with supporting proof.
              </p>
              <NavLink to="/apply?type=correction" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
                Request Fix <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section style={{ padding: '3rem 0', background: 'rgba(0,0,0,0.15)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-approved" style={{ marginBottom: '0.5rem' }}>How It Works</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Simple 4-Step Process</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '1', title: 'Fill Form Details', text: 'Enter personal details in Sinhala, Tamil, and English along with address.', icon: Users },
              { step: '2', title: 'Upload Photo & Docs', text: 'Attach digital ID photo, signature, and Grama Niladhari certificate.', icon: FilePlus },
              { step: '3', title: 'Officer Verification', text: 'Assigned officer validates details against national registration database.', icon: ShieldCheck },
              { step: '4', title: 'Receive Smart NIC', text: 'Card is batch printed on PVC and dispatched to your home address via post.', icon: CheckCircle2 }
            ].map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: '1.75rem', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'var(--border-color)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    0{s.step}
                  </div>
                  <div style={{ padding: '10px', background: 'var(--gradient-primary)', borderRadius: '10px', width: 'fit-content', color: '#fff', marginBottom: '1rem' }}>
                    <IconComp size={20} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
