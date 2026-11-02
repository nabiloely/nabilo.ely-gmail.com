import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  ArrowLeft,
  Flame,
  Bell,
  Clock,
  Share2,
  Bookmark,
  Check,
  Calendar
} from 'lucide-react';
import { WorshipTask, DhikrItem, UserSettings, Hadith, ReminderItem } from '../../types';
import { formatArabicNumber, formatPercentage, getHijriDateDetails, getSpiritualGreeting } from '../../utils/arabicUtils';
import { calculateDailyCompletionRate } from '../../utils/taskCalculations';

interface DashboardScreenProps {
  tasks: WorshipTask[];
  onToggleTask: (taskId: string) => void;
  activeDhikr: DhikrItem;
  tasbeehCount: number;
  tasbeehTarget: number;
  onQuickTasbeehTap: () => void;
  dailyHadith: Hadith;
  isHadithFavorite: boolean;
  onToggleHadithFavorite: (hadithId: string) => void;
  morningAdhkarProgress: number; // 0 to 100
  eveningAdhkarProgress: number; // 0 to 100
  reminders: ReminderItem[];
  streakCount: number;
  totalDhikrToday: number;
  settings: UserSettings;
  onNavigate: (screen: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  tasks,
  onToggleTask,
  activeDhikr,
  tasbeehCount,
  tasbeehTarget,
  onQuickTasbeehTap,
  dailyHadith,
  isHadithFavorite,
  onToggleHadithFavorite,
  morningAdhkarProgress,
  eveningAdhkarProgress,
  reminders,
  streakCount,
  totalDhikrToday,
  settings,
  onNavigate,
  onShowToast
}) => {
  const hijri = getHijriDateDetails();
  const greeting = getSpiritualGreeting();
  const completionRate = calculateDailyCompletionRate(tasks);

  // Active upcoming reminders
  const activeReminders = reminders.filter(r => r.enabled).slice(0, 2);

  const copyHadith = () => {
    const text = `${dailyHadith.textArabic}\n\n[${dailyHadith.referenceSource}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast('تم نسخ الحديث الشريف إلى الحافظة');
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* 1. Header Hero: Spiritual Greeting & Hijri Date */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-stone-100 p-5 shadow-lg border border-emerald-700/40">
        <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-amber-300 text-xs font-semibold mb-2 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{hijri.formattedArabic}</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {greeting.greeting}
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 font-amiri text-lg">
              {greeting.subtext}
            </p>
          </div>

          {/* Today's completion rate ring badge */}
          <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-sm p-3 rounded-2xl border border-emerald-600/30">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-950/80 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 stroke-current transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-amber-200">
                {formatPercentage(completionRate, settings.useArabicNumerals)}
              </span>
            </div>
            <div>
              <p className="text-xs text-emerald-200/80 font-medium">إنجاز العبادات</p>
              <p className="text-sm font-bold text-white">
                {formatArabicNumber(tasks.filter(t => t.isCompleted).length, settings.useArabicNumerals)} من {formatArabicNumber(tasks.length, settings.useArabicNumerals)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Adhkar Shortcuts (Morning & Evening) */}
      <section className="grid grid-cols-2 gap-3">
        {/* Morning Adhkar Card */}
        <button
          onClick={() => onNavigate('adhkar')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-amber-500/15 via-emerald-600/10 to-emerald-800/15 dark:bg-stone-900 border border-amber-500/20 dark:border-amber-500/10 shadow-sm text-right group hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {formatPercentage(morningAdhkarProgress, settings.useArabicNumerals)}
            </span>
          </div>
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">أذكار الصباح</h2>
          <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">بركة البكور وحفظ اليوم</p>
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${morningAdhkarProgress}%` }}
            />
          </div>
        </button>

        {/* Evening Adhkar Card */}
        <button
          onClick={() => onNavigate('adhkar')}
          className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-indigo-500/15 via-emerald-700/10 to-teal-900/15 dark:bg-stone-900 border border-indigo-500/20 dark:border-indigo-500/10 shadow-sm text-right group hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {formatPercentage(eveningAdhkarProgress, settings.useArabicNumerals)}
            </span>
          </div>
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">أذكار المساء</h2>
          <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">سكينة النفس وحصن الليل</p>
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${eveningAdhkarProgress}%` }}
            />
          </div>
        </button>
      </section>

      {/* 3. Smart Tasbeeh Interactive Hero Card */}
      <section className="rounded-3xl bg-stone-900 text-stone-100 p-5 shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-200">المسبحة الإلكترونية السريعة</h2>
              <span className="text-[11px] text-stone-400">اضغط للتسبيح مباشرة أو افتح الشاشة الكاملة</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('tasbeeh')}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold px-2 py-1 rounded-lg bg-emerald-950/70 border border-amber-500/20 cursor-pointer"
          >
            <span>الشاشة الكاملة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-right">
            <p className="text-lg font-amiri font-bold text-amber-200 leading-snug">
              {activeDhikr.text}
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm line-clamp-1">
              {activeDhikr.virtue || 'أجر عظيم وثواب مضاعف'}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-stone-300">
              <span className="bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700">
                الهدف: {formatArabicNumber(tasbeehTarget, settings.useArabicNumerals)}
              </span>
              <span className="bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700">
                اليوم: {formatArabicNumber(totalDhikrToday, settings.useArabicNumerals)} تسبيحة
              </span>
            </div>
          </div>

          {/* Quick Tap Button with Ripple */}
          <button
            onClick={onQuickTasbeehTap}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 hover:from-emerald-600 hover:to-teal-400 text-white font-extrabold flex flex-col items-center justify-center shadow-lg shadow-emerald-950/60 ring-4 ring-emerald-900/60 active:scale-90 transition-transform cursor-pointer select-none"
            aria-label={`تسبيح: ${activeDhikr.text}`}
          >
            <span className="text-2xl sm:text-3xl font-mono leading-none">
              {formatArabicNumber(tasbeehCount, settings.useArabicNumerals)}
            </span>
            <span className="text-[10px] text-emerald-100 font-medium mt-0.5">سبّح</span>
          </button>
        </div>
      </section>

      {/* 4. Daily Worship Tasks (Top 4 Checklist Preview) */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              قائمة العبادات اليومية
            </h2>
            <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
              حدد ما أتممته اليوم من صلوات وأوراد
            </p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الكل ({formatArabicNumber(tasks.length, settings.useArabicNumerals)})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                task.isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/40'
                  : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    task.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'text-stone-400 hover:text-emerald-600'
                  }`}
                  aria-label={task.isCompleted ? `إلغاء إتمام ${task.title}` : `إتمام ${task.title}`}
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p
                    className={`text-sm font-bold ${
                      task.isCompleted
                        ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-75'
                        : 'text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.time && (
                    <span className="text-[11px] text-stone-700 dark:text-stone-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {task.time}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  task.isCompleted
                    ? 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    : 'bg-stone-200/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {task.isCompleted ? 'مكتمل' : 'متبقي'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Daily Authentic Hadith from Sahih Muslim */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-900/10 to-emerald-950/20 dark:bg-stone-900 border border-amber-500/30 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              حديث اليوم من صحيح مسلم
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleHadithFavorite(dailyHadith.id)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-amber-500 transition-colors cursor-pointer"
              aria-label="إضافة الحديث للمفضلة"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isHadithFavorite ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>
            <button
              onClick={copyHadith}
              className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
              aria-label="نسخ نص الحديث"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 dark:bg-stone-950/60 border border-amber-400/20 backdrop-blur-sm">
          <p className="text-stone-900 dark:text-amber-100 font-amiri text-lg leading-relaxed text-right font-medium">
            {dailyHadith.textArabic}
          </p>
          <div className="mt-3 pt-3 border-t border-stone-200/70 dark:border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-700 dark:text-stone-300">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
              {dailyHadith.referenceSource}
            </span>
            <button
              onClick={() => onNavigate('hadith')}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              تصفح مكتبة صحيح مسلم ←
            </button>
          </div>
        </div>
      </section>

      {/* 6. Upcoming Reminders Card */}
      {activeReminders.length > 0 && (
        <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                التذكيرات القادمة
              </h2>
            </div>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              إدارة التذكيرات
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeReminders.map(rem => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60"
              >
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    {rem.title}
                  </p>
                  <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
                    {rem.subtitle}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                  {rem.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
