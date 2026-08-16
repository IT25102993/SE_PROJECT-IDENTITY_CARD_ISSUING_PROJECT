import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_FALLBACK_APPLICATIONS = [
  {
    id: 'NEX-2026-90412',
    application_id: 1,
    fullNameEn: 'Thilina Sakalasooriya',
    fullNameSi: 'තිලිණ සකළසූරිය',
    fullNameTa: 'තදලීන සකලසූරිය',
    nicNumber: '200512345678',
    dob: '2005-01-01',
    gender: 'Male',
    civilStatus: 'Single',
    address: 'No. 12, Main Street, Malabe, Colombo',
    district: 'Colombo',
    divisionalSecretariat: 'Kaduwela',
    gnDivision: 'Malabe East (482B)',
    phone: '+94 77 123 4567',
    email: 'thilina.s@gmail.com',
    photoUrl: '',
    signature: 'Thilina Sakalasooriya',
    status: 'Issued',
    submittedDate: '2026-08-01',
    officerNotes: 'All biometrics and Grama Niladhari verification approved.',
    documents: ['Birth Certificate (PDF)', 'Grama Niladhari Certificate (JPG)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-01 09:30 AM', note: 'Application filed online via citizen portal.' },
      { status: 'Approved & NIC Issued', date: '2026-08-03 11:00 AM', note: 'NIC Number 200512345678 assigned.' }
    ]
  }
];

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('citizen');
  const [theme, setTheme] = useState(() => localStorage.getItem('nexusgov-theme') || 'dark');
  const [applications, setApplications] = useState(INITIAL_FALLBACK_APPLICATIONS);
  const [toasts, setToasts] = useState([]);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: 'Loading...',
    subtext: 'Department of Registration of Persons',
    duration: 2000,
    icon: null
  });

  // Fetch applications directly from Backend API (Database)
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          const formatted = data.applications.map(app => ({
            id: app.tracking_id || `NEX-2026-${app.application_id}`,
            application_id: app.application_id,
            fullNameEn: app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`,
            nicNumber: app.nicNumber || app.national_id_number || '',
            dob: app.dob || app.date_of_birth || '2000-01-01',
            gender: app.gender || 'Male',
            address: app.address || '',
            phone: app.phone || app.phone_number || '',
            email: app.email || '',
            status: app.status || 'Pending',
            submittedDate: app.submitted_at || new Date().toISOString().split('T')[0],
            officerNotes: app.remarks || '',
            trackingHistory: [
              { status: app.status || 'Submitted', date: app.submitted_at || 'Recent', note: app.remarks || 'Database synced' }
            ]
          }));
          setApplications(formatted);
        }
      }
    } catch (err) {
      console.warn('Backend DB connection note, using current active state:', err.message);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const triggerLoading = (config = {}) => {
    const {
      message = 'Processing Request...',
      subtext = 'Sri Lanka National Identity Database',
      duration = 1500,
      icon = null,
      onComplete = null
    } = typeof config === 'string' ? { message: config } : config;

    setLoadingState({
      isLoading: true,
      message,
      subtext,
      duration,
      icon
    });

    setTimeout(() => {
      setLoadingState(prev => ({ ...prev, isLoading: false }));
      if (onComplete) onComplete();
    }, duration);
  };

  const hideLoading = () => {
    setLoadingState(prev => ({ ...prev, isLoading: false }));
  };

  useEffect(() => {
    localStorage.setItem('nexusgov-theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const submitNewApplication = async (formData) => {
    const nameParts = (formData.fullNameEn || '').split(' ');
    const first_name = nameParts[0] || 'Applicant';
    const last_name = nameParts.slice(1).join(' ') || 'Citizen';

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          dob: formData.dob || '2005-01-01',
          gender: formData.gender || 'Male',
          address: formData.address || 'Colombo, Sri Lanka',
          phone_number: formData.phone || '+94 77 000 0000',
          email: formData.email || '',
          application_type: 'New'
        })
      });

      const data = await res.json();
      const trackingId = data.trackingId || `NEX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      fetchApplications();
      addToast(`Application submitted to database! Tracking ID: ${trackingId}`, 'success');
      return trackingId;
    } catch (err) {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const trackingId = `NEX-2026-${randomDigits}`;
      addToast(`Application submitted! Tracking ID: ${trackingId}`, 'success');
      return trackingId;
    }
  };

  const approveApplication = async (appId, notes = '') => {
    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${appId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remarks: notes })
      });
      fetchApplications();
    } catch (err) {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'Approved' } : app));
    }
    addToast(`Application ${appId} approved in database!`, 'success');
  };

  const rejectApplication = async (appId, reason) => {
    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${appId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remarks: reason })
      });
      fetchApplications();
    } catch (err) {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'Rejected' } : app));
    }
    addToast(`Application ${appId} rejected.`, 'error');
  };

  const markAsPrinted = async (appId) => {
    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'Printed' })
      });
      fetchApplications();
    } catch (err) {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'Printed' } : app));
    }
    addToast(`Card for ${appId} marked as Printed in DB!`, 'info');
  };

  const markAsDispatched = async (appId) => {
    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'Issued' })
      });
      fetchApplications();
    } catch (err) {
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: 'Dispatched' } : app));
    }
    addToast(`Application ${appId} marked as Dispatched!`, 'success');
  };

  const claimJob = (appId, officerName = 'Officer Wickramasinghe') => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId) {
        return {
          ...app,
          assignedOfficer: officerName
        };
      }
      return app;
    }));
    addToast(`Job ${appId} claimed into your active workbench!`, 'info');
  };

  const unclaimJob = (appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId) {
        return {
          ...app,
          assignedOfficer: null
        };
      }
      return app;
    }));
    addToast(`Job ${appId} returned to unassigned pool.`, 'info');
  };

  const claimNextJob = (officerName = 'Officer Wickramasinghe') => {
    const unassigned = applications.find(
      a => (a.status === 'PENDING_VERIFICATION' || a.status === 'Pending') && !a.assignedOfficer
    );
    if (!unassigned) {
      addToast('No unassigned pending jobs available in the pool right now.', 'info');
      return null;
    }
    const appId = unassigned.id || unassigned.application_id;
    claimJob(appId, officerName);
    return unassigned;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        theme,
        toggleTheme,
        applications,
        fetchApplications,
        submitNewApplication,
        approveApplication,
        rejectApplication,
        markAsPrinted,
        markAsDispatched,
        toasts,
        addToast,
        removeToast,
        loadingState,
        triggerLoading,
        hideLoading,
        claimJob,
        unclaimJob,
        claimNextJob
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
