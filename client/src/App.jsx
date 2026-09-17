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
import { OfficerDashboard } from './modules/verification-management/OfficerDashboard';
import { PrintQueuePage } from './modules/operation-management/PrintQueuePage';
import { AnalyticsPage } from './modules/operation-management/AnalyticsPage';
import { AdminDashboard } from './modules/admin-managemnt/AdminDashboard';

// ── Route guard: redirect logged-in staff away from public pages ─────────────
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    const r = (user.role || '').toLowerCase();
    if (r === 'operational')   return <Navigate to="/print-queue" replace />;
    if (r === 'admin')         return <Navigate to="/admin" replace />;
    if (r === 'approver')      return <Navigate to="/officer?view=approver" replace />;
    if (r === 'officer' || r === 'form-officer' || r === 'document-officer')
      return <Navigate to="/officer?view=officer" replace />;
  }
  return children;
};

// ── Route guard: only Operational + Admin can access Print Queue ─────────────
const OperationalRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  if (r !== 'operational' && r !== 'admin') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          The <strong>Print Queue</strong> is exclusively accessible to <strong>Operational</strong> staff and Administrators.
          Your current role (<strong>{user?.role}</strong>) does not have permission to view this section.
        </p>
        <button className="btn btn-primary" onClick={() => window.history.back()}>← Go Back</button>
      </div>
    );
  }
  return children;
};

// ── Route guard: staff-only pages (Officer / Approver dashboard) ─────────────
const StaffRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const r = (user?.role || '').toLowerCase();
  const isStaff = ['admin', 'officer', 'approver', 'form-officer', 'document-officer'].includes(r);
  if (!isStaff) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
          This portal is reserved for authorised staff only.
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

  const isAdminPath = location.pathname === '/admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
      {loadingState.isLoading && (
        <LoadingScreen
          message={loadingState.message}
          subtext={loadingState.subtext}
          duration={loadingState.duration}
        />
      )}
      {!isAdminPath && <BackgroundCanvas />}
      {!isAdminPath && <Navbar />}
      <main style={{ flex: 1, paddingTop: isAdminPath ? '0' : '72px' }}>
        <Routes>
          {/* Public / citizen routes */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/apply" element={<PublicRoute><ApplyPage /></PublicRoute>} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Staff-only routes */}
          <Route path="/officer" element={<StaffRoute><OfficerDashboard /></StaffRoute>} />
          <Route path="/analytics" element={<StaffRoute><AnalyticsPage /></StaffRoute>} />

          {/* Operational + Admin only */}
          <Route path="/print-queue" element={<OperationalRoute><PrintQueuePage /></OperationalRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
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
