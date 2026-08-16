import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  UserPlus, User, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowLeft, IdCard,
  ShieldCheck, KeyRound, RefreshCw, CheckCircle2, Send
} from 'lucide-react';

const getPasswordRequirements = (pwd) => [
  { label: 'At least 8 characters',      met: pwd.length >= 8 },
  { label: 'One uppercase letter (A–Z)',  met: /[A-Z]/.test(pwd) },
  { label: 'One special character (!@#$%…)', met: /[^A-Za-z0-9]/.test(pwd) }
];

const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: 'None', color: 'var(--text-muted)' };
  let score = 0;
  if (pwd.length >= 8)          score += 1;
  if (pwd.length >= 12)         score += 1;
  if (/[A-Z]/.test(pwd))        score += 1;
  if (/[0-9]/.test(pwd))        score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  if (score <= 2) return { score: 33,  label: 'Weak',   color: 'var(--accent-rose)' };
  if (score <= 3) return { score: 66,  label: 'Medium', color: 'var(--accent-amber)' };
  return              { score: 100, label: 'Strong', color: 'var(--accent-emerald)' };
};

const iconStyle = {
  position: 'absolute', left: '12px', top: '50%',
  transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none'
};
const inputStyle = { paddingLeft: '2.6rem' };

const STEP_FORM  = 'form';
const STEP_OTP   = 'otp';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, loading: authLoading } = useAuth();
  const { addToast, triggerLoading, setRole } = useApp();

  const [step, setStep] = useState(STEP_FORM);

  const [formData, setFormData] = useState({
    full_name: '', username: '', email: '', password: '', confirm_password: '', role: 'Citizen'
  });
  const [showPassword, setShowPassword]     = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');
  const [sendingOtp, setSendingOtp]         = useState(false);

  const [otp, setOtp]                       = useState('');
  const [verifyingOtp, setVerifyingOtp]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const pwdStrength  = calculatePasswordStrength(formData.password);
  const pwdReqs      = getPasswordRequirements(formData.password);
  const allPwdMetReqs = pwdReqs.every(r => r.met);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const { full_name, username, email, password, confirm_password } = formData;

    if (!full_name || !username || !email || !password || !confirm_password) {
      return setErrorMessage('Please complete all mandatory fields.');
    }
    if (!allPwdMetReqs) {
      return setErrorMessage('Password does not meet all requirements listed below.');
    }
    if (password !== confirm_password) {
      return setErrorMessage('Passwords do not match.');
    }

    setSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send OTP.');

      addToast(`Verification code sent to ${email}`, 'success');
      setStep(STEP_OTP);
      startResendCooldown();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, full_name: formData.full_name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to resend OTP.');
      addToast('New OTP sent to your email!', 'info');
      startResendCooldown();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setErrorMessage('Please enter the 6-digit OTP.');

    setVerifyingOtp(true);
    setErrorMessage('');
    try {
      const vRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const vData = await vRes.json();
      if (!vRes.ok || !vData.success) throw new Error(vData.message || 'OTP verification failed.');

      const { full_name, username, email, password } = formData;
      const newUser = await registerUser({ full_name, username, email, password, role: 'Citizen' });

      setRole('citizen');

      triggerLoading({
        message: 'Account Created Successfully!',
        subtext: `Welcome aboard, ${newUser.full_name}`,
        duration: 1500,
        onComplete: () => {
          addToast(`Registration complete! Logged in as ${newUser.username}`, 'success');
          navigate('/');
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      addToast(err.message || 'Registration error', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const ErrorBlock = () => errorMessage ? (
    <div style={{
      background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
      color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1rem', marginBottom: '1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem'
    }}>
      <AlertCircle size={18} style={{ flexShrink: 0 }} />
      <span>{errorMessage}</span>
    </div>
  ) : null;

  const StepDots = () => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
      {[STEP_FORM, STEP_OTP].map((s) => (
        <div key={s} style={{
          width: step === s ? '24px' : '8px', height: '8px',
          borderRadius: '4px', transition: 'all 0.3s ease',
          background: step === s ? 'var(--accent-emerald)' :
            (step === STEP_OTP && s === STEP_FORM) ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'
        }} />
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1rem', position: 'relative'
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '420px', height: '420px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div className="glass-card animate-fade-in" style={{
        width: '100%', maxWidth: '520px', padding: '2.5rem 2.25rem',
        position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: step === STEP_OTP ? 'var(--gradient-primary)' : 'var(--gradient-emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', margin: '0 auto 1rem auto',
            boxShadow: step === STEP_OTP ? '0 8px 24px rgba(59,130,246,0.4)' : '0 8px 24px rgba(16,185,129,0.4)',
            transition: 'all 0.4s ease'
          }}>
            {step === STEP_OTP ? <ShieldCheck size={28} /> : <UserPlus size={28} />}
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            {step === STEP_OTP ? (
              <>Email <span style={{ color: 'var(--accent-primary)' }}>Verification</span></>
            ) : (
              <>Citizen <span style={{ color: 'var(--accent-emerald)' }}>Registration</span></>
            )}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {step === STEP_OTP
              ? `Enter the 6-digit code sent to ${formData.email}`
              : 'Create Citizen Account for National Identity Portal Services'}
          </p>
        </div>

        <StepDots />
        <ErrorBlock />

        {step === STEP_FORM && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-fullname">Full Official Name</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-fullname" type="text" name="full_name" className="form-control"
                  placeholder="e.g. Thilina Sakalasooriya"
                  value={formData.full_name} onChange={handleChange}
                  style={inputStyle} required />
                <User size={18} style={iconStyle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-username" type="text" name="username" className="form-control"
                  placeholder="e.g. thilina_s"
                  value={formData.username} onChange={handleChange}
                  style={inputStyle} required />
                <IdCard size={18} style={iconStyle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input id="reg-email" type="email" name="email" className="form-control"
                  placeholder="e.g. thilina@gmail.com"
                  value={formData.email} onChange={handleChange}
                  style={inputStyle} required />
                <Mail size={18} style={iconStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="reg-password" type={showPassword ? 'text' : 'password'}
                    name="password" className="form-control" placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.2rem' }} required />
                  <Lock size={18} style={iconStyle} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="reg-confirm" type={showPassword ? 'text' : 'password'}
                    name="confirm_password" className="form-control" placeholder="••••••••"
                    value={formData.confirm_password} onChange={handleChange}
                    style={inputStyle} required />
                  <Lock size={18} style={iconStyle} />
                </div>
              </div>
            </div>

            {formData.password && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Password Strength:</span>
                  <span style={{ fontWeight: 700, color: pwdStrength.color }}>{pwdStrength.label}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ width: `${pwdStrength.score}%`, height: '100%', background: pwdStrength.color, transition: 'all 0.3s ease' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {pwdReqs.map(req => (
                    <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <CheckCircle2 size={13} style={{ color: req.met ? 'var(--accent-emerald)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ color: req.met ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-emerald" disabled={sendingOtp}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700, gap: '0.6rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {sendingOtp ? <span>Sending Code...</span> : <><Send size={18} /> Send Verification Code</>}
            </button>
          </form>
        )}

        {step === STEP_OTP && (
          <form onSubmit={handleVerifyAndRegister}>
            <div style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem',
              display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
              marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)'
            }}>
              <Mail size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>A 6-digit code was sent to <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="otp-input">Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="otp-input" type="text" inputMode="numeric" maxLength={6}
                  className="form-control"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); if (errorMessage) setErrorMessage(''); }}
                  style={{
                    paddingLeft: '2.6rem', paddingRight: '1rem',
                    fontSize: '1.5rem', fontWeight: 800,
                    letterSpacing: '0.5rem', textAlign: 'center', fontFamily: "'Courier New', monospace"
                  }}
                  autoFocus
                />
                <KeyRound size={18} style={iconStyle} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Didn't receive it?{' '}
              <button type="button" onClick={handleResendOtp}
                disabled={resendCooldown > 0 || sendingOtp}
                style={{
                  background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent-primary)',
                  fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                }}>
                <RefreshCw size={13} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={verifyingOtp || authLoading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 700, gap: '0.6rem', marginBottom: '1rem' }}>
              {(verifyingOtp || authLoading)
                ? <span>Verifying & Registering...</span>
                : <><ShieldCheck size={20} /> Verify & Complete Registration</>}
            </button>

            <button type="button" onClick={() => { setStep(STEP_FORM); setOtp(''); setErrorMessage(''); }}
              style={{
                width: '100%', background: 'none', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', padding: '0.7rem', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                marginBottom: '1.5rem'
              }}>
              <ArrowLeft size={15} /> Back to Form
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem'
        }}>
          Already registered?{' '}
          <Link to="/login" style={{
            color: 'var(--accent-primary)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.25rem'
          }}>
            Sign In Here <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
