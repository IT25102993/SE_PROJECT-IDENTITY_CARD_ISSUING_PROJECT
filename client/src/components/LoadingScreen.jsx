import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export const LoadingScreen = ({
  message = 'Loading...',
  subtext = 'Department of Registration of Persons',
  duration = 3000,
  icon: CustomIcon
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="minimal-loader-overlay">
      <div className="minimal-loader-card">
        <div className="minimal-loader-ambient" />

        <div className="minimal-loader-emblem">
          <div className="ring ring-outer" />
          <div className="ring ring-inner" />
          <div className="icon-center">
            {CustomIcon ? <CustomIcon size={24} /> : <Cpu size={24} />}
          </div>
        </div>

        <div className="minimal-loader-brand">
          <div className="brand-badge">
            <span className="dot-live" /> Government Security Portal
          </div>
          <div className="brand-title">{message}</div>
          <div className="brand-sub">{subtext}</div>
        </div>

        <div className="minimal-loader-progress-box">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <div className="progress-glow-head" style={{ left: `${progress}%` }} />
          </div>

          <div className="progress-meta">
            <span className="status-text">Processing cryptographic handshake...</span>
            <span className="percent-text">{progress}%</span>
          </div>
        </div>

        <div className="minimal-loader-footer">
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>ISO 27001 Certified • National Biometric Gateway</span>
        </div>
      </div>
    </div>
  );
};
