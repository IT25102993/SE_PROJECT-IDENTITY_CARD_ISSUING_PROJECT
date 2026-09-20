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
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { AccountSettingsModal } from './AccountSettingsModal';

export const Navbar = () => {
  const { role, theme, toggleTheme, addToast } = useApp();
  const { user, isAuthenticated, logoutUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    addToast('Logged out of system', 'info');
    navigate('/login');
  };

  // Normalised role string (always lowercase)
  const userRoleName = (user?.role || role || '').toLowerCase();

  // Role flags
  const isStaffMember = ['admin', 'approver', 'operational', 'form-officer', 'document-officer'].includes(userRoleName);
  const isAdminRole       = userRoleName === 'admin';
  const isOfficerRole     = userRoleName === 'form-officer' || userRoleName === 'document-officer';
  const isFormOfficerRole     = userRoleName === 'form-officer';
  const isDocumentOfficerRole = userRoleName === 'document-officer';
  const isApproverRole    = userRoleName === 'approver';
  const isOperationalRole = userRoleName === 'operational';

  // Badge config
  const getRoleBadge = () => {
    switch (userRoleName) {
      case 'form-officer':
        return { label: 'Form Officer', icon: UserCheck, color: '#10b981' };
      case 'document-officer':
        return { label: 'Document Officer', icon: ClipboardList, color: '#06b6d4' };
      case 'operational':
        return { label: 'Operational Staff', icon: Printer, color: '#3b82f6' };
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

  // ── Nav link style helper ────────────────────────────────
  const navStyle = (isActive, color = 'var(--accent-primary)') => ({
    color: isActive ? color : 'var(--text-secondary)',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.92rem',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  });

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
        <NavLink to={isStaffMember ? getDashboardPath(userRoleName) : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <img
              src="/images/gov_logo.png"
              alt="Sri Lanka Emblem Logo"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
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
          <ul style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', listStyle: 'none', margin: 0, padding: 0 }}>

            {/* ── PUBLIC LINKS — visible only to citizens / unauthenticated ── */}
            {!isStaffMember && (
              <>
                <li>
                  <NavLink to="/" style={({ isActive }) => navStyle(isActive)}>Home</NavLink>
                </li>
                <li>
                  <NavLink to="/apply" style={({ isActive }) => navStyle(isActive)}>Apply Online</NavLink>
                </li>
                <li>
                  <NavLink to="/track" style={({ isActive }) => navStyle(isActive)}>Track Status</NavLink>
                </li>
                <li>
                  <NavLink to="/about" style={({ isActive }) => navStyle(isActive)}>About</NavLink>
                </li>
              </>
            )}

            {/* ── STAFF LINKS — strictly role-isolated job pool ── */}
            {isOfficerRole && (
              <li>
                <NavLink
                  to="/officer?view=officer"
                  style={({ isActive }) => navStyle(isActive, 'var(--accent-emerald)')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <LayoutDashboard size={14} /> {isFormOfficerRole ? 'Form Officer Job Pool' : 'Document Officer Job Pool'}
                  </span>
                </NavLink>
              </li>
            )}

            {isApproverRole && (
              <li>
                <NavLink
                  to="/officer?view=approver"
                  style={({ isActive }) => navStyle(isActive, 'var(--accent-cyan)')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={14} /> Approver Job Pool
                  </span>
                </NavLink>
              </li>
            )}

            {isOperationalRole && (
              <li>
                <NavLink
                  to="/print-queue"
                  style={({ isActive }) => navStyle(isActive, '#3b82f6')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Printer size={14} /> Print Queue
                  </span>
                </NavLink>
              </li>
            )}

            {isAdminRole && (
              <li>
                <NavLink
                  to="/admin"
                  style={({ isActive }) => navStyle(isActive, '#8b5cf6')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={14} /> Admin Portal
                  </span>
                </NavLink>
              </li>
            )}
          </ul>

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setAccountModalOpen(true)}
                style={{
                  background: 'var(--bg-nested)',
                  border: `1px solid ${currentRole.color}`,
                  borderRadius: '20px',
                  padding: '0.35rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="View Profile & Account Settings"
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
                <Settings size={13} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
              </button>

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

          {/* Theme Switcher */}
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

        {/* Mobile menu toggle */}
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
          {/* Public links — only for citizens */}
          {!isStaffMember && (
            <>
              <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
              <NavLink to="/apply" onClick={() => setMobileOpen(false)}>Apply Online</NavLink>
              <NavLink to="/track" onClick={() => setMobileOpen(false)}>Track Status</NavLink>
              <NavLink to="/about" onClick={() => setMobileOpen(false)}>About</NavLink>
            </>
          )}

          {/* Staff links — strictly role-isolated job pool */}
          {isOfficerRole && (
            <NavLink to="/officer?view=officer" onClick={() => setMobileOpen(false)}>{isFormOfficerRole ? 'Form Officer Job Pool' : 'Document Officer Job Pool'}</NavLink>
          )}
          {isApproverRole && (
            <NavLink to="/officer?view=approver" onClick={() => setMobileOpen(false)}>Approver Job Pool</NavLink>
          )}
          {isOperationalRole && (
            <NavLink to="/print-queue" onClick={() => setMobileOpen(false)}>Print Queue</NavLink>
          )}
          {isAdminRole && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin Portal</NavLink>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.full_name}</span>
                <span style={{ fontSize: '0.7rem', background: currentRole.color, color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '8px' }}>
                  {user?.role || role}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => { setAccountModalOpen(true); setMobileOpen(false); }}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Settings size={13} /> Account
                </button>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1, fontSize: '0.8rem' }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <NavLink to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Login</NavLink>
              <NavLink to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Register</NavLink>
            </div>
          )}
        </div>
      )}

      {/* Account Settings Modal */}
      <AccountSettingsModal isOpen={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
    </nav>
  );
};

// Helper: get the default dashboard path for a staff role
function getDashboardPath(roleName) {
  switch (roleName) {
    case 'operational': return '/print-queue';
    case 'admin':       return '/admin';
    case 'approver':    return '/officer?view=approver';
    default:            return '/officer?view=officer'; // form-officer, document-officer
  }
}
