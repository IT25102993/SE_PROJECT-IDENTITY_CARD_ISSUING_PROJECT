import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingScreen = ({
  message = 'Loading...',
  subtext = 'Department of Registration of Persons',
  duration = 2000
}) => {
  const [progress, setProgress] = useState(0);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check saved theme or body class for light theme
    const savedTheme = localStorage.getItem('nexusgov-theme');
    const hasLightClass = document.body.classList.contains('light-theme');
    setIsLight(savedTheme === 'light' || hasLightClass);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight
          ? 'rgba(248, 250, 252, 0.94)'
          : 'rgba(10, 13, 20, 0.94)',
        backdropFilter: 'blur(12px)',
        color: isLight ? '#0f172a' : '#f1f5f9',
        fontFamily: "'Poppins', system-ui, sans-serif",
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '320px',
          width: '90%',
          textAlign: 'center'
        }}
      >
        <Loader2
          size={36}
          style={{
            animation: 'spin 1s linear infinite',
            color: 'var(--accent-primary, #3b82f6)'
          }}
        />

        <div style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '-0.2px' }}>
          {message}
        </div>

        {subtext && (
          <div
            style={{
              fontSize: '0.8rem',
              color: isLight ? '#64748b' : '#94a3b8',
              marginTop: '-0.3rem'
            }}
          >
            {subtext}
          </div>
        )}

        <div
          style={{
            width: '100%',
            height: '3px',
            background: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '0.5rem'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'var(--accent-primary, #3b82f6)',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

