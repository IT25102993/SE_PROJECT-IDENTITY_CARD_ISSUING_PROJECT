import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Edit2,
  Moon,
  Sun,
  Home,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, logoutUser } = useAuth();
  const { addToast, theme, toggleTheme } = useApp();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'users', 'register-staff'

  const [dbApplications, setDbApplications] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Register Officer Form State
  const [staffForm, setStaffForm] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'Officer'
  });

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const userRes = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.users) setDbUsers(uData.users);
      }

      const appRes = await fetch('/api/applications');
      if (appRes.ok) {
        const aData = await appRes.json();
        if (aData.applications) setDbApplications(aData.applications);
      }
    } catch (err) {
      console.error('Failed to load DB admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.username || !staffForm.email || !staffForm.password || !staffForm.full_name) {
      addToast('Please complete all staff registration fields.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to register staff user');
      }

      addToast(`Successfully registered ${staffForm.full_name} as ${staffForm.role}!`, 'success');
      setStaffForm({ username: '', email: '', full_name: '', password: '', role: 'Officer' });
      fetchAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to remove user #${userId}?`)) return;

    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'User deleted successfully', 'success');
        fetchAdminData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      const res = await fetch(`/api/auth/users/${editingUser.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        addToast(`Updated ${editingUser.username}'s role to ${newRole}!`, 'success');
        setEditingUser(null);
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to update user role', 'error');
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm(`Delete application #${appId}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast(`Application #${appId} deleted.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to delete application', 'error');
    }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addToast(`Application #${appId} status updated to ${newStatus}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredApps = dbApplications.filter(app => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.tracking_id && app.tracking_id.toLowerCase().includes(term)) ||
      (app.first_name && app.first_name.toLowerCase().includes(term)) ||
      (app.last_name && app.last_name.toLowerCase().includes(term)) ||
      (app.national_id_number && app.national_id_number.includes(term)) ||
      (app.status && app.status.toLowerCase().includes(term))
    );
  });

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
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
              color: '#fff'
            }}
          >
            <LayoutDashboard size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              Nexus<span style={{ color: 'var(--accent-primary)' }}>Admin</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              National Identity Portal
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'applications' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'applications' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'applications' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={18} /> Applications
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'users' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'users' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={18} /> User Management
          </button>

          <button
            onClick={() => setActiveTab('register-staff')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'register-staff' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'register-staff' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'register-staff' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={18} /> Register Staff
          </button>

          {/* Direct Staff Oversight Links for Admin */}
          <div style={{ margin: '0.65rem 0 0.35rem 0', padding: '0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Staff Oversight
          </div>

          <NavLink
            to="/officer?view=officer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--accent-emerald)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <UserCheck size={18} /> Officer Panel
          </NavLink>

          <NavLink
            to="/officer?view=approver"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              backgroundColor: 'rgba(6, 182, 212, 0.08)',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={18} /> Approver Panel
          </NavLink>

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
              onClick={logoutUser}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
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
            zIndex: 5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu size={22} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {activeTab === 'applications' ? 'National Application Records' :
               activeTab === 'users' ? 'Registered System Personnel' : 'Staff Account Enrollment'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

            {/* Current Admin Tag */}
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
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.full_name || user?.username || 'Administrator'}</span>
              <span style={{ fontSize: '0.7rem', background: 'var(--accent-purple)', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '8px', fontWeight: 700 }}>
                ADMIN
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: '2rem', position: 'relative' }}>
          {/* Applications View */}
          {activeTab === 'applications' && (
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Applications Database <span style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 600 }}>({filteredApps.length})</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Official registry of Sri Lankan citizen national identity applications
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search ID, name, or NIC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '0.55rem 1rem 0.55rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid var(--input-border)',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--input-bg)',
                        outline: 'none',
                        width: '260px'
                      }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>

                  <button
                    onClick={fetchAdminData}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-table-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Tracking ID</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Applicant</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Generated NIC</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No applications matching current search query.
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                            {app.tracking_id || `NEX-2026-${app.application_id || app.id}`}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <div>{app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.phone || app.phone_number || app.email || '—'}</div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                            {app.national_id_number || app.nicNumber || 'Pending Issuance'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)' }}>
                            {app.application_type || 'New'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '20px',
                                fontWeight: 700,
                                fontSize: '0.76rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'inline-block',
                                backgroundColor:
                                  app.status === 'Approved' || app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' :
                                  app.status === 'Rejected' || app.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.15)' :
                                  'rgba(245, 158, 11, 0.15)',
                                color:
                                  app.status === 'Approved' || app.status === 'APPROVED' ? 'var(--accent-emerald)' :
                                  app.status === 'Rejected' || app.status === 'REJECTED' ? 'var(--accent-rose)' :
                                  'var(--accent-amber)',
                                border: `1px solid ${
                                  app.status === 'Approved' || app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.3)' :
                                  app.status === 'Rejected' || app.status === 'REJECTED' ? 'rgba(244, 63, 94, 0.3)' :
                                  'rgba(245, 158, 11, 0.3)'
                                }`
                              }}
                            >
                              {app.status || 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => handleUpdateAppStatus(app.application_id || app.id, 'Approved')}
                                title="Approve Application"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: 'var(--accent-emerald)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  cursor: 'pointer'
                                }}
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateAppStatus(app.application_id || app.id, 'Rejected')}
                                title="Reject Application"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                  color: 'var(--accent-rose)',
                                  border: '1px solid rgba(244, 63, 94, 0.3)',
                                  cursor: 'pointer'
                                }}
                              >
                                <XCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(app.application_id || app.id)}
                                title="Delete Application"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                  color: 'var(--text-muted)',
                                  border: '1px solid var(--border-color)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Management View */}
          {activeTab === 'users' && (
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    System Users & Staff Accounts <span style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 600 }}>({dbUsers.length})</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Government administrators, verification registrars, and approval officers
                  </p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-table-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>User ID</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Name</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Email & Username</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbUsers.map((u, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          #{u.user_id}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u.full_name}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.email}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              backgroundColor:
                                u.role === 'Admin' ? 'rgba(139, 92, 246, 0.15)' :
                                u.role === 'Approver' ? 'rgba(6, 182, 212, 0.15)' :
                                u.role === 'Officer' ? 'rgba(16, 185, 129, 0.15)' :
                                'rgba(245, 158, 11, 0.15)',
                              color:
                                u.role === 'Admin' ? 'var(--accent-purple)' :
                                u.role === 'Approver' ? 'var(--accent-cyan)' :
                                u.role === 'Officer' ? 'var(--accent-emerald)' :
                                'var(--accent-amber)',
                              border: `1px solid ${
                                u.role === 'Admin' ? 'rgba(139, 92, 246, 0.3)' :
                                u.role === 'Approver' ? 'rgba(6, 182, 212, 0.3)' :
                                u.role === 'Officer' ? 'rgba(16, 185, 129, 0.3)' :
                                'rgba(245, 158, 11, 0.3)'
                              }`
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => { setEditingUser(u); setNewRole(u.role); }}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--accent-amber)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              cursor: 'pointer',
                              marginRight: '0.5rem',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <Edit2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.user_id)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(244, 63, 94, 0.15)',
                              color: 'var(--accent-rose)',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            <Trash2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Register Staff View */}
          {activeTab === 'register-staff' && (
            <div
              className="glass-card"
              style={{
                borderRadius: '16px',
                padding: '2.25rem',
                maxWidth: '650px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Enroll Staff Personnel</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Create high-privilege credentials for identity officers</p>
                </div>
              </div>

              <form onSubmit={handleRegisterStaff}>
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Full Official Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Officer Wickramasinghe"
                    value={staffForm.full_name}
                    onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--input-bg)',
                      outline: 'none',
                      fontSize: '0.92rem'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.15rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. officer_wickrama"
                      value={staffForm.username}
                      onChange={e => setStaffForm({ ...staffForm, username: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--input-bg)',
                        outline: 'none',
                        fontSize: '0.92rem'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Assigned Role
                    </label>
                    <select
                      value={staffForm.role}
                      onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--input-border)',
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.92rem'
                      }}
                    >
                      <option value="Officer">Officer (Verification Personnel)</option>
                      <option value="Approver">Approver (Senior Officer)</option>
                      <option value="Admin">Admin (System Administrator)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. officer@nexusgov.lk"
                    value={staffForm.email}
                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--input-bg)',
                      outline: 'none',
                      fontSize: '0.92rem'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Temporary Password (min 8 chars, 1 uppercase, 1 special)
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={staffForm.password}
                    onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--input-bg)',
                      outline: 'none',
                      fontSize: '0.92rem'
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <UserPlus size={18} /> Register Staff Account
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Edit Role Modal Overlay */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            className="glass-card"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              padding: '2rem',
              borderRadius: '16px',
              width: '420px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Edit User Role
            </h3>
            <p style={{ marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Assigning new privileges for user: <strong style={{ color: 'var(--accent-primary)' }}>{editingUser.username}</strong>
            </p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--input-border)',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--input-bg)',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            >
              <option value="Citizen">Citizen (Applicant)</option>
              <option value="Officer">Officer (Verification)</option>
              <option value="Approver">Approver (Senior Officer)</option>
              <option value="Admin">Admin (System Administrator)</option>
            </select>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingUser(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '10px' }}
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
