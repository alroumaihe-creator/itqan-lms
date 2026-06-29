// ============================================================
// TEACHER DETAIL PAGE - Full Profile for Admin
// ============================================================

import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Users, BookOpen, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { StatusBadge } from '../components/shared/StatusBadge';

export const TeacherDetailPage: React.FC<{ teacherId: string, onBack: () => void }> = ({ teacherId, onBack }) => {
  const [teacher, setTeacher] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        const [teachersRes, sessionsRes, enrollmentsRes] = await Promise.all([
          fetch(`${apiUrl}/teachers`), fetch(`${apiUrl}/sessions`), fetch(`${apiUrl}/enrollments`)
        ]);

        if (teachersRes.ok) {
          const allTeachers = await teachersRes.json();
          setTeacher(allTeachers.find((t: any) => t.id === teacherId));
        }
        if (sessionsRes.ok) {
          const allSessions = await sessionsRes.json();
          setSessions(allSessions.filter((s: any) => s.teacherId === teacherId));
        }
        if (enrollmentsRes.ok) {
          const allEnrollments = await enrollmentsRes.json();
          setEnrollments(allEnrollments.filter((e: any) => e.teacherId === teacherId));
        }
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacherDetails();
  }, [teacherId]);

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!teacher) return <div className="text-center py-20 text-red-500 font-bold">لم يتم العثور على المعلم</div>;

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED');

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#1B4F72] text-sm font-bold">
        <ArrowRight size={16} /> العودة لقائمة المعلمين
      </button>

      {/* الترويسة الشاملة */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <Avatar name={teacher.nameAr} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-800 mb-1">{teacher.nameAr}</h1>
            <p className="text-gray-500 mb-3">{teacher.specialization || 'مسار عام'}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><BookOpen size={15}/> {teacher.paymentMethod === 'HOURLY' ? 'محاسبة بالساعة' : 'محاسبة بالنسبة'}</span>
              <span className="flex items-center gap-1"><CheckCircle size={15} className={teacher.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}/> {teacher.status === 'ACTIVE' ? 'نشط' : 'موقوف'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-black text-[#1B4F72]">{enrollments.length}</p>
            <p className="text-xs text-gray-400 mt-1">طالب مسجل</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#27AE60]">{completedSessions.length}</p>
            <p className="text-xs text-gray-400 mt-1">جلسة مكتملة</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-[#F39C12]">{upcomingSessions.length}</p>
            <p className="text-xs text-gray-400 mt-1">جلسة قادمة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* الطلاب المسجلين */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={18} className="text-[#1B4F72]"/> الطلاب والمسارات المشترك بها</h3>
          {enrollments.length === 0 ? <p className="text-center text-gray-400 py-4">لا يوجد طلاب</p> : (
            <div className="space-y-3">
              {enrollments.map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.student?.nameAr} size="sm" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{e.student?.nameAr}</p>
                      <p className="text-xs text-[#1B4F72]">{e.course?.nameAr}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">نشط</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الجلسات القادمة */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-[#1B4F72]"/> الجلسات القادمة</h3>
          {upcomingSessions.length === 0 ? <p className="text-center text-gray-400 py-4">لا توجد جلسات</p> : (
            <div className="space-y-3">
              {upcomingSessions.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="font-bold text-[#1B4F72] text-sm">{s.course?.nameAr}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12}/> {new Date(s.scheduledAt).toLocaleString('ar-SA')}</p>
                  </div>
                  <StatusBadge status={s.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};