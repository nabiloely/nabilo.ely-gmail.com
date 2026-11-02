import React, { useState } from 'react';
import { Bookmark, Scroll, BookOpen, Trash2, Share2, Sparkles } from 'lucide-react';
import { Hadith, AdhkarEntry, UserSettings } from '../../types';
import { formatArabicNumber } from '../../utils/arabicUtils';

interface FavoritesScreenProps {
  favoriteHadithIds: string[];
  favoriteAdhkarIds: string[];
  allHadiths: Hadith[];
  allAdhkar: AdhkarEntry[];
  onToggleHadithFavorite: (id: string) => void;
  onToggleAdhkarFavorite: (id: string) => void;
  settings: UserSettings;
  onShowToast: (msg: string) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  favoriteHadithIds,
  favoriteAdhkarIds,
  allHadiths,
  allAdhkar,
  onToggleHadithFavorite,
  onToggleAdhkarFavorite,
  settings,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'hadiths' | 'adhkar'>('hadiths');

  const favoritedHadiths = allHadiths.filter(h => favoriteHadithIds.includes(h.id));
  const favoritedAdhkar = allAdhkar.filter(a => favoriteAdhkarIds.includes(a.id));

  const copyText = (text: string, title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onShowToast(`تم نسخ ${title} إلى الحافظة`);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Header */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/50">
        <h1 className="text-xl font-black">المفضلة والمحفوظات</h1>
        <p className="text-xs text-emerald-200 mt-1">
          وصول سريع للأحاديث والأذكار التي قمت بتمييزها وحفظها
        </p>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('hadiths')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'hadiths'
              ? 'bg-emerald-800 text-amber-200 shadow-sm'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <Scroll className="w-4 h-4" />
          <span>أحاديث صحيح مسلم ({formatArabicNumber(favoritedHadiths.length, settings.useArabicNumerals)})</span>
        </button>

        <button
          onClick={() => setActiveTab('adhkar')}
          className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'adhkar'
              ? 'bg-emerald-800 text-amber-200 shadow-sm'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>الأذكار المختارة ({formatArabicNumber(favoritedAdhkar.length, settings.useArabicNumerals)})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'hadiths' ? (
        <div className="space-y-3.5">
          {favoritedHadiths.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
              <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-500">لا توجد أحاديث في المفضلة بعد</p>
              <p className="text-xs text-stone-400 mt-1">
                يمكنك الضغط على أيقونة الحفظ بجانب أي حديث في مكتبة صحيح مسلم
              </p>
            </div>
          ) : (
            favoritedHadiths.map(h => (
              <div
                key={h.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs text-stone-500">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    رقم الحديث: {formatArabicNumber(h.hadithNumber, settings.useArabicNumerals)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(h.textArabic, 'الحديث الشريف')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleHadithFavorite(h.id)}
                      className="p-1.5 rounded-lg text-amber-500 hover:text-rose-500 cursor-pointer"
                      title="إزالة من المفضلة"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>
                </div>

                <p className="font-amiri text-lg text-stone-900 dark:text-amber-100 leading-relaxed font-medium mt-3">
                  {h.textArabic}
                </p>
                <p className="text-[11px] text-stone-400 mt-2 font-mono">
                  {h.referenceSource}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {favoritedAdhkar.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
              <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-500">لا توجد أذكار في المفضلة بعد</p>
              <p className="text-xs text-stone-400 mt-1">
                اضغط على أيقونة الحفظ على أي ذكر في شاشة الأذكار لإضافته هنا
              </p>
            </div>
          ) : (
            favoritedAdhkar.map(a => (
              <div
                key={a.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 text-xs text-stone-500">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    التكرار: {formatArabicNumber(a.count, settings.useArabicNumerals)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(a.textArabic, 'الذكر المبارك')}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleAdhkarFavorite(a.id)}
                      className="p-1.5 rounded-lg text-amber-500 hover:text-rose-500 cursor-pointer"
                      title="إزالة من المفضلة"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500" />
                    </button>
                  </div>
                </div>

                <p className="font-amiri text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-medium mt-3">
                  {a.textArabic}
                </p>
                {a.virtue && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium mt-2">
                    {a.virtue}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
