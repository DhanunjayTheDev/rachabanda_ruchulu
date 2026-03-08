import React, { useState } from 'react';
import { useToast, Toast, ToastType } from '@/lib/ToastContext';

const toastColors: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    icon: '✓',
    text: 'text-green-100',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    icon: '✕',
    text: 'text-red-100',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-700',
    icon: '⚠',
    text: 'text-yellow-100',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    icon: 'ℹ',
    text: 'text-blue-100',
  },
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);
  const colors = toastColors[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`${colors.bg} ${colors.border} border backdrop-blur-md rounded-lg shadow-xl overflow-hidden`}
      >
        {/* Main Content */}
        <div className="flex items-start gap-4 p-4">
          {/* Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
            <span className="text-lg font-bold">{colors.icon}</span>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className={`${colors.text} text-sm font-medium break-words`}>{toast.message}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors duration-200 ml-2"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-white/20 w-full">
            <div
              className="h-full bg-white/50 transition-all ease-linear"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="toast-enter fixed top-6 right-6 z-50 space-y-3 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};
