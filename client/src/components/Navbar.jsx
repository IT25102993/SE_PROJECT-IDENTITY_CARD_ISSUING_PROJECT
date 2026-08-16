import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
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
  Loader2,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

export const Navbar = () => {
  const { role, setRole, theme, toggleTheme, triggerLoading, addToast } = useApp();
  const { user, isAuthenticated, logoutUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    addToast('Logged out of system', 'info');
    navigate('/login');
  };

  const getRoleBadge = () => {
    const currentRole = user?.role ? user.role.toLowerCase() : role;
    switch (currentRole) {
      case 'officer':
        return { label: 'Verification Officer', icon: UserCheck, color: '#10b981' };
      case 'printer':
        return { label: 'Printing Tech', icon: Printer, color: '#3b82f6' };
      case 'admin':
        return { label: 'System Admin', icon: ShieldAlert, color: '#8b5cf6' };
      case 'approver':
        return { label: 'Senior Approver', icon: UserCheck, color: '#06b6d4' };
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          <ul style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', listStyle: 'none' }}>
            <li>
              <NavLink
                to="/"
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
            {(role === 'officer' || role === 'admin' || role === 'approver' || isAuthenticated) && (
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
          </ul>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${currentRole.color}`,
                  borderRadius: '20px',
                  padding: '0.35rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem'
                }}
              >
                <RoleIcon size={14} color={currentRole.color} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user?.full_name || user?.username}
                </span>
                <span
                  style={{
                    background: currentRole.color,
                    color: '#fff',
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {user?.role || role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ borderRadius: '20px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                title="Sign Out"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <NavLink to="/login" className="btn btn-secondary btn-sm" style={{ borderRadius: '20px', fontSize: '0.82rem' }}>
                <LogIn size={14} /> Login
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" style={{ borderRadius: '20px', fontSize: '0.82rem' }}>
                <UserPlus size={14} /> Register
              </NavLink>
            </div>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
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

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.full_name}</span>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn btn-danger btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <NavLink to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Login</NavLink>
              <NavLink to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
