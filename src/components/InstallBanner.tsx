import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, QrCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallBannerProps {
  onOpenInstallModal: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onOpenInstallModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('athkar_pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  // Do not show banner if already running in standalone PWA mode or explicitly dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('athkar_pwa_banner_dismissed', 'true');
  };

  const handleQuickInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      await install();
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-3.5 py-2.5 border-b border-amber-400/20 shadow-sm transition-all duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 cursor-pointer flex-1" onClick={onOpenInstallModal}>
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-amber-300 animate-bounce" />
          </div>
          <div>
            <div className="font-bold text-amber-200 flex items-center gap-1.5">
              <span>تثبيت تطبيق أذكاري على هاتفك</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80 line-clamp-1">
              استخدمه كـتطبيق مستقل مع شاشة كاملة وبدون إنترنت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleQuickInstall}
            className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تنزيل وتثبيت</span>
            <span className="sm:hidden">تثبيت</span>
          </button>

          <button
            onClick={onOpenInstallModal}
            title="عرض رمز QR"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition hidden md:flex items-center"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDismiss}
            title="إخفاء التنبيه"
            className="p-1 rounded-lg text-emerald-200/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
