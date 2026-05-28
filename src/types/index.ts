// ============================================================
// SHARED TYPES - Academic Management System
// ============================================================

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'TEACHER' | 'ACCOUNTANT' | 'PARENT' | 'STUDENT';
export type StudentStatus = 'LEAD' | 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
export type SessionType = 'INDIVIDUAL' | 'GROUP';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type QuranTrackType = 'NEW_MEMORIZATION' | 'REVISION' | 'READING' | 'TAJWEED';
export type CourseType = 'QURAN_QAIDA' | 'QURAN_READING' | 'QURAN_MEMORIZATION' | 'QURAN_TAJWEED' | 'QURAN_IJAZAH' | 'ACADEMIC';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';
export type CertificateType = 'COURSE_COMPLETION' | 'MEMORIZATION' | 'LEVEL_PASS' | 'TAJWEED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  student?: Student;
  teacher?: Teacher;
  parent?: Parent;
  admin?: Admin;
}

export interface Student {
  id: string;
  userId: string;
  nameAr: string;
  nameEn?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  timezone: string;
  profileImageUrl?: string;
  status: StudentStatus;
  enrollmentDate?: string;
  notes?: string;
  user: User;
  parentLinks?: StudentParent[];
  enrollments?: Enrollment[];
  createdAt: string;
}

export interface Parent {
  id: string;
  userId: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  whatsapp?: string;
  user: User;
  studentLinks?: StudentParent[];
}

export interface StudentParent {
  id: string;
  studentId: string;
  parentId: string;
  relation?: string;
  isPrimary: boolean;
  student?: Student;
  parent?: Parent;
}

export interface Teacher {
  id: string;
  userId: string;
  nameAr: string;
  nameEn?: string;
  specializations: string[];
  bio?: string;
  timezone: string;
  hourlyRate?: number;
  isAvailable: boolean;
  user: User;
  sessions?: Session[];
  createdAt: string;
}

export interface Course {
  id: string;
  nameAr: string;
  nameEn?: string;
  description?: string;
  type: CourseType;
  level: number;
  durationWeeks?: number;
  price?: number;
  isActive: boolean;
  teachers?: CourseTeacher[];
  enrollments?: Enrollment[];
  createdAt: string;
}

export interface CourseTeacher {
  id: string;
  courseId: string;
  teacherId: string;
  isLead: boolean;
  course?: Course;
  teacher?: Teacher;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedAt?: string;
  isActive: boolean;
  progress: number;
  student?: Student;
  course?: Course;
}

export interface Session {
  id: string;
  courseId?: string;
  teacherId: string;
  type: SessionType;
  status: SessionStatus;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingLink?: string;
  notes?: string;
  cancellationReason?: string;
  isRecurring: boolean;
  course?: Course;
  teacher?: Teacher;
  attendances?: Attendance[];
  createdAt: string;
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  notes?: string;
  session?: Session;
  student?: Student;
}

export interface QuranTrackingRecord {
  id: string;
  studentId: string;
  teacherId: string;
  sessionId?: string;
  date: string;
  trackType: QuranTrackType;
  surahStart?: number;
  ayahStart?: number;
  surahEnd?: number;
  ayahEnd?: number;
  pagesCount?: number;
  recitationScore?: number;
  tajweedErrors: string[];
  teacherNotes?: string;
  weeklyGoalMet?: boolean;
  student?: Student;
  teacher?: Teacher;
  createdAt: string;
}

export interface Exam {
  id: string;
  courseId?: string;
  titleAr: string;
  titleEn?: string;
  description?: string;
  type: string;
  totalMarks: number;
  passingMarks: number;
  durationMinutes?: number;
  scheduledAt?: string;
  isActive: boolean;
  course?: Course;
  questions?: Question[];
  attempts?: ExamAttempt[];
  createdAt: string;
}

export interface Question {
  id: string;
  examId: string;
  textAr: string;
  textEn?: string;
  type: string;
  options?: Record<string, string>;
  answer?: string;
  marks: number;
  orderIndex: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  isPassed?: boolean;
  teacherFeedback?: string;
  student?: Student;
  exam?: Exam;
  answers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer?: string;
  score?: number;
  feedback?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  dueDate?: string;
  notes?: string;
  student?: Student;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  transactionRef?: string;
  paidAt?: string;
  notes?: string;
  invoice?: Invoice;
  createdAt: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  packageName: string;
  sessionsTotal?: number;
  sessionsUsed: number;
  startDate: string;
  endDate?: string;
  monthlyFee?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  type: CertificateType;
  titleAr: string;
  titleEn?: string;
  issueDate: string;
  verificationCode: string;
  fileUrl?: string;
  student?: Student;
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  courseId?: string;
  titleAr: string;
  titleEn?: string;
  description?: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  fileSize?: number;
  isPublic: boolean;
  course?: Course;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  userId: string;
  nameAr: string;
  nameEn?: string;
  permissions?: Record<string, unknown>;
  user?: User;
}

// Dashboard & Analytics types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalSessions: number;
  sessionsThisWeek: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalPages: number;
  attendanceRate: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target: number;
}

export interface AttendanceDataPoint {
  day: string;
  present: number;
  absent: number;
  late: number;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  nameAr: string;
  profileImageUrl?: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Filters
export interface StudentFilters {
  search?: string;
  status?: StudentStatus | 'ALL';
  courseId?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
}

export interface SessionFilters {
  search?: string;
  status?: SessionStatus | 'ALL';
  teacherId?: string;
  courseId?: string;
  dateFrom?: string;
  dateTo?: string;
}
