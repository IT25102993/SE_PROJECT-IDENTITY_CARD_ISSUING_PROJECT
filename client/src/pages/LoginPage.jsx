import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  IdCard,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser, loading: authLoading } = useAuth();
  const { addToast, triggerLoading, setRole } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setErrorMessage('Please fill in both Username/Email and Password.');
      return;
    }

    setErrorMessage('');
    try {
      const loggedInUser = await loginUser(usernameOrEmail, password);
      
      // Sync AppContext role with logged-in user role
      if (loggedInUser.role) {
        setRole(loggedInUser.role.toLowerCase());
      }

      triggerLoading({
        message: `Welcome back, ${loggedInUser.full_name}!`,
        subtext: `Role Session: ${loggedInUser.role} • Security Token Granted`,
        duration: 1500,
        onComplete: () => {
          addToast(`Logged in successfully as ${loggedInUser.full_name} (${loggedInUser.role})`, 'success');
          if (loggedInUser.role === 'Admin' || loggedInUser.role === 'Officer' || loggedInUser.role === 'Approver') {
            navigate('/officer');
          } else {
            navigate('/');
          }
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      addToast(err.message || 'Authentication failed', 'error');
    }
  };

  // Quick fill demo credentials
  const fillDemoAccount = (username, demoPassword, roleName) => {
    setUsernameOrEmail(username);
    setPassword(demoPassword);
    setErrorMessage('');
    addToast(`Loaded ${roleName} demo credentials`, 'info');
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
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 1,
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
        }}
      >
        {/* Card Header Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem auto',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
            }}
          >
            <IdCard size={30} />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Account <span style={{ color: 'var(--accent-primary)' }}>Login</span>
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Access Sri Lanka Identity Card Management Gateway
          </p>
        </div>

        {/* Error Alert Box */}
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

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username / Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username or Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-username"
                type="text"
                className="form-control"
                placeholder="e.g. officer1 or admin@nexusgov.lk"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
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

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.6rem', paddingRight: '2.6rem' }}
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
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me & Security Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
              fontSize: '0.85rem'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
              Remember credentials
            </label>
            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} color="var(--accent-emerald)" /> SSL Encrypted
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={authLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: 700,
              gap: '0.6rem'
            }}
          >
            {authLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={20} /> Sign In to Portal
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            margin: '1.75rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>Quick Demo Access</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Demo Quick Logins */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin', 'password123', 'Admin')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('officer1', 'password123', 'Officer')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            Officer
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('approver1', 'password123', 'Approver')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.45rem' }}
          >
            Approver
          </button>
        </div>

        {/* Footer Link to Register */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--accent-primary)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginLeft: '0.25rem'
            }}
          >
            Register Here <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
