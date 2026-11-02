import React from 'react';
import { Calendar, Bookmark, Bell, Settings, X, Sparkles, ChevronLeft, Smartphone } from 'lucide-react';

interface MoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  activeScreen: string;
  onOpenInstallModal?: () => void;
}

export const MoreMenuModal: React.FC<MoreMenuModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activeScreen,
  onOpenInstallModal,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'stats',
      label: 'التقويم والإحصائيات',
      desc: 'سجل الالتزام وسلسلة الأيام وإجمالي التسبيح',
      icon: Calendar,
      color: 'from-amber-500 to-amber-700'
    },
    {
      id: 'favorites',
      label: 'المفضلة والمحفوظات',
      desc: 'الأحاديث والأذكار التي قمت بتمييزها',
      icon: Bookmark,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'reminders',
      label: 'مركز التنبيهات والتذكيرات',
      desc: 'إدارة مواعيد أذكار الصباح والمساء والصلوات',
      icon: Bell,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'settings',
      label: 'الإعدادات والنسخ الاحتياطي',
      desc: 'السمة، الأرقام، التنبيهات الصوتية، وحفظ البيانات',
      icon: Settings,
      color: 'from-stone-600 to-stone-800'
    }
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const handleInstallClick = () => {
    onClose();
    if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-right animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
              قوائم إضافية
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Special Install Card in More Menu */}
        {onOpenInstallModal && (
          <button
            onClick={handleInstallClick}
            className="w-full mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shadow-md hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer text-right border border-amber-400/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>تثبيت التطبيق على هاتفك</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/30 text-amber-200 font-normal">
                    PWA
                  </span>
                </p>
                <p className="text-[11px] text-emerald-100/90 mt-0.5">
                  طريقة التنزيل للآيفون والأندرويد بدون متجر تطبيقات
                </p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-emerald-200" />
          </button>
        )}

        <div className="space-y-2.5 mt-3">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isCurrent = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-stone-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
