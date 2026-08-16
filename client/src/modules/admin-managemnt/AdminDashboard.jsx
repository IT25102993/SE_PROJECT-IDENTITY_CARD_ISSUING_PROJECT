import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  Printer,
  CreditCard,
  LogOut,
  Menu,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Lock,
  Mail,
  User,
  RefreshCw,
  Plus
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, logoutUser } = useAuth();
  const { applications, triggerLoading, addToast } = useApp();

  const [activeTab, setActiveTab] = useState('orders'); // 'dashboard', 'applications', 'users', 'orders', 'payments'
  const [activeSubTab, setActiveSubTab] = useState('customer-orders'); // 'customer-orders', 'driver-details', 'register-staff'

  // Admin Data state from DB
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

  // Edit User Modal / State
  const [editingUser, setEditingUser] = useState(null);
  const [editingApp, setEditingApp] = useState(null);

  // Fetch Users & Applications from Backend Database API
  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      // Fetch Users
      const userRes = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.users) setDbUsers(uData.users);
      }

      // Fetch Applications
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

  // Use DB data if available, fallback to context
  const displayApps = dbApplications.length > 0 ? dbApplications : applications;

  // Handle Staff Registration by Admin
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

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast(`User #${userId} removed.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to delete user', 'error');
    }
  };

  // Delete Application
  const handleDeleteApp = async (appId) => {
    if (!window.confirm(`Are you sure you want to delete Application #${appId}?`)) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast(`Application #${appId} deleted from database.`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      addToast('Failed to delete application', 'error');
    }
  };

  // Update Application Status
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

  // Admin user email format
  const adminEmail = user ? user.email : 'admin@gmail.com';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
      }}
    >
      {/* ── Left Sidebar (Vibrant Green matching reference screenshot) ──────── */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#16a34a', // Fresh green theme matching user image
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxShadow: '4px 0 15px rgba(0, 0, 0, 0.05)',
          zIndex: 10
        }}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.25rem',
            fontWeight: 800,
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <Shield size={26} />
          <span>FreshMart</span>
        </div>

        {/* Navigation Menu Links */}
        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={() => { setActiveTab('dashboard'); setActiveSubTab('customer-orders'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'dashboard' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('products'); setActiveSubTab('customer-orders'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'products' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <FileText size={20} />
            Products
          </button>

          <button
            onClick={() => { setActiveTab('accounts'); setActiveSubTab('register-staff'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'accounts' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Users size={20} />
            Accounts
          </button>

          <button
            onClick={() => { setActiveTab('orders'); setActiveSubTab('customer-orders'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'orders' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <CheckSquare size={20} />
            Orders
          </button>

          <button
            onClick={() => { setActiveTab('payments'); setActiveSubTab('customer-orders'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'payments' ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <CreditCard size={20} />
            Payments
          </button>

          <button
            onClick={logoutUser}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
              marginTop: 'auto'
            }}
          >
            <LogOut size={20} />
            Log out
          </button>
        </nav>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        
        {/* White Header Top Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            zIndex: 5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu size={22} style={{ color: '#334155', cursor: 'pointer' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {activeTab === 'orders' ? 'Order Management' :
               activeTab === 'accounts' ? 'User & Account Management' :
               activeTab === 'products' ? 'Product & Application Management' :
               activeTab === 'payments' ? 'Payment Gateway & Issue Audit' : 'Dashboard Overview'}
            </h1>
          </div>

          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
            {adminEmail}
          </div>
        </header>

        {/* Content Container with Subtle Overlay Image Background */}
        <main
          style={{
            flex: 1,
            padding: '2rem',
            position: 'relative',
            backgroundImage: 'radial-gradient(rgba(22, 163, 74, 0.04) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Sub-Header Navigation Cards matching image design ("Customer Orders", "Delivery Driver Details") */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
            <div
              onClick={() => setActiveSubTab('customer-orders')}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem 1.75rem',
                minWidth: '280px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'customer-orders' ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: activeSubTab === 'customer-orders' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Order Management
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Orders
              </div>
            </div>

            <div
              onClick={() => setActiveSubTab('driver-details')}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem 1.75rem',
                minWidth: '280px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'driver-details' ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: activeSubTab === 'driver-details' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Officer Management
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Delivery Driver Details
              </div>
            </div>

            <div
              onClick={() => setActiveSubTab('register-staff')}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem 1.75rem',
                minWidth: '280px',
                cursor: 'pointer',
                boxShadow: activeSubTab === 'register-staff' ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: activeSubTab === 'register-staff' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Admin Portal Registration
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Register Staff / Officers
              </div>
            </div>
          </div>

          {/* ── SUB-VIEW 1: Customer Orders / Application Management ───────────── */}
          {activeSubTab === 'customer-orders' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                    Applications & Customer Orders ({displayApps.length})
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Admin can view, edit, approve, reject, or manage every application in the system database.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search application or applicant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem 0.5rem 2.4rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>

                  <button
                    onClick={fetchAdminData}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {/* Table of Applications */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ID / NIC</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Applicant Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Submitted</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayApps
                      .filter(a => 
                        !searchTerm || 
                        (a.fullNameEn && a.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (a.first_name && a.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (a.id && String(a.id).toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (a.application_id && String(a.application_id).toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((app, index) => {
                        const appId = app.application_id || app.id;
                        const name = app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Citizen Applicant';
                        const status = app.status || 'Pending';

                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', color: '#1e293b' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{appId}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>{name}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>{app.application_type || 'New'}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span
                                style={{
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  backgroundColor: status === 'Approved' || status === 'Issued' ? '#dcfce7' : status === 'Rejected' ? '#ffe4e6' : '#fef3c7',
                                  color: status === 'Approved' || status === 'Issued' ? '#15803d' : status === 'Rejected' ? '#be123c' : '#b45309'
                                }}
                              >
                                {status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{app.submitted_at || app.submittedDate || 'Recent'}</td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                  onClick={() => handleUpdateAppStatus(appId, 'Approved')}
                                  title="Approve Application"
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleUpdateAppStatus(appId, 'Rejected')}
                                  title="Reject Application"
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  <XCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteApp(appId)}
                                  title="Delete Record"
                                  style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#64748b', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUB-VIEW 2: Delivery Driver / Verification Officers Details ────── */}
          {activeSubTab === 'driver-details' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                    Registered Officers & Verification Accounts ({dbUsers.length})
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    View and edit registered system officers, verification personnel, and administrators.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Full Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Username / Email</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Assigned Role</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbUsers.map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', color: '#1e293b' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{u.user_id}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{u.full_name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{u.email} ({u.username})</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.8rem' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteUser(u.user_id)}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUB-VIEW 3: Admin Register Officers / Verification Officers ────── */}
          {activeSubTab === 'register-staff' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '600px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Register Officer / Verification Personnel
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Officers and Verification Officers are registered exclusively through this Admin page.
                </p>
              </div>

              <form onSubmit={handleRegisterStaff}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Official Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Officer Perera"
                    value={staffForm.full_name}
                    onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. officer_perera"
                      value={staffForm.username}
                      onChange={e => setStaffForm({ ...staffForm, username: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Assigned Role
                    </label>
                    <select
                      value={staffForm.role}
                      onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="Officer">Officer</option>
                      <option value="Verification Officer">Verification Officer</option>
                      <option value="Approver">Approver</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. officer@nexusgov.lk"
                    value={staffForm.email}
                    onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Initial Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={staffForm.password}
                    onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
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
    </div>
  );
};

export default AdminDashboard;
