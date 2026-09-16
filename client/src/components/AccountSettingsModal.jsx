import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  Shield,
  Trash2,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  Info,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

export const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { user, token, logoutUser } = useAuth();
  const { addToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [confirmDirectDelete, setConfirmDirectDelete] = useState(false);

  const fetchEligibility = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/deletion-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEligibility(data);
      }
    } catch (err) {
      console.error('Failed to fetch deletion status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEligibility();
      setConfirmDirectDelete(false);
      setDeletionReason('');
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Direct Account Deletion (0 Applications)
  const handleDirectDelete = async () => {
    setSubmittingRequest(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete account');
      }

      addToast('Your account has been deleted permanently.', 'info');
      logoutUser();
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Submit Deletion Request to Admin (Applications on file)
  const handleRequestDeletion = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const res = await fetch('/api/users/request-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: deletionReason || 'Citizen requested account removal.' })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit deletion request');
      }

      addToast(data.message || 'Account deletion request submitted for administrative review.', 'success');
      fetchEligibility();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                My Account & Governance
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Citizen Profile & Account Lifecycle Settings
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* User Details Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Full Name
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {user?.full_name || 'Citizen'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Username
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
                  @{user?.username}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Email Address
                </span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {user?.email}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Assigned Role
                </span>
                <div style={{ marginTop: '0.2rem' }}>
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--accent-primary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {user?.role || 'Citizen'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Deletion & Governance Section */}
          <div
            style={{
              border: '1px solid rgba(244, 63, 94, 0.25)',
              background: 'rgba(244, 63, 94, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <Trash2 size={18} color="var(--accent-rose)" />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent-rose)', fontWeight: 700 }}>
                Account Deletion & Data Privacy
              </h4>
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.85rem' }}>Verifying application records & status...</div>
              </div>
            ) : eligibility?.canDirectDelete ? (
              /* Case 1: 0 Applications Submitted - Direct Deletion Permitted */
              <div>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem'
                  }}
                >
                  <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong>Direct Deletion Eligible:</strong> You have <strong>0 submitted identity applications</strong> on file.
                    You may permanently delete your citizen account immediately.
                  </div>
                </div>

                {!confirmDirectDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDirectDelete(true)}
                    className="btn btn-danger"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}
                  >
                    <Trash2 size={16} /> Delete Account Immediately
                  </button>
                ) : (
                  <div
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid var(--accent-rose)',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Are you sure you want to permanently delete your account?
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      This action cannot be undone. All citizen credentials and history will be wiped immediately.
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={handleDirectDelete}
                        disabled={submittingRequest}
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {submittingRequest ? 'Deleting...' : 'Yes, Permanently Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDirectDelete(false)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Case 2: Applications Exist - Must Request Admin Review */
              <div>
                <div
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem'
                  }}
                >
                  <AlertTriangle size={18} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong>Administrative Review Required:</strong> You have{' '}
                    <strong>{eligibility?.applicationCount} submitted application(s)</strong> on file.
                    Under identity regulatory protocols, accounts with submitted identity applications require Administrator verification before deletion.
                  </div>
                </div>

                {/* Applications list */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Submitted Applications on File:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {eligibility?.applications?.map((app) => (
                      <div
                        key={app.application_id}
                        style={{
                          background: 'var(--bg-nested)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {app.tracking_id}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Recent'} • Type: {app.application_type}
                          </div>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              background:
                                app.status === 'Approved'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : app.status === 'Pending'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(59, 130, 246, 0.15)',
                              color:
                                app.status === 'Approved'
                                  ? 'var(--accent-emerald)'
                                  : app.status === 'Pending'
                                  ? 'var(--accent-amber)'
                                  : 'var(--accent-primary)'
                            }}
                          >
                            Status: {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* If a request is already pending */}
                {eligibility?.pendingRequest ? (
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <Clock size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        Deletion Request Pending Admin Review
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Requested on {new Date(eligibility.pendingRequest.requested_at).toLocaleString()}.
                        The system administrator has been notified and will verify your submitted identity records before completing account deletion.
                      </div>
                      {eligibility.pendingRequest.reason && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                          Reason: "{eligibility.pendingRequest.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Form to request account deletion */
                  <form onSubmit={handleRequestDeletion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        Reason for Requesting Account Deletion (Required for Admin Audit)
                      </label>
                      <textarea
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        placeholder="Please explain why you wish to delete your account while having active application submissions..."
                        rows={3}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingRequest}
                      className="btn btn-warning"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.88rem',
                        alignSelf: 'flex-start'
                      }}
                    >
                      {submittingRequest ? (
                        <>
                          <Loader2 size={16} className="spin" /> Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Request Account Deletion from Admin
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg-glass)'
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
