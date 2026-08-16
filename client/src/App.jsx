import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
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

function AppContent() {
  const { loadingState } = useApp();
  const location = useLocation();

  const isAdminPath = location.pathname === '/admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/print-queue" element={<PrintQueuePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
