import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Moon,
  Info
} from 'lucide-react';
import { ReminderItem, ReminderType, UserSettings } from '../../types';
import { ARABIC_DAYS, formatArabicNumber } from '../../utils/arabicUtils';
import { notificationService } from '../../utils/notificationService';

interface RemindersScreenProps {
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (rem: Omit<ReminderItem, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
  onApplyPresets: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  notificationLogs: { id: string; title: string; time: string; date: string }[];
  onShowToast: (msg: string) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  onApplyPresets,
  settings,
  onUpdateSettings,
  notificationLogs,
  onShowToast
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [permissionState, setPermissionState] = useState(notificationService.getPermissionStatus());

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTime, setFormTime] = useState('08:00');
  const [formDays, setFormDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formType, setFormType] = useState<ReminderType>('custom');

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermissionState(res);
    if (res === 'granted') {
      onShowToast('تم تفعيل إشعارات المتصفح بنجاح');
      onUpdateSettings({ notificationsEnabled: true });
    } else if (res === 'denied') {
      onShowToast('تم رفض إذن الإشعارات من إعدادات المتصفح');
      onUpdateSettings({ notificationsEnabled: false });
    }
  };

  const handleTestNotification = () => {
    notificationService.triggerNotification(
      'تذكير أذكاري التجريبي',
      'سبحان الله وبحمده، ألا بذكر الله تطمئن القلوب'
    );
    onShowToast('تم إرسال إشعار تجريبي بنجاح');
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    onAddReminder({
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || 'موعد وردك اليومي المبارك',
      time: formTime,
      days: formDays,
      enabled: true,
      type: formType
    });

    setFormTitle('');
    setFormSubtitle('');
    setIsAddModalOpen(false);
    onShowToast('تم حفظ التذكير بنجاح');
  };

  const toggleDay = (idx: number) => {
    if (formDays.includes(idx)) {
      if (formDays.length > 1) {
        setFormDays(formDays.filter(d => d !== idx));
      }
    } else {
      setFormDays([...formDays, idx]);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">مركز التنبيهات والتذكيرات</h1>
            <p className="text-xs text-emerald-200 mt-1">
              خصص أوقات التذكير بأذكار الصباح والمساء والصلوات والورد القرآني
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تذكير جديد</span>
          </button>
        </div>

        {/* Global Mute & Test Actions */}
        <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.globalNotificationsMute}
              onChange={e => onUpdateSettings({ globalNotificationsMute: e.target.checked })}
              className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-semibold text-emerald-100">كتم جميع التنبيهات مؤقتاً</span>
          </label>

          <button
            onClick={handleTestNotification}
            className="px-3 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-amber-300 font-bold border border-emerald-600/40 cursor-pointer"
          >
            إرسال إشعار تجريبي
          </button>
        </div>
      </section>

      {/* 2. Web Notification Permission Notice with Honesty Disclaimer */}
      <section className="p-4 rounded-3xl bg-amber-50 dark:bg-stone-900 border border-amber-300/60 dark:border-amber-500/20 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-stone-900 dark:text-stone-100">
              حالة إشعارات المتصفح والنظام
            </h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              تتطلب إشعارات الويب موافقة المتصفح (HTTPS) وقد تعتمد على إبقاء التطبيق مفتوحاً أو دعمه في الخلفية. عند رفض الإذن أو إغلاق المتصفح ستظهر التنبيهات داخل التطبيق بمجرد فتحه لضمان عدم فوات أي ورد.
            </p>
            <div className="pt-2 flex items-center gap-2">
              {permissionState === 'granted' ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  إذن المتصفح مفعّل
                </span>
              ) : permissionState === 'denied' ? (
                <span className="text-rose-500 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  تم رفض الإذن (يمكن تفعيله من إعدادات المتصفح)
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  طلب إذن الإشعارات الآن
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quiet Hours Setting Card */}
      <section className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
              ساعات الهدوء (عدم الإزعاج أثناء النوم)
            </h3>
          </div>
          <input
            type="checkbox"
            checked={settings.quietHours.enabled}
            onChange={e =>
              onUpdateSettings({
                quietHours: { ...settings.quietHours, enabled: e.target.checked }
              })
            }
            className="accent-emerald-600 w-4 h-4 rounded cursor-pointer"
          />
        </div>

        {settings.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div>
              <label className="block text-stone-500 mb-1">من الساعة</label>
              <input
                type="time"
                value={settings.quietHours.start}
                onChange={e =>
                  onUpdateSettings({
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">إلى الساعة</label>
              <input
                type="time"
                value={settings.quietHours.end}
                onChange={e =>
                  onUpdateSettings({
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. Reminder List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold text-stone-700 dark:text-stone-300">
            قائمة التذكيرات المجدولة ({formatArabicNumber(reminders.length, settings.useArabicNumerals)})
          </h2>
          <button
            onClick={onApplyPresets}
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
          >
            استعادة التذكيرات الافتراضية
          </button>
        </div>

        {reminders.map(rem => (
          <div
            key={rem.id}
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              rem.enabled
                ? 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
                : 'bg-stone-50 dark:bg-stone-950/40 border-stone-200/50 dark:border-stone-800/40 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleReminder(rem.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  rem.enabled
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-stone-200 text-stone-400 dark:bg-stone-800'
                }`}
                aria-label={rem.enabled ? `تعطيل ${rem.title}` : `تفعيل ${rem.title}`}
              >
                {rem.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>

              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {rem.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {rem.time}
                  </span>
                  <span>•</span>
                  <span>
                    {rem.days.length === 7
                      ? 'يومياً'
                      : rem.days.map(d => ARABIC_DAYS[d].slice(0, 2)).join('، ')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteReminder(rem.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 cursor-pointer"
              title="حذف التذكير"
              aria-label={`حذف ${rem.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 5. Notification History Logs */}
      {notificationLogs.length > 0 && (
        <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-800">
          <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-3">
            سجل التنبيهات الأخيرة
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {notificationLogs.slice(0, 10).map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs border border-stone-100 dark:border-stone-800"
              >
                <span className="text-stone-800 dark:text-stone-200 font-medium">
                  {log.title}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {log.date} {log.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-right animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                إضافة تذكير عبادة جديد
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان التذكير *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: أذكار الصباح، قراءة سورة الملك..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  نص التذكير / الرسالة (اختياري)
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={e => setFormSubtitle(e.target.value)}
                  placeholder="مثال: ألا بذكر الله تطمئن القلوب"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الوقت *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    النوع
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as ReminderType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="morning_adhkar">أذكار الصباح</option>
                    <option value="evening_adhkar">أذكار المساء</option>
                    <option value="prayer">صلاة</option>
                    <option value="duha">صلاة الضحى</option>
                    <option value="qiyam">قيام الليل</option>
                    <option value="friday">يوم الجمعة</option>
                    <option value="tasbeeh">تسبيح وذكر</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  أيام التكرار
                </label>
                <div className="flex items-center gap-1.5 justify-between">
                  {ARABIC_DAYS.map((dayName, idx) => {
                    const isSelected = formDays.includes(idx);
                    return (
                      <button
                        key={dayName}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        }`}
                      >
                        {dayName.slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ التذكير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
