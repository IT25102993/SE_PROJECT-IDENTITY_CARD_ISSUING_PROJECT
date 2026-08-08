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
    photoUrl: '/images/index/photo-placeholder.png',
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
    submittedDate: '2026-08-06',
    officerNotes: '',
    documents: ['Birth Certificate (PDF)', 'Grama Niladhari Certificate (JPG)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-06 11:45 AM', note: 'Application submitted successfully. Awaiting verification officer assignment.' }
    ]
  },
  {
    id: 'NEX-2026-92004',
    fullNameEn: 'Mohamed Rizwan',
    fullNameSi: 'මොහොමඩ් රිස්වාන්',
    fullNameTa: 'முகமது ரிஸ்வான்',
    nicNumber: '199831204590',
    dob: '1998-11-20',
    gender: 'Male',
    civilStatus: 'Married',
    address: 'No. 88, Beach Road, Galle',
    district: 'Galle',
    divisionalSecretariat: 'Four Gravets',
    gnDivision: 'Fort (102C)',
    phone: '+94 76 555 4321',
    email: 'm.rizwan@outlook.com',
    photoUrl: '',
    signature: 'M. Rizwan',
    status: 'APPROVED',
    submittedDate: '2026-08-05',
    officerNotes: 'Information verified against national registration database.',
    documents: ['Marriage Certificate (PDF)', 'Existing NIC Copy (JPG)', 'Grama Niladhari Certificate (PDF)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-05 08:20 AM', note: 'Data correction application submitted.' },
      { status: 'Approved & NIC Issued', date: '2026-08-07 01:10 PM', note: 'Approved by Senior Officer Jayawardena. Sent to Print Queue.' }
    ]
  },
  {
    id: 'NEX-2026-92410',
    fullNameEn: 'Santhosh Kumar',
    fullNameSi: 'සන්තෝෂ් කුමාර්',
    fullNameTa: 'சந்தோஷ் குமார்',
    nicNumber: '200609801234',
    dob: '2006-03-25',
    gender: 'Male',
    civilStatus: 'Single',
    address: 'No. 14, Station Road, Jaffna',
    district: 'Jaffna',
    divisionalSecretariat: 'Nallur',
    gnDivision: 'Nallur East (J/108)',
    phone: '+94 75 222 3344',
    email: 'skumar@gmail.com',
    photoUrl: '',
    signature: 'S. Kumar',
    status: 'PRINTED',
    submittedDate: '2026-08-04',
    officerNotes: 'First-time NIC application verified.',
    documents: ['Birth Certificate (PDF)', 'School Leaving Certificate (PDF)', 'Grama Niladhari Certificate (JPG)'],
    trackingHistory: [
      { status: 'Submitted', date: '2026-08-04 03:00 PM', note: 'First-time NIC application registered.' },
      { status: 'Approved & NIC Issued', date: '2026-08-05 09:30 AM', note: 'Identity validated.' },
      { status: 'Printed PVC', date: '2026-08-07 04:00 PM', note: 'PVC Card printed successfully.' }
    ]
  }
];

export const AppProvider = ({ children }) => {
  const [role, setRole] = useState('citizen'); // 'citizen' | 'officer' | 'printer' | 'admin'
  const [theme, setTheme] = useState(() => localStorage.getItem('nexusgov-theme') || 'dark');
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('nexusgov-applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('nexusgov-applications', JSON.stringify(applications));
  }, [applications]);

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

  // Citizen submission
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

  // Verification Officer approval
  const approveApplication = (appId, notes = '') => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        // Generate cryptographic NIC number (e.g. 2005 + 8 random digits)
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

  // Officer rejection
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

  // Printing Tech updates
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
        removeToast
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
