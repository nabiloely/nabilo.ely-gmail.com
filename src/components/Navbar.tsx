import React from 'react';
import { Moon, Sun, Flame, Sparkles, Smartphone } from 'lucide-react';
import { UserSettings } from '../types';
import { formatArabicNumber, getHijriDateDetails } from '../utils/arabicUtils';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  streakCount: number;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  streakCount,
  onNavigate,
  onOpenInstallModal,
}) => {
  const hijri = getHijriDateDetails();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-emerald-950/90 text-stone-100 border-b border-emerald-800/60 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand and Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-right focus:outline-none group cursor-pointer"
          aria-label="الذهاب إلى الشاشة الرئيسية"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-950/30 ring-1 ring-amber-400/40 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wide text-amber-200">أذكاري</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 font-medium">
                Athkar
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium leading-none mt-0.5">
              {hijri.dayName}، {formatArabicNumber(hijri.day, settings.useArabicNumerals)} {hijri.monthName}
            </p>
          </div>
        </button>

        {/* Quick Actions: Install, Streak, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Install on Phone Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-semibold transition active:scale-95"
              title="تثبيت التطبيق على هاتفك"
              aria-label="تثبيت التطبيق على هاتفك"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">تثبيت بالهاتف</span>
              <span className="sm:hidden">تثبيت</span>
            </button>
          )}

          {/* Streak pill */}
          <button
            onClick={() => onNavigate('stats')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-inner"
            title="أيام الالتزام المتتالية"
            aria-label={`أيام الالتزام المتتالية: ${streakCount}`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{formatArabicNumber(streakCount, settings.useArabicNumerals)}</span>
            <span className="text-[10px] text-amber-200/80">يوم</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-amber-300 transition-colors border border-emerald-700/50"
            aria-label={settings.theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
