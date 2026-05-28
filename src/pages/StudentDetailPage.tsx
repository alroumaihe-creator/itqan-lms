// ============================================================
// STUDENT DETAIL PAGE - Full Profile with Tabs (Connected to API)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Edit, MoreVertical, BookMarked, GraduationCap,
  Calendar, CreditCard, FileText, MessageSquare, Phone, Mail,
  MapPin, Clock, Star, TrendingUp, CheckCircle, XCircle,
  AlertCircle, Award, Download
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  mockQuranRecords, mockInvoices, mockSessions,
  mockEnrollments, mockCertificates, mockTajweedErrors,
  mockQuranProgressData
} from '../data/mockData'; // تمت إزالة mockStudents لأننا سنجلب الطالب من السيرفر
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import {
  formatDateAr, formatCurrency, getSurahName,
  TRACK_TYPE_LABELS, INVOICE_STATUS_LABELS, formatRelativeTime
} from '../utils/formatters';
import type { Student } from '../types';

const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: GraduationCap },
  { id: 'quran', label: 'تتبع القرآن', icon: BookMarked },
  { id: 'academic', label: 'الأكاديمي', icon: TrendingUp },
  { id: 'attendance', label: 'الحضور', icon: Calendar },
  { id: 'finance', label: 'المالية', icon: CreditCard },
  { id: 'documents', label: 'الوثائق', icon: FileText },
  { id: 'notes', label: 'التواصل', icon: MessageSquare },
];

interface StudentDetailPageProps {
  studentId: string;
  onBack: () => void;
  onNavigate: (page: string, id?: string) => void;
}

const StarRating: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 10 }).map((_, i) => (
      <span
        key={i}
        className={`text-base leading-none ${i < score ? 'text-[#F39C12]' : 'text-gray-200'}`}
      >
        ★
      </span>
    ))}
    <span className="text-sm font-bold text-gray-600 mr-1">{score}/10</span>
  </div>
);

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  studentId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // 1. إضافة حالات التحميل والبيانات الحقيقية
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. جلب بيانات الطالب من السيرفر
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        
        // جلب جميع الطلاب والبحث عن الطالب المطلوب 
        // (في المستقبل سنصنع مسار مخصص لجلب طالب واحد لتسريع العملية)
        const response = await fetch(`${apiUrl}/students`);
        if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');
        
        const data = await response.json();
        const foundStudent = data.find((s: Student) => s.id === studentId);
        setStudent(foundStudent || null);
      } catch (error) {
        console.error("خطأ في جلب تفاصيل الطالب:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  // 3. شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب ملف الطالب...</p>
      </div>
    );
  }

  // 4. في حالة عدم العثور على الطالب
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-gray-800 font-bold text-lg">لم يتم العثور على بيانات الطالب</p>
        <button onClick={onBack} className="btn btn-primary">العودة لقائمة الطلاب</button>
      </div>
    );
  }

  // فلترة البيانات الوهمية بناءً على الـ ID الحقيقي (ستكون فارغة بشكل صحيح للطالب الجديد)
  const studentRecords = mockQuranRecords.filter((r) => r.studentId === student.id);
  const studentInvoices = mockInvoices.filter((i) => i.studentId === student.id);
  const studentEnrollments = mockEnrollments.filter((e) => e.studentId === student.id);
  const studentCerts = mockCertificates.filter((c) => c.studentId === student.id);

  const totalPagesMemorized = studentRecords.reduce(
    (sum, r) => sum + (r.pagesCount || 0), 0
  );
  const avgScore = studentRecords.length > 0
    ? studentRecords.reduce((s, r) => s + (r.recitationScore || 0), 0) / studentRecords.length
    : 0;

  // Attendance mock data
  const attendanceData = [
    { month: 'مارس', present: 10, absent: 1 },
    { month: 'أبريل', present: 11, absent: 2 },
    { month: 'مايو', present: 12, absent: 0 },
    { month: 'يونيو', present: 10, absent: 1 },
  ];

  const tajweedRadarData = mockTajweedErrors.map((e) => ({
    subject: e.error,
    count: e.count,
    fullMark: 20,
  }));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1B4F72] transition-colors text-sm font-medium"
      >
        <ArrowRight size={16} />
        العودة إلى قائمة الطلاب
      </button>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative">
            <Avatar name={student.nameAr} size="xl" imageUrl={student.profileImageUrl} />
            <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-[#1B4F72] rounded-full flex items-center justify-center text-white shadow-lg">
              <Edit size={12} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-800 mb-1">{student.nameAr}</h1>
                {student.nameEn && (
                  <p className="text-gray-400 text-sm mb-2">{student.nameEn}</p>
                )}
                <StatusBadge status={student.status} />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm gap-1">
                  <Edit size={15} />
                  تعديل
                </button>
                <button className="btn btn-icon btn-ghost btn-sm">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail size={15} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{student.user?.email || 'لا يوجد بريد'}</span>
              </div>
              {student.nationality && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                  <span>{student.nationality}</span>
                </div>
              )}
              {student.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span>{formatDateAr(student.dateOfBirth)}</span>
                </div>
              )}
              {student.timezone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={15} className="text-gray-400 flex-shrink-0" />
                  <span>{student.timezone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1B4F72]">{totalPagesMemorized.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-0.5">صفحات محفوظة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#27AE60]">{avgScore.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-0.5">متوسط الدرجات</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#F39C12]">{studentEnrollments.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">دورات مسجل بها</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#9B59B6]">{studentCerts.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">شهادات</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-scrollable">
        <div className="tabs bg-white rounded-xl border border-gray-100 px-2 overflow-hidden" style={{ minWidth: 'max-content' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeIn">
          {/* Enrollments */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">الدورات المسجل بها</h3>
            {studentEnrollments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">لا توجد دورات مسجلة حالياً</p>
            ) : (
              <div className="space-y-3">
                {studentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-800 text-sm">{enrollment.course?.nameAr}</p>
                      <span className={`text-xs font-bold ${enrollment.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {enrollment.isActive ? 'نشط' : 'مكتمل'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill bg-gradient-to-r from-[#1B4F72] to-[#2E86AB]"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{enrollment.progress}% مكتمل</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">آخر الجلسات</h3>
            <div className="space-y-3">
              {mockSessions.slice(0, 4).map((session) => (
                <div key={session.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    session.status === 'COMPLETED' ? 'bg-green-100' :
                    session.status === 'CANCELLED' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {session.status === 'COMPLETED'
                      ? <CheckCircle size={16} className="text-green-600" />
                      : session.status === 'CANCELLED'
                      ? <XCircle size={16} className="text-red-500" />
                      : <Clock size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{session.course?.nameAr}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(session.scheduledAt).toLocaleDateString('ar-SA', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <StatusBadge status={session.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          {studentCerts.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">الشهادات</h3>
              <div className="space-y-2">
                {studentCerts.map((cert) => (
                  <div key={cert.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <Award size={20} className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{cert.titleAr}</p>
                      <p className="text-xs text-gray-400">{formatDateAr(cert.issueDate)}</p>
                    </div>
                    <button className="btn btn-icon btn-ghost btn-sm">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {student.notes && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-3">ملاحظات</h3>
              <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">
                {student.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quran Tab */}
      {activeTab === 'quran' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quran Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card" style={{ borderRightColor: '#1B4F72' }}>
              <p className="text-gray-500 text-xs mb-1">إجمالي الصفحات</p>
              <p className="text-3xl font-black text-[#1B4F72]">{totalPagesMemorized.toFixed(1)}</p>
              <p className="text-xs text-gray-400">من 604 صفحة</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
              <p className="text-gray-500 text-xs mb-1">متوسط الدرجة</p>
              <p className="text-3xl font-black text-[#27AE60]">{avgScore.toFixed(1)}</p>
              <p className="text-xs text-gray-400">من 10</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <p className="text-gray-500 text-xs mb-1">عدد الجلسات</p>
              <p className="text-3xl font-black text-[#F39C12]">{studentRecords.length}</p>
              <p className="text-xs text-gray-400">إجمالي</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#9B59B6' }}>
              <p className="text-gray-500 text-xs mb-1">التقدم الكلي</p>
              <p className="text-3xl font-black text-[#9B59B6]">
                {((totalPagesMemorized / 604) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">من القرآن الكريم</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">التقدم في حفظ القرآن</h3>
              <span className="text-sm font-bold text-[#1B4F72]">{totalPagesMemorized.toFixed(1)} / 604 صفحة</span>
            </div>
            <div className="progress-bar h-4 rounded-full">
              <div
                className="progress-fill rounded-full bg-gradient-to-l from-[#F39C12] via-[#2E86AB] to-[#1B4F72]"
                style={{ width: `${Math.min((totalPagesMemorized / 604) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Weekly Progress */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">التقدم الأسبوعي</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockQuranProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip />
                    <Bar dataKey="pages" fill="#1B4F72" radius={[4, 4, 0, 0]} name="صفحات محفوظة" />
                    <Bar dataKey="goal" fill="#F39C12" radius={[4, 4, 0, 0]} name="الهدف" opacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tajweed Errors Radar */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">أكثر أخطاء التجويد</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={tajweedRadarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 20]} tick={{ fontSize: 9 }} />
                    <Radar
                      name="أخطاء"
                      dataKey="count"
                      stroke="#E74C3C"
                      fill="#E74C3C"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Records Timeline */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">سجل الجلسات القرآنية</h3>
            {studentRecords.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد سجلات قرآنية محفوظة لهذا الطالب حتى الآن</p>
            ) : (
              <div className="timeline">
                {studentRecords.map((record) => (
                  <div key={record.id} className="timeline-item">
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor:
                          record.trackType === 'NEW_MEMORIZATION' ? '#1B4F72' :
                          record.trackType === 'REVISION' ? '#27AE60' :
                          record.trackType === 'READING' ? '#2E86AB' : '#F39C12',
                      }}
                    />
                    <div className="card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {TRACK_TYPE_LABELS[record.trackType]}
                          </span>
                          <p className="font-semibold text-gray-800 mt-1">
                            {record.surahStart && getSurahName(record.surahStart)}
                            {record.ayahStart && ` (${record.ayahStart})`}
                            {record.surahEnd && ` → ${getSurahName(record.surahEnd)}`}
                            {record.ayahEnd && ` (${record.ayahEnd})`}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-gray-400">{formatRelativeTime(record.date)}</p>
                          <p className="text-xs font-bold text-[#1B4F72] mt-0.5">{record.pagesCount} صفحة</p>
                        </div>
                      </div>

                      {record.recitationScore && (
                        <StarRating score={record.recitationScore} />
                      )}

                      {record.tajweedErrors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.tajweedErrors.map((err) => (
                            <span
                              key={err}
                              className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs"
                            >
                              {err}
                            </span>
                          ))}
                        </div>
                      )}

                      {record.teacherNotes && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">
                          <span className="font-bold">ملاحظة المعلم: </span>
                          {record.teacherNotes}
                        </p>
                      )}

                      {record.weeklyGoalMet !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${record.weeklyGoalMet ? 'text-green-600' : 'text-red-500'}`}>
                          {record.weeklyGoalMet ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {record.weeklyGoalMet ? 'تم تحقيق الهدف الأسبوعي' : 'لم يتحقق الهدف الأسبوعي'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
              <p className="text-xs text-gray-400">حاضر</p>
              <p className="text-3xl font-black text-green-600">0</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#E74C3C' }}>
              <p className="text-xs text-gray-400">غائب</p>
              <p className="text-3xl font-black text-red-500">0</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <p className="text-xs text-gray-400">نسبة الحضور</p>
              <p className="text-3xl font-black text-amber-500">0%</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">الحضور الشهري</h3>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="present" fill="#27AE60" radius={[4, 4, 0, 0]} name="حاضر" />
                  <Bar dataKey="absent" fill="#E74C3C" radius={[4, 4, 0, 0]} name="غائب" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
              <p className="text-xs text-gray-400">إجمالي المدفوع</p>
              <p className="text-2xl font-black text-green-600">
                {formatCurrency(studentInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0))}
              </p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <p className="text-xs text-gray-400">مستحق</p>
              <p className="text-2xl font-black text-amber-500">
                {formatCurrency(studentInvoices.filter(i => ['SENT', 'DRAFT'].includes(i.status)).reduce((s, i) => s + i.total, 0))}
              </p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#E74C3C' }}>
              <p className="text-xs text-gray-400">متأخر</p>
              <p className="text-2xl font-black text-red-500">
                {formatCurrency(studentInvoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0))}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">الفواتير</h3>
            </div>
            {studentInvoices.length === 0 ? (
               <p className="text-gray-400 text-sm text-center py-8">لا توجد فواتير مالية مسجلة</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {studentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">
                        {invoice.dueDate
                          ? `يستحق: ${new Date(invoice.dueDate).toLocaleDateString('ar-SA')}`
                          : '—'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{formatCurrency(invoice.total, invoice.currency)}</p>
                    </div>
                    <StatusBadge status={invoice.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="upload-area">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 mb-1">رفع وثيقة جديدة</p>
            <p className="text-sm text-gray-400">اسحب وأفلت الملف هنا، أو انقر للاختيار</p>
            <p className="text-xs text-gray-300 mt-1">PDF, JPG, PNG (حتى 10MB)</p>
          </div>
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">الوثائق المرفوعة</h3>
            </div>
            <div className="p-8 text-center text-gray-400">
              <FileText size={40} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">لا توجد وثائق بعد</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Communication Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card p-4">
            <div className="form-group">
              <label className="form-label">إضافة ملاحظة أو رسالة</label>
              <textarea
                rows={3}
                placeholder="اكتب ملاحظاتك هنا..."
                className="form-input resize-none"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary btn-sm gap-1">
                <MessageSquare size={14} />
                إرسال
              </button>
              <button className="btn btn-ghost btn-sm gap-1">
                <Phone size={14} />
                اتصال
              </button>
              <button className="btn btn-ghost btn-sm gap-1">
                <Mail size={14} />
                بريد
              </button>
            </div>
          </div>
          <div className="card p-8 text-center text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">لا توجد محادثات بعد</p>
          </div>
        </div>
      )}

      {/* Academic Tab */}
      {activeTab === 'academic' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">الدورات والتقدم</h3>
            {studentEnrollments.length === 0 ? (
               <p className="text-gray-400 text-sm text-center py-8">لا توجد دورات مسجلة حالياً</p>
            ) : (
              <div className="space-y-4">
                {studentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{enrollment.course?.nameAr}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          مسجل منذ {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className={`text-2xl font-black ${
                        enrollment.progress >= 75 ? 'text-green-600' :
                        enrollment.progress >= 50 ? 'text-[#1B4F72]' : 'text-amber-500'
                      }`}>
                        {enrollment.progress}%
                      </span>
                    </div>
                    <div className="progress-bar h-3 rounded-full">
                      <div
                        className="progress-fill rounded-full"
                        style={{
                          width: `${enrollment.progress}%`,
                          background: `linear-gradient(to left, #F39C12, #1B4F72)`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                      <span>0%</span>
                      <span>مكتمل: {enrollment.progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">الاختبارات</h3>
            <div className="text-center py-8 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm">لم يُجرِ الطالب أي اختبارات بعد</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};