/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { MoreMenuModal } from './components/MoreMenuModal';
import { ToastBanner } from './components/ToastBanner';
import { InstallModal } from './components/InstallModal';
import { InstallBanner } from './components/InstallBanner';
import { FloatingTasbeehWidget } from './components/FloatingTasbeehWidget';
import { HomeScreenWidgetGuideModal } from './components/HomeScreenWidgetGuideModal';

import { DashboardScreen } from './components/screens/DashboardScreen';
import { TasksScreen } from './components/screens/TasksScreen';
import { TasbeehScreen } from './components/screens/TasbeehScreen';
import { AdhkarScreen } from './components/screens/AdhkarScreen';
import { HadithScreen } from './components/screens/HadithScreen';
import { RemindersScreen } from './components/screens/RemindersScreen';
import { StatsCalendarScreen } from './components/screens/StatsCalendarScreen';
import { FavoritesScreen } from './components/screens/FavoritesScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import { SAHIH_MUSLIM_HADITHS } from './data/sahihMuslimHadiths';
import { ADHKAR_ENTRIES } from './data/adhkarData';
import { storage } from './utils/storage';
import { sensory } from './utils/audioAndSensory';
import { notificationService, InAppToast } from './utils/notificationService';
import {
  shouldResetTasksForNewDay,
  resetTasksForNewDay,
  calculateWorshipStreak
} from './utils/taskCalculations';
import {
  incrementTasbeeh,
  decrementTasbeeh,
  getSessionSummary
} from './utils/tasbeehLogic';
import {
  WorshipTask,
  TaskCompletion,
  DhikrItem,
  TasbeehSession,
  ReminderItem,
  UserSettings,
  Hadith,
  AdhkarEntry,
  ReportedError
} from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isWidgetGuideOpen, setIsWidgetGuideOpen] = useState<boolean>(false);
  const [isFloatingWidgetVisible, setIsFloatingWidgetVisible] = useState<boolean>(true);
  const [toasts, setToasts] = useState<InAppToast[]>([]);

  // Persistent States
  const [tasks, setTasks] = useState<WorshipTask[]>(() => storage.getTasks());
  const [completions, setCompletions] = useState<TaskCompletion[]>(() => storage.getCompletions());
  const [dhikrs, setDhikrs] = useState<DhikrItem[]>(() => storage.getDhikrs());
  const [activeTasbeeh, setActiveTasbeeh] = useState(() => storage.getActiveTasbeeh());
  const [sessions, setSessions] = useState<TasbeehSession[]>(() => storage.getSessions());
  const [adhkarProgress, setAdhkarProgress] = useState<Record<string, number>>(() => storage.getAdhkarProgress());
  const [favorites, setFavorites] = useState<{ hadiths: string[]; adhkar: string[] }>(() => storage.getFavorites());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storage.getReminders());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [notificationLogs, setNotificationLogs] = useState(() => storage.getNotificationLogs());

  // Check URL params for quick autostart or direct screen navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    if (screenParam && ['dashboard', 'tasks', 'tasbeeh', 'adhkar', 'hadith', 'reminders', 'stats', 'favorites', 'settings'].includes(screenParam)) {
      setActiveScreen(screenParam);
    }
  }, []);

  // Theme synchronization with html element
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Subscribe to Notification Service
  useEffect(() => {
    notificationService.startReminderScheduler();
    const unsubscribe = notificationService.subscribe((toast) => {
      setToasts(prev => [toast, ...prev]);
      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 6000);
    });

    return () => {
      unsubscribe();
      notificationService.stopReminderScheduler();
    };
  }, []);

  // Check for New Day reset
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (shouldResetTasksForNewDay(settings.lastActiveDate, todayStr)) {
      const resetList = resetTasksForNewDay(tasks);
      setTasks(resetList);
      storage.setTasks(resetList);
      const updatedSettings = { ...settings, lastActiveDate: todayStr };
      setSettings(updatedSettings);
      storage.setSettings(updatedSettings);
    }
  }, [settings.lastActiveDate, tasks]);

  // Streak calculation
  const todayDateStr = new Date().toISOString().split('T')[0];
  const { currentStreak, longestStreak } = useMemo(() => {
    return calculateWorshipStreak(completions, todayDateStr);
  }, [completions, todayDateStr]);

  // Today's total dhikr calculation from sessions and current counter
  const totalDhikrToday = useMemo(() => {
    const todaySessions = sessions.filter(s => s.date === todayDateStr);
    const pastTodayCount = todaySessions.reduce((acc, s) => acc + s.finalCount, 0);
    return pastTodayCount + (activeTasbeeh.count || 0);
  }, [sessions, activeTasbeeh.count, todayDateStr]);

  // Active Dhikr Item
  const activeDhikrItem: DhikrItem = useMemo(() => {
    return dhikrs.find(d => d.id === activeTasbeeh.dhikrId) || dhikrs[0];
  }, [dhikrs, activeTasbeeh.dhikrId]);

  // Deterministic daily authentic hadith rotation
  const dailyHadith: Hadith = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = Math.abs(dayOfYear) % SAHIH_MUSLIM_HADITHS.length;
    return SAHIH_MUSLIM_HADITHS[index];
  }, []);

  // Adhkar progress percentages
  const morningEntries = useMemo(() => ADHKAR_ENTRIES.filter(e => e.category === 'morning'), []);
  const eveningEntries = useMemo(() => ADHKAR_ENTRIES.filter(e => e.category === 'evening'), []);

  const calculateCategoryProgress = (categoryEntries: AdhkarEntry[]) => {
    const totalRequired = categoryEntries.reduce((acc, curr) => acc + curr.count, 0);
    const totalDone = categoryEntries.reduce((acc, curr) => {
      const count = adhkarProgress[curr.id] || 0;
      return acc + Math.min(curr.count, count);
    }, 0);
    return totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0;
  };

  const morningProgress = calculateCategoryProgress(morningEntries);
  const eveningProgress = calculateCategoryProgress(eveningEntries);

  // --- Handlers ---
  const handleShowToast = (msg: string, title: string = 'أذكاري') => {
    const toast: InAppToast = {
      id: 'toast-' + Date.now(),
      title,
      message: msg,
      type: 'info',
      timestamp: Date.now()
    };
    setToasts(prev => [toast, ...prev]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 4000);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.setSettings(updated);
  };

  // Tasks handlers
  const handleToggleTask = (taskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const nextCompleted = !targetTask.isCompleted;
    const updatedTasks = tasks.map(t =>
      t.id === taskId
        ? { ...t, isCompleted: nextCompleted, currentCount: nextCompleted ? t.targetCount : 0 }
        : t
    );

    setTasks(updatedTasks);
    storage.setTasks(updatedTasks);

    sensory.playTapSound(settings.soundEnabled);
    sensory.vibrate(20, settings.vibrationEnabled);

    // If marked completed, record historical completion
    if (nextCompleted) {
      const completionRecord: TaskCompletion = {
        id: 'comp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        taskId: targetTask.id,
        taskTitle: targetTask.title,
        category: targetTask.category,
        date: todayDateStr,
        completedCount: targetTask.targetCount,
        targetCount: targetTask.targetCount,
        completedAt: new Date().toLocaleTimeString('ar-SA')
      };
      setCompletions(prev => [completionRecord, ...prev]);
      storage.addCompletion(completionRecord);
      sensory.playTargetReachedSound(settings.soundEnabled);
      handleShowToast(`تم بحمد الله إتمام: ${targetTask.title}`);
    }
  };

  const handleAddTask = (newTaskData: Omit<WorshipTask, 'id' | 'createdAt' | 'order' | 'currentCount' | 'isCompleted'>) => {
    const newTask: WorshipTask = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      order: tasks.length + 1,
      currentCount: 0,
      isCompleted: false,
      createdAt: todayDateStr
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    storage.setTasks(updated);
    handleShowToast('تمت إضافة العبادة بنجاح');
  };

  const handleUpdateTask = (updatedTask: WorshipTask) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    storage.setTasks(updated);
    handleShowToast('تم حفظ تعديلات العبادة');
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    storage.setTasks(updated);
    handleShowToast('تم حذف العبادة من الجدول');
  };

  const handleReorderTasks = (reordered: WorshipTask[]) => {
    setTasks(reordered);
    storage.setTasks(reordered);
  };

  // Tasbeeh handlers
  const handleTasbeehIncrement = () => {
    const currentCount = activeTasbeeh.count;
    const target = activeTasbeeh.target;

    const result = incrementTasbeeh({
      count: currentCount,
      target,
      sessionStartCount: activeTasbeeh.startCount || 0,
      totalCycleCount: 0
    });

    sensory.playTapSound(settings.soundEnabled);
    sensory.vibrate(15, settings.vibrationEnabled);

    if (result.targetReached || result.isCycleCompleted) {
      sensory.playTargetReachedSound(settings.soundEnabled);
      sensory.vibrate([30, 50, 30], settings.vibrationEnabled);
    }

    const updated = {
      ...activeTasbeeh,
      count: result.newCount
    };
    setActiveTasbeeh(updated);
    storage.setActiveTasbeeh(updated);
  };

  const handleTasbeehDecrement = () => {
    const newCount = decrementTasbeeh(activeTasbeeh.count);
    sensory.playTapSound(settings.soundEnabled);
    const updated = { ...activeTasbeeh, count: newCount };
    setActiveTasbeeh(updated);
    storage.setActiveTasbeeh(updated);
  };

  const handleTasbeehReset = () => {
    if (activeTasbeeh.count > 0) {
      const summary = getSessionSummary(
        activeTasbeeh.startCount || 0,
        activeTasbeeh.count,
        activeTasbeeh.sessionStartTime || Date.now()
      );

      const session: TasbeehSession = {
        id: 'sess-' + Date.now(),
        dhikrId: activeDhikrItem.id,
        dhikrText: activeDhikrItem.text,
        date: todayDateStr,
        startTime: new Date(activeTasbeeh.sessionStartTime || Date.now()).toLocaleTimeString('ar-SA'),
        endTime: new Date().toLocaleTimeString('ar-SA'),
        durationSeconds: summary.durationSeconds,
        startCount: activeTasbeeh.startCount || 0,
        finalCount: activeTasbeeh.count,
        target: activeTasbeeh.target,
        completedTarget: activeTasbeeh.target > 0 && activeTasbeeh.count >= activeTasbeeh.target
      };

      setSessions(prev => [session, ...prev]);
      storage.addSession(session);
    }

    const resetData = {
      ...activeTasbeeh,
      count: 0,
      startCount: 0,
      sessionStartTime: Date.now()
    };
    setActiveTasbeeh(resetData);
    storage.setActiveTasbeeh(resetData);
    handleShowToast('تم تصفير العداد وحفظ الجلسة في السجل');
  };

  const handleSelectDhikr = (item: DhikrItem) => {
    // If there is pending count, save previous session
    if (activeTasbeeh.count > 0 && activeTasbeeh.dhikrId !== item.id) {
      const summary = getSessionSummary(
        activeTasbeeh.startCount || 0,
        activeTasbeeh.count,
        activeTasbeeh.sessionStartTime || Date.now()
      );

      const session: TasbeehSession = {
        id: 'sess-' + Date.now(),
        dhikrId: activeDhikrItem.id,
        dhikrText: activeDhikrItem.text,
        date: todayDateStr,
        startTime: new Date(activeTasbeeh.sessionStartTime || Date.now()).toLocaleTimeString('ar-SA'),
        endTime: new Date().toLocaleTimeString('ar-SA'),
        durationSeconds: summary.durationSeconds,
        startCount: activeTasbeeh.startCount || 0,
        finalCount: activeTasbeeh.count,
        target: activeTasbeeh.target,
        completedTarget: activeTasbeeh.target > 0 && activeTasbeeh.count >= activeTasbeeh.target
      };
      setSessions(prev => [session, ...prev]);
      storage.addSession(session);
    }

    const updated = {
      dhikrId: item.id,
      count: 0,
      target: item.target,
      startCount: 0,
      sessionStartTime: Date.now()
    };
    setActiveTasbeeh(updated);
    storage.setActiveTasbeeh(updated);
    handleShowToast(`تم اختيار: ${item.text}`);
  };

  const handleAddCustomDhikr = (text: string, target: number, virtue?: string) => {
    const newDhikr: DhikrItem = {
      id: 'dhikr-custom-' + Date.now(),
      text,
      target,
      count: 0,
      virtue,
      isCustom: true,
      category: 'ذكر مخصص'
    };
    const updated = [newDhikr, ...dhikrs];
    setDhikrs(updated);
    storage.setDhikrs(updated);
    handleSelectDhikr(newDhikr);
  };

  const handleUpdateTasbeehTarget = (newTarget: number) => {
    const updated = { ...activeTasbeeh, target: newTarget };
    setActiveTasbeeh(updated);
    storage.setActiveTasbeeh(updated);
  };

  // Adhkar handlers
  const handleIncrementAdhkar = (entryId: string, targetCount: number) => {
    const current = adhkarProgress[entryId] || 0;
    const next = Math.min(targetCount, current + 1);
    const updated = { ...adhkarProgress, [entryId]: next };
    setAdhkarProgress(updated);
    storage.setAdhkarProgress(updated);
  };

  const handleResetAdhkarCategory = (category: string) => {
    const catEntries = ADHKAR_ENTRIES.filter(e => e.category === category);
    const updated = { ...adhkarProgress };
    catEntries.forEach(e => {
      delete updated[e.id];
    });
    setAdhkarProgress(updated);
    storage.setAdhkarProgress(updated);
    handleShowToast('تمت إعادة تعيين قراءة الأذكار لهذا القسم');
  };

  // Favorites handlers
  const handleToggleHadithFavorite = (id: string) => {
    const currentList = favorites.hadiths || [];
    const isFav = currentList.includes(id);
    const nextList = isFav ? currentList.filter(item => item !== id) : [...currentList, id];
    const updated = { ...favorites, hadiths: nextList };
    setFavorites(updated);
    storage.setFavorites(updated);
    handleShowToast(isFav ? 'تمت إزالة الحديث من المفضلة' : 'تم حفظ الحديث في المفضلة');
  };

  const handleToggleAdhkarFavorite = (id: string) => {
    const currentList = favorites.adhkar || [];
    const isFav = currentList.includes(id);
    const nextList = isFav ? currentList.filter(item => item !== id) : [...currentList, id];
    const updated = { ...favorites, adhkar: nextList };
    setFavorites(updated);
    storage.setFavorites(updated);
    handleShowToast(isFav ? 'تمت إزالة الذكر من المفضلة' : 'تم حفظ الذكر في المفضلة');
  };

  // Reminders handlers
  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    storage.setReminders(updated);
  };

  const handleAddReminder = (newRemData: Omit<ReminderItem, 'id'>) => {
    const newRem: ReminderItem = {
      ...newRemData,
      id: 'rem-' + Date.now()
    };
    const updated = [...reminders, newRem];
    setReminders(updated);
    storage.setReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    storage.setReminders(updated);
    handleShowToast('تم حذف التذكير');
  };

  const handleApplyPresetReminders = () => {
    storage.resetAllData();
    const defaults = storage.getReminders();
    setReminders(defaults);
    handleShowToast('تمت استعادة التذكيرات الافتراضية');
  };

  const handleReportError = (err: ReportedError) => {
    storage.addReportedError(err);
  };

  const handleDataRestored = () => {
    setTasks(storage.getTasks());
    setCompletions(storage.getCompletions());
    setDhikrs(storage.getDhikrs());
    setActiveTasbeeh(storage.getActiveTasbeeh());
    setSessions(storage.getSessions());
    setAdhkarProgress(storage.getAdhkarProgress());
    setFavorites(storage.getFavorites());
    setReminders(storage.getReminders());
    setSettings(storage.getSettings());
    setNotificationLogs(storage.getNotificationLogs());
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        streakCount={currentStreak}
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Mobile Install Promotion Banner */}
      <InstallBanner onOpenInstallModal={() => setIsInstallModalOpen(true)} />

      {/* Floating In-App Toast Banners */}
      <ToastBanner toasts={toasts} onDismiss={id => setToasts(toasts.filter(t => t.id !== id))} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3">
        {activeScreen === 'dashboard' && (
          <DashboardScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            activeDhikr={activeDhikrItem}
            tasbeehCount={activeTasbeeh.count}
            tasbeehTarget={activeTasbeeh.target}
            onQuickTasbeehTap={handleTasbeehIncrement}
            dailyHadith={dailyHadith}
            isHadithFavorite={favorites.hadiths?.includes(dailyHadith.id) || false}
            onToggleHadithFavorite={handleToggleHadithFavorite}
            morningAdhkarProgress={morningProgress}
            eveningAdhkarProgress={eveningProgress}
            reminders={reminders}
            streakCount={currentStreak}
            totalDhikrToday={totalDhikrToday}
            settings={settings}
            onNavigate={setActiveScreen}
            onShowToast={handleShowToast}
          />
        )}

        {activeScreen === 'tasks' && (
          <TasksScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onReorderTasks={handleReorderTasks}
            completionsHistory={completions}
            settings={settings}
          />
        )}

        {activeScreen === 'tasbeeh' && (
          <TasbeehScreen
            activeDhikr={activeDhikrItem}
            dhikrList={dhikrs}
            count={activeTasbeeh.count}
            target={activeTasbeeh.target}
            sessionStartTime={activeTasbeeh.sessionStartTime}
            startCount={activeTasbeeh.startCount}
            onIncrement={handleTasbeehIncrement}
            onDecrement={handleTasbeehDecrement}
            onReset={handleTasbeehReset}
            onSelectDhikr={handleSelectDhikr}
            onAddCustomDhikr={handleAddCustomDhikr}
            onUpdateTarget={handleUpdateTasbeehTarget}
            sessions={sessions}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenWidgetGuide={() => setIsWidgetGuideOpen(true)}
          />
        )}

        {activeScreen === 'adhkar' && (
          <AdhkarScreen
            entries={ADHKAR_ENTRIES}
            readProgress={adhkarProgress}
            onIncrementAdhkar={handleIncrementAdhkar}
            onResetCategory={handleResetAdhkarCategory}
            favoritesList={favorites.adhkar || []}
            onToggleFavorite={handleToggleAdhkarFavorite}
            settings={settings}
            onShowToast={handleShowToast}
          />
        )}

        {activeScreen === 'hadith' && (
          <HadithScreen
            hadiths={SAHIH_MUSLIM_HADITHS}
            favoritesList={favorites.hadiths || []}
            onToggleFavorite={handleToggleHadithFavorite}
            onReportError={handleReportError}
            settings={settings}
            onShowToast={handleShowToast}
          />
        )}

        {activeScreen === 'reminders' && (
          <RemindersScreen
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            onApplyPresets={handleApplyPresetReminders}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            notificationLogs={notificationLogs}
            onShowToast={handleShowToast}
          />
        )}

        {activeScreen === 'stats' && (
          <StatsCalendarScreen
            completions={completions}
            sessions={sessions}
            streakCount={currentStreak}
            longestStreak={longestStreak}
            settings={settings}
          />
        )}

        {activeScreen === 'favorites' && (
          <FavoritesScreen
            favoriteHadithIds={favorites.hadiths || []}
            favoriteAdhkarIds={favorites.adhkar || []}
            allHadiths={SAHIH_MUSLIM_HADITHS}
            allAdhkar={ADHKAR_ENTRIES}
            onToggleHadithFavorite={handleToggleHadithFavorite}
            onToggleAdhkarFavorite={handleToggleAdhkarFavorite}
            settings={settings}
            onShowToast={handleShowToast}
          />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataRestored={handleDataRestored}
            onShowToast={handleShowToast}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onOpenWidgetGuide={() => setIsWidgetGuideOpen(true)}
          />
        )}
      </main>

      {/* Floating On-Screen Tasbeeh Widget (Active across all screens except full Tasbeeh screen) */}
      {activeScreen !== 'tasbeeh' && (
        <FloatingTasbeehWidget
          activeDhikr={activeDhikrItem}
          tasbeehCount={activeTasbeeh.count || 0}
          tasbeehTarget={activeTasbeeh.target || 33}
          settings={settings}
          dhikrs={dhikrs}
          onTap={handleTasbeehIncrement}
          onUndo={handleTasbeehDecrement}
          onReset={handleTasbeehReset}
          onSelectDhikr={handleSelectDhikr}
          onNavigateToTasbeeh={() => setActiveScreen('tasbeeh')}
          onOpenWidgetGuide={() => setIsWidgetGuideOpen(true)}
          isVisible={isFloatingWidgetVisible && (settings.floatingTasbeehWidget !== false)}
          onToggleVisibility={setIsFloatingWidgetVisible}
        />
      )}

      {/* Home Screen Widget Guide Modal */}
      <HomeScreenWidgetGuideModal
        isOpen={isWidgetGuideOpen}
        onClose={() => setIsWidgetGuideOpen(false)}
        onNavigateToTasbeeh={() => setActiveScreen('tasbeeh')}
      />

      {/* PWA Phone Installation Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onShowToast={handleShowToast}
      />

      {/* More Menus Sheet / Modal */}
      <MoreMenuModal
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onNavigate={setActiveScreen}
        activeScreen={activeScreen}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Bottom Nav Bar */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenMore={() => setIsMoreMenuOpen(true)}
      />
    </div>
  );
}
