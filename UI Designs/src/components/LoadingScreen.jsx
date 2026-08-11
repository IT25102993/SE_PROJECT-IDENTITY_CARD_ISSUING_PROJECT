import React, { useState, useEffect } from 'react';
import { ShieldCheck, CreditCard, Sparkles, Lock, Cpu } from 'lucide-react';

export const LoadingScreen = ({
  message = 'Initializing System...',
  subtext = 'Sri Lanka Department of Registration of Persons',
  fullScreen = true,
  progress: externalProgress = null,
  autoComplete = true,
  duration = 3500,
  onComplete = null,
  icon: IconComponent = ShieldCheck
}) => {
  const [internalProgress, setInternalProgress] = useState(0);

  // Auto-progress simulation if no external progress provided
  useEffect(() => {
    if (externalProgress !== null) return;

    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) setTimeout(onComplete, 200);
          return 100;
        }
        return Math.min(100, prev + increment + (Math.random() * 2));
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [externalProgress, duration, onComplete]);

  const currentProgress = externalProgress !== null ? externalProgress : Math.floor(internalProgress);

  const getDynamicStatusText = (prog) => {
    if (prog < 25) return 'Establishing secure cryptographic tunnel...';
    if (prog < 55) return 'Loading national identity registry...';
    if (prog < 85) return 'Verifying biometric verification modules...';
    if (prog < 100) return 'Finalizing system interface...';
    return 'System Ready';
  };

  const content = (
    <div className="minimal-loader-card">
      {/* Background ambient lighting */}
      <div className="minimal-loader-ambient" />

      {/* Central Emblem with Dual Rotating Rings */}
      <div className="minimal-loader-emblem">
        <div className="ring ring-outer" />
        <div className="ring ring-inner" />
        <div className="icon-center">
          <IconComponent size={28} className="emblem-icon" />
        </div>
      </div>

      {/* Brand Header */}
      <div className="minimal-loader-brand">
        <div className="brand-badge">
          <span className="dot-live" />
          <span>SECURE SYSTEM</span>
        </div>
        <h2 className="brand-title">NEXUS GOV</h2>
        <p className="brand-sub">{message}</p>
      </div>

      {/* Progress Bar Container */}
      <div className="minimal-loader-progress-box">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${currentProgress}%` }}
          />
          <div
            className="progress-glow-head"
            style={{ left: `${currentProgress}%` }}
          />
        </div>
        <div className="progress-meta">
          <span className="status-text">{getDynamicStatusText(currentProgress)}</span>
          <span className="percent-text">{currentProgress}%</span>
        </div>
      </div>

      {/* Micro Footer Meta */}
      <div className="minimal-loader-footer">
        <Lock size={12} style={{ opacity: 0.6 }} />
        <span>{subtext}</span>
      </div>
    </div>
  );

  if (!fullScreen) {
    return <div className="minimal-loader-inline">{content}</div>;
  }

  return (
    <div className="minimal-loader-overlay animate-fade-in">
      {content}
    </div>
  );
};

export default LoadingScreen;
