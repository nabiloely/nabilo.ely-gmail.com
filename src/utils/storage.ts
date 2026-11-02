import {
  WorshipTask,
  TaskCompletion,
  DhikrItem,
  TasbeehSession,
  ReminderItem,
  UserSettings,
  ReportedError
} from '../types';
import { DEFAULT_TASKS, DEFAULT_DHIKR_ITEMS, DEFAULT_REMINDERS, DEFAULT_SETTINGS } from '../data/defaults';

const KEYS = {
  TASKS: 'athkar_worship_tasks_v1',
  COMPLETIONS: 'athkar_task_completions_v1',
  DHIKRS: 'athkar_dhikr_items_v1',
  ACTIVE_TASBEEH: 'athkar_active_tasbeeh_v1',
  SESSIONS: 'athkar_tasbeeh_sessions_v1',
  ADHKAR_PROGRESS: 'athkar_adhkar_read_progress_v1',
  FAVORITES: 'athkar_favorites_v1',
  REMINDERS: 'athkar_reminders_v1',
  SETTINGS: 'athkar_settings_v1',
  REPORTED_ERRORS: 'athkar_reported_errors_v1',
  NOTIFICATION_LOGS: 'athkar_notification_logs_v1'
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export const storage = {
  getTasks: (): WorshipTask[] => safeGet(KEYS.TASKS, DEFAULT_TASKS),
  setTasks: (tasks: WorshipTask[]): void => safeSet(KEYS.TASKS, tasks),

  getCompletions: (): TaskCompletion[] => safeGet(KEYS.COMPLETIONS, []),
  setCompletions: (completions: TaskCompletion[]): void => safeSet(KEYS.COMPLETIONS, completions),
  addCompletion: (completion: TaskCompletion): void => {
    const list = safeGet<TaskCompletion[]>(KEYS.COMPLETIONS, []);
    safeSet(KEYS.COMPLETIONS, [completion, ...list]);
  },

  getDhikrs: (): DhikrItem[] => safeGet(KEYS.DHIKRS, DEFAULT_DHIKR_ITEMS),
  setDhikrs: (items: DhikrItem[]): void => safeSet(KEYS.DHIKRS, items),

  getActiveTasbeeh: () => safeGet(KEYS.ACTIVE_TASBEEH, {
    dhikrId: DEFAULT_DHIKR_ITEMS[0].id,
    count: 0,
    target: DEFAULT_DHIKR_ITEMS[0].target,
    sessionStartTime: Date.now(),
    startCount: 0
  }),
  setActiveTasbeeh: (data: any) => safeSet(KEYS.ACTIVE_TASBEEH, data),

  getSessions: (): TasbeehSession[] => safeGet(KEYS.SESSIONS, []),
  setSessions: (sessions: TasbeehSession[]): void => safeSet(KEYS.SESSIONS, sessions),
  addSession: (session: TasbeehSession): void => {
    const list = safeGet<TasbeehSession[]>(KEYS.SESSIONS, []);
    safeSet(KEYS.SESSIONS, [session, ...list]);
  },

  getAdhkarProgress: (): Record<string, number> => safeGet(KEYS.ADHKAR_PROGRESS, {}),
  setAdhkarProgress: (progress: Record<string, number>): void => safeSet(KEYS.ADHKAR_PROGRESS, progress),

  getFavorites: (): { hadiths: string[]; adhkar: string[] } => safeGet(KEYS.FAVORITES, { hadiths: [], adhkar: [] }),
  setFavorites: (favs: { hadiths: string[]; adhkar: string[] }): void => safeSet(KEYS.FAVORITES, favs),

  getReminders: (): ReminderItem[] => safeGet(KEYS.REMINDERS, DEFAULT_REMINDERS),
  setReminders: (reminders: ReminderItem[]): void => safeSet(KEYS.REMINDERS, reminders),

  getSettings: (): UserSettings => safeGet(KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (settings: UserSettings): void => safeSet(KEYS.SETTINGS, settings),

  getReportedErrors: (): ReportedError[] => safeGet(KEYS.REPORTED_ERRORS, []),
  addReportedError: (err: ReportedError): void => {
    const list = safeGet<ReportedError[]>(KEYS.REPORTED_ERRORS, []);
    safeSet(KEYS.REPORTED_ERRORS, [err, ...list]);
  },

  getNotificationLogs: (): { id: string; title: string; time: string; date: string }[] =>
    safeGet(KEYS.NOTIFICATION_LOGS, []),
  addNotificationLog: (log: { id: string; title: string; time: string; date: string }): void => {
    const logs = safeGet<any[]>(KEYS.NOTIFICATION_LOGS, []);
    safeSet(KEYS.NOTIFICATION_LOGS, [log, ...logs.slice(0, 49)]); // keep last 50
  },

  exportAllData(): string {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: storage.getTasks(),
      completions: storage.getCompletions(),
      dhikrs: storage.getDhikrs(),
      sessions: storage.getSessions(),
      adhkarProgress: storage.getAdhkarProgress(),
      favorites: storage.getFavorites(),
      reminders: storage.getReminders(),
      settings: storage.getSettings()
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.tasks) storage.setTasks(data.tasks);
      if (data.completions) storage.setCompletions(data.completions);
      if (data.dhikrs) storage.setDhikrs(data.dhikrs);
      if (data.sessions) storage.setSessions(data.sessions);
      if (data.adhkarProgress) storage.setAdhkarProgress(data.adhkarProgress);
      if (data.favorites) storage.setFavorites(data.favorites);
      if (data.reminders) storage.setReminders(data.reminders);
      if (data.settings) storage.setSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  },

  resetAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
};
