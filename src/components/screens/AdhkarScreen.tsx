import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
  RotateCcw,
  CheckCircle2,
  Play,
  Pause,
  Square,
  Volume2,
  SkipForward,
  SkipBack,
  Headphones,
  ListMusic,
  Radio,
  Sliders,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AdhkarEntry, AdhkarCategory, UserSettings } from '../../types';
import { formatArabicNumber, formatPercentage } from '../../utils/arabicUtils';
import { sensory } from '../../utils/audioAndSensory';
import { adhkarAudio, AudioPlayerState, PlaybackMode } from '../../utils/adhkarAudio';
import { CATEGORY_FULL_AUDIO } from '../../data/adhkarData';

interface AdhkarScreenProps {
  entries: AdhkarEntry[];
  readProgress: Record<string, number>;
  onIncrementAdhkar: (entryId: string, targetCount: number) => void;
  onResetCategory: (category: AdhkarCategory) => void;
  favoritesList: string[];
  onToggleFavorite: (id: string) => void;
  settings: UserSettings;
  onShowToast: (msg: string) => void;
}

export const AdhkarScreen: React.FC<AdhkarScreenProps> = ({
  entries,
  readProgress,
  onIncrementAdhkar,
  onResetCategory,
  favoritesList,
  onToggleFavorite,
  settings,
  onShowToast
}) => {
  const [activeCategory, setActiveCategory] = useState<AdhkarCategory>('morning');
  const [playerState, setPlayerState] = useState<AudioPlayerState>(adhkarAudio.getState());
  const [selectedMode, setSelectedMode] = useState<PlaybackMode>('full_track');

  useEffect(() => {
    const unsub = adhkarAudio.subscribe(state => {
      setPlayerState(state);
    });
    return () => {
      unsub();
    };
  }, []);

  const categories: { id: AdhkarCategory; label: string; icon: any; count: number }[] = [
    { id: 'morning', label: 'أذكار الصباح', icon: Sun, count: entries.filter(e => e.category === 'morning').length },
    { id: 'evening', label: 'أذكار المساء', icon: Moon, count: entries.filter(e => e.category === 'evening').length },
    { id: 'after_prayer', label: 'أذكار الصلاة', icon: Clock, count: entries.filter(e => e.category === 'after_prayer').length },
    { id: 'sleep', label: 'أذكار النوم', icon: Sparkles, count: entries.filter(e => e.category === 'sleep').length },
  ];

  const currentCategoryEntries = entries.filter(e => e.category === activeCategory);
  const activeCategoryLabel = categories.find(c => c.id === activeCategory)?.label || 'الأذكار';
  const categoryAudioMeta = CATEGORY_FULL_AUDIO[activeCategory];

  // Calculate completion percentage for this category
  const totalRequiredTaps = currentCategoryEntries.reduce((acc, curr) => acc + curr.count, 0);
  const totalCompletedTaps = currentCategoryEntries.reduce((acc, curr) => {
    const current = readProgress[curr.id] || 0;
    return acc + Math.min(curr.count, current);
  }, 0);

  const categoryProgress = totalRequiredTaps > 0
    ? Math.round((totalCompletedTaps / totalRequiredTaps) * 100)
    : 0;

  const isCurrentCategoryPlaying =
    playerState.categoryKey === activeCategory &&
    playerState.status === 'playing';

  const isCurrentCategoryPaused =
    playerState.categoryKey === activeCategory &&
    playerState.status === 'paused';

  const isCurrentCategoryLoading =
    playerState.categoryKey === activeCategory &&
    playerState.status === 'loading';

  const isCategoryActiveInPlayer =
    playerState.categoryKey === activeCategory &&
    playerState.status !== 'idle';

  // Toggle unified play button in the upper section
  const handleToggleUnifiedPlay = () => {
    if (isCurrentCategoryPlaying) {
      adhkarAudio.pause();
      onShowToast('تم إيقاف التلاوة مؤقتاً');
    } else if (isCurrentCategoryPaused) {
      adhkarAudio.resume();
      onShowToast('استئناف التلاوة');
    } else {
      // Start playback according to selected mode
      if (selectedMode === 'full_track' && categoryAudioMeta) {
        adhkarAudio.playCategoryFullAudio(
          activeCategory,
          categoryAudioMeta.audioUrl,
          categoryAudioMeta.title,
          categoryAudioMeta.reciter
        );
        onShowToast(`جاري تشغيل: ${categoryAudioMeta.title}`);
      } else {
        const playlistItems = currentCategoryEntries.map(e => ({
          id: e.id,
          text: e.textArabic,
          audioUrl: e.audioUrl,
          reciter: e.reciter
        }));
        adhkarAudio.playPlaylist(playlistItems, 0, activeCategoryLabel, activeCategory);
        onShowToast(`بدء التلاوة التسلسلية لـ ${activeCategoryLabel}`);
      }
    }
  };

  const handleStopAudio = () => {
    adhkarAudio.stop();
    onShowToast('تم إيقاف الصوت');
  };

  const handleSpeedChange = (rate: number) => {
    adhkarAudio.setPlaybackRate(rate);
    onShowToast(`سرعة القراءة: ${rate}x`);
  };

  const handleTapItem = (entry: AdhkarEntry) => {
    const current = readProgress[entry.id] || 0;
    if (current < entry.count) {
      sensory.playTapSound(settings.soundEnabled);
      sensory.vibrate(15, settings.vibrationEnabled);

      if (current + 1 === entry.count) {
        sensory.playTargetReachedSound(settings.soundEnabled);
        sensory.vibrate([25, 40, 25], settings.vibrationEnabled);
      }
      onIncrementAdhkar(entry.id, entry.count);
    }
  };

  const handleShare = (entry: AdhkarEntry) => {
    const text = `${entry.textArabic}\n\n[المصدر: ${entry.source}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast('تم نسخ الذكر المبارك إلى الحافظة');
    }
  };

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activePlayingEntry = entries.find(e => e.id === playerState.activeEntryId);

  return (
    <div className="space-y-5 pb-32 pt-2">
      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-800 text-amber-200 ring-2 ring-amber-400/40 shadow-md font-bold'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- UPPER SECTION: UNIFIED AUDIO & PROGRESS CONTROL PANEL --- */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-700/60 relative overflow-hidden">
        {/* Subtle geometric pattern background */}
        <div className="absolute top-0 left-0 w-full h-full islamic-pattern opacity-25 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Row: Category Title & Current Playback State Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  {activeCategoryLabel}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-amber-300 border border-emerald-600/40">
                  {formatArabicNumber(currentCategoryEntries.length, settings.useArabicNumerals)} أذكار
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1">
                {categoryAudioMeta?.reciter || 'مكتبة حصن المسلم الصوتية المعتمدة'}
              </p>
            </div>

            {/* Playback State Indicator Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs">
              {isCurrentCategoryLoading ? (
                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border-amber-500/40 px-2.5 py-0.5 rounded-full">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : isCurrentCategoryPlaying ? (
                <div className="flex items-center gap-1.5 text-emerald-200 bg-emerald-950/70 border-emerald-400/50 px-2.5 py-0.5 rounded-full animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>مشغل الآن</span>
                </div>
              ) : isCurrentCategoryPaused ? (
                <div className="flex items-center gap-1.5 text-amber-200 bg-amber-950/70 border-amber-400/50 px-2.5 py-0.5 rounded-full">
                  <Pause className="w-3.5 h-3.5 text-amber-300" />
                  <span>متوقف مؤقتاً</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-stone-300 bg-emerald-950/50 border-emerald-700/40 px-2.5 py-0.5 rounded-full">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>جاهز للاستماع</span>
                </div>
              )}
            </div>
          </div>

          {/* Mode Selector: Continuous Full Track vs Sequential Interactive */}
          <div className="flex items-center gap-2 p-1 bg-emerald-950/60 rounded-2xl border border-emerald-700/50 max-w-sm">
            <button
              onClick={() => setSelectedMode('full_track')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedMode === 'full_track'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>تلاوة متصلة كاملة</span>
            </button>
            <button
              onClick={() => setSelectedMode('sequential')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedMode === 'sequential'
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>تلاوة ذكر بذكر</span>
            </button>
          </div>

          {/* Primary Unified Play Control Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/40 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* The Big Unified Play/Pause Button */}
              <button
                onClick={handleToggleUnifiedPlay}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer shrink-0 ${
                  isCurrentCategoryPlaying
                    ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-300/40 shadow-amber-900/50'
                    : 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-white ring-4 ring-emerald-700/40 hover:scale-105'
                }`}
                aria-label={
                  isCurrentCategoryPlaying
                    ? 'إيقاف مؤقت للتلاوة الصوتية'
                    : `تشغيل ${activeCategoryLabel} بالكامل`
                }
              >
                {isCurrentCategoryLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-stone-950" />
                ) : isCurrentCategoryPlaying ? (
                  <Pause className="w-6 h-6 fill-stone-950 text-stone-950" />
                ) : (
                  <Play className="w-6 h-6 fill-current text-white ml-1" />
                )}
              </button>

              {/* Title & Status Details */}
              <div className="text-right flex-1 truncate">
                <h2 className="text-sm font-bold text-white leading-tight">
                  {isCategoryActiveInPlayer
                    ? playerState.playlistTitle || categoryAudioMeta?.title
                    : `تشغيل ${activeCategoryLabel} كاملة`}
                </h2>
                <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                  {isCategoryActiveInPlayer && playerState.playbackMode === 'sequential' && activePlayingEntry
                    ? activePlayingEntry.textArabic.slice(0, 35) + '...'
                    : categoryAudioMeta?.reciter}
                </p>
                {/* Duration indicator */}
                <span className="text-[10px] text-amber-300/90 font-mono mt-0.5 block">
                  {categoryAudioMeta?.durationEstimate ? `المدة المقدرة: ${categoryAudioMeta.durationEstimate}` : ''}
                </span>
              </div>
            </div>

            {/* Additional Upper Controls: Speed selector, Stop, Reset */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Playback Speed selector */}
              <div className="flex items-center bg-emerald-900/80 p-0.5 rounded-xl border border-emerald-700/50 text-[10px] font-mono">
                {[1, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      playerState.playbackRate === rate
                        ? 'bg-amber-400 text-stone-950'
                        : 'text-emerald-200 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Stop button (if active) */}
              {isCategoryActiveInPlayer && (
                <button
                  onClick={handleStopAudio}
                  className="w-9 h-9 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-stone-300 hover:text-white border border-emerald-700/50 flex items-center justify-center cursor-pointer"
                  title="إيقاف نهائي"
                  aria-label="إيقاف نهائي"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Reset Category Reading Progress */}
              <button
                onClick={() => onResetCategory(activeCategory)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/40 hover:bg-emerald-800 cursor-pointer"
                title="إعادة تعيين قراءة هذا القسم"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة البدء</span>
              </button>
            </div>
          </div>

          {/* Audio Progress Scrubber (if playing and duration available) */}
          {isCategoryActiveInPlayer && playerState.duration > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-emerald-950/80 h-2 rounded-full overflow-hidden border border-emerald-700/40">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.min(100, (playerState.currentTime / playerState.duration) * 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-200 font-mono">
                <span>{formatAudioTime(playerState.currentTime)}</span>
                <span>{formatAudioTime(playerState.duration)}</span>
              </div>
            </div>
          )}

          {/* Reading Completion Percentage Bar */}
          <div className="pt-2 border-t border-emerald-800/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-emerald-100">
                إنجاز القراءة والتسبيح: {formatArabicNumber(totalCompletedTaps, settings.useArabicNumerals)} من {formatArabicNumber(totalRequiredTaps, settings.useArabicNumerals)} تكرار
              </span>
              <span className="font-extrabold text-amber-300">
                {formatPercentage(categoryProgress, settings.useArabicNumerals)}
              </span>
            </div>
            <div className="w-full bg-emerald-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-emerald-700/40">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${categoryProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- ADHKAR CARDS LIST --- */}
      <div className="space-y-3.5">
        {currentCategoryEntries.map((entry, index) => {
          const currentCount = readProgress[entry.id] || 0;
          const isFinished = currentCount >= entry.count;
          const isFavorite = favoritesList.includes(entry.id);
          const isCurrentlyPlayingThis =
            playerState.activeEntryId === entry.id &&
            playerState.status === 'playing';

          return (
            <div
              key={entry.id}
              className={`rounded-3xl p-5 border transition-all ${
                isCurrentlyPlayingThis
                  ? 'ring-2 ring-amber-400 bg-amber-50/50 dark:bg-emerald-950/30 border-amber-400/80 shadow-md'
                  : isFinished
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50'
                  : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {/* Header: Numbering, Tags, Active Indicator, Favorite & Share */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-400 dark:text-stone-500">
                    {formatArabicNumber(index + 1, settings.useArabicNumerals)}.
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      entry.isQuran
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40'
                    }`}
                  >
                    {entry.isQuran ? 'آية قرآنية' : 'دعاء مأثور'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    التكرار: {formatArabicNumber(entry.count, settings.useArabicNumerals)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Active Playing Indicator */}
                  {isCurrentlyPlayingThis && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-400/40 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>يتلى الآن</span>
                    </div>
                  )}

                  <button
                    onClick={() => onToggleFavorite(entry.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 cursor-pointer"
                    aria-label="إضافة للمفضلة"
                  >
                    <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleShare(entry)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 cursor-pointer"
                    aria-label="مشاركة الذكر"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arabic Text with Tashkeel */}
              <p className="font-amiri text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-loose text-right font-medium">
                {entry.textArabic}
              </p>

              {/* Virtue and Source */}
              <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-800/80 space-y-1.5 text-xs text-stone-500">
                {entry.virtue && (
                  <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                    <span className="font-bold">الفضل: </span>{entry.virtue}
                  </p>
                )}
                <p className="text-[11px] text-stone-400">
                  <span className="font-bold">المصدر: </span>{entry.source}
                </p>
              </div>

              {/* Interactive Counter Tap Button */}
              <div className="mt-4 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  {isFinished ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      تم إتمام القراءة
                    </span>
                  ) : (
                    <span>
                      المتبقي: {formatArabicNumber(entry.count - currentCount, settings.useArabicNumerals)}
                    </span>
                  )}
                </span>

                <button
                  onClick={() => handleTapItem(entry)}
                  disabled={isFinished}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm ${
                    isFinished
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 opacity-60 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-900/30'
                  }`}
                  aria-label={`قراءة: ${currentCount} من ${entry.count}`}
                >
                  <span>{formatArabicNumber(currentCount, settings.useArabicNumerals)} / {formatArabicNumber(entry.count, settings.useArabicNumerals)}</span>
                  <span>{isFinished ? 'اكتمل' : 'المس'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Sticky Audio Player Bar when audio is active */}
      {isCategoryActiveInPlayer && (
        <div className="fixed bottom-16 left-4 right-4 z-40 max-w-md mx-auto">
          <div className="p-3.5 rounded-3xl bg-stone-900/95 dark:bg-stone-950/95 text-stone-100 shadow-2xl border border-amber-400/40 backdrop-blur-md animate-in slide-in-from-bottom duration-300">
            {/* Header info */}
            <div className="flex items-center justify-between text-[11px] text-amber-300/90 font-bold mb-2 pb-1.5 border-b border-stone-800">
              <span className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>{playerState.playlistTitle || categoryAudioMeta?.title}</span>
              </span>
              <span>
                {playerState.playbackMode === 'sequential'
                  ? `الذكر ${formatArabicNumber(playerState.currentIndex + 1, settings.useArabicNumerals)} من ${formatArabicNumber(playerState.totalItems, settings.useArabicNumerals)}`
                  : 'تلاوة متصلة'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  {playerState.status === 'playing' ? (
                    <Volume2 className="w-5 h-5 animate-pulse text-amber-400" />
                  ) : (
                    <Headphones className="w-5 h-5 text-stone-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate font-amiri text-sm">
                    {playerState.playbackMode === 'sequential' && activePlayingEntry
                      ? activePlayingEntry.textArabic.slice(0, 35) + '...'
                      : categoryAudioMeta?.title}
                  </p>
                  <p className="text-[10px] text-stone-400 truncate">
                    {playerState.reciter || categoryAudioMeta?.reciter}
                  </p>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {playerState.playbackMode === 'sequential' && (
                  <button
                    onClick={() => adhkarAudio.prev()}
                    disabled={!playerState.hasPrev}
                    className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-stone-300 flex items-center justify-center cursor-pointer"
                    title="الذكر السابق"
                    aria-label="الذكر السابق"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Play / Pause Toggle */}
                <button
                  onClick={() => {
                    if (playerState.status === 'playing') {
                      adhkarAudio.pause();
                    } else {
                      adhkarAudio.resume();
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center cursor-pointer shadow-sm"
                  aria-label={playerState.status === 'playing' ? 'إيقاف مؤقت' : 'متابعة التشغيل'}
                >
                  {playerState.status === 'playing' ? (
                    <Pause className="w-4 h-4 fill-stone-950 text-stone-950" />
                  ) : (
                    <Play className="w-4 h-4 fill-stone-950 text-stone-950 ml-0.5" />
                  )}
                </button>

                {playerState.playbackMode === 'sequential' && (
                  <button
                    onClick={() => adhkarAudio.next()}
                    disabled={!playerState.hasNext}
                    className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-stone-300 flex items-center justify-center cursor-pointer"
                    title="الذكر التالي"
                    aria-label="الذكر التالي"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Stop Button */}
                <button
                  onClick={handleStopAudio}
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 flex items-center justify-center cursor-pointer ml-0.5"
                  title="إغلاق المشغل"
                  aria-label="إغلاق المشغل"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>

            {/* Time progress bar if duration is available */}
            {playerState.duration > 0 && (
              <div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (playerState.currentTime / playerState.duration) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1">
                  <span>{formatAudioTime(playerState.currentTime)}</span>
                  <span>{formatAudioTime(playerState.duration)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
