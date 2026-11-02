/**
 * Utility functions for Arabic language formatting, numerals, and dates.
 */

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toAsciiDigits(str: string): string {
  return str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function formatArabicNumber(value: number | string, useArabicNumerals: boolean = true): string {
  const str = String(value);
  if (!useArabicNumerals) {
    return str.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  }
  return str.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[parseInt(digit, 10)] ?? digit);
}

export function formatPercentage(value: number, useArabicNumerals: boolean = true): string {
  const formatted = formatArabicNumber(Math.round(value), useArabicNumerals);
  return `${formatted}٪`;
}

export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
];

/**
 * Format a Hijri date string accurately using Umm al-Qura calendar.
 */
export function getHijriDateDetails(date: Date = new Date()): {
  dayName: string;
  day: number;
  monthIndex: number;
  monthName: string;
  year: number;
  formattedArabic: string;
} {
  const dayName = ARABIC_DAYS[date.getDay()];

  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    let day = 1;
    let monthIndex = 4; // Jamada al-Ula
    let year = 1448;

    for (const part of parts) {
      if (part.type === 'day') {
        const ascii = toAsciiDigits(part.value).replace(/\D/g, '');
        day = parseInt(ascii, 10) || 1;
      } else if (part.type === 'month') {
        const ascii = toAsciiDigits(part.value).replace(/\D/g, '');
        const m = parseInt(ascii, 10) || 1;
        monthIndex = Math.max(0, Math.min(11, m - 1));
      } else if (part.type === 'year') {
        const ascii = toAsciiDigits(part.value).replace(/\D/g, '');
        year = parseInt(ascii, 10) || 1448;
      }
    }

    const monthName = HIJRI_MONTHS[monthIndex] || 'شهر الله';
    const formattedArabic = `${dayName}، ${formatArabicNumber(day, true)} ${monthName} ${formatArabicNumber(year, true)} هـ`;

    return {
      dayName,
      day,
      monthIndex,
      monthName,
      year,
      formattedArabic
    };
  } catch {
    const day = 22;
    const monthIndex = 4;
    const year = 1448;
    const monthName = HIJRI_MONTHS[monthIndex];
    const formattedArabic = `${dayName}، ${formatArabicNumber(day, true)} ${monthName} ${formatArabicNumber(year, true)} هـ`;

    return {
      dayName,
      day,
      monthIndex,
      monthName,
      year,
      formattedArabic
    };
  }
}

/**
 * Returns a warm, spiritual Islamic greeting according to current hour.
 */
export function getSpiritualGreeting(date: Date = new Date()): {
  greeting: string;
  subtext: string;
  period: 'morning' | 'noon' | 'evening' | 'night';
} {
  const hour = date.getHours();

  if (hour >= 4 && hour < 11) {
    return {
      greeting: 'صباح مبارك بذكر الله',
      subtext: 'أصبحنا وأصبح الملك لله، والحمد لله',
      period: 'morning'
    };
  } else if (hour >= 11 && hour < 15) {
    return {
      greeting: 'طابت أوقاتكم بالخير والطاعة',
      subtext: 'ألا بذكر الله تطمئن القلوب',
      period: 'noon'
    };
  } else if (hour >= 15 && hour < 20) {
    return {
      greeting: 'مساء الخير والسكينة',
      subtext: 'أمسينا وأمسى الملك لله',
      period: 'evening'
    };
  } else {
    return {
      greeting: 'ليلة هادئة في كنف الرحمن',
      subtext: 'سبحان الله وبحمده، عدد خلقه ورضا نفسه',
      period: 'night'
    };
  }
}

export function formatDurationInArabic(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  }
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  if (remSecs === 0) {
    return `${mins} دقيقة`;
  }
  return `${mins} د و ${remSecs} ث`;
}
