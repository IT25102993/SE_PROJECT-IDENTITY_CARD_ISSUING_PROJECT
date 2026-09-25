import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { ToastContainer } from './components/ToastContainer';
import { LoadingScreen } from './components/LoadingScreen';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

// Module Imports from src/modules/
import { LoginPage } from './modules/user-management/LoginPage';
import { RegisterPage } from './modules/user-management/RegisterPage';
import { ApplyPage } from './modules/application-form-management/ApplyPage';
import { TrackingPage } from './modules/application-form-management/TrackingPage';
import { FormOfficerPool } from './modules/verification-management/FormOfficerPool';
import { DocumentOfficerPool } from './modules/verification-management/DocumentOfficerPool';
import { ApproverPool } from './modules/verification-management/ApproverPool';
import { PrintQueuePage } from './modules/operation-management/PrintQueuePage';
import { AnalyticsPage } from './modules/operation-management/AnalyticsPage';
import { AdminDashboard } from './modules/admin-managemnt/AdminDashboard';

// ── Route guard: redirect logged-in staff away from public citizen pages ─────
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    const r = (user.role || '').toLowerCase();
    if (r === 'operational')   return <Navigate to="/print-queue" replace />;
    if (r === 'admin')         return <Navigate to="/admin" replace />;
    if (r === 'approver')      return <Navigate to="/approver-jobpool" replace />;
    if (r === 'form-officer')  return <Navigate to="/officer-jobpool" replace />;
    if (r === 'document-officer') return <Navigate to="/document-jobpool" replace />;
  }
  return children;
};

// ── Role-specific zone guards for the individual Job Pool pages ─────────────
const FormOfficerRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (!['admin', 'form-officer'].includes(r)) {
    return <Navigate to={r === 'document-officer' ? '/document-jobpool' : r === 'approver' ? '/approver-jobpool' : r === 'operational' ? '/print-queue' : '/login'} replace />;
  }
  return children;
};

const DocumentOfficerRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (!['admin', 'document-officer'].includes(r)) {
    return <Navigate to={r === 'form-officer' ? '/officer-jobpool' : r === 'approver' ? '/approver-jobpool' : r === 'operational' ? '/print-queue' : '/login'} replace />;
  }
  return children;
};

const ApproverRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (!['admin', 'approver'].includes(r)) {
    return <Navigate to={r === 'form-officer' ? '/officer-jobpool' : r === 'document-officer' ? '/document-jobpool' : r === 'operational' ? '/print-queue' : '/login'} replace />;
  }
  return children;
};

// ── Route guard: ONLY Operational role can access Print Queue ────────────────
const OperationalRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (r !== 'operational') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          The <strong>Print Queue</strong> is exclusively accessible to <strong>Operational</strong> staff.
          Your current role (<strong>{user?.role}</strong>) does not have permission to view this section.
        </p>
        <button className="btn btn-primary" onClick={() => window.history.back()}>← Go Back</button>
      </div>
    );
  }
  return children;
};

// ── Route guard: staff-only verification pages (Officer / Approver dashboard) ─
const StaffRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  const isStaff = ['admin', 'approver', 'form-officer', 'document-officer'].includes(r);
  if (!isStaff) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          This portal is reserved for authorised Verification Officers and Senior Approvers.
        </p>
        <button className="btn btn-primary" onClick={() => window.history.back()}>← Go Back</button>
      </div>
    );
  }
  return children;
};

// ── Route guard: Admin-only portal ───────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (r !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          The Administrator Portal is exclusively accessible to System Administrators.
        </p>
        <button className="btn btn-primary" onClick={() => window.history.back()}>← Go Back</button>
      </div>
    );
  }
  return children;
};

function AppContent() {
  const { loadingState } = useApp();
  const location = useLocation();

  // Admin-panel style pages hide the public Navbar / Footer / background
  const isPanelPath = ['/admin', '/officer-jobpool', '/document-jobpool', '/approver-jobpool', '/print-queue', '/analytics'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
      {loadingState.isLoading && (
        <LoadingScreen
          message={loadingState.message}
          subtext={loadingState.subtext}
          duration={loadingState.duration}
        />
      )}
      {!isPanelPath && <BackgroundCanvas />}
      {!isPanelPath && <Navbar />}
      <main style={{ flex: 1, paddingTop: isPanelPath ? '0' : '72px' }}>
        <Routes>
          {/* Public / citizen routes — logged-in staff are redirected to their own job pool */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/apply" element={<PublicRoute><ApplyPage /></PublicRoute>} />
          <Route path="/track" element={<PublicRoute><TrackingPage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Individual staff Job Pool pages — admin-panel style */}
          <Route path="/officer" element={<Navigate to="/officer-jobpool" replace />} />
          <Route path="/officer-jobpool" element={<FormOfficerRoute><FormOfficerPool /></FormOfficerRoute>} />
          <Route path="/document-jobpool" element={<DocumentOfficerRoute><DocumentOfficerPool /></DocumentOfficerRoute>} />
          <Route path="/approver-jobpool" element={<ApproverRoute><ApproverPool /></ApproverRoute>} />
          <Route path="/analytics" element={<StaffRoute><AnalyticsPage /></StaffRoute>} />

          {/* Strictly Operational only */}
          <Route path="/print-queue" element={<OperationalRoute><PrintQueuePage /></OperationalRoute>} />

          {/* Strictly Admin only */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      {!isPanelPath && <Footer />}
      <ToastContainer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
