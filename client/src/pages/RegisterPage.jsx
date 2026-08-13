import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  IdCard,
  Briefcase
} from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, loading: authLoading } = useAuth();
  const { addToast, triggerLoading, setRole } = useApp();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'Officer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'var(--text-muted)' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'var(--accent-rose)' };
    if (score <= 4) return { score: 66, label: 'Medium', color: 'var(--accent-amber)' };
    return { score: 100, label: 'Strong', color: 'var(--accent-emerald)' };
  };

  const pwdStrength = calculatePasswordStrength(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    const { full_name, username, email, password, confirm_password, role } = formData;

    if (!full_name || !username || !email || !password || !confirm_password) {
      setErrorMessage('Please complete all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirm_password) {
      setErrorMessage('Passwords do not match. Please re-type password.');
      return;
    }

    setErrorMessage('');
    try {
      const newUser = await registerUser({
        full_name,
        username,
        email,
        password,
        role
      });

      if (newUser.role) {
        setRole(newUser.role.toLowerCase());
      }

      triggerLoading({
        message: `Account Created Successfully!`,
        subtext: `Welcome aboard, ${newUser.full_name} (${newUser.role})`,
        duration: 1500,
        onComplete: () => {
          addToast(`Registration complete! Logged in as ${newUser.username}`, 'success');
          navigate('/officer');
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      addToast(err.message || 'Registration error', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        position: 'relative'
      }}
    >
      {/* Ambient Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--gradient-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
            }}
          >
            <UserPlus size={28} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Officer <span style={{ color: 'var(--accent-emerald)' }}>Registration</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Register Official Portal User & Verification Credentials
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.875rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">
              Full Official Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-fullname"
                type="text"
                name="full_name"
                className="form-control"
                placeholder="e.g. Officer Wickramasinghe"
                value={formData.full_name}
                onChange={handleChange}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          {/* Grid: Username & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="e.g. officer_wick"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.6rem' }}
                  required
                />
                <IdCard
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">
                Assigned Role
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="reg-role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.6rem' }}
                >
                  <option value="Officer">Officer</option>
                  <option value="Approver">Approver</option>
                  <option value="Admin">Admin</option>
                </select>
                <Briefcase
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Official Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="e.g. officer@nexusgov.lk"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          {/* Grid: Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.6rem', paddingRight: '2.2rem' }}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.6rem' }}
                  required
                />
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                <span style={{ fontWeight: 700, color: pwdStrength.color }}>{pwdStrength.label}</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pwdStrength.score}%`,
                    height: '100%',
                    background: pwdStrength.color,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-emerald"
            disabled={authLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 700,
              gap: '0.6rem',
              marginTop: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            {authLoading ? (
              <span>Registering User...</span>
            ) : (
              <>
                <UserPlus size={20} /> Complete Registration
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}
        >
          Already registered?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--accent-primary)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: '0.25rem'
            }}
          >
            Sign In Here <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};
