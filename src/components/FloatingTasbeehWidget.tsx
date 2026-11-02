import React, { useState } from 'react';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Undo2,
  Maximize2,
  X,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { DhikrItem, UserSettings } from '../types';
import { formatArabicNumber } from '../utils/arabicUtils';

interface FloatingTasbeehWidgetProps {
  activeDhikr: DhikrItem;
  tasbeehCount: number;
  tasbeehTarget: number;
  settings: UserSettings;
  dhikrs: DhikrItem[];
  onTap: () => void;
  onUndo: () => void;
  onReset: () => void;
  onSelectDhikr: (dhikr: DhikrItem) => void;
  onNavigateToTasbeeh: () => void;
  onOpenWidgetGuide: () => void;
  isVisible: boolean;
  onToggleVisibility: (visible: boolean) => void;
}

export const FloatingTasbeehWidget: React.FC<FloatingTasbeehWidgetProps> = ({
  activeDhikr,
  tasbeehCount,
  tasbeehTarget,
  settings,
  dhikrs,
  onTap,
  onUndo,
  onReset,
  onSelectDhikr,
  onNavigateToTasbeeh,
  onOpenWidgetGuide,
  isVisible,
  onToggleVisibility,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isTapping, setIsTapping] = useState<boolean>(false);

  if (!isVisible) return null;

  const handleQuickTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsTapping(true);
    onTap();
    setTimeout(() => setIsTapping(false), 120);
  };

  const progressPercent = Math.min(100, Math.round((tasbeehCount / (tasbeehTarget || 33)) * 100));

  return (
    <aside aria-label="ويدجت السبحة العائم" className="fixed bottom-20 left-4 z-40 select-none">
      {/* 1. Collapsed Mode: Floating Quick Tasbeeh Bubble */}
      {!isExpanded ? (
        <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 dark:bg-stone-950/95 backdrop-blur-md rounded-full shadow-2xl border border-amber-500/30 ring-2 ring-emerald-600/30 animate-bounce-short">
          {/* Quick Tap Button with Count */}
          <button
            onClick={handleQuickTap}
            aria-label={`تسبيح: ${activeDhikr.text}`}
            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-700 hover:to-teal-600 active:scale-95 text-white transition-transform cursor-pointer ${
              isTapping ? 'scale-90 ring-2 ring-amber-400' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center font-bold text-amber-300 text-xs shadow-inner">
              📿
            </div>
            <div className="text-right leading-tight">
              <span className="block text-[10px] text-amber-200/90 font-medium truncate max-w-[90px]">
                {activeDhikr.text}
              </span>
              <span className="block text-xs font-mono font-black text-white">
                {formatArabicNumber(tasbeehCount, settings.useArabicNumerals)}
                <span className="text-[9px] text-emerald-200/70 font-normal">/{formatArabicNumber(tasbeehTarget, settings.useArabicNumerals)}</span>
              </span>
            </div>
          </button>

          {/* Expand to Card Button */}
          <button
            onClick={() => setIsExpanded(true)}
            aria-label="توسيع ويدجت السبحة"
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* 2. Expanded Mode: Rich Mini Floating Tasbeeh Card */
        <div className="w-72 sm:w-80 bg-stone-900/95 dark:bg-stone-950/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-amber-500/30 ring-2 ring-emerald-600/30 text-white space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ويدجت السبحة الذكية</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenWidgetGuide}
                title="إضافة ويدجت على شاشة هاتفك الرئيسية"
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition text-[10px] flex items-center gap-1 px-1.5"
              >
                <Smartphone className="w-3 h-3" />
                <span>شاشة الهاتف</span>
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="تصغير الويدجت"
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleVisibility(false)}
                title="إخفاء الويدجت"
                className="p-1 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Dhikr Display */}
          <div className="text-center py-1">
            <h4 className="text-sm font-amiri font-bold text-amber-200 line-clamp-1">
              {activeDhikr.text}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-stone-400">
              <span>الهدف: {formatArabicNumber(tasbeehTarget, settings.useArabicNumerals)}</span>
              <span>•</span>
              <span className="text-emerald-400">{progressPercent}%</span>
            </div>
          </div>

          {/* Quick Dhikr Chips */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {dhikrs.slice(0, 5).map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDhikr(d)}
                className={`text-[10px] px-2 py-1 rounded-lg whitespace-nowrap transition shrink-0 ${
                  activeDhikr.id === d.id
                    ? 'bg-amber-400 text-emerald-950 font-bold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {d.text.split(' ')[0]} {d.text.split(' ')[1] || ''}
              </button>
            ))}
          </div>

          {/* Big Tap Button */}
          <button
            onClick={handleQuickTap}
            aria-label={`سبح: ${activeDhikr.text}`}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 active:scale-95 text-white shadow-lg transition-transform flex flex-col items-center justify-center cursor-pointer select-none ${
              isTapping ? 'scale-95 ring-2 ring-amber-300' : ''
            }`}
          >
            <span className="text-3xl font-mono font-bold leading-none tracking-wider text-white">
              {formatArabicNumber(tasbeehCount, settings.useArabicNumerals)}
            </span>
            <span className="text-[11px] text-amber-200 font-bold mt-1">اضغط للتسبيح 📿</span>
          </button>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800 text-stone-400">
            <button
              onClick={onUndo}
              disabled={tasbeehCount === 0}
              className="flex items-center gap-1 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400 transition cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>تراجع</span>
            </button>

            <button
              onClick={onReset}
              disabled={tasbeehCount === 0}
              className="flex items-center gap-1 hover:text-amber-300 disabled:opacity-30 disabled:hover:text-stone-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير</span>
            </button>

            <button
              onClick={onNavigateToTasbeeh}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>الشاشة الكاملة</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
