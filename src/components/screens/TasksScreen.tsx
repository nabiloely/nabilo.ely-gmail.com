import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Filter,
  ArrowUpDown,
  History,
  X,
  Sparkles
} from 'lucide-react';
import { WorshipTask, TaskCategory, RecurrenceType, UserSettings, TaskCompletion } from '../../types';
import { formatArabicNumber, formatPercentage, ARABIC_DAYS } from '../../utils/arabicUtils';
import { calculateDailyCompletionRate } from '../../utils/taskCalculations';

interface TasksScreenProps {
  tasks: WorshipTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<WorshipTask, 'id' | 'createdAt' | 'order' | 'currentCount' | 'isCompleted'>) => void;
  onUpdateTask: (task: WorshipTask) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (tasks: WorshipTask[]) => void;
  completionsHistory: TaskCompletion[];
  settings: UserSettings;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onReorderTasks,
  completionsHistory,
  settings
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorshipTask | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TaskCategory>('custom');
  const [formRecurrence, setFormRecurrence] = useState<RecurrenceType>('daily');
  const [formScheduledDays, setFormScheduledDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formTime, setFormTime] = useState('12:00');
  const [formTargetCount, setFormTargetCount] = useState(1);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'prayer', label: 'الصلوات المفروضة' },
    { id: 'voluntary', label: 'السنن والنوافل' },
    { id: 'quran', label: 'القرآن الكريم' },
    { id: 'adhkar', label: 'الأذكار والورد' },
    { id: 'custom', label: 'مهام خاصة' }
  ];

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory;
  });

  const completionRate = calculateDailyCompletionRate(tasks);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormCategory('custom');
    setFormRecurrence('daily');
    setFormScheduledDays([0, 1, 2, 3, 4, 5, 6]);
    setFormTime('12:00');
    setFormTargetCount(1);
    setEditingTask(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: WorshipTask) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormCategory(task.category);
    setFormRecurrence(task.recurrence);
    setFormScheduledDays(task.scheduledDays || [0, 1, 2, 3, 4, 5, 6]);
    setFormTime(task.time || '12:00');
    setFormTargetCount(task.targetCount || 1);
    setIsAddModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: formTitle.trim(),
        category: formCategory,
        recurrence: formRecurrence,
        scheduledDays: formScheduledDays,
        time: formTime,
        targetCount: formTargetCount
      });
    } else {
      onAddTask({
        title: formTitle.trim(),
        category: formCategory,
        recurrence: formRecurrence,
        scheduledDays: formScheduledDays,
        time: formTime,
        targetCount: formTargetCount,
        reminderEnabled: true
      });
    }

    setIsAddModalOpen(false);
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newTasks.length) return;

    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIdx];
    newTasks[targetIdx] = temp;

    // re-assign orders
    const updated = newTasks.map((t, idx) => ({ ...t, order: idx + 1 }));
    onReorderTasks(updated);
  };

  const toggleDaySelection = (dayIdx: number) => {
    if (formScheduledDays.includes(dayIdx)) {
      if (formScheduledDays.length > 1) {
        setFormScheduledDays(formScheduledDays.filter(d => d !== dayIdx));
      }
    } else {
      setFormScheduledDays([...formScheduledDays, dayIdx]);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Top Banner & Progress Summary */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 shadow-md border border-emerald-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">جدول العبادات اليومي</h1>
            <p className="text-xs text-emerald-200 mt-1">
              أحب الأعمال إلى الله أدومها وإن قل
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عبادة</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-emerald-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-emerald-100">نسبة الإنجاز اليومي</span>
            <span className="font-extrabold text-amber-300">
              {formatPercentage(completionRate, settings.useArabicNumerals)}
            </span>
          </div>
          <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-700/40">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filter Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <p className="text-sm font-bold text-stone-500">لا توجد عبادات في هذا التصنيف</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              + إضافة عبادة جديدة
            </button>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                task.isCompleted
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/40'
                  : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {/* Checkbox & Details */}
              <div
                onClick={() => onToggleTask(task.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <button
                  type="button"
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
                  <h3
                    className={`text-sm font-bold ${
                      task.isCompleted
                        ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-75'
                        : 'text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                    {task.time && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </span>
                    )}
                    <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-[10px]">
                      {task.recurrence === 'daily'
                        ? 'يومي'
                        : task.recurrence === 'weekly'
                        ? 'أسبوعي'
                        : 'مخصص'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Delete, Reorder */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                  title="تعديل"
                  aria-label={`تعديل ${task.title}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 cursor-pointer"
                  title="حذف"
                  aria-label={`حذف ${task.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
        >
          <History className="w-4 h-4 text-emerald-600" />
          <span>سجل إتمام العبادات السابقة ({formatArabicNumber(completionsHistory.length, settings.useArabicNumerals)})</span>
        </button>
      </div>

      {/* Add / Edit Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                {editingTask ? 'تعديل العبادة' : 'إضافة عبادة جديدة'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  عنوان العبادة أو الذكر *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: قيام ركعتين، قراءة سورة الملك..."
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    التصنيف
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="prayer">صلاة مفروضة</option>
                    <option value="voluntary">سنة أو نافلة</option>
                    <option value="quran">قرآن كريم</option>
                    <option value="adhkar">أذكار وورد</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    التكرار
                  </label>
                  <select
                    value={formRecurrence}
                    onChange={e => setFormRecurrence(e.target.value as RecurrenceType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي (أيام محددة)</option>
                  </select>
                </div>
              </div>

              {formRecurrence === 'weekly' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    الأيام المحددة
                  </label>
                  <div className="flex items-center gap-1.5 justify-between">
                    {ARABIC_DAYS.map((dayName, idx) => {
                      const isSelected = formScheduledDays.includes(idx);
                      return (
                        <button
                          key={dayName}
                          type="button"
                          onClick={() => toggleDaySelection(idx)}
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الوقت المقترح
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    الهدف اليومي (العدد)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formTargetCount}
                    onChange={e => setFormTargetCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono outline-none"
                  />
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
                  حفظ العبادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                سجل إتمام العبادات التاريخي
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 mt-4 flex-1 pr-1">
              {completionsHistory.length === 0 ? (
                <p className="text-center text-xs text-stone-500 py-8">
                  لا توجد سجلات تاريخية بعد. أنجز عباداتك اليوم لتظهر هنا.
                </p>
              ) : (
                completionsHistory.map(comp => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/50 dark:border-stone-700/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {comp.taskTitle}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-mono">
                          {comp.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      تم بحمد الله
                    </span>
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
