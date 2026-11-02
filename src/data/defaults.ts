import { WorshipTask, DhikrItem, ReminderItem, UserSettings } from '../types';

export const DEFAULT_TASKS: WorshipTask[] = [
  {
    id: 'task-fajr',
    title: 'صلاة الفجر في وقتها',
    category: 'prayer',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '05:00',
    reminderEnabled: true,
    order: 1,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-morning-adhkar',
    title: 'أذكار الصباح',
    category: 'adhkar',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '06:30',
    reminderEnabled: true,
    order: 2,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-duha',
    title: 'صلاة الضحى (ركعتان فأكثر)',
    category: 'voluntary',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '09:00',
    reminderEnabled: false,
    order: 3,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-dhuhr',
    title: 'صلاة الظهر',
    category: 'prayer',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '12:30',
    reminderEnabled: true,
    order: 4,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-asr',
    title: 'صلاة العصر',
    category: 'prayer',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '15:45',
    reminderEnabled: true,
    order: 5,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-evening-adhkar',
    title: 'أذكار المساء',
    category: 'adhkar',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '17:00',
    reminderEnabled: true,
    order: 6,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-maghrib',
    title: 'صلاة المغرب',
    category: 'prayer',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '18:15',
    reminderEnabled: true,
    order: 7,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-isha',
    title: 'صلاة العشاء',
    category: 'prayer',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '19:45',
    reminderEnabled: true,
    order: 8,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-quran',
    title: 'ورد تلاوة القرآن الكريم (جزء/حزب)',
    category: 'quran',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '20:30',
    reminderEnabled: true,
    order: 9,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-daily-dhikr',
    title: 'المسبحة اليومية (١٠٠ تسبيحة واستغفار)',
    category: 'dhikr',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '21:00',
    reminderEnabled: true,
    order: 10,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-witr',
    title: 'صلاة الوتر وقيام الليل',
    category: 'voluntary',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'daily',
    time: '22:30',
    reminderEnabled: false,
    order: 11,
    createdAt: '2026-01-01'
  },
  {
    id: 'task-kahf',
    title: 'قراءة سورة الكهف (يوم الجمعة)',
    category: 'quran',
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    recurrence: 'weekly',
    scheduledDays: [5], // Friday only
    time: '10:00',
    reminderEnabled: true,
    order: 12,
    createdAt: '2026-01-01'
  }
];

export const DEFAULT_DHIKR_ITEMS: DhikrItem[] = [
  {
    id: 'dhikr-subhanallah',
    text: 'سُبْحَانَ اللهِ',
    virtue: 'تنزيه الله تعالى عن كل نقص وعيب، وتغرس لصاحبها نخلة في الجنة',
    target: 33,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'تسبيح'
  },
  {
    id: 'dhikr-alhamdulillah',
    text: 'الْحَمْدُ لِلَّهِ',
    virtue: 'تَمْلأ الميزان بالثواب، وهي خير الدعاء وأعظم الثناء',
    target: 33,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'تحميد'
  },
  {
    id: 'dhikr-allahuakbar',
    text: 'اللهُ أَكْبَرُ',
    virtue: 'الله أكبر من كل شيء وأعظم من كل هم ودنيا',
    target: 33,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'تكبير'
  },
  {
    id: 'dhikr-tahlil',
    text: 'لَا إِلَهَ إِلَّا اللهُ',
    virtue: 'أفضل الذكر وكلمة الإخلاص والتوحيد ومفتاح الجنة',
    target: 100,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'تهليل'
  },
  {
    id: 'dhikr-istighfar',
    text: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',
    virtue: 'ممحاة للذنوب، جالبة للرزق والبركة وانشراح الصدر ونزول الغيث',
    target: 100,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'استغفار'
  },
  {
    id: 'dhikr-salawat',
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    virtue: 'من صلى عليه واحدة صلى الله عليه بها عشراً وحط عنه عشر خطيئات',
    target: 100,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'صلاة على النبي'
  },
  {
    id: 'dhikr-hawqalah',
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
    virtue: 'كنز من كنوز الجنة، وباب من أبواب تفريج الكرب ودفع المشاق',
    target: 100,
    count: 0,
    isCustom: false,
    isFavorite: false,
    category: 'حوقلة'
  },
  {
    id: 'dhikr-subhanallah-wabihamdih',
    text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ ، سُبْحَانَ اللهِ الْعَظِيمِ',
    virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
    target: 100,
    count: 0,
    isCustom: false,
    isFavorite: true,
    category: 'تسبيح'
  }
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-morning',
    title: 'أذكار الصباح',
    subtitle: 'حصن المسلم وبركة البكور',
    time: '06:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    type: 'morning_adhkar'
  },
  {
    id: 'rem-duha',
    title: 'صلاة الضحى',
    subtitle: 'صدقة عن كل مفصل في بدنك',
    time: '09:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    type: 'duha'
  },
  {
    id: 'rem-evening',
    title: 'أذكار المساء',
    subtitle: 'حفظ وسكينة مع غروب الشمس',
    time: '17:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    type: 'evening_adhkar'
  },
  {
    id: 'rem-friday-kahf',
    title: 'سورة الكهف والصلاة على النبي',
    subtitle: 'نور ما بين الجمعتين',
    time: '10:00',
    days: [5], // Friday
    enabled: true,
    type: 'friday'
  },
  {
    id: 'rem-night-tasbeeh',
    title: 'جلسة تسبيح واستغفار',
    subtitle: 'استغفار ودعاء قبل النوم',
    time: '21:30',
    days: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    type: 'tasbeeh'
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  useArabicNumerals: true,
  vibrationEnabled: true,
  soundEnabled: true,
  screenAwakeEnabled: false,
  notificationsEnabled: false,
  globalNotificationsMute: false,
  quietHours: {
    enabled: false,
    start: '23:00',
    end: '05:00'
  },
  dailyTargetDhikr: 300,
  lastActiveDate: new Date().toISOString().split('T')[0],
  floatingTasbeehWidget: true
};
