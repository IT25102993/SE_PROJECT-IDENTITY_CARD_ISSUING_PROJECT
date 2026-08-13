import React from 'react';
import { NavLink } from 'react-router-dom';
import { IdCard, Shield, Phone, Mail, Clock, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        background: 'var(--bg-glass-heavy)',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 0 1.5rem 0',
        marginTop: '4rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '8px', background: 'var(--gradient-primary)', borderRadius: '8px', color: '#fff' }}>
                <IdCard size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Nexus <span style={{ color: 'var(--accent-primary)' }}>Gov</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Official National Identity Card Issuing & Digital Verification Portal of Sri Lanka. Fast, secure, and paperless.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
              <Lock size={14} /> 256-Bit SSL Encrypted & ISO 27001 Certified
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Portal Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <li><NavLink to="/" style={{ color: 'var(--text-secondary)' }}>Home & Portal Overview</NavLink></li>
              <li><NavLink to="/apply" style={{ color: 'var(--text-secondary)' }}>Apply for New Identity Card</NavLink></li>
              <li><NavLink to="/track" style={{ color: 'var(--text-secondary)' }}>Track Application Status</NavLink></li>
              <li><NavLink to="/login" style={{ color: 'var(--text-secondary)' }}>Officer Login</NavLink></li>
              <li><NavLink to="/register" style={{ color: 'var(--text-secondary)' }}>Officer Registration</NavLink></li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Government Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li>Department of Registration of Persons</li>
              <li>Ministry of Technology & Digital Economy</li>
              <li>Grama Niladhari Verification Service</li>
              <li>Sri Lanka Post Card Delivery Tracking</li>
              <li>Biometric Security Framework</li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Support Hotline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--accent-primary)" />
                <span>+94 11 234 5678 / 1919</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--accent-primary)" />
                <span>support@nexusgov.lk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--accent-primary)" />
                <span>Mon – Fri: 8:30 AM – 4:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>&copy; 2026 Nexus Gov Identity System. Government of Sri Lanka. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <NavLink to="/about" style={{ color: 'var(--text-muted)' }}>Privacy Policy</NavLink>
            <NavLink to="/about" style={{ color: 'var(--text-muted)' }}>Terms of Service</NavLink>
            <NavLink to="/contact" style={{ color: 'var(--text-muted)' }}>Help & Support</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
