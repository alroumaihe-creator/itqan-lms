// ============================================================
// FORMATTERS - Date, Currency, Text utilities
// ============================================================

import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Format date in Arabic
 */
export const formatDateAr = (date: string | Date, pattern = 'dd MMMM yyyy'): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, pattern, { locale: ar });
  } catch {
    return String(date);
  }
};

/**
 * Format date/time for display
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd/MM/yyyy - hh:mm a', { locale: ar });
  } catch {
    return String(date);
  }
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'hh:mm a', { locale: ar });
  } catch {
    return String(date);
  }
};

/**
 * Relative time (e.g., "منذ 5 دقائق")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isToday(d)) return `اليوم ${format(d, 'HH:mm')}`;
    if (isYesterday(d)) return `أمس ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `غداً ${format(d, 'HH:mm')}`;
    
    return formatDistanceToNow(d, { addSuffix: true, locale: ar });
  } catch {
    return String(date);
  }
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'ar-SA'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with Arabic locale
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

/**
 * Format percentage
 */
export const formatPercent = (value: number): string => `${Math.round(value)}%`;

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get initials from Arabic name
 */
export const getInitials = (name: string): string => {
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return words[0][0] + words[1][0];
  }
  return name.slice(0, 2);
};

/**
 * Quran surah names
 */
export const SURAH_NAMES: Record<number, string> = {
  1: 'الفاتحة',
  2: 'البقرة',
  3: 'آل عمران',
  4: 'النساء',
  5: 'المائدة',
  6: 'الأنعام',
  7: 'الأعراف',
  8: 'الأنفال',
  9: 'التوبة',
  10: 'يونس',
  11: 'هود',
  12: 'يوسف',
  13: 'الرعد',
  14: 'إبراهيم',
  15: 'الحجر',
  16: 'النحل',
  17: 'الإسراء',
  18: 'الكهف',
  19: 'مريم',
  20: 'طه',
  21: 'الأنبياء',
  22: 'الحج',
  23: 'المؤمنون',
  24: 'النور',
  25: 'الفرقان',
  26: 'الشعراء',
  27: 'النمل',
  28: 'القصص',
  29: 'العنكبوت',
  30: 'الروم',
  31: 'لقمان',
  32: 'السجدة',
  33: 'الأحزاب',
  34: 'سبأ',
  35: 'فاطر',
  36: 'يس',
  37: 'الصافات',
  38: 'ص',
  39: 'الزمر',
  40: 'غافر',
  41: 'فصلت',
  42: 'الشورى',
  43: 'الزخرف',
  44: 'الدخان',
  45: 'الجاثية',
  46: 'الأحقاف',
  47: 'محمد',
  48: 'الفتح',
  49: 'الحجرات',
  50: 'ق',
  51: 'الذاريات',
  52: 'الطور',
  53: 'النجم',
  54: 'القمر',
  55: 'الرحمن',
  56: 'الواقعة',
  57: 'الحديد',
  58: 'المجادلة',
  59: 'الحشر',
  60: 'الممتحنة',
  61: 'الصف',
  62: 'الجمعة',
  63: 'المنافقون',
  64: 'التغابن',
  65: 'الطلاق',
  66: 'التحريم',
  67: 'الملك',
  68: 'القلم',
  69: 'الحاقة',
  70: 'المعارج',
  71: 'نوح',
  72: 'الجن',
  73: 'المزمل',
  74: 'المدثر',
  75: 'القيامة',
  76: 'الإنسان',
  77: 'المرسلات',
  78: 'النبأ',
  79: 'النازعات',
  80: 'عبس',
  81: 'التكوير',
  82: 'الانفطار',
  83: 'المطففين',
  84: 'الانشقاق',
  85: 'البروج',
  86: 'الطارق',
  87: 'الأعلى',
  88: 'الغاشية',
  89: 'الفجر',
  90: 'البلد',
  91: 'الشمس',
  92: 'الليل',
  93: 'الضحى',
  94: 'الشرح',
  95: 'التين',
  96: 'العلق',
  97: 'القدر',
  98: 'البينة',
  99: 'الزلزلة',
  100: 'العاديات',
  101: 'القارعة',
  102: 'التكاثر',
  103: 'العصر',
  104: 'الهمزة',
  105: 'الفيل',
  106: 'قريش',
  107: 'الماعون',
  108: 'الكوثر',
  109: 'الكافرون',
  110: 'النصر',
  111: 'المسد',
  112: 'الإخلاص',
  113: 'الفلق',
  114: 'الناس',
};

/**
 * Get surah name by number
 */
export const getSurahName = (surahNum: number): string => {
  return SURAH_NAMES[surahNum] || `سورة ${surahNum}`;
};

/**
 * Student status labels
 */
export const STUDENT_STATUS_LABELS: Record<string, string> = {
  LEAD: 'مهتم',
  TRIAL: 'تجريبي',
  ACTIVE: 'نشط',
  SUSPENDED: 'موقوف',
  GRADUATED: 'متخرج',
  DROPPED: 'منسحب',
};

/**
 * Session status labels
 */
export const SESSION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'مجدولة',
  IN_PROGRESS: 'جارية',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغاة',
  POSTPONED: 'مؤجلة',
};

/**
 * Course type labels
 */
export const COURSE_TYPE_LABELS: Record<string, string> = {
  QURAN_QAIDA: 'القاعدة النورانية',
  QURAN_READING: 'تلاوة القرآن',
  QURAN_MEMORIZATION: 'تحفيظ القرآن',
  QURAN_TAJWEED: 'التجويد',
  QURAN_IJAZAH: 'الإجازة',
  ACADEMIC: 'أكاديمي',
};

/**
 * Track type labels
 */
export const TRACK_TYPE_LABELS: Record<string, string> = {
  NEW_MEMORIZATION: 'حفظ جديد',
  REVISION: 'مراجعة',
  READING: 'تلاوة',
  TAJWEED: 'تجويد',
};

/**
 * Invoice status labels
 */
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'مسودة',
  SENT: 'مُرسلة',
  PAID: 'مدفوعة',
  OVERDUE: 'متأخرة',
  CANCELLED: 'ملغاة',
};

/**
 * Payment method labels
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'تحويل بنكي',
  stripe: 'بطاقة ائتمان',
  paypal: 'باي بال',
  cash: 'نقداً',
  crypto: 'عملة رقمية',
};

/**
 * Role labels
 */
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'مدير عام',
  ADMIN: 'مدير',
  SUPERVISOR: 'مشرف',
  TEACHER: 'معلم',
  ACCOUNTANT: 'محاسب',
  PARENT: 'ولي أمر',
  STUDENT: 'طالب',
};

/**
 * Certificate type labels
 */
export const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  COURSE_COMPLETION: 'إتمام الدورة',
  MEMORIZATION: 'حفظ القرآن',
  LEVEL_PASS: 'اجتياز المستوى',
  TAJWEED: 'شهادة التجويد',
};

/**
 * Common Tajweed errors in Arabic
 */
export const TAJWEED_ERRORS = [
  'الغنة',
  'المد',
  'الإدغام',
  'الإخفاء',
  'القلقلة',
  'الوقف',
  'الابتداء',
  'الإقلاب',
  'الإظهار',
  'السكت',
  'التفخيم',
  'الترقيق',
  'المد اللازم',
  'المد العارض',
  'الهمزة',
];

/**
 * Days of week in Arabic
 */
export const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Months in Arabic
 */
export const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
