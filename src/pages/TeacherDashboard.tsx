// ============================================================
// TEACHER DASHBOARD - Dedicated Interface for Teachers
// ============================================================

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, Calendar, Clock, CheckCircle, Video, FileText } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { QuranTrackingModal } from '../components/teachers/QuranTrackingModal';

export const TeacherDashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<any>(null);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
  // حالة التحكم بنافذة سجل الحفظ
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        const currentUserString = localStorage.getItem('currentUser');
        if (!currentUserString) return;
        
        const currentUser = JSON.parse(currentUserString);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';

        // 1. جلب بيانات المعلم
        const teachersRes = await fetch(`${apiUrl}/teachers`);
        if (teachersRes.ok) {
          const teachersList = await teachersRes.json();
          const currentTeacher = teachersList.find((t: any) => t.userId === currentUser.id);
          setTeacher(currentTeacher);

          // 2. جلب طلاب المعلم
          if (currentTeacher) {
            const enrollmentsRes = await fetch(`${apiUrl}/enrollments`);
            if (enrollmentsRes.ok) {
              const allEnrollments = await enrollmentsRes.json();
              const teacherEnrollments = allEnrollments.filter((e: any) => e.teacherId === currentTeacher.id);
              setMyStudents(teacherEnrollments);
            }
          }
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات لوحة تحكم المعلم:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#27AE60] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري تجهيز مساحة العمل الخاصة بك...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على ملف المعلم</p>
        <p className="text-gray-500">يرجى التأكد من تسجيل الدخول بحساب معلم صالح.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ترويسة الترحيب */}
      <div className="bg-gradient-to-l from-[#1B4F72] to-[#27AE60] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">مرحباً بك، أستاذ {teacher.nameAr} 👋</h1>
            <p className="text-white/80 text-sm">مساحة العمل الخاصة بك - {teacher.specialization || 'مسار عام'}</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
             <Calendar size={18} className="text-white/80" />
             <span className="font-medium text-sm">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* المؤشرات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 border-t-4 border-[#1B4F72]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">طلابي الحاليين</p>
            <div className="p-2 bg-blue-50 text-[#1B4F72] rounded-lg"><Users size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">{myStudents.length}</p>
          <p className="text-xs text-gray-400 mt-2">طالب مسجل في مساراتك</p>
        </div>

        <div className="card p-5 border-t-4 border-[#27AE60]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">جلسات اليوم</p>
            <div className="p-2 bg-green-50 text-[#27AE60] rounded-lg"><Video size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">0</p>
          <p className="text-xs text-gray-400 mt-2">سيتم تفعيلها مع نظام الجدولة</p>
        </div>

        <div className="card p-5 border-t-4 border-[#F39C12]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">مستحقاتي التقديرية</p>
            <div className="p-2 bg-amber-50 text-[#F39C12] rounded-lg"><DollarSign size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">$0.00</p>
          <p className="text-xs text-amber-600 font-medium mt-2">
            {teacher.paymentMethod === 'PERCENTAGE' 
              ? `بناءً على نظام النسبة (${teacher.percentageRate}%)` 
              : `بناءً على الأجر بالساعة (${teacher.hourlyRate}$/ساعة)`}
          </p>
        </div>
      </div>

      {/* شريط التنقل الداخلي */}
      <div className="tabs-scrollable">
        <div className="tabs bg-white rounded-xl border border-gray-100 px-2 overflow-hidden" style={{ minWidth: 'max-content' }}>
          <button onClick={() => setActiveTab('students')} className={`tab ${activeTab === 'students' ? 'active' : ''}`}>
            <Users size={15} /> طلابي ({myStudents.length})
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}>
            <Calendar size={15} /> الجدول والجلسات
          </button>
          <button onClick={() => setActiveTab('reports')} className={`tab ${activeTab === 'reports' ? 'active' : ''}`}>
            <FileText size={15} /> التقارير الأكاديمية
          </button>
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className="card p-0 overflow-hidden">
        {activeTab === 'students' && (
          <div className="p-0 animate-fadeIn">
            {myStudents.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Users size={48} className="mx-auto mb-3 text-gray-200" />
                <p>لا يوجد طلاب مسجلين في مساراتك حالياً.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>المسار / الدورة</th>
                      <th>تاريخ الالتحاق</th>
                      <th>التقدم</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={enrollment.student?.nameAr} size="sm" />
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{enrollment.student?.nameAr}</p>
                              <p className="text-xs text-gray-400">{enrollment.student?.timezone}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm font-medium text-[#1B4F72] bg-blue-50 px-2 py-1 rounded-md">
                            {enrollment.course?.nameAr}
                          </span>
                        </td>
                        <td className="text-sm text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                              <div className="h-full bg-[#27AE60]" style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600">{enrollment.progress.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            onClick={() => setSelectedEnrollment(enrollment)} 
                            className="btn btn-outline btn-sm gap-1 border-gray-200 text-gray-600 hover:border-[#1B4F72] hover:text-[#1B4F72]"
                          >
                            <BookOpen size={14} /> سجل الحفظ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="p-12 text-center text-gray-400 animate-fadeIn">
            <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">الجدول الزمني</h3>
            <p className="text-sm">قريباً سيتم تفعيل نظام حجز وجدولة الجلسات التفاعلية.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-12 text-center text-gray-400 animate-fadeIn">
            <FileText size={48} className="mx-auto mb-3 text-gray-200" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">تقارير البحث والتطوير</h3>
            <p className="text-sm">المساحة المخصصة لرفع التقييمات وتقارير مستوى الطلاب.</p>
          </div>
        )}
      </div>

      {/* عرض نافذة التقييم عند اختيار طالب */}
      {selectedEnrollment && (
        <QuranTrackingModal 
          student={selectedEnrollment.student}
          teacherId={teacher.id}
          onClose={() => setSelectedEnrollment(null)}
          onSave={() => window.location.reload()} 
        />
      )}
    </div>
  );
};