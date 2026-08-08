import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { ToastContainer } from './components/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ApplyPage } from './pages/ApplyPage';
import { TrackingPage } from './pages/TrackingPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { PrintQueuePage } from './pages/PrintQueuePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

export function App() {
  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <BackgroundCanvas />
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/print-queue" element={<PrintQueuePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}

export default App;
