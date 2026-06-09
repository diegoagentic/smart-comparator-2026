import { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

interface AuthToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function AuthToast({ toast, onDismiss }: AuthToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  // Vivid solid backgrounds matching prod toast style — high contrast,
  // white text/icons over saturated brand-ish backgrounds.
  const config = {
    success: {
      icon: CheckCircleIcon,
      bg: 'bg-emerald-600 dark:bg-emerald-500',
      border: 'border-emerald-700/30 dark:border-emerald-400/30',
      iconColor: 'text-white',
      textColor: 'text-white',
    },
    error: {
      icon: ExclamationCircleIcon,
      bg: 'bg-red-600 dark:bg-red-500',
      border: 'border-red-700/30 dark:border-red-400/30',
      iconColor: 'text-white',
      textColor: 'text-white',
    },
    info: {
      icon: InformationCircleIcon,
      bg: 'bg-blue-600 dark:bg-blue-500',
      border: 'border-blue-700/30 dark:border-blue-400/30',
      iconColor: 'text-white',
      textColor: 'text-white',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${config.bg} ${config.border} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`text-sm font-medium flex-1 ${config.textColor}`}>{toast.message}</p>
      {toast.action && (
        <button
          onClick={() => {
            toast.action!.onClick();
            setIsVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className={`shrink-0 text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md hover:bg-foreground/5 transition-colors ${config.textColor}`}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => { setIsVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
        title="Dismiss"
        aria-label="Dismiss"
        className={`shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Toast Container ---

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2">
      {toasts.map((toast) => (
        <AuthToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// --- Hook ---

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (type: ToastType, message: string, action?: ToastAction) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, action }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
