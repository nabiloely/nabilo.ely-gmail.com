import React from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { InAppToast } from '../utils/notificationService';

interface ToastBannerProps {
  toasts: InAppToast[];
  onDismiss: (id: string) => void;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 rounded-2xl bg-emerald-900/95 text-stone-100 shadow-xl border border-amber-400/40 backdrop-blur-md flex items-start justify-between gap-3 animate-in slide-in-from-top duration-300"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              {toast.type === 'reminder' ? (
                <Bell className="w-4 h-4 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                {toast.title}
              </h4>
              <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-lg text-emerald-300 hover:text-white cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
