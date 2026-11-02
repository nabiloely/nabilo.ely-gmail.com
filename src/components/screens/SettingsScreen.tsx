import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Vibrate,
  Volume2,
  FileDown,
  FileUp,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Download,
  QrCode,
  Hash,
  Sparkles
} from 'lucide-react';
import { UserSettings } from '../../types';
import { storage } from '../../utils/storage';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onDataRestored: () => void;
  onShowToast: (msg: string) => void;
  onOpenInstallModal?: () => void;
  onOpenWidgetGuide?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onDataRestored,
  onShowToast,
  onOpenInstallModal,
  onOpenWidgetGuide,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    try {
      const dataStr = storage.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `athkar-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('تم تصدير النسخة الاحتياطية بنجاح');
    } catch {
      onShowToast('حدث خطأ أثناء تصدير البيانات');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = storage.importAllData(content);
        if (ok) {
          onShowToast('تم استعادة النسخة الاحتياطية بنجاح');
          onDataRestored();
        } else {
          onShowToast('الملف غير صالح أو تالف');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    storage.resetAllData();
    setShowClearConfirm(false);
    onShowToast('تم مسح جميع البيانات المحلية وإعادة ضبط المصنع');
    onDataRestored();
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/50">
        <h1 className="text-xl font-black">الإعدادات والتفضيلات</h1>
        <p className="text-xs text-emerald-200 mt-1">
          خصص واجهة التطبيق وخيارات الصوت والاهتزاز وتثبيت التطبيق والنسخ الاحتياطي
        </p>
      </section>

      {/* PWA Phone Installation Section */}
      {onOpenInstallModal && (
        <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 shadow-md border border-amber-400/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-200">
                  تثبيت "أذكاري" على الهاتف المحمول (PWA)
                </h2>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  تطبيق مستقل يعمل بدون إنترنت وبدون شريط متصفح
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onOpenInstallModal}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs transition shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>خطوات التثبيت للآيفون والأندرويد</span>
            </button>
            <button
              onClick={onOpenInstallModal}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="عرض رمز QR"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">مسح QR</span>
            </button>
          </div>
        </section>
      )}

      {/* 1. Theme & Appearance */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
          المظهر والسمة
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onUpdateSettings({ theme: 'light' })}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 ring-2 ring-amber-400/40'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>فاتح</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'dark' })}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Moon className="w-5 h-5 text-emerald-400" />
            <span>داكن</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ theme: 'system' })}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
              settings.theme === 'system'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>تلقائي (النظام)</span>
          </button>
        </div>
      </section>

      {/* 2. Language & Numeral Format */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
          تنسيق الأرقام واللغة
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Hash className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                استخدام الأرقام العربية المشرقية (١، ٢، ٣)
              </p>
              <p className="text-[11px] text-stone-500">
                عند التعطيل تُعرض بالأرقام اللاتينية (1, 2, 3)
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.useArabicNumerals}
            onChange={e => onUpdateSettings({ useArabicNumerals: e.target.checked })}
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>
      </section>

      {/* 3. Sensory Feedback (Audio & Vibration) */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
          التنبيه الصوتي والاهتزاز
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                صوت نقرة التسبيح الهادئة
              </p>
              <p className="text-[11px] text-stone-500">
                صوت لطيف يشبه حبات المسبحة الخشبية بدون إزعاج
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={e => onUpdateSettings({ soundEnabled: e.target.checked })}
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                الاهتزاز اللمسي (Haptic Feedback)
              </p>
              <p className="text-[11px] text-stone-500">
                نبضة اهتزاز خفيفة عند كل تسبيحة وعند إكمال الهدف
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.vibrationEnabled}
            onChange={e => onUpdateSettings({ vibrationEnabled: e.target.checked })}
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                إبقاء الشاشة مضاءة أثناء جلسة التسبيح
              </p>
              <p className="text-[11px] text-stone-500">
                يمنع انطفاء الشاشة تلقائياً أثناء الذكر
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.screenAwakeEnabled}
            onChange={e => onUpdateSettings({ screenAwakeEnabled: e.target.checked })}
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>
      </section>

      {/* 4. On-Screen Tasbeeh Widget & Home Screen Widget */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
          ويدجت السبحة السريعة
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                ويدجت السبحة العائم على الشاشة (Floating Widget)
              </p>
              <p className="text-[11px] text-stone-500">
                زر وفقاعة عائمة للتسبيح السريع بلمسة واحدة فوق أي صفحة
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.floatingTasbeehWidget !== false}
            onChange={e => onUpdateSettings({ floatingTasbeehWidget: e.target.checked })}
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>

        {onOpenWidgetGuide && (
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  ويدجت شاشة الهاتف الرئيسية
                </p>
                <p className="text-[11px] text-stone-500">
                  إضافة اختصار مباشر للسبحة على شاشة هاتفك
                </p>
              </div>
            </div>
            <button
              onClick={onOpenWidgetGuide}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
            >
              عرض الطريقة
            </button>
          </div>
        )}
      </section>

      {/* 4. Data Backup, Restore and Reset */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 space-y-4">
        <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
          إدارة البيانات والنسخ الاحتياطي
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            <span>استعادة من ملف JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح جميع البيانات وإعادة تعيين التطبيق</span>
          </button>
        </div>
      </section>

      {/* 5. Privacy & Authenticity Assurance */}
      <section className="p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>خصوصية كاملة وموثوقية شرعية</span>
        </div>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[11px]">
          تطبيق "أذكاري" يعمل محلياً دون الحاجة لحساب أو اتصال إنترنت للأدوات الأساسية. بياناتك وعباداتك وتفضيلاتك محفوظة فقط في متصفح جهازك، دون أي خوادم تتبع أو إعلانات تجارية.
        </p>
      </section>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-1">
              تأكيد مسح جميع البيانات
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              هل أنت متأكد من رغبتك في حذف جميع الجلسات والعبادات والمفضلة وإعادة التطبيق إلى حالته الأصلية؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md cursor-pointer"
              >
                مسح نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
