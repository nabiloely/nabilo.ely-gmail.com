export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export type TaskCategory = 'prayer' | 'quran' | 'adhkar' | 'dhikr' | 'voluntary' | 'custom';

export interface WorshipTask {
  id: string;
  title: string;
  category: TaskCategory;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  recurrence: RecurrenceType;
  scheduledDays?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time?: string; // HH:mm
  reminderEnabled?: boolean;
  order: number;
  createdAt: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  taskTitle: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  completedCount: number;
  targetCount: number;
  completedAt: string;
}

export interface DhikrItem {
  id: string;
  text: string;
  transliteration?: string;
  virtue?: string;
  target: number;
  count: number;
  isCustom?: boolean;
  isFavorite?: boolean;
  category?: string;
}

export interface TasbeehSession {
  id: string;
  dhikrId: string;
  dhikrText: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  startCount: number;
  finalCount: number;
  target: number;
  completedTarget: boolean;
}

export type ReminderType = 'morning_adhkar' | 'evening_adhkar' | 'prayer' | 'duha' | 'qiyam' | 'friday' | 'tasbeeh' | 'custom';

export interface ReminderItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string; // HH:mm
  days: number[]; // [0,1,2,3,4,5,6]
  enabled: boolean;
  type: ReminderType;
  lastTriggered?: string;
}

export type HadithTopic = 'dhikr' | 'virtues' | 'repentance' | 'manners' | 'supplication' | 'patience';

export interface Hadith {
  id: string;
  hadithNumber: number | string;
  bookNumber: number;
  bookNameArabic: string;
  chapterArabic: string;
  textArabic: string;
  narratorArabic: string;
  benefitsArabic?: string;
  topic: HadithTopic;
  isFavorite?: boolean;
  referenceSource: string;
  grade: string; // e.g., 'صحيح - متفق عليه' or 'صحيح مسلم'
}

export type AdhkarCategory = 'morning' | 'evening' | 'after_prayer' | 'sleep';

export interface AdhkarEntry {
  id: string;
  category: AdhkarCategory;
  textArabic: string;
  count: number;
  currentReadCount: number;
  source: string;
  virtue: string;
  isQuran: boolean;
  isFavorite?: boolean;
  audioUrl?: string;
  reciter?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  useArabicNumerals: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  screenAwakeEnabled: boolean;
  notificationsEnabled: boolean;
  globalNotificationsMute: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // e.g. "22:00"
    end: string;   // e.g. "06:00"
  };
  dailyTargetDhikr: number;
  lastActiveDate: string;
  floatingTasbeehWidget?: boolean;
}

export interface ReportedError {
  id: string;
  hadithId: string;
  hadithNumber: string;
  reason: string;
  userNote: string;
  date: string;
}
