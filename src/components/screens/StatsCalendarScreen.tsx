import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  TrendingUp,
  Heart
} from 'lucide-react';
import { TaskCompletion, TasbeehSession, UserSettings } from '../../types';
import { formatArabicNumber, HIJRI_MONTHS, ARABIC_DAYS, getHijriDateDetails } from '../../utils/arabicUtils';

interface StatsCalendarScreenProps {
  completions: TaskCompletion[];
  sessions: TasbeehSession[];
  streakCount: number;
  longestStreak: number;
  settings: UserSettings;
}

export const StatsCalendarScreen: React.FC<StatsCalendarScreenProps> = ({
  completions,
  sessions,
  streakCount,
  longestStreak,
  settings
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Aggregate stats
  const totalTasbeehPraises = sessions.reduce((acc, s) => acc + s.finalCount, 0);
  const totalCompletedTasksCount = completions.length;

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 to 11

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create set of completion dates
  const taskDatesMap = new Map<string, number>();
  completions.forEach(c => {
    const count = taskDatesMap.get(c.date) || 0;
    taskDatesMap.set(c.date, count + 1);
  });

  const tasbeehDatesMap = new Map<string, number>();
  sessions.forEach(s => {
    const total = tasbeehDatesMap.get(s.date) || 0;
    tasbeehDatesMap.set(s.date, total + s.finalCount);
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* 1. Spiritual Encouragement Hero */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/50">
        <div className="flex items-center gap-2 mb-2 text-amber-300">
          <Heart className="w-4 h-4 fill-amber-400" />
          <span className="text-xs font-bold">بشارة وهداية نبوية</span>
        </div>
        <p className="font-amiri text-lg text-amber-100 font-bold leading-relaxed">
          «أَحَبُّ الْأَعْمَالِ إِلَى اللهِ أَدْوَمُهَا وَإِنْ قَلَّ»
        </p>
        <p className="text-xs text-emerald-200/80 mt-1">
          الاستمرار في الطاعة ولو بركعتين أو تسبيحات معدودات يثمر طمأنينة القلب وثبات الإيمان.
        </p>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-800/60 text-center">
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-700/40">
            <span className="text-[11px] text-emerald-200 block">الأيام المتتالية</span>
            <span className="text-xl font-black text-amber-300 font-mono">
              {formatArabicNumber(streakCount, settings.useArabicNumerals)}
            </span>
          </div>
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-700/40">
            <span className="text-[11px] text-emerald-200 block">إجمالي التسبيحات</span>
            <span className="text-xl font-black text-white font-mono">
              {formatArabicNumber(totalTasbeehPraises, settings.useArabicNumerals)}
            </span>
          </div>
          <div className="bg-emerald-950/50 p-2.5 rounded-2xl border border-emerald-700/40">
            <span className="text-[11px] text-emerald-200 block">العبادات المنجزة</span>
            <span className="text-xl font-black text-amber-300 font-mono">
              {formatArabicNumber(totalCompletedTasksCount, settings.useArabicNumerals)}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Monthly Calendar */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>{monthNamesArabic[month]} {formatArabicNumber(year, settings.useArabicNumerals)}</span>
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 cursor-pointer"
              title="الشهر السابق"
              aria-label="الشهر السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 cursor-pointer"
              title="الشهر القادم"
              aria-label="الشهر القادم"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 mb-2">
          {ARABIC_DAYS.map(d => (
            <div key={d} className="py-1">
              {d.slice(0, 2)}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 rounded-xl" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const fullDateStr = `${year}-${mStr}-${dStr}`;

            const taskCount = taskDatesMap.get(fullDateStr) || 0;
            const dhikrCount = tasbeehDatesMap.get(fullDateStr) || 0;
            const hasActivity = taskCount > 0 || dhikrCount > 0;

            const isToday =
              new Date().toISOString().split('T')[0] === fullDateStr;

            return (
              <div
                key={fullDateStr}
                className={`h-11 rounded-xl flex flex-col items-center justify-center p-1 text-xs transition-all relative ${
                  isToday
                    ? 'ring-2 ring-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                    : hasActivity
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60'
                    : 'bg-stone-50 dark:bg-stone-800/30'
                }`}
              >
                <span
                  className={`font-semibold ${
                    isToday
                      ? 'text-amber-600 font-extrabold'
                      : hasActivity
                      ? 'text-emerald-900 dark:text-emerald-300'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {formatArabicNumber(dayNum, settings.useArabicNumerals)}
                </span>

                {/* Activity Dots */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {taskCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title={`${taskCount} عبادات`} />
                  )}
                  {dhikrCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title={`${dhikrCount} تسبيحة`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>عبادة مكتملة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>جلسة تسبيح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full ring-2 ring-amber-400" />
            <span>اليوم الحالي</span>
          </div>
        </div>
      </section>

      {/* 3. Streaks and Dedication Highlights */}
      <section className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <span className="text-xs text-stone-500 block">أطول سلسلة التزام</span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-0.5 block">
            {formatArabicNumber(longestStreak, settings.useArabicNumerals)}
            <span className="text-xs text-stone-400 font-normal mr-1">أيام</span>
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs text-stone-500 block">إجمالي جلسات المسبحة</span>
          <span className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono mt-0.5 block">
            {formatArabicNumber(sessions.length, settings.useArabicNumerals)}
            <span className="text-xs text-stone-400 font-normal mr-1">جلسة</span>
          </span>
        </div>
      </section>
    </div>
  );
};
