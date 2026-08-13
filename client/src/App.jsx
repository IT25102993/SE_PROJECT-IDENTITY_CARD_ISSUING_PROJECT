import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { ToastContainer } from './components/ToastContainer';
import { LoadingScreen } from './components/LoadingScreen';

import { HomePage } from './pages/HomePage';
import { ApplyPage } from './pages/ApplyPage';
import { TrackingPage } from './pages/TrackingPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { PrintQueuePage } from './pages/PrintQueuePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppContent() {
  const { loadingState } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {loadingState.isLoading && (
        <LoadingScreen
          message={loadingState.message}
          subtext={loadingState.subtext}
          duration={loadingState.duration}
          icon={loadingState.icon || undefined}
        />
      )}
      <BackgroundCanvas />
      <Navbar />
      <main style={{ flex: 1, paddingTop: '72px' }}>
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
        </Routes>
      </main>
      <Footer />
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
