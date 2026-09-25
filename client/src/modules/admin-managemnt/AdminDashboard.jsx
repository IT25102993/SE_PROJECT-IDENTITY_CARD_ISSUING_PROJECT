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
  UserX,
  FileCheck,
  Printer,
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Eye,
  ShieldAlert,
  Info,
  Building2,
  Layers,
  Receipt,
  Download,
  Check
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, logoutUser } = useAuth();
  const { addToast, theme, toggleTheme } = useApp();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'cash-flow', 'users', 'register-staff', 'deletion-requests'

  const [dbApplications, setDbApplications] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [deletionFilter, setDeletionFilter] = useState('all');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [cashFlowFilter, setCashFlowFilter] = useState('all');
  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Register Staff Form State
  const [staffForm, setStaffForm] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'Form-Officer'
  });

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
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

      const delRes = await fetch('/api/admin/deletion-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (delRes.ok) {
        const dData = await delRes.json();
        if (dData.requests) setDeletionRequests(dData.requests);
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
      const res = await fetch('/api/admin/register-staff', {
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
      setStaffForm({ username: '', email: '', full_name: '', password: '', role: 'Form-Officer' });
      fetchAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to remove user #${userId}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
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
      const res = await fetch(`/api/admin/users/${editingUser.user_id}`, {
        method: 'PUT',
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
      addToast('Failed to update application status', 'error');
    }
  };

  const handleMarkAsPrinted = async (appId) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Printed' })
      });
      if (res.ok) {
        addToast(`Smart Card for #${appId} marked as PRINTED!`, 'success');
        fetchAdminData();
      } else {
        throw new Error('Failed to update print status');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update print status', 'error');
    }
  };

  const handleApproveDeletion = async (requestId, username) => {
    if (!window.confirm(`Are you sure you want to approve account deletion for user "${username}"? This will permanently delete the user account.`)) return;

    try {
      const res = await fetch(`/api/admin/deletion-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(data.message || 'Account deletion approved.', 'success');
        fetchAdminData();
      } else {
        throw new Error(data.message || 'Failed to approve deletion');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRejectDeletion = async (requestId, username) => {
    const reason = window.prompt(`Provide administrative reason/notes for rejecting deletion for "${username}":`, 'Cannot delete account while application submission is active/in processing.');
    if (reason === null) return;

    try {
      const res = await fetch(`/api/admin/deletion-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_notes: reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(data.message || 'Account deletion request rejected.', 'info');
        fetchAdminData();
      } else {
        throw new Error(data.message || 'Failed to reject deletion request');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const pendingDeletionCount = deletionRequests.filter(r => r.status === 'Pending').length;

  // Real-time Application Metrics
  const totalSubmitted = dbApplications.length;
  const totalPrinted = dbApplications.filter(a => (a.status || '').toLowerCase() === 'printed').length;
  const totalApproved = dbApplications.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'approved' || s === 'verification-passed';
  }).length;
  const totalPending = dbApplications.filter(a => (a.status || '').toLowerCase().includes('pending')).length;
  const totalDispatched = dbApplications.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'dispatched' || s === 'issued';
  }).length;
  const totalRejected = dbApplications.filter(a => (a.status || '').toLowerCase() === 'rejected').length;

  // Treasury Cash Flow Metrics (1-Day = Rs. 1500, Normal = Rs. 500)
  const oneDayApps = dbApplications.filter(a => a.service_type === '1-Day');
  const normalApps = dbApplications.filter(a => a.service_type !== '1-Day');
  const oneDayRevenue = oneDayApps.length * 1500;
  const normalRevenue = normalApps.length * 500;
  const totalRevenue = oneDayRevenue + normalRevenue;

  const filteredApps = dbApplications.filter(app => {
    if (appStatusFilter !== 'all') {
      const s = (app.status || '').toLowerCase();
      if (appStatusFilter === 'Submitted' && !s.includes('pending') && s !== '') return false;
      if (appStatusFilter === 'Pending' && !s.includes('pending')) return false;
      if (appStatusFilter === 'Approved' && !s.includes('approved') && !s.includes('verification-passed')) return false;
      if (appStatusFilter === 'Printed' && s !== 'printed') return false;
      if (appStatusFilter === 'Dispatched' && s !== 'dispatched' && s !== 'issued') return false;
      if (appStatusFilter === 'Rejected' && s !== 'rejected') return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.tracking_id && app.tracking_id.toLowerCase().includes(term)) ||
      (app.first_name && app.first_name.toLowerCase().includes(term)) ||
      (app.last_name && app.last_name.toLowerCase().includes(term)) ||
      (app.fullNameEn && app.fullNameEn.toLowerCase().includes(term)) ||
      (app.national_id_number && app.national_id_number.includes(term)) ||
      (app.service_type && app.service_type.toLowerCase().includes(term)) ||
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
              justifyContent: 'space-between',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <FileText size={18} /> Applications
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontWeight: 700 }}>
              {totalSubmitted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cash-flow')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'cash-flow' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'cash-flow' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'cash-flow' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <TrendingUp size={18} /> Cash Flow & Revenue
            </div>
            <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
              Rs. {totalRevenue.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Users size={18} /> User Management
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
              {dbUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deletion-requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: activeTab === 'deletion-requests' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent',
              backgroundColor: activeTab === 'deletion-requests' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
              color: activeTab === 'deletion-requests' ? 'var(--accent-rose)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <UserX size={18} /> Deletion Governance
            </div>
            {pendingDeletionCount > 0 && (
              <span style={{ fontSize: '0.7rem', background: 'var(--accent-rose)', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 700 }}>
                {pendingDeletionCount}
              </span>
            )}
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
            to="/officer-jobpool"
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
            <UserCheck size={18} /> Officer Job Pool
          </NavLink>

          <NavLink
            to="/document-jobpool"
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
            <FileCheck size={18} /> Document Officer Pool
          </NavLink>

          <NavLink
            to="/approver-jobpool"
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
              {activeTab === 'applications' ? 'National Application & Card Production Records' :
               activeTab === 'cash-flow' ? 'Treasury Cash Flow, Teller Receipts & Revenue Tracking' :
               activeTab === 'users' ? 'Registered System Personnel' :
               activeTab === 'deletion-requests' ? 'Account Deletion Governance & Auditing' :
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
            <div>
              {/* Top KPI Cards: Applications Submitted, Cards Printed, Pending, Revenue */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.75rem'
                }}
              >
                {/* 1. Applications Submitted */}
                <div
                  onClick={() => setAppStatusFilter('all')}
                  className="glass-card"
                  style={{
                    background: appStatusFilter === 'all' ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                    border: `1px solid ${appStatusFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '16px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: appStatusFilter === 'all' ? '0 0 16px rgba(59, 130, 246, 0.2)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Applications Submitted
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    {totalSubmitted}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    Total citizen applications recorded
                  </div>
                </div>

                {/* 2. Applications Printed (Crucial User Requirement) */}
                <div
                  onClick={() => setAppStatusFilter('Printed')}
                  className="glass-card"
                  style={{
                    background: appStatusFilter === 'Printed' ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
                    border: `1px solid ${appStatusFilter === 'Printed' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    borderRadius: '16px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: appStatusFilter === 'Printed' ? '0 0 18px rgba(6, 182, 212, 0.25)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Applications Printed
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Printer size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    {totalPrinted}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.7rem' }}>
                      PVC PRINTED
                    </span>
                    Smart cards ready / dispatched
                  </div>
                </div>

                {/* 3. Pending Verification */}
                <div
                  onClick={() => setAppStatusFilter('Pending')}
                  className="glass-card"
                  style={{
                    background: appStatusFilter === 'Pending' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                    border: `1px solid ${appStatusFilter === 'Pending' ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                    borderRadius: '16px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pending Audit
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    {totalPending}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {totalApproved} approved & in print queue
                  </div>
                </div>

                {/* 4. Treasury Revenue */}
                <div
                  onClick={() => setActiveTab('cash-flow')}
                  className="glass-card"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '16px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="View Cash Flow & Teller Machine Receipts"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Treasury Cash Flow
                    </span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                    Rs. {totalRevenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Acc: 1234 5678 9012 1234 <ArrowUpRight size={14} color="var(--accent-emerald)" />
                  </div>
                </div>
              </div>

              {/* Applications Main Card */}
              <div
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  padding: '1.75rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                {/* Header with Search and Status Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Citizen Application Registry <span style={{ color: 'var(--accent-primary)', fontSize: '1rem', fontWeight: 600 }}>({filteredApps.length} shown)</span>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      Track applicant details, service tiers, teller receipts, and physical card printing
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                          width: '240px'
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

                {/* Quick Status Filter Pills */}
                <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.35rem' }}>
                    FILTER STATUS:
                  </span>
                  {[
                    { id: 'all', label: `All (${totalSubmitted})` },
                    { id: 'Pending', label: `Submitted / Pending (${totalPending})` },
                    { id: 'Approved', label: `Approved (${totalApproved})` },
                    { id: 'Printed', label: `Printed PVC (${totalPrinted})` },
                    { id: 'Dispatched', label: `Dispatched (${totalDispatched})` },
                    { id: 'Rejected', label: `Rejected (${totalRejected})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAppStatusFilter(tab.id)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: appStatusFilter === tab.id ? 'var(--accent-primary)' : 'var(--border-color)',
                        background: appStatusFilter === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                        color: appStatusFilter === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Applications Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-table-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Tracking ID</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Applicant</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>NIC Number</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Service Tier & Fee</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Teller Slip</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Print Status</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                            <div>No applications matching filter <strong>"{appStatusFilter}"</strong>.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredApps.map((app, index) => {
                          const isPrinted = (app.status || '').toLowerCase() === 'printed';
                          const isOneDay = app.service_type === '1-Day';
                          const hasTellerSlip = (app.documents || []).some(d => 
                            (d.document_type || '').includes('Deposit') || 
                            (d.document_type || '').includes('Teller') || 
                            (d.file_name || '').toLowerCase().includes('receipt') ||
                            (d.file_name || '').toLowerCase().includes('teller')
                          );

                          return (
                            <tr
                              key={index}
                              style={{
                                borderBottom: '1px solid var(--border-color)',
                                transition: 'background 0.2s ease',
                                backgroundColor: isPrinted ? 'rgba(6, 182, 212, 0.02)' : 'transparent'
                              }}
                            >
                              <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                                {app.tracking_id || `NEX-2026-${app.application_id || app.id}`}
                              </td>

                              <td style={{ padding: '0.9rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                <div style={{ fontWeight: 600 }}>{app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.phone || app.phone_number || app.email || '—'}</div>
                              </td>

                              <td style={{ padding: '0.9rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                                {app.national_id_number || app.nicNumber || 'Pending Issuance'}
                              </td>

                              {/* Service Tier & Expected Fee */}
                              <td style={{ padding: '0.9rem 1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      padding: '0.2rem 0.55rem',
                                      borderRadius: '8px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      background: isOneDay ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                      color: isOneDay ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                                      border: `1px solid ${isOneDay ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                                      width: 'fit-content'
                                    }}
                                  >
                                    {isOneDay ? '1-Day (Courier)' : 'Normal (Post)'}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Rs. {isOneDay ? '1,500' : '500'}
                                  </span>
                                </div>
                              </td>

                              {/* Teller Slip Preview */}
                              <td style={{ padding: '0.9rem 1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptApp(app)}
                                  className="btn btn-outline btn-sm"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '8px',
                                    fontSize: '0.76rem',
                                    background: hasTellerSlip ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                                    color: hasTellerSlip ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    border: `1px solid ${hasTellerSlip ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`
                                  }}
                                  title="Inspect uploaded teller receipt & bank payment confirmation"
                                >
                                  <Receipt size={13} />
                                  {hasTellerSlip ? 'View Receipt' : 'Audit Payment'}
                                </button>
                              </td>

                              {/* Card Print Status */}
                              <td style={{ padding: '0.9rem 1rem' }}>
                                {isPrinted ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.3rem 0.65rem',
                                      borderRadius: '14px',
                                      fontSize: '0.76rem',
                                      fontWeight: 800,
                                      background: 'rgba(6, 182, 212, 0.15)',
                                      color: 'var(--accent-cyan)',
                                      border: '1px solid rgba(6, 182, 212, 0.4)',
                                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)'
                                    }}
                                  >
                                    <Printer size={13} /> PVC PRINTED
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      padding: '0.25rem 0.65rem',
                                      borderRadius: '14px',
                                      fontWeight: 700,
                                      fontSize: '0.76rem',
                                      textTransform: 'uppercase',
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
                                )}
                              </td>

                              <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', alignItems: 'center' }}>
                                  {/* Quick Card Print Trigger Button */}
                                  {!isPrinted && (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAsPrinted(app.application_id || app.id)}
                                      title="Mark physical PVC Smart NIC as Printed"
                                      style={{
                                        padding: '0.35rem 0.65rem',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                        color: 'var(--accent-cyan)',
                                        border: '1px solid rgba(6, 182, 212, 0.35)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                      }}
                                    >
                                      <Printer size={13} /> Print Card
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleUpdateAppStatus(app.application_id || app.id, 'Approved')}
                                    title="Approve Application"
                                    style={{
                                      padding: '0.4rem 0.6rem',
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
                                      padding: '0.4rem 0.6rem',
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
                                      padding: '0.4rem 0.6rem',
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
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Cash Flow & Treasury Tracking View */}
          {activeTab === 'cash-flow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Treasury Master Card */}
              <div
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  padding: '1.75rem',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        National Treasury Cash Flow & Deposit Tracking
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Official Sri Lankan Identity Issuance payment tracking, teller slip verification, and cash flow diagrams
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchAdminData}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh Ledger
                  </button>
                </div>

                {/* Bank Account Credentials Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    background: 'rgba(0,0,0,0.22)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Government Treasury Account
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                      1234 5678 9012 1234
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Bank of Ceylon / CDM Teller Machine
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Beneficiary Account Name
                    </span>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      Department of Identity Issuance
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.15rem', fontWeight: 600 }}>
                      ✓ Verified State Treasury Facility
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Official Fee Schedule
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                        Normal: Rs. 500
                      </span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                        1-Day: Rs. 1,500
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Flow Diagrams & Visual Analytics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {/* Visual Diagram 1: Revenue Inflow Breakdown */}
                <div
                  className="glass-card"
                  style={{
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Revenue Inflow Diagram
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Proportional treasury receipts by service tier
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      Rs. {totalRevenue.toLocaleString()}
                    </div>
                  </div>

                  {/* Dual Proportional Bar Diagram */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ height: '20px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${totalRevenue > 0 ? (oneDayRevenue / totalRevenue) * 100 : 50}%`,
                          background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                          transition: 'width 0.4s ease'
                        }}
                        title={`1-Day Express: Rs. ${oneDayRevenue.toLocaleString()}`}
                      />
                      <div
                        style={{
                          width: `${totalRevenue > 0 ? (normalRevenue / totalRevenue) * 100 : 50}%`,
                          background: 'linear-gradient(90deg, #10b981, #34d399)',
                          transition: 'width 0.4s ease'
                        }}
                        title={`Normal Service: Rs. ${normalRevenue.toLocaleString()}`}
                      />
                    </div>
                  </div>

                  {/* Diagram Legend / Stream Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-amber)' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>1-Day Priority Service (Rs. 1,500)</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{oneDayApps.length} applicants via Courier Dispatch</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontSize: '0.95rem' }}>
                        Rs. {oneDayRevenue.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent-emerald)' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Normal Standard Service (Rs. 500)</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{normalApps.length} applicants via Sri Lanka Post</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                        Rs. {normalRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Diagram 2: Cash Flow Lifecycle Pipeline */}
                <div
                  className="glass-card"
                  style={{
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Cash Flow & Production Funnel
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      End-to-end audit progression from bank teller deposit to card delivery
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Stage 1: Deposited */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        1
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Teller Machine Fee Deposited</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>All {totalSubmitted} applicants uploaded teller slip to Acc 1234 5678 9012 1234</div>
                      </div>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                        100%
                      </span>
                    </div>

                    {/* Stage 2: Audit Verified */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-emerald)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        2
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Payment & Identity Audited</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{totalApproved} applications approved by verification officers</div>
                      </div>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                        {totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0}%
                      </span>
                    </div>

                    {/* Stage 3: Printed PVC Cards */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-cyan)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        3
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Smart Cards Printed</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{totalPrinted} physical PVC identity cards manufactured</div>
                      </div>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                        {totalSubmitted > 0 ? Math.round((totalPrinted / totalSubmitted) * 100) : 0}%
                      </span>
                    </div>

                    {/* Stage 4: Dispatched */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        4
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Courier / Postal Dispatch</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{totalDispatched} cards issued and dispatched to citizen address</div>
                      </div>
                      <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                        {totalSubmitted > 0 ? Math.round((totalDispatched / totalSubmitted) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer-by-Customer Payment Ledger */}
              <div
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  padding: '1.75rem',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Individual Citizen Payment & Teller Slip Ledger
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      Track each customer's payment status, deposit amount, and inspect teller receipts
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setCashFlowFilter('all')}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: cashFlowFilter === 'all' ? 'var(--accent-primary)' : 'var(--border-color)',
                        background: cashFlowFilter === 'all' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                        color: cashFlowFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      All ({dbApplications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashFlowFilter('1-Day')}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: cashFlowFilter === '1-Day' ? 'var(--accent-amber)' : 'var(--border-color)',
                        background: cashFlowFilter === '1-Day' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                        color: cashFlowFilter === '1-Day' ? 'var(--accent-amber)' : 'var(--text-secondary)'
                      }}
                    >
                      1-Day (Rs. 1,500) ({oneDayApps.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashFlowFilter('Normal')}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: cashFlowFilter === 'Normal' ? 'var(--accent-emerald)' : 'var(--border-color)',
                        background: cashFlowFilter === 'Normal' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                        color: cashFlowFilter === 'Normal' ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                      }}
                    >
                      Normal (Rs. 500) ({normalApps.length})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-table-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Tracking ID</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer Name</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>NIC Number</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Service Tier</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Payment Amount</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Treasury Acc</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Teller Slip</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Print & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbApplications
                        .filter(app => {
                          if (cashFlowFilter === '1-Day') return app.service_type === '1-Day';
                          if (cashFlowFilter === 'Normal') return app.service_type !== '1-Day';
                          return true;
                        })
                        .map((app, idx) => {
                          const isOneDay = app.service_type === '1-Day';
                          const fee = isOneDay ? 1500 : 500;
                          const isPrinted = (app.status || '').toLowerCase() === 'printed';

                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: '1px solid var(--border-color)',
                                transition: 'background-color 0.2s ease'
                              }}
                            >
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                                {app.tracking_id || `NEX-2026-${app.application_id || app.id}`}
                              </td>

                              <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`}
                              </td>

                              <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                                {app.national_id_number || app.nicNumber || 'Pending Issuance'}
                              </td>

                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  style={{
                                    padding: '0.2rem 0.55rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: isOneDay ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: isOneDay ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                                    border: `1px solid ${isOneDay ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                  }}
                                >
                                  {isOneDay ? '1-Day Priority' : 'Normal'}
                                </span>
                              </td>

                              <td style={{ padding: '0.85rem 1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isOneDay ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                                Rs. {fee.toLocaleString()}
                              </td>

                              <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                1234 5678 9012 1234
                              </td>

                              <td style={{ padding: '0.85rem 1rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptApp(app)}
                                  className="btn btn-outline btn-sm"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <Receipt size={13} color="var(--accent-primary)" />
                                  Audit Slip
                                </button>
                              </td>

                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: isPrinted
                                      ? 'rgba(6, 182, 212, 0.15)'
                                      : (app.status === 'Approved' || app.status === 'APPROVED')
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : 'rgba(245, 158, 11, 0.15)',
                                    color: isPrinted
                                      ? 'var(--accent-cyan)'
                                      : (app.status === 'Approved' || app.status === 'APPROVED')
                                      ? 'var(--accent-emerald)'
                                      : 'var(--accent-amber)',
                                    border: `1px solid ${
                                      isPrinted
                                        ? 'rgba(6, 182, 212, 0.35)'
                                        : (app.status === 'Approved' || app.status === 'APPROVED')
                                        ? 'rgba(16, 185, 129, 0.35)'
                                        : 'rgba(245, 158, 11, 0.35)'
                                    }`
                                  }}
                                >
                                  {isPrinted ? <Printer size={12} /> : <Clock size={12} />}
                                  {isPrinted ? 'Printed' : (app.status || 'Pending')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
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
                                u.role === 'Form-Officer' ? 'rgba(16, 185, 129, 0.15)' :
                                u.role === 'Document-Officer' ? 'rgba(6, 182, 212, 0.15)' :
                                u.role === 'Operational' ? 'rgba(59, 130, 246, 0.15)' :
                                'rgba(245, 158, 11, 0.15)',
                              color:
                                u.role === 'Admin' ? 'var(--accent-purple)' :
                                u.role === 'Approver' ? 'var(--accent-cyan)' :
                                u.role === 'Form-Officer' ? 'var(--accent-emerald)' :
                                u.role === 'Document-Officer' ? 'var(--accent-cyan)' :
                                u.role === 'Operational' ? 'var(--accent-primary)' :
                                'var(--accent-amber)',
                              border: `1px solid ${
                                u.role === 'Admin' ? 'rgba(139, 92, 246, 0.3)' :
                                u.role === 'Approver' ? 'rgba(6, 182, 212, 0.3)' :
                                u.role === 'Form-Officer' ? 'rgba(16, 185, 129, 0.3)' :
                                u.role === 'Document-Officer' ? 'rgba(6, 182, 212, 0.3)' :
                                u.role === 'Operational' ? 'rgba(59, 130, 246, 0.3)' :
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
          {/* Account Deletion Requests View */}
          {activeTab === 'deletion-requests' && (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
                      <UserX size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Account Deletion Governance <span style={{ color: 'var(--accent-rose)', fontSize: '1rem', fontWeight: 600 }}>({deletionRequests.length})</span>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Review citizen deletion requests, inspect submitted application history, and grant or deny approval
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setDeletionFilter(status)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: deletionFilter === status ? 'var(--accent-primary)' : 'var(--border-color)',
                        background: deletionFilter === status ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary)',
                        color: deletionFilter === status ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {status === 'all' ? 'All Requests' : status}
                      {status === 'Pending' && pendingDeletionCount > 0 && (
                        <span style={{ marginLeft: '6px', background: 'var(--accent-rose)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                          {pendingDeletionCount}
                        </span>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={fetchAdminData}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {/* Requests Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-table-header)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Req ID</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Citizen Details</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Submitted Applications</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Citizen Reason</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700 }}>Requested Date</th>
                      <th style={{ padding: '0.9rem 1rem', fontWeight: 700, textAlign: 'right' }}>Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletionRequests
                      .filter(r => deletionFilter === 'all' || r.status === deletionFilter)
                      .map((r) => {
                        const appCount = r.application_count || (r.submitted_applications ? r.submitted_applications.length : 0);
                        return (
                          <tr key={r.request_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' }}>
                            <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                              #DEL-{r.request_id}
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {r.current_user_fullname || r.username}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {r.email} • @{r.username}
                              </div>
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '12px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  background: appCount > 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(156, 163, 175, 0.15)',
                                  color: appCount > 0 ? 'var(--accent-primary)' : 'var(--text-muted)'
                                }}
                              >
                                <FileText size={13} /> {appCount} {appCount === 1 ? 'Application' : 'Applications'} on File
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 1rem', maxWidth: '240px' }}>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>
                                "{r.reason || 'Citizen requested account removal.'}"
                              </div>
                            </td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '12px',
                                  background:
                                    r.status === 'Approved'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : r.status === 'Rejected'
                                      ? 'rgba(244, 63, 94, 0.15)'
                                      : 'rgba(245, 158, 11, 0.15)',
                                  color:
                                    r.status === 'Approved'
                                      ? 'var(--accent-emerald)'
                                      : r.status === 'Rejected'
                                      ? 'var(--accent-rose)'
                                      : 'var(--accent-amber)'
                                }}
                              >
                                {r.status === 'Approved' && <CheckCircle2 size={12} />}
                                {r.status === 'Rejected' && <XCircle size={12} />}
                                {r.status === 'Pending' && <Clock size={12} />}
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {r.requested_at ? new Date(r.requested_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRequest(r)}
                                  className="btn btn-outline btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                  title="Inspect citizen submitted applications, data, and status"
                                >
                                  <Eye size={14} /> Review Data & Status
                                </button>
                                {r.status === 'Pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDeletion(r.request_id, r.username)}
                                      className="btn btn-emerald btn-sm"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                      title="Approve Deletion & Delete User Account"
                                    >
                                      <CheckCircle size={13} /> Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectDeletion(r.request_id, r.username)}
                                      className="btn btn-danger btn-sm"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                      title="Reject Deletion Request"
                                    >
                                      <XCircle size={13} /> Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {deletionRequests.filter(r => deletionFilter === 'all' || r.status === deletionFilter).length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          <UserCheck size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No deletion requests in this category.</div>
                          <div style={{ fontSize: '0.82rem' }}>All citizen identity account lifecycles are in good standing.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                    placeholder="e.g. Form Handling Officer Perera"
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
                      <option value="Form-Officer">Form Officer (Application Form Handling)</option>
                      <option value="Document-Officer">Document Officer (Document Handling)</option>
                      <option value="Approver">Approver (Senior Officer)</option>
                      <option value="Operational">Operational (Print & Dispatch Specialist)</option>
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
                    placeholder="e.g. form-officer@nexusgov.lk"
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


      {/* Citizen Deletion Request: Submitted Data & Status Inspection Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1.25rem'
          }}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="glass-card"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-glass)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Citizen Deletion Audit & Application Verification
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Request #DEL-{selectedRequest.request_id} • Account: @{selectedRequest.username} ({selectedRequest.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Citizen Details Card */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Citizen Name</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {selectedRequest.current_user_fullname || selectedRequest.username}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {selectedRequest.email}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Requested On</span>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {selectedRequest.requested_at ? new Date(selectedRequest.requested_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Request Status</span>
                    <div style={{ marginTop: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background:
                            selectedRequest.status === 'Approved'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : selectedRequest.status === 'Rejected'
                              ? 'rgba(244, 63, 94, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            selectedRequest.status === 'Approved'
                              ? 'var(--accent-emerald)'
                              : selectedRequest.status === 'Rejected'
                              ? 'var(--accent-rose)'
                              : 'var(--accent-amber)'
                        }}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Citizen Stated Reason */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Reason for Deletion Request
                  </span>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.3rem', fontStyle: 'italic', background: 'var(--bg-nested)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
                    "{selectedRequest.reason || 'Citizen requested account removal.'}"
                  </div>
                </div>
              </div>

              {/* Submitted Applications & Data Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--accent-primary)" />
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Citizen Submitted Applications ({selectedRequest.submitted_applications?.length || 0})
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Cross-referenced by registered email: {selectedRequest.email}
                  </span>
                </div>

                {selectedRequest.submitted_applications && selectedRequest.submitted_applications.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedRequest.submitted_applications.map((app, idx) => {
                      const appStatus = app.application_status || app.status || 'Pending';
                      return (
                        <div
                          key={app.application_id || idx}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem'
                          }}
                        >
                          {/* Application Header Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                                {app.tracking_id || `NEX-2026-${app.application_id}`}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                                Type: <strong>{app.application_type || 'New'}</strong> • Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>

                            {/* Application Status Badge */}
                            <div>
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: '14px',
                                  background:
                                    appStatus === 'Approved' || appStatus === 'Verification-Passed'
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : appStatus === 'Pending'
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : appStatus === 'Rejected'
                                      ? 'rgba(244, 63, 94, 0.15)'
                                      : 'rgba(59, 130, 246, 0.15)',
                                  color:
                                    appStatus === 'Approved' || appStatus === 'Verification-Passed'
                                      ? 'var(--accent-emerald)'
                                      : appStatus === 'Pending'
                                      ? 'var(--accent-amber)'
                                      : appStatus === 'Rejected'
                                      ? 'var(--accent-rose)'
                                      : 'var(--accent-primary)'
                                }}
                              >
                                Application Status: {appStatus}
                              </span>
                            </div>
                          </div>

                          {/* Bot Verification Score if available */}
                          {(app.bot_score !== undefined && app.bot_score !== null) && (
                            <div
                              style={{
                                background: app.bot_verified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                border: `1px solid ${app.bot_verified ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                                borderRadius: '8px',
                                padding: '0.65rem 0.85rem',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.4rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {app.bot_verified ? <CheckCircle2 size={15} color="var(--accent-emerald)" /> : <AlertCircle size={15} color="var(--accent-amber)" />}
                                <span style={{ fontWeight: 700, color: app.bot_verified ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                                  Automated Bot Verification: {app.bot_verified ? 'PASSED' : 'FLAGGED'}
                                </span>
                              </div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                Match Score: <span style={{ color: 'var(--accent-primary)' }}>{app.bot_score}%</span>
                              </div>
                              {app.bot_notes && (
                                <div style={{ width: '100%', fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                  {app.bot_notes}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Citizen Submitted Form Details Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Submitted Full Name</span>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                {app.full_name || `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>National ID (NIC)</span>
                              <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                                {app.national_id_number || 'Pending Generation'}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</span>
                              <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                {app.date_of_birth || app.dob || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gender</span>
                              <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                {app.gender || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone Contact</span>
                              <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                {app.phone_number || app.phone || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Address</span>
                              <div style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                                {app.address || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {app.remarks && (
                            <div style={{ background: 'var(--bg-nested)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <strong>Officer Remarks:</strong> {app.remarks}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Info size={24} style={{ margin: '0 auto 0.4rem', opacity: 0.6 }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No submitted identity applications found for this citizen.</div>
                    <div style={{ fontSize: '0.8rem' }}>This account is free of active application records.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Governance Actions */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-glass)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedRequest.status === 'Pending' ? (
                  <span>Carefully verify active applications before approving account removal.</span>
                ) : (
                  <span>
                    Processed on: {selectedRequest.processed_at ? new Date(selectedRequest.processed_at).toLocaleString() : 'N/A'}
                    {selectedRequest.processed_by_name ? ` by ${selectedRequest.processed_by_name}` : ''}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Close
                </button>
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleRejectDeletion(selectedRequest.request_id, selectedRequest.username);
                        setSelectedRequest(null);
                      }}
                      className="btn btn-danger btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                    >
                      <XCircle size={15} /> Reject Request
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveDeletion(selectedRequest.request_id, selectedRequest.username);
                        setSelectedRequest(null);
                      }}
                      className="btn btn-emerald btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                    >
                      <CheckCircle size={15} /> Approve Account Deletion
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              <option value="Form-Officer">Form Officer (Form Handling)</option>
              <option value="Document-Officer">Document Officer (Document Handling)</option>
              <option value="Approver">Approver (Senior Officer)</option>
              <option value="Operational">Operational (Print & Dispatch)</option>
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
      {/* Teller Machine Receipt & Payment Inspection Modal */}
      {selectedReceiptApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '1.25rem'
          }}
          onClick={() => setSelectedReceiptApp(null)}
        >
          <div
            className="glass-card"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-glass)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Bank Deposit & Teller Machine Slip Audit
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Application: {selectedReceiptApp.tracking_id || `NEX-2026-${selectedReceiptApp.application_id}`} • Beneficiary: Department of Identity Issuance
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptApp(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Payment Summary Grid */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Name</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {selectedReceiptApp.fullNameEn || `${selectedReceiptApp.first_name || ''} ${selectedReceiptApp.last_name || ''}`}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>NIC Number</span>
                    <div style={{ fontSize: '0.92rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '0.2rem', fontWeight: 700 }}>
                      {selectedReceiptApp.national_id_number || selectedReceiptApp.nicNumber || 'Pending Generation'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Service Tier & Delivery</span>
                    <div style={{ marginTop: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          background: selectedReceiptApp.service_type === '1-Day' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: selectedReceiptApp.service_type === '1-Day' ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                        }}
                      >
                        {selectedReceiptApp.service_type === '1-Day' ? '1-Day Priority (Courier)' : 'Normal (Post)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Deposit Amount</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedReceiptApp.service_type === '1-Day' ? 'var(--accent-amber)' : 'var(--accent-emerald)', marginTop: '0.15rem' }}>
                      Rs. {selectedReceiptApp.service_type === '1-Day' ? '1,500' : '500'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Treasury Account: </span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>1234 5678 9012 1234</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Beneficiary: </span>
                    <strong>Department of Identity Issuance</strong>
                  </div>
                </div>
              </div>

              {/* Uploaded Teller Machine Slip View */}
              <div>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Receipt size={16} color="var(--accent-primary)" /> Uploaded Teller Machine Receipt Slip
                </h4>

                {(() => {
                  const slipDoc = (selectedReceiptApp.documents || []).find(d =>
                    (d.document_type || '').includes('Deposit') ||
                    (d.document_type || '').includes('Teller') ||
                    (d.file_name || '').toLowerCase().includes('receipt') ||
                    (d.file_name || '').toLowerCase().includes('teller')
                  );

                  if (slipDoc) {
                    const preview = slipDoc.preview_url || slipDoc.file_data || slipDoc.file_path;
                    const isPdf = slipDoc.file_name && slipDoc.file_name.toLowerCase().endsWith('.pdf');

                    return (
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={15} /> Attached Receipt: {slipDoc.file_name} ({slipDoc.file_size || 'Valid'})
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Uploaded: {slipDoc.uploaded_at ? new Date(slipDoc.uploaded_at).toLocaleString() : 'Recent'}
                          </span>
                        </div>

                        {preview && !isPdf ? (
                          <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '280px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
                            <img src={preview} alt="Teller Receipt" style={{ maxHeight: '280px', objectFit: 'contain', width: '100%' }} />
                          </div>
                        ) : (
                          <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FileText size={28} color="var(--accent-primary)" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{slipDoc.file_name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official PDF Teller Confirmation Document</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // If no slip attached, show verified state slip
                  return (
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.22)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '12px',
                        padding: '1.75rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Receipt size={32} style={{ opacity: 0.4, color: 'var(--accent-amber)' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Direct CDM Machine Teller Deposit Slip
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                        Customer confirmed payment of Rs. {selectedReceiptApp.service_type === '1-Day' ? '1,500' : '500'} to State Treasury Acc #1234 5678 9012 1234.
                      </div>
                      <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        ✓ Bank Clearance In Progress
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-glass)'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Card Status: <strong>{selectedReceiptApp.status || 'Pending'}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptApp(null)}
                  className="btn btn-outline btn-sm"
                  style={{ borderRadius: '8px' }}
                >
                  Close
                </button>
                {selectedReceiptApp.status !== 'Printed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAsPrinted(selectedReceiptApp.application_id || selectedReceiptApp.id);
                      setSelectedReceiptApp(null);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', background: 'var(--accent-cyan)' }}
                  >
                    <Printer size={14} /> Mark Card as Printed
                  </button>
                )}
                {selectedReceiptApp.status !== 'Approved' && selectedReceiptApp.status !== 'Printed' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateAppStatus(selectedReceiptApp.application_id || selectedReceiptApp.id, 'Approved');
                      setSelectedReceiptApp(null);
                    }}
                    className="btn btn-emerald btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                  >
                    <CheckCircle size={14} /> Approve Payment & Form
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
