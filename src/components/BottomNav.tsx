import React from 'react';
import { Home, CheckSquare, Sparkles, BookOpen, Scroll, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
  onOpenMore
}) => {
  const isMoreActive = ['stats', 'favorites', 'reminders', 'settings'].includes(activeScreen);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'tasks', label: 'العبادات', icon: CheckSquare },
    { id: 'tasbeeh', label: 'المسبحة', icon: Sparkles, isHighlight: true },
    { id: 'adhkar', label: 'الأذكار', icon: BookOpen },
    { id: 'hadith', label: 'صحيح مسلم', icon: Scroll },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-emerald-900/40 text-stone-300 py-1 px-2 shadow-2xl safe-area-pb"
      aria-label="شريط التنقل السفلي"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -top-3 flex flex-col items-center justify-center group focus:outline-none cursor-pointer"
                aria-label={item.label}
              >
                <div
                  className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-amber-500 to-emerald-600 text-white ring-4 ring-emerald-900/50 shadow-emerald-900/50 scale-105'
                      : 'bg-emerald-800 text-amber-200 hover:bg-emerald-700 ring-2 ring-emerald-600/40'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[11px] font-bold mt-1 ${isActive ? 'text-amber-400' : 'text-stone-300'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all focus:outline-none cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all focus:outline-none cursor-pointer ${
            isMoreActive
              ? 'text-amber-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="المزيد من القوائم"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">المزيد</span>
        </button>
      </div>
    </nav>
  );
};
