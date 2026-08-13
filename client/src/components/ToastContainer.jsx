import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let className = 'toast toast-info';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          className = 'toast toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          className = 'toast toast-error';
        }

        return (
          <div key={toast.id} className={className}>
            <Icon size={20} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500 }}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
