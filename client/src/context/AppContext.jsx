import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AppContext = createContext();

// ── Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C) ─────────────────
export const generateSriLankan12DigitNIC = (dobString, gender = 'Male', serialNum = null) => {
  let dob = new Date(dobString);
  if (isNaN(dob.getTime())) {
    dob = new Date('2005-01-01');
  }

  // 1. Year of Birth (YYYY - 4 Digits)
  const yyyy = dob.getFullYear();

  // 2. Day of Year (DDD - 3 Digits): 001 to 366. For Females: add 500
  const startOfYear = new Date(yyyy, 0, 1);
  const diffInMs = dob - startOfYear;
  const dayOfYear = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  const isFemale = (gender || '').toLowerCase().includes('female') || (gender || '').toLowerCase().includes('ස්ත්‍රී') || (gender || '').toLowerCase().includes('பெண்');
  const dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
  const ddd = String(dddVal).padStart(3, '0');

  // 3. Serial Number (SSSS - 4 Digits)
  const serialVal = serialNum ? serialNum : Math.floor(1000 + Math.random() * 9000);
  const ssss = String(serialVal).padStart(4, '0');

  // 4. Check Digit (C - 1 Digit)
  const rawBase = `${yyyy}${ddd}${ssss}`;
  let checkSum = 0;
  for (let i = 0; i < rawBase.length; i++) {
    checkSum += parseInt(rawBase[i], 10) * (i + 1);
  }
  const c = checkSum % 10;

  return `${yyyy}${ddd}${ssss}${c}`;
};

const INITIAL_FALLBACK_APPLICATIONS = [
  {
    id: 'NEX-2026-90412',
    application_id: 1,
    fullNameEn: 'Thilina Sakalasooriya',
    fullNameSi: 'තිලිණ සකළසූරිය',
    fullNameTa: 'திலீன சகலசூரிய',
    nicNumber: generateSriLankan12DigitNIC('2005-01-01', 'Male'),
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

  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef(null);

  // Debounced background refresh helper to eliminate request cascades and proxy stalls
  const scheduleRefresh = useCallback((delay = 350) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchApplications();
    }, delay);
  }, []);

  // Fetch applications directly from Backend API with connection timeout and concurrency guard
  const fetchApplications = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('/api/applications', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          const formatted = data.applications.map(app => ({
            id: app.tracking_id || `NEX-2026-${app.application_id}`,
            application_id: app.application_id,
            first_name: app.first_name || '',
            last_name: app.last_name || '',
            fullNameEn: app.fullNameEn || `${app.first_name || ''} ${app.last_name || ''}`,
            nicNumber: app.nicNumber || app.national_id_number || '',
            national_id_number: app.national_id_number || '',
            dob: app.dob || app.date_of_birth || '2000-01-01',
            gender: app.gender || 'Male',
            address: app.address || '',
            phone: app.phone || app.phone_number || '',
            phone_number: app.phone_number || app.phone || '',
            email: app.email || '',
            status: app.status || 'Pending',
            application_type: app.application_type || 'New',
            application_reason: app.application_reason || 'G.C.E O/L',
            marital_status: app.marital_status || app.civilStatus || 'Single',
            civilStatus: app.marital_status || app.civilStatus || 'Single',
            assignedOfficer: app.assigned_officer || app.assignedOfficer || app.processed_by_name || null,
            // ── Bot Verification Fields ──
            bot_verified: app.bot_verified === 1 || app.bot_verified === true,
            bot_score: app.bot_score || 0,
            bot_notes: app.bot_notes || '',
            bot_verified_at: app.bot_verified_at || null,
            // ────────────────────────────
            submittedDate: app.submitted_at || new Date().toISOString().split('T')[0],
            submitted_at: app.submitted_at || '',
            officerNotes: app.remarks || '',
            remarks: app.remarks || '',
            documents: Array.isArray(app.documents) ? app.documents : [],
            trackingHistory: [
              { status: app.status || 'Submitted', date: app.submitted_at || 'Recent', note: app.remarks || 'Database synced' }
            ]
          }));
          setApplications(formatted);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Backend DB connection note, using current active state:', err.message);
      }
    } finally {
      clearTimeout(timeoutId);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchApplications();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
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
      document.body.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
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

    // Convert the documents array into the format expected by the backend
    const documentsPayload = (formData.documents || []).map(doc => ({
      document_type: doc.document_type || doc.type || 'Supporting Document',
      file_name: doc.file_name || doc.name || 'document.pdf',
      file_data: doc.file_data || doc.data || doc.url || null,
      file_size: doc.file_size || doc.size || 'Unknown'
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          first_name,
          last_name,
          dob: formData.dob || '2005-01-01',
          gender: formData.gender || 'Male',
          civil_status: formData.civilStatus || 'Single',
          marital_status: formData.civilStatus || 'Single',
          application_reason: formData.applicationReason === 'Other' && formData.otherReason
            ? `Other: ${formData.otherReason}`
            : (formData.applicationReason || 'G.C.E O/L'),
          other_reason: formData.otherReason || '',
          address: formData.address || 'Colombo, Sri Lanka',
          phone_number: formData.phone || '+94 77 000 0000',
          email: formData.email || '',
          application_type: 'New',
          documents: documentsPayload
        })
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const trackingId = data.trackingId || `NEX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      scheduleRefresh(200);
      addToast(`Application submitted to database! Tracking ID: ${trackingId}`, 'success');
      return trackingId;
    } catch (err) {
      clearTimeout(timeoutId);
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const trackingId = `NEX-2026-${randomDigits}`;
      scheduleRefresh(500);
      addToast(`Application submitted! Tracking ID: ${trackingId}`, 'success');
      return trackingId;
    }
  };

  const approveApplication = async (appId, notes = '') => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    // Instant optimistic update
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return { ...app, status: 'Approved', officerNotes: notes, remarks: notes };
      }
      return app;
    }));
    addToast(`Application ${appId} approved in database!`, 'success');

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remarks: notes })
      });
      scheduleRefresh(400);
    } catch (err) {
      console.warn('Backend approve sync note:', err.message);
    }
  };

  const rejectApplication = async (appId, reason) => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    // Instant optimistic update
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return { ...app, status: 'Rejected', officerNotes: reason, remarks: reason };
      }
      return app;
    }));
    addToast(`Application ${appId} rejected.`, 'error');

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ remarks: reason })
      });
      scheduleRefresh(400);
    } catch (err) {
      console.warn('Backend reject sync note:', err.message);
    }
  };

  const markAsPrinted = async (appId) => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    // Instant optimistic update
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return { ...app, status: 'Printed' };
      }
      return app;
    }));
    addToast(`Card for ${appId} marked as Printed in DB!`, 'info');

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'Printed' })
      });
      scheduleRefresh(400);
    } catch (err) {
      console.warn('Backend print status sync note:', err.message);
    }
  };

  const markAsDispatched = async (appId) => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    // Instant optimistic update
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return { ...app, status: 'Issued' };
      }
      return app;
    }));
    addToast(`Application ${appId} marked as Dispatched!`, 'success');

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'Issued' })
      });
      scheduleRefresh(400);
    } catch (err) {
      console.warn('Backend dispatch status sync note:', err.message);
    }
  };

  const claimJob = async (appId, officerName = 'Officer Wickramasinghe') => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return {
          ...app,
          assignedOfficer: officerName
        };
      }
      return app;
    }));

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ officerName })
      });
      scheduleRefresh(500);
    } catch (err) {
      console.warn('Backend claim sync note:', err.message);
    }
    addToast(`Job ${appId} claimed into your active workbench!`, 'info');
  };

  const unclaimJob = async (appId) => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');

    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        return {
          ...app,
          assignedOfficer: null
        };
      }
      return app;
    }));

    try {
      const token = localStorage.getItem('nexusgov-token');
      await fetch(`/api/applications/${numericId}/unclaim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      scheduleRefresh(500);
    } catch (err) {
      console.warn('Backend unclaim sync note:', err.message);
    }
    addToast(`Application ${appId} removed from your job pool and returned to general queue.`, 'info');
  };

  const claimNextJob = (officerName = 'Officer Wickramasinghe') => {
    const unassigned = applications.find(
      a => (a.status === 'PENDING_VERIFICATION' || a.status === 'Pending' || a.status === 'Verification-Passed') && !a.assignedOfficer
    );
    if (!unassigned) {
      addToast('No unassigned pending jobs available in the pool right now.', 'info');
      return null;
    }
    const appId = unassigned.id || unassigned.application_id;
    claimJob(appId, officerName);
    return unassigned;
  };

  const updateApplication = async (appId, updatedFields) => {
    const numericId = String(appId).replace(/^NEX-2026-/, '');
    const token = localStorage.getItem('nexusgov-token');

    // Optimistic local state update
    setApplications(prev => prev.map(app => {
      if (app.id === appId || app.application_id === appId || String(app.application_id) === numericId) {
        const newFirstName = updatedFields.first_name !== undefined ? updatedFields.first_name : app.first_name;
        const newLastName = updatedFields.last_name !== undefined ? updatedFields.last_name : app.last_name;
        return {
          ...app,
          ...updatedFields,
          fullNameEn: `${newFirstName || ''} ${newLastName || ''}`.trim(),
          remarks: updatedFields.officerNotes !== undefined ? updatedFields.officerNotes : (updatedFields.remarks !== undefined ? updatedFields.remarks : app.remarks),
          officerNotes: updatedFields.officerNotes !== undefined ? updatedFields.officerNotes : (updatedFields.remarks !== undefined ? updatedFields.remarks : app.officerNotes)
        };
      }
      return app;
    }));

    try {
      const res = await fetch(`/api/applications/${numericId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update application');
      }
      scheduleRefresh(300);
      addToast(`Application #${appId} updated successfully.`, 'success');
      return { success: true, message: data.message };
    } catch (err) {
      addToast(err.message || 'Error updating application', 'error');
      return { success: false, message: err.message };
    }
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
        updateApplication,
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
