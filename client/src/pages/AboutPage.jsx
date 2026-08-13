import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  FileCheck2,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Title Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>System Documentation</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>About Nexus Gov ICIS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Enterprise-grade digital transformation for national identity card application, verification, PVC print queueing, and dispatch.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', borderRadius: '10px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Automated Cryptographic NIC</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Integrated 2D QR codes and PDF417 barcodes storing encrypted identity payloads. Guarantees tamper-proof identity verification across official government check-points.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', borderRadius: '10px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Strict Role-Based Access (RBAC)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Hierarchical security permissions governing Applicant, Data Entry Clerk, Verification Officer, Super Administrator, and Printing Technician roles.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', borderRadius: '10px', width: 'fit-content', marginBottom: '1.25rem' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>High-Throughput PVC Print Queue</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Batch print queue automation for thermal PVC printers with vector print preview generator and automated postal delivery status synchronization.
            </p>
          </div>
        </div>

        {/* Technical Specification Section */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="var(--accent-primary)" /> System Architecture Standards
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Frontend Application Layer</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Built with React 18, Vite, custom glassmorphic CSS tokens, interactive 3D WebGL physics, and real-time state management.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>Security & Encryption</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                SHA-256 payload signing, AES-256 encrypted biometric storage, and audit log immutability.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>Post Office Delivery Integration</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Automated registered mail dispatch tracking connected directly with Sri Lanka Post logistics services.
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <NavLink to="/apply" className="btn btn-primary btn-lg">
            Start Your NIC Application <ArrowRight size={18} />
          </NavLink>
        </div>
      </div>
    </div>
  );
};
