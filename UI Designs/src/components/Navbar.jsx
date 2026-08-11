import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  IdCard,
  Moon,
  Sun,
  Menu,
  X,
  UserCheck,
  Printer,
  ShieldAlert,
  User,
  Loader2
} from 'lucide-react';

export const Navbar = () => {
  const { role, setRole, theme, toggleTheme, triggerLoading } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'officer':
        return { label: 'Verification Officer', icon: UserCheck, color: '#10b981' };
      case 'printer':
        return { label: 'Printing Tech', icon: Printer, color: '#3b82f6' };
      case 'admin':
        return { label: 'System Admin', icon: ShieldAlert, color: '#8b5cf6' };
      default:
        return { label: 'Citizen Applicant', icon: User, color: '#f59e0b' };
    }
  };

  const currentRole = getRoleBadge();
  const RoleIcon = currentRole.icon;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1000,
        background: 'var(--bg-glass-heavy)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <IdCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Nexus <span style={{ color: 'var(--accent-primary)' }}>Gov</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Identity Issuing System
            </div>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', listStyle: 'none' }}>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem'
                })}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/apply"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem'
                })}
              >
                Apply Online
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/track"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem'
                })}
              >
                Track Status
              </NavLink>
            </li>
            {(role === 'officer' || role === 'admin') && (
              <li>
                <NavLink
                  to="/officer"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.92rem'
                  })}
                >
                  Verification Portal
                </NavLink>
              </li>
            )}
            {(role === 'printer' || role === 'admin') && (
              <li>
                <NavLink
                  to="/print-queue"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.92rem'
                  })}
                >
                  Print Queue
                </NavLink>
              </li>
            )}
            {role === 'admin' && (
              <li>
                <NavLink
                  to="/analytics"
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.92rem'
                  })}
                >
                  Analytics
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/about"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem'
                })}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem'
                })}
              >
                Contact
              </NavLink>
            </li>
          </ul>

          {/* Interactive Role Selector Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${currentRole.color}`,
                color: currentRole.color,
                borderRadius: '20px',
                padding: '0.35rem 0.85rem 0.35rem 2rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'auto'
              }}
              title="Switch user role for testing"
            >
              <option value="citizen">👤 Citizen Mode</option>
              <option value="officer">🔍 Officer Mode</option>
              <option value="printer">🖨️ Tech Mode</option>
              <option value="admin">📊 Admin Mode</option>
            </select>
            <RoleIcon
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                color: currentRole.color,
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Sync / Loader Trigger Button */}
          <button
            onClick={() => triggerLoading({
              message: 'Synchronizing National Identity Gateway...',
              subtext: 'Performing cryptographic handshake with central database',
              duration: 3000
            })}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-cyan)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Trigger System Sync & Minimal Loading Screen"
          >
            <Loader2 size={18} className="animate-spin-slow" />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-glass-heavy)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/apply" onClick={() => setMobileOpen(false)}>Apply Online</NavLink>
          <NavLink to="/track" onClick={() => setMobileOpen(false)}>Track Status</NavLink>
          <NavLink to="/officer" onClick={() => setMobileOpen(false)}>Verification Portal</NavLink>
          <NavLink to="/print-queue" onClick={() => setMobileOpen(false)}>Print Queue</NavLink>
          <NavLink to="/analytics" onClick={() => setMobileOpen(false)}>Analytics</NavLink>
          <NavLink to="/about" onClick={() => setMobileOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role Mode:</span>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setMobileOpen(false);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            >
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
              <option value="printer">Print Tech</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
};
