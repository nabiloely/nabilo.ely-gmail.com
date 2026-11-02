import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Undo2,
  ListFilter,
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  Sun,
  Plus,
  Check,
  History,
  X,
  Sparkles,
  Trophy,
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { DhikrItem, TasbeehSession, UserSettings } from '../../types';
import { formatArabicNumber, formatDurationInArabic } from '../../utils/arabicUtils';
import { calculateProgressPercentage } from '../../utils/tasbeehLogic';
import { sensory } from '../../utils/audioAndSensory';

interface TasbeehScreenProps {
  activeDhikr: DhikrItem;
  dhikrList: DhikrItem[];
  count: number;
  target: number;
  sessionStartTime: number;
  startCount: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onSelectDhikr: (dhikr: DhikrItem) => void;
  onAddCustomDhikr: (text: string, target: number, virtue?: string) => void;
  onUpdateTarget: (newTarget: number) => void;
  sessions: TasbeehSession[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenWidgetGuide?: () => void;
}

export const TasbeehScreen: React.FC<TasbeehScreenProps> = ({
  activeDhikr,
  dhikrList,
  count,
  target,
  sessionStartTime,
  startCount,
  onIncrement,
  onDecrement,
  onReset,
  onSelectDhikr,
  onAddCustomDhikr,
  onUpdateTarget,
  sessions,
  settings,
  onUpdateSettings,
  onOpenWidgetGuide
}) => {
  const [showDhikrModal, setShowDhikrModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSessionsHistory, setShowSessionsHistory] = useState(false);
  const [isCustomDhikrForm, setIsCustomDhikrForm] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTarget, setCustomTarget] = useState(100);
  const [customVirtue, setCustomVirtue] = useState('');
  const [tapEffect, setTapEffect] = useState(false);

  // Screen awake mode
  const [isScreenAwake, setIsScreenAwake] = useState(false);

  useEffect(() => {
    if (settings.screenAwakeEnabled) {
      sensory.requestWakeLock().then(active => {
        setIsScreenAwake(active);
      });
    } else {
      sensory.releaseWakeLock();
      setIsScreenAwake(false);
    }
    return () => {
      sensory.releaseWakeLock();
    };
  }, [settings.screenAwakeEnabled]);

  const handleTap = () => {
    setTapEffect(true);
    setTimeout(() => setTapEffect(false), 120);
    onIncrement();
  };

  const progress = calculateProgressPercentage(count, target);
  const cycles = target > 0 ? Math.floor(count / target) : 0;

  const handleCreateCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddCustomDhikr(customText.trim(), customTarget, customVirtue.trim());
    setCustomText('');
    setCustomVirtue('');
    setIsCustomDhikrForm(false);
    setShowDhikrModal(false);
  };

  const targetsPreset = [33, 100, 1000, 0];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] pb-24 pt-2 max-w-md mx-auto select-none">
      {/* 1. Top Controls Bar: Dhikr Selector, Sound, Vibration, Screen Awake */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDhikrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-900/60 dark:bg-emerald-950/80 border border-emerald-700/60 text-amber-200 text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
          >
            <ListFilter className="w-3.5 h-3.5 text-amber-400" />
            <span>تغيير الذكر</span>
          </button>

          {onOpenWidgetGuide && (
            <button
              onClick={onOpenWidgetGuide}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-600 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors shadow-xs cursor-pointer"
              title="إضافة ويدجت السبحة على شاشة هاتفك الرئيسية"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ويدجت الشاشة</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Target presets */}
          <div className="flex items-center bg-stone-200 dark:bg-stone-800/80 p-0.5 rounded-xl text-xs font-mono">
            {targetsPreset.map(t => (
              <button
                key={t}
                onClick={() => onUpdateTarget(t)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  target === t
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-emerald-700'
                }`}
              >
                {t === 0 ? 'حر' : formatArabicNumber(t, settings.useArabicNumerals)}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-emerald-900/40 border-emerald-700/60 text-amber-300'
                : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400'
            }`}
            title={settings.soundEnabled ? 'صوت التسبيح مفعّل' : 'صوت التسبيح مكتوم'}
            aria-label="تبديل صوت التسبيح"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vibration Toggle */}
          <button
            onClick={() => onUpdateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
              settings.vibrationEnabled
                ? 'bg-emerald-900/40 border-emerald-700/60 text-amber-300'
                : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400'
            }`}
            title={settings.vibrationEnabled ? 'الاهتزاز مفعّل' : 'الاهتزاز مغلق'}
            aria-label="تبديل الاهتزاز"
          >
            {settings.vibrationEnabled ? <Vibrate className="w-4 h-4" /> : <VibrateOff className="w-4 h-4" />}
          </button>

          {/* Screen Awake Toggle */}
          <button
            onClick={() => onUpdateSettings({ screenAwakeEnabled: !settings.screenAwakeEnabled })}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors cursor-pointer ${
              settings.screenAwakeEnabled
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-500'
                : 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400'
            }`}
            title={settings.screenAwakeEnabled ? 'إبقاء الشاشة مضاءة مفعّل' : 'إبقاء الشاشة مضاءة معطل'}
            aria-label="تبديل إبقاء الشاشة مضاءة"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Active Dhikr Display with Tashkeel & Virtue */}
      <div className="w-full text-center px-4 my-2">
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-900/10 dark:bg-emerald-950/60 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          {activeDhikr.category || 'تسبيح وذكر'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-amiri text-stone-900 dark:text-amber-100 tracking-wide leading-relaxed min-h-[4rem] flex items-center justify-center">
          {activeDhikr.text}
        </h2>
        {activeDhikr.virtue && (
          <p className="text-xs text-stone-700 dark:text-stone-300 max-w-xs mx-auto line-clamp-2 mt-1">
            {activeDhikr.virtue}
          </p>
        )}
      </div>

      {/* 3. The Core Tasbeeh Tactile Tap Target with Circular Ring */}
      <div className="relative my-4 flex items-center justify-center">
        {/* SVG Circular Progress Ring */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 relative flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-stone-200 dark:text-stone-800 stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            {target > 0 && (
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-amber-500 stroke-current transition-all duration-200 ease-out"
                strokeWidth="5"
                strokeDasharray={`${(progress / 100) * 276.46} 276.46`}
                strokeLinecap="round"
                fill="transparent"
              />
            )}
          </svg>

          {/* Big Tactile Tap Button */}
          <button
            onClick={handleTap}
            className={`absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-100 cursor-pointer select-none active:scale-95 ${
              tapEffect
                ? 'bg-gradient-to-br from-emerald-600 to-teal-500 scale-95 shadow-inner'
                : 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 shadow-emerald-950/40 hover:scale-[1.02]'
            } border-4 border-amber-400/30 text-white`}
            aria-label={`تسبيح: ${activeDhikr.text}. العداد الحالي ${count}`}
          >
            {/* Cycle indicator */}
            {cycles > 0 && target > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full mb-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>دورة {formatArabicNumber(cycles, settings.useArabicNumerals)}</span>
              </div>
            )}

            {/* Huge Prominent Count Display */}
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {formatArabicNumber(count, settings.useArabicNumerals)}
            </span>

            {/* Target indicator */}
            <span className="text-xs text-emerald-200 mt-1 font-medium">
              {target > 0 ? (
                <>الهدف: {formatArabicNumber(target, settings.useArabicNumerals)}</>
              ) : (
                <>عداد حر</>
              )}
            </span>

            <span className="text-[10px] text-amber-300/80 mt-2 font-bold tracking-wider">
              المس للتسبيح
            </span>
          </button>
        </div>
      </div>

      {/* 4. Action Controls: Undo, Reset, Sessions History */}
      <div className="w-full flex items-center justify-center gap-6 px-4 mt-2">
        {/* Undo Button */}
        <button
          onClick={onDecrement}
          disabled={count === 0}
          className="flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          title="تراجع خطوة (-١)"
          aria-label="تراجع خطوة واحدة"
        >
          <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center shadow-xs border border-stone-300 dark:border-stone-700">
            <Undo2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">تراجع</span>
        </button>

        {/* Reset Button with confirmation */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-rose-500 cursor-pointer"
          title="تصفير العداد"
          aria-label="تصفير العداد"
        >
          <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center shadow-xs border border-stone-300 dark:border-stone-700">
            <RotateCcw className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">تصفير</span>
        </button>

        {/* Sessions History */}
        <button
          onClick={() => setShowSessionsHistory(true)}
          className="flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-emerald-500 cursor-pointer"
          title="سجل الجلسات"
          aria-label="سجل جلسات التسبيح"
        >
          <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center shadow-xs border border-stone-300 dark:border-stone-700">
            <History className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">الجلسات</span>
        </button>
      </div>

      {/* 5. Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-1">
              هل تريد تصفير عداد التسبيح؟
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              سيتم حفظ التسبيحات المنجزة في سجل الجلسات وإعادة العداد إلى الصفر.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 cursor-pointer"
              >
                متابعة التسبيح
              </button>
              <button
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md cursor-pointer"
              >
                نعم، صفّر العداد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Dhikr Picker & Custom Dhikr Modal */}
      {showDhikrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 text-right animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                {isCustomDhikrForm ? 'إضافة ذكر مخصص' : 'اختر صيغة الذكر'}
              </h3>
              <button
                onClick={() => {
                  setShowDhikrModal(false);
                  setIsCustomDhikrForm(false);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isCustomDhikrForm ? (
              <form onSubmit={handleCreateCustomDhikr} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    صيغة الذكر *
                  </label>
                  <input
                    type="text"
                    required
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="مثال: يا حي يا قيوم برحمتك أستغيث"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الهدف المقترح
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customTarget}
                    onChange={e => setCustomTarget(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الفضل أو ملاحظة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={customVirtue}
                    onChange={e => setCustomVirtue(e.target.value)}
                    placeholder="بيان الفضل أو المناسبة..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsCustomDhikrForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    حفظ واختيار
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="overflow-y-auto space-y-2 mt-4 flex-1 pr-1">
                  {dhikrList.map(item => {
                    const isSelected = item.id === activeDhikr.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectDhikr(item);
                          setShowDhikrModal(false);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 shadow-xs'
                            : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <p className="font-amiri font-bold text-base text-stone-900 dark:text-stone-100">
                            {item.text}
                          </p>
                          {item.virtue && (
                            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                              {item.virtue}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 mt-3 flex justify-between items-center">
                  <button
                    onClick={() => setIsCustomDhikrForm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة ذكر جديد خاص بي</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 7. Sessions History Modal */}
      {showSessionsHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                سجل جلسات التسبيح
              </h3>
              <button
                onClick={() => setShowSessionsHistory(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 mt-4 flex-1 pr-1">
              {sessions.length === 0 ? (
                <p className="text-center text-xs text-stone-500 py-8">
                  لا توجد جلسات تسبيح مسجلة بعد. عند تصفير العداد أو انتهاء الورد تُحفظ الجلسة تلقائياً.
                </p>
              ) : (
                sessions.map(s => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-amiri font-bold text-sm text-stone-900 dark:text-stone-100">
                        {s.dhikrText}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {formatArabicNumber(s.finalCount, settings.useArabicNumerals)} تسبيحة
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{s.date}</span>
                      <span>المدة: {formatDurationInArabic(s.durationSeconds)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
