import React, { useState, useEffect } from 'react';
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
  Edit2
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, logoutUser } = useAuth();
  const { addToast } = useApp();

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
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast(`User #${userId} removed.`, 'success');
        fetchAdminData();
      } else {
        addToast('Failed to delete user', 'error');
      }
    } catch (err) {
      addToast('Failed to delete user', 'error');
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
        addToast(`User role updated to ${newRole}`, 'success');
        setEditingUser(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        addToast(data.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm(`Are you sure you want to delete Application #${appId}?`)) return;
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 800, borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <div style={{ width: '30px', height: '30px', background: 'var(--gradient-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LayoutDashboard size={18} />
          </div>
          <span>NexusGov Admin</span>
        </div>

        <nav style={{ flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button onClick={() => setActiveTab('applications')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.85rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'applications' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}>
            <FileText size={20} /> Applications
          </button>
          <button onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.85rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'users' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}>
            <Users size={20} /> User Management
          </button>
          <button onClick={() => setActiveTab('register-staff')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.85rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'register-staff' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left' }}>
            <UserPlus size={20} /> Register Staff
          </button>
          <button onClick={logoutUser} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.85rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}>
            <LogOut size={20} /> Log out
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', zIndex: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Menu size={22} style={{ color: '#334155', cursor: 'pointer' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {activeTab === 'applications' ? 'Application Management' :
               activeTab === 'users' ? 'User Management' : 'Register Staff Account'}
            </h1>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
            {user ? user.email : 'admin@nexusgov.lk'}
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', position: 'relative' }}>
          {/* Applications View */}
          {activeTab === 'applications' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>All Applications ({dbApplications.length})</h3>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search application..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.5rem 1rem 0.5rem 2.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  <button onClick={fetchAdminData} style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={14} /> Refresh</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Applicant Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbApplications.map((app, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{app.application_id || app.id}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{app.first_name} {app.last_name}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{app.application_type || 'New'}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{app.status || 'Pending'}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => handleUpdateAppStatus(app.application_id, 'Approved')} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}><CheckCircle size={14} /></button>
                          <button onClick={() => handleUpdateAppStatus(app.application_id, 'Rejected')} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}><XCircle size={14} /></button>
                          <button onClick={() => handleDeleteApp(app.application_id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#64748b', color: '#fff', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* User Management View */}
          {activeTab === 'users' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>System Users ({dbUsers.length})</h3>
                <button onClick={fetchAdminData} style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RefreshCw size={14} /> Refresh</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Full Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email / Username</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbUsers.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>#{u.user_id}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{u.full_name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{u.email}<br/><small>{u.username}</small></td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.8rem' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button onClick={() => { setEditingUser(u); setNewRole(u.role); }} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}><Edit2 size={14} /> Edit</button>
                        <button onClick={() => handleDeleteUser(u.user_id)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /> Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Register Staff View */}
          {activeTab === 'register-staff' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '2rem', maxWidth: '600px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>Register Officer / Verification Personnel</h3>
              <form onSubmit={handleRegisterStaff}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Full Official Name</label>
                  <input type="text" placeholder="e.g. Officer Perera" value={staffForm.full_name} onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Username</label>
                    <input type="text" placeholder="e.g. officer_perera" value={staffForm.username} onChange={e => setStaffForm({ ...staffForm, username: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Assigned Role</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                      <option value="Officer">Officer</option>
                      <option value="Approver">Approver</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Email Address</label>
                  <input type="email" placeholder="e.g. officer@nexusgov.lk" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Initial Password</label>
                  <input type="password" placeholder="••••••••••••" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <UserPlus size={18} /> Register Staff Account
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Edit Role Modal Overlay */}
      {editingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>Edit User Role</h3>
            <p style={{ marginBottom: '1rem', color: '#475569' }}>User: <strong>{editingUser.username}</strong></p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <option value="Officer">Officer</option>
              <option value="Approver">Approver</option>
              <option value="Admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingUser(null)} style={{ padding: '0.65rem 1.2rem', borderRadius: '8px', backgroundColor: '#e2e8f0', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleUpdateRole} style={{ padding: '0.65rem 1.2rem', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
