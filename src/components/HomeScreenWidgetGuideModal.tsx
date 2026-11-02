import React from 'react';
import { X, Sparkles, Smartphone, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';

interface HomeScreenWidgetGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTasbeeh: () => void;
}

export const HomeScreenWidgetGuideModal: React.FC<HomeScreenWidgetGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTasbeeh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 rounded-3xl shadow-2xl border border-emerald-900/10 dark:border-emerald-800/20 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 p-2.5 flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold mb-1">
                <Smartphone className="w-3 h-3" />
                <span>شاشة الهاتف الرئيسية (Home Screen)</span>
              </div>
              <h2 className="text-xl font-bold font-amiri tracking-wide text-white">إضافة ويدجت السبحة على شاشة هاتفك</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">تسبيح فوري بلمسة واحدة من شاشة القفل أو الرئيسية</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-right">
          {/* Method 1: App Shortcut (Built-in WebAPK & Android) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-emerald-800/20 dark:border-emerald-700/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                الطريقة الأسرع والأسهل ⚡
              </span>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                اختصار ويدجت السبحة من أيقونة التطبيق
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ١
                </span>
                <div>
                  اذهب إلى الشاشة الرئيسية لهاتفك حيث توجد أيقونة تطبيق <strong>«أذكاري»</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ٢
                </span>
                <div>
                  اضغط <strong>ضغطة مطولة (Long Press)</strong> على أيقونة التطبيق لمدة ثانيتين.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ٣
                </span>
                <div>
                  ستظهر لك قائمة سريعة منبثقة، اختر منها <strong>«التسبيح الذكي 📿»</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ٤
                </span>
                <div>
                  اسحب هذا الخيار وضعه على أي مكان في شاشتك الرئيسية ليصبح <strong>ويدجت اختصار مستقل</strong> يفتح المسبحة فوراً بلمسة واحدة!
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: In-App Floating Widget */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-2">
            <h4 className="font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>ميزة الويدجت العائم داخل التطبيق (Floating Widget)</span>
            </h4>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-[11px]">
              قمنا أيضاً بتفعيل <strong>ويدجت السبحة العائم</strong> داخل التطبيق! ستجد فقاعة سبحة صغيرة عائمة أسفل الشاشة، يمكنك استخدامها للتسبيح بنقرة واحدة سريعة أثناء تصفح الأذكار أو الأحاديث أو المهام دون الحاجة لفتح شاشة التسبيح.
            </p>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              onClose();
              onNavigateToTasbeeh();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>فتح شاشة التسبيح الآن</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            أذكاري | رفيقك الدائم لذكر الله
          </p>
        </div>
      </div>
    </div>
  );
};
