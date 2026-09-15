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
  AlertCircle,
  FolderOpen,
  Eye,
  Download
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, logoutUser } = useAuth();
  const { addToast, theme, toggleTheme } = useApp();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'users', 'register-staff', 'documents'

  const [dbApplications, setDbApplications] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Document Viewer Modal State
  const [docViewerApp, setDocViewerApp] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docSearchTerm, setDocSearchTerm] = useState('');

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

      // Fetch all documents for Document Repository
      try {
        const docRes = await fetch('/api/documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (docRes.ok) {
          const dData = await docRes.json();
          if (dData.documents) setAllDocuments(dData.documents);
        }
      } catch (_) {
        // Documents endpoint may not be reachable in offline mode
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

  const handleDeleteDocument = async (docId, fileName) => {
    if (!window.confirm(`Delete document "${fileName || docId}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Document deleted successfully', 'success');
        fetchAdminData();
      } else {
        addToast('Failed to delete document', 'error');
      }
    } catch (err) {
      addToast('Error deleting document', 'error');
    }
  };

  const filteredDocs = allDocuments.filter(doc => {
    if (!docSearchTerm) return true;
    const term = docSearchTerm.toLowerCase();
    return (
      (doc.tracking_id && doc.tracking_id.toLowerCase().includes(term)) ||
      (doc.applicant_name && doc.applicant_name.toLowerCase().includes(term)) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(term)) ||
      (doc.file_name && doc.file_name.toLowerCase().includes(term))
    );
  });

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

          <button
            onClick={() => setActiveTab('documents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'documents' ? '1px solid rgba(6,182,212,0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'documents' ? 'rgba(6,182,212,0.12)' : 'transparent',
              color: activeTab === 'documents' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <FolderOpen size={18} /> Document Repository
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
               activeTab === 'users' ? 'Registered System Personnel' :
               activeTab === 'documents' ? 'Document Repository' :
               'Staff Account Enrollment'}
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
                                onClick={() => setDocViewerApp(app)}
                                title={`View Uploaded Documents (${app.documents ? app.documents.length : 0})`}
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                  color: 'var(--accent-cyan)',
                                  border: '1px solid rgba(6, 182, 212, 0.3)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontSize: '0.78rem'
                                }}
                              >
                                <FolderOpen size={14} />
                                {app.documents && app.documents.length > 0 && (
                                  <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>{app.documents.length}</span>
                                )}
                              </button>
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

          {/* Document Repository View */}
          {activeTab === 'documents' && (
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
                    National Verification Document Repository <span style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 600 }}>({filteredDocs.length})</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Centralized archive of citizen-submitted identity verification documents, birth certificates, and photos
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search tracking ID, applicant, or doc type..."
                      value={docSearchTerm}
                      onChange={(e) => setDocSearchTerm(e.target.value)}
                      style={{
                        padding: '0.55rem 1rem 0.55rem 2.4rem',
                        borderRadius: '10px',
                        border: '1px solid var(--input-border)',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--input-bg)',
                        outline: 'none',
                        width: '280px'
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
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Document Type</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>File Name</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Size</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Uploaded Date</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <FolderOpen size={40} style={{ marginBottom: '0.75rem', opacity: 0.35, display: 'block', margin: '0 auto 0.75rem auto' }} />
                          <div>No verification documents found.</div>
                          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Citizen uploads submitted through the 5-step application will appear here automatically.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc, index) => (
                        <tr
                          key={doc.document_id || index}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                            {doc.tracking_id || `NEX-2026-${doc.application_id}`}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            <div>{doc.applicant_name || 'Citizen Applicant'}</div>
                            {doc.status && (
                              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Status: {doc.status}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.9rem 1rem' }}>
                            <span
                              style={{
                                padding: '0.25rem 0.65rem',
                                borderRadius: '12px',
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                                color: 'var(--accent-cyan)',
                                border: '1px solid rgba(6, 182, 212, 0.3)'
                              }}
                            >
                              {doc.document_type || 'General'}
                            </span>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <FileText size={15} color="var(--accent-cyan)" />
                              <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {doc.file_name || 'document'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.83rem', fontFamily: 'var(--font-mono)' }}>
                            {doc.file_size || '—'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}
                          </td>
                          <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                title="Preview Document"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                  color: 'var(--accent-primary)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 600
                                }}
                              >
                                <Eye size={13} /> View
                              </button>
                              {doc.file_path && (
                                <a
                                  href={doc.file_path}
                                  download={doc.file_name || 'document'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Download File"
                                  style={{
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    color: 'var(--accent-emerald)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 600
                                  }}
                                >
                                  <Download size={13} />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteDocument(doc.document_id, doc.file_name)}
                                title="Delete Document"
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                                  color: 'var(--accent-rose)',
                                  border: '1px solid rgba(244, 63, 94, 0.3)',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
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

      {/* Application Documents Modal */}
      {docViewerApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}
          onClick={() => setDocViewerApp(null)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  Verification Dossier
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Documents for Application #{docViewerApp.application_id || docViewerApp.id}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {docViewerApp.tracking_id || `NEX-2026-${docViewerApp.application_id || docViewerApp.id}`} — {docViewerApp.fullNameEn || `${docViewerApp.first_name || ''} ${docViewerApp.last_name || ''}`}
                </div>
              </div>
              <button
                onClick={() => setDocViewerApp(null)}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>

            {/* List of documents for this application */}
            {(!docViewerApp.documents || docViewerApp.documents.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <FolderOpen size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4, display: 'block' }} />
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Verification Documents Attached</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>This applicant did not attach uploaded files during submission.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {docViewerApp.documents.map((doc, idx) => (
                  <div
                    key={doc.document_id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', flexShrink: 0 }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {doc.document_type || 'Uploaded File'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                          <span>{doc.file_name}</span>
                          {doc.file_size && <span>• {doc.file_size}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: 'var(--accent-primary)',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                      {doc.file_path && (
                        <a
                          href={doc.file_path}
                          download={doc.file_name || 'document'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: 'var(--accent-emerald)',
                            textDecoration: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 600
                          }}
                        >
                          <Download size={14} /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Status Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Application Status: <strong style={{ color: docViewerApp.status === 'Approved' ? 'var(--accent-emerald)' : docViewerApp.status === 'Rejected' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>{docViewerApp.status || 'Pending'}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    handleUpdateAppStatus(docViewerApp.application_id || docViewerApp.id, 'Approved');
                    setDocViewerApp(prev => ({ ...prev, status: 'Approved' }));
                  }}
                  className="btn btn-sm"
                  style={{ borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <CheckCircle size={14} /> Approve Application
                </button>
                <button
                  onClick={() => {
                    handleUpdateAppStatus(docViewerApp.application_id || docViewerApp.id, 'Rejected');
                    setDocViewerApp(prev => ({ ...prev, status: 'Rejected' }));
                  }}
                  className="btn btn-sm"
                  style={{ borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <XCircle size={14} /> Reject Application
                </button>
                <button
                  onClick={() => setDocViewerApp(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Document Preview Modal */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                  Official Document Viewer
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {previewDoc.document_type || 'Verification Document'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {previewDoc.file_name} {previewDoc.file_size ? `· ${previewDoc.file_size}` : ''} {previewDoc.uploaded_at ? `· Uploaded: ${new Date(previewDoc.uploaded_at).toLocaleDateString()}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {previewDoc.file_path && (
                  <a
                    href={previewDoc.file_path}
                    download={previewDoc.file_name || 'document'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: 'var(--accent-emerald)',
                      textDecoration: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    <Download size={14} /> Download
                  </a>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Preview Viewport */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
              {previewDoc.preview_url && !previewDoc.file_name?.toLowerCase().endsWith('.pdf') ? (
                <img src={previewDoc.preview_url} alt={previewDoc.file_name} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
              ) : previewDoc.file_path && !previewDoc.file_path.toLowerCase().endsWith('.pdf') ? (
                <img src={previewDoc.file_path} alt={previewDoc.file_name} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
              ) : previewDoc.file_path ? (
                <iframe src={previewDoc.file_path} title={previewDoc.file_name} style={{ width: '100%', height: '65vh', border: 'none' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No direct preview available</div>
                  <div style={{ fontSize: '0.83rem' }}>Use the download button above to inspect the file.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
