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

  const config = {
    success: {
      icon: CheckCircleIcon,
      bg: 'bg-green-50 dark:bg-green-500/10',
      border: 'border-green-200 dark:border-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      icon: ExclamationCircleIcon,
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      textColor: 'text-red-800 dark:text-red-200',
    },
    info: {
      icon: InformationCircleIcon,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-800 dark:text-blue-200',
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
