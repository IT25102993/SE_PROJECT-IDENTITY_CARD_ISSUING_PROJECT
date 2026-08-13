import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const INITIAL_APPLICATIONS = [
  {
    id: 'NEX-2026-90412',
    fullNameEn: 'Thilina Sakalasooriya',
    fullNameSi: 'තිලිණ සකළසූරිය',
    fullNameTa: 'திலீன சகலசூரிய',
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
    status: 'DISPATCHED',
    submittedDate: '2026-08-01',
    officerNotes: 'All biometrics and Grama Niladhari verification approved.',
    documents: ['Birth Certificate (PDF)', 'Grama Niladhari Certificate (JPG)', 'Police Clearance (PDF)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-01 09:30 AM', note: 'Application filed online via citizen portal.' },
      { status: 'Document Verification', date: '2026-08-02 02:15 PM', note: 'Verified by Officer Wickramasinghe.' },
      { status: 'Approved & NIC Issued', date: '2026-08-03 11:00 AM', note: 'NIC Number 200512345678 assigned.' },
      { status: 'Printed PVC', date: '2026-08-04 04:30 PM', note: 'Batch PVC thermal print queue completed.' },
      { status: 'Dispatched', date: '2026-08-05 10:00 AM', note: 'Handed over to Sri Lanka Post Registered Mail (Tracking: RL9821034LK).' }
    ]
  },
  {
    id: 'NEX-2026-91823',
    fullNameEn: 'Kavindi Perera',
    fullNameSi: 'කාවින්දි පෙරේරා',
    fullNameTa: 'காவிந்தி பெரேரா',
    nicNumber: '',
    dob: '2004-05-14',
    gender: 'Female',
    civilStatus: 'Single',
    address: 'No. 45, Temple Road, Kandy',
    district: 'Kandy',
    divisionalSecretariat: 'Kandy Four Gravets',
    gnDivision: 'Suduhumpola (211A)',
    phone: '+94 71 987 6543',
    email: 'kavindi.p@yahoo.com',
    photoUrl: '',
    signature: 'Kavindi P.',
    status: 'PENDING_VERIFICATION',
    assignedOfficer: null,
    priority: 'STANDARD',
    submittedDate: '2026-08-06',
    officerNotes: '',
    documents: ['Birth Certificate (PDF)', 'Grama Niladhari Certificate (JPG)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-06 11:45 AM', note: 'Application submitted successfully. Queued in Unassigned Job Pool.' }
    ]
  },
  {
    id: 'NEX-2026-92881',
    fullNameEn: 'Dilshan Senanayake',
    fullNameSi: 'දිල්ෂාන් සේනානායක',
    fullNameTa: 'தில்ஷான் சேனாநாயக்க',
    nicNumber: '',
    dob: '2003-09-12',
    gender: 'Male',
    civilStatus: 'Single',
    address: 'No. 78, Highlevel Road, Nugegoda',
    district: 'Colombo',
    divisionalSecretariat: 'Sri Jayawardenepura',
    gnDivision: 'Nugegoda West (512A)',
    phone: '+94 77 888 9900',
    email: 'dilshan.s@gmail.com',
    photoUrl: '',
    signature: 'D. Senanayake',
    status: 'PENDING_VERIFICATION',
    assignedOfficer: null,
    priority: 'HIGH',
    submittedDate: '2026-08-08',
    officerNotes: '',
    documents: ['Birth Certificate (PDF)', 'School Certificate (PDF)', 'GN Certificate (JPG)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-08 08:15 AM', note: 'Application queued for priority verification.' }
    ]
  }
];

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('citizen');
  const [theme, setTheme] = useState(() => localStorage.getItem('nexusgov-theme') || 'dark');
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('nexusgov-applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });
  const [toasts, setToasts] = useState([]);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: 'Loading...',
    subtext: 'Department of Registration of Persons',
    duration: 3000,
    icon: null
  });

  useEffect(() => {
    localStorage.setItem('nexusgov-applications', JSON.stringify(applications));
  }, [applications]);

  const triggerLoading = (config = {}) => {
    const {
      message = 'Processing Request...',
      subtext = 'Sri Lanka National Identity Database',
      duration = 2000,
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

  const submitNewApplication = (formData) => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `NEX-2026-${randomDigits}`;

    const newApp = {
      id: trackingId,
      fullNameEn: formData.fullNameEn,
      fullNameSi: formData.fullNameSi || formData.fullNameEn,
      fullNameTa: formData.fullNameTa || formData.fullNameEn,
      nicNumber: '',
      dob: formData.dob,
      gender: formData.gender,
      civilStatus: formData.civilStatus || 'Single',
      address: formData.address,
      district: formData.district,
      divisionalSecretariat: formData.divisionalSecretariat || 'Central',
      gnDivision: formData.gnDivision || 'Division 01',
      phone: formData.phone,
      email: formData.email,
      photoUrl: formData.photoUrl || '',
      signature: formData.signature || formData.fullNameEn,
      status: 'PENDING_VERIFICATION',
      submittedDate: new Date().toISOString().split('T')[0],
      officerNotes: '',
      documents: formData.documents || ['Birth Certificate (PDF)', 'GN Certificate (JPG)'],
      trackingHistory: [
        {
          status: 'Submitted',
          date: new Date().toLocaleString(),
          note: 'Application filed online via citizen portal.'
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);
    addToast(`Application submitted! Tracking ID: ${trackingId}`, 'success');
    return trackingId;
  };

  const approveApplication = (appId, notes = '') => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const birthYear = app.dob ? app.dob.substring(0, 4) : '2005';
        const randDigits = Math.floor(10000000 + Math.random() * 90000000);
        const nic = `${birthYear}${randDigits}`;

        return {
          ...app,
          status: 'APPROVED',
          nicNumber: nic,
          officerNotes: notes || 'Verified and approved by Verification Officer.',
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Approved & NIC Issued',
              date: new Date().toLocaleString(),
              note: `Approved. Assigned official NIC Number: ${nic}`
            }
          ]
        };
      }
      return app;
    }));

    addToast(`Application ${appId} approved successfully!`, 'success');
  };

  const rejectApplication = (appId, reason) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'REJECTED',
          officerNotes: reason || 'Application rejected due to document mismatch.',
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Rejected',
              date: new Date().toLocaleString(),
              note: `Rejected: ${reason || 'Document mismatch'}`
            }
          ]
        };
      }
      return app;
    }));

    addToast(`Application ${appId} marked as Rejected.`, 'error');
  };

  const markAsPrinted = (appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'PRINTED',
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Printed PVC',
              date: new Date().toLocaleString(),
              note: 'PVC thermal identity card batch printed.'
            }
          ]
        };
      }
      return app;
    }));

    addToast(`Card for ${appId} queued and printed!`, 'info');
  };

  const markAsDispatched = (appId, dispatchRef = 'RL8819203LK') => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: 'DISPATCHED',
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Dispatched',
              date: new Date().toLocaleString(),
              note: `Card dispatched via Sri Lanka Post Registered Mail (Tracking: ${dispatchRef}).`
            }
          ]
        };
      }
      return app;
    }));

    addToast(`Application ${appId} marked as Dispatched!`, 'success');
  };

  const claimJob = (appId, officerName = 'Officer Wickramasinghe') => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          assignedOfficer: officerName,
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Claimed by Officer',
              date: new Date().toLocaleString(),
              note: `Assigned to ${officerName} from Verification Job Pool.`
            }
          ]
        };
      }
      return app;
    }));
    addToast(`Job ${appId} claimed into your active workbench!`, 'info');
  };

  const unclaimJob = (appId) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          assignedOfficer: null,
          trackingHistory: [
            ...app.trackingHistory,
            {
              status: 'Returned to Job Pool',
              date: new Date().toLocaleString(),
              note: 'Released back to central job pool for available verification officers.'
            }
          ]
        };
      }
      return app;
    }));
    addToast(`Job ${appId} returned to unassigned pool.`, 'info');
  };

  const claimNextJob = (officerName = 'Officer Wickramasinghe') => {
    const unassigned = applications.find(
      a => a.status === 'PENDING_VERIFICATION' && !a.assignedOfficer
    );
    if (!unassigned) {
      addToast('No unassigned pending jobs available in the pool right now.', 'info');
      return null;
    }
    claimJob(unassigned.id, officerName);
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
