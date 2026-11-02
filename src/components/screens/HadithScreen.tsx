import React, { useState } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  Share2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  RefreshCw,
  Heart,
  Hand,
  Shield,
  Send,
  X,
  Check
} from 'lucide-react';
import { Hadith, HadithTopic, UserSettings, ReportedError } from '../../types';
import { HADITH_TOPICS } from '../../data/sahihMuslimHadiths';
import { formatArabicNumber } from '../../utils/arabicUtils';

interface HadithScreenProps {
  hadiths: Hadith[];
  favoritesList: string[];
  onToggleFavorite: (hadithId: string) => void;
  onReportError: (err: ReportedError) => void;
  settings: UserSettings;
  onShowToast: (msg: string) => void;
}

export const HadithScreen: React.FC<HadithScreenProps> = ({
  hadiths,
  favoritesList,
  onToggleFavorite,
  onReportError,
  settings,
  onShowToast
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportingHadith, setReportingHadith] = useState<Hadith | null>(null);
  const [reportReason, setReportReason] = useState('خطأ في الترقيم أو الإسناد');
  const [reportNote, setReportNote] = useState('');

  const filteredHadiths = hadiths.filter(h => {
    const matchesTopic = selectedTopic === 'all' || h.topic === selectedTopic;
    const matchesSearch =
      searchQuery === '' ||
      h.textArabic.includes(searchQuery) ||
      h.chapterArabic.includes(searchQuery) ||
      h.bookNameArabic.includes(searchQuery) ||
      String(h.hadithNumber).includes(searchQuery);
    return matchesTopic && matchesSearch;
  });

  const handleShare = (h: Hadith) => {
    const text = `عن رسول الله ﷺ:\n\n${h.textArabic}\n\n[صحيح مسلم - رقم الحديث: ${h.hadithNumber}]`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast('تم نسخ الحديث الشريف وتخريجه إلى الحافظة');
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingHadith) return;
    onReportError({
      id: 'rep-' + Date.now(),
      hadithId: reportingHadith.id,
      hadithNumber: String(reportingHadith.hadithNumber),
      reason: reportReason,
      userNote: reportNote,
      date: new Date().toISOString()
    });
    setReportingHadith(null);
    setReportNote('');
    onShowToast('جزاكم الله خيراً، تم إرسال الملاحظة للمراجعة والتدقيق');
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Top Banner: Authenticity Guarantee */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-800/80 text-amber-300 text-[11px] font-bold mb-2 border border-emerald-600/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مكتبة صحيح الإمام مسلم رحمه الله</span>
            </div>
            <h1 className="text-xl font-black">أحاديث نبوية صحيحة موثقة</h1>
            <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
              جميع الأحاديث الواردة هنا مخرجة من صحيح مسلم بالترقيم واللفظ العربي المعتمد (ترقيم محمد فؤاد عبد الباقي)، مصنفة ومميزة عن الشروح الفقهية.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث بكلمة أو برقم الحديث في صحيح مسلم..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-white placeholder-emerald-300/60 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <Search className="w-4 h-4 text-emerald-300 absolute right-3.5 top-3 pointer-events-none" />
        </div>
      </section>

      {/* Topic Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedTopic === 'all'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
          }`}
        >
          جميع الموضوعات ({formatArabicNumber(hadiths.length, settings.useArabicNumerals)})
        </button>
        {HADITH_TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedTopic === topic.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
            }`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Hadith Cards List */}
      <div className="space-y-4">
        {filteredHadiths.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <p className="text-sm font-bold text-stone-500">لا توجد نتائج مطابقة لبحثك</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('all');
              }}
              className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              عرض جميع الأحاديث
            </button>
          </div>
        ) : (
          filteredHadiths.map(hadith => {
            const isFavorite = favoritesList.includes(hadith.id);
            return (
              <article
                key={hadith.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-xs border border-stone-200/80 dark:border-stone-800 transition-all hover:shadow-md"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/80 text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[11px]">
                      حديث رقم: {formatArabicNumber(hadith.hadithNumber, settings.useArabicNumerals)}
                    </span>
                    <span className="font-semibold text-stone-600 dark:text-stone-400">
                      {hadith.bookNameArabic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(hadith.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-500 cursor-pointer"
                      title="حفظ في المفضلة"
                      aria-label="حفظ في المفضلة"
                    >
                      <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleShare(hadith)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 cursor-pointer"
                      title="نسخ الحديث الشريف"
                      aria-label="نسخ الحديث الشريف"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReportingHadith(hadith)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 cursor-pointer"
                      title="الإبلاغ عن تصحيح أو ملاحظة"
                      aria-label="الإبلاغ عن تصحيح أو ملاحظة"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Narrator */}
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-3">
                  {hadith.narratorArabic}
                </p>

                {/* Hadith Text in Amiri Font */}
                <p className="font-amiri text-lg sm:text-xl text-stone-900 dark:text-amber-100 leading-loose text-right font-medium mt-2">
                  {hadith.textArabic}
                </p>

                {/* Chapter & Benefits distinction */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-950/40 p-3.5 rounded-2xl space-y-1.5">
                  <div className="text-xs text-stone-500">
                    <span className="font-bold text-stone-700 dark:text-stone-300">الباب: </span>
                    {hadith.chapterArabic}
                  </div>
                  {hadith.benefitsArabic && (
                    <div className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
                      <span className="font-bold">من فوائد الحديث: </span>
                      {hadith.benefitsArabic}
                    </div>
                  )}
                  <div className="text-[10px] text-stone-400 pt-1 font-mono">
                    {hadith.referenceSource}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Report Error / Correction Modal */}
      {reportingHadith && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-right animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                إرسال ملاحظة أو تدقيق على حديث
              </h3>
              <button
                onClick={() => setReportingHadith(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4 mt-4">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs text-stone-600 dark:text-stone-300">
                <span className="font-bold">الحديث رقم: </span>
                {reportingHadith.hadithNumber} - {reportingHadith.chapterArabic}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  نوع الملاحظة
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="خطأ في الترقيم أو الإسناد">خطأ في الترقيم أو الإسناد</option>
                  <option value="خطأ في رسم الحركات والتشكيل">خطأ في رسم الحركات والتشكيل</option>
                  <option value="ملاحظة على نص الشرح والفوائد">ملاحظة على نص الشرح والفوائد</option>
                  <option value="أخرى">ملاحظة أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  تفاصيل الملاحظة أو التصحيح المقترح *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  placeholder="اكتب التعديل المقترح أو مرجع المصحح..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setReportingHadith(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  إرسال التدقيق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
