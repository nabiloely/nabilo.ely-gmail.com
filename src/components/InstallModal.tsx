import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Zap,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'guide' | 'qr'>('guide');
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://athkar.app';

  useEffect(() => {
    if (isIOS) setDeviceType('ios');
    else if (isAndroid) setDeviceType('android');
    else setDeviceType('other');
  }, [isIOS, isAndroid]);

  useEffect(() => {
    if (isOpen) {
      // Generate scannable QR Code with Islamic emerald styling
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#064e3b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    if (success) {
      onShowToast('تم تثبيت تطبيق أذكاري بنجاح على جهازك! مبارك 🌿', 'success');
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    onShowToast('تم نسخ رابط التطبيق إلى الحافظة', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'أذكاري | تطبيق الأذكار والعبادات اليومية',
          text: 'حمّل تطبيق أذكاري على هاتفك لقراءة أذكار الصباح والمساء والتسبيح الذكي بدون إنترنت:',
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

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
            aria-label="إغلاق النافذة"
            className="absolute top-5 left-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 p-2.5 flex items-center justify-center shadow-inner">
              <img src="/pwa-192x192.png" alt="أذكاري" className="w-full h-full object-contain drop-shadow" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-semibold mb-1">
                <Smartphone className="w-3 h-3" />
                <span>تطبيق هاتف رسمي (PWA)</span>
              </div>
              <h2 className="text-xl font-bold font-amiri tracking-wide text-white">تنزيل وتثبيت "أذكاري" في الهاتف</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">يعمل كتطبيق مستقل بدون متصفح وبدون إنترنت</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>خطوات التنزيل على الهاتف</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>مسح الرمز (QR Code)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status banner if already installed */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>التطبيق مثبت بالفعل ويعمل كـتطبيق مستقل على هذا الجهاز.</span>
            </div>
          )}

          {activeTab === 'guide' ? (
            <div className="space-y-4">
              {/* Direct Instant Install Button if supported by Chromium/Android */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>تثبيت بنقرة واحدة متاح لجهازك الآن!</span>
                      </h3>
                      <p className="text-xs text-emerald-100 mt-1">
                        متصفحك يدعم التثبيت المباشر. اضغط على الزر لإضافة التطبيق إلى شاشتك الرئيسية فوراً.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-emerald-950 font-bold text-sm shadow transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'جاري التثبيت...' : 'تثبيت تطبيق أذكاري في الهاتف الآن'}</span>
                  </button>
                </div>
              )}

              {/* Device Selector Sub-tabs */}
              <div className="flex rounded-xl bg-stone-200/70 dark:bg-stone-800/70 p-1 gap-1">
                <button
                  onClick={() => setDeviceType('ios')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'ios'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <span>🍎 آيفون (iPhone / Safari)</span>
                </button>
                <button
                  onClick={() => setDeviceType('android')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'android'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <span>🤖 أندرويد (Android / Chrome)</span>
                </button>
                <button
                  onClick={() => setDeviceType('other')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    deviceType === 'other'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <span>💻 حاسوب أو متصفح آخر</span>
                </button>
              </div>

              {/* iOS Step by Step Instructions */}
              {deviceType === 'ios' && (
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
                  <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[11px] font-black">
                      iOS
                    </span>
                    <span>خطوات التثبيت على أجهزة iPhone و iPad عبر Safari:</span>
                  </h4>

                  <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        ١
                      </span>
                      <div>
                        افتح هذا الرابط في متصفح <strong>Safari (سفاري)</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        ٢
                      </span>
                      <div>
                        اضغط على زر <strong>المشاركة (Share)</strong> في أسفل شاشة سفاري (الأيقونة ذات المربع والسهم للأعلى <span className="inline-block px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 font-mono text-[10px]">⎋</span>).
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        ٣
                      </span>
                      <div>
                        مرر للأسفل واضغط على <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)</strong>.
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        ٤
                      </span>
                      <div>
                        اضغط على <strong>"إضافة" (Add)</strong> في أعلى الزاوية. سيظهر تطبيق <strong>أذكاري</strong> مباشرة بين تطبيقات هاتفك!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Step by Step Instructions */}
              {deviceType === 'android' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
                    <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[11px] font-black">
                        Android
                      </span>
                      <span>طريقة التثبيت المباشرة (WebAPK الرسمي):</span>
                    </h4>

                    <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          ١
                        </span>
                        <div>
                          افتح الرابط في متصفح <strong>Google Chrome</strong> على هاتفك الأندرويد.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          ٢
                        </span>
                        <div>
                          اضغط على قائمة <strong>النقاط الثلاث (⋮)</strong> في أعلى يمين المتصفح.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          ٣
                        </span>
                        <div>
                          اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          ٤
                        </span>
                        <div>
                          يقوم نظام أندرويد تلقائياً بإنشاء حزمة <strong>APK</strong> وتثبيتها كـتطبيق نظام كامل في قائمة التطبيقات والشاشة الرئيسية.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* APK Explainer Card */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                      <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 font-mono text-[10px]">APK</span>
                      <span>هل تبحث عن ملف تنزيل APK لهاتفك؟</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                      نظام أندرويد عبر متصفح كروم يثبت التطبيق بتقنية <strong>WebAPK</strong> الرسمية من Google؛ مما يعني أنه <strong>يثبت بالفعل كملف APK أصلي</strong> في هاتفك بدون الحاجة لتنزيل ملفات خارجية غير موثوقة أو تفعيل "مصادر غير معروفة".
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                      إذا أردت ملف <strong>.apk</strong> كملف مستقل للتثبيت اليدوي، يمكنك إدخال رابط التطبيق في أداة <strong>PWABuilder</strong> الرسمية من مايكروسوفت (pwabuilder.com) لتوليد حزمة APK فوراً.
                    </p>
                  </div>
                </div>
              )}

              {/* Other / Desktop Instructions */}
              {deviceType === 'other' && (
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
                  <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                    كيف تفتح التطبيق على هاتفك الآن؟
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    امسح رمز الاستجابة السريعة (QR Code) بكاميرا هاتفك المحمول ليفتح التطبيق فوراً، أو انسخ الرابط وأرسله إلى هاتفك عبر واتساب أو تيليجرام.
                  </p>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-xs font-bold text-stone-800 dark:text-stone-200 transition flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>عرض رمز الاستجابة السريعة (QR Code) للمسح بكاميرا الهاتف</span>
                  </button>
                </div>
              )}

              {/* Highlights & Benefits */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <WifiOff className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>يعمل بالكامل بدون اتصال بالإنترنت</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>حجم خفيف جداً ولا يستهلك الذاكرة</span>
                </div>
              </div>
            </div>
          ) : (
            /* QR Code Scanner Section */
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
              <div className="p-3 bg-white rounded-3xl shadow-md border-2 border-emerald-600/30 inline-block">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code لمسح التطبيق" className="w-56 h-56 rounded-xl" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
                    جاري توليد الرمز...
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
                  امسح الرمز بكاميرا الهاتف
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                  وجّه كاميرا هاتفك الآيفون أو الأندرويد نحو الرمز وسيظهر رابط التطبيق لتفتحه وتثبته بضغطة زر.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons: Copy link & Share */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الرابط!' : 'نسخ رابط التطبيق'}</span>
            </button>
            <button
              onClick={handleShareLink}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 dark:bg-stone-950/80 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
            <span>تطبيق آمن وخصوصية تامة ૧٠٠٪ مع حفظ الأذكار محلياً</span>
          </p>
        </div>
      </div>
    </div>
  );
};
