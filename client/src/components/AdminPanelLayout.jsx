import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LogOut,
  Home,
  Menu,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';

/**
 * Shared admin-panel style shell used by every staff Job Pool.
 * Mirrors the AdminDashboard sidebar + header layout so all
 * job pools present the same unified admin panel appearance.
 */
export const AdminPanelLayout = ({
  brandTitle = 'NexusStaff',
  brandSubtitle = 'National Identity Portal',
  brandIcon: BrandIcon = LayoutDashboard,
  accent = '#3b82f6',
  pageTitle,
  pageSubtitle,
  roleTag,
  navItems = [],
  children
}) => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme, addToast } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logoutUser) {
      logoutUser();
      addToast('Logged out of system', 'info');
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-main)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 10,
          position: 'sticky',
          top: 0,
          height: '100vh',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'var(--gradient-primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${accent}59`,
              color: '#fff'
            }}
          >
            <BrandIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Nexus<span style={{ color: accent }}>{brandTitle.replace('Nexus', '')}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {brandSubtitle}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const shared = {
              display: 'flex',
              alignItems: 'center',
              justifyContent: item.count !== undefined && item.count !== null ? 'space-between' : 'flex-start',
              gap: '0.85rem',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: item.active ? `1px solid ${item.color}66` : '1px solid transparent',
              backgroundColor: item.active ? `${item.color}26` : 'transparent',
              color: item.active ? item.color : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            };

            const content = item.to ? (
              <NavLink to={item.to} style={shared} onClick={item.onClick}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <item.icon size={18} /> {item.label}
                </div>
                {item.count !== undefined && item.count !== null && (
                  <span style={{ fontSize: '0.72rem', background: `${item.color}33`, color: item.color, padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                    {item.count}
                  </span>
                )}
              </NavLink>
            ) : (
              <button type="button" style={{ ...shared, border: item.active ? `1px solid ${item.color}66` : '1px solid transparent' }} onClick={item.onClick || (() => {})}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <item.icon size={18} /> {item.label}
                </div>
                {item.count !== undefined && item.count !== null && (
                  <span style={{ fontSize: '0.72rem', background: `${item.color}33`, color: item.color, padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
            return content;
          })}

          {/* Bottom actions */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <NavLink
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              <Home size={18} /> Citizen Portal
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                backgroundColor: 'rgba(244, 63, 94, 0.08)',
                color: 'var(--accent-rose)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden', minWidth: 0 }}>
        {/* Header Bar */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--bg-glass-heavy)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            zIndex: 5,
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <Menu size={22} style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pageSubtitle}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
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
              {theme === 'dark' ? <Sun size={17} color="var(--accent-gold)" /> : <Moon size={17} />}
            </button>

            {/* Current Staff Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {user?.full_name || user?.username || 'Staff Member'}
              </span>
              <span style={{ fontSize: '0.7rem', background: accent, color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '8px', fontWeight: 700 }}>
                {roleTag || 'STAFF'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '2rem', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminPanelLayout;