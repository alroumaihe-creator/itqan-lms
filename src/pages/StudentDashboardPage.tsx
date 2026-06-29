// ============================================================
// STUDENT DASHBOARD PAGE - The Student's Personal Portal
// ============================================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, BookMarked, CreditCard, Clock, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [quranRecords, setQuranRecords] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        
        // 1. جلب بيانات الطالب بناءً على إيميل المستخدم الحالي
        const studentsRes = await fetch(`${apiUrl}/students`);
        const allStudents = await studentsRes.json();
        const me = allStudents.find((s: any) => s.user?.email === user?.email);
        
        if (me) {
          setStudentInfo(me);
          // 2. جلب البيانات المرتبطة بهذا الطالب فقط
          const [enrollRes, quranRes, invRes] = await Promise.all([
            fetch(`${apiUrl}/enrollments`),
            fetch(`${apiUrl}/quran-records/${me.id}`),
            fetch(`${apiUrl}/invoices`)
          ]);

          if (enrollRes.ok) {
            const allEnrolls = await enrollRes.json();
            setEnrollments(allEnrolls.filter((e: any) => e.studentId === me.id));
          }
          if (quranRes.ok) setQuranRecords(await quranRes.json());
          if (invRes.ok) {
            const allInvs = await invRes.json();
            setInvoices(allInvs.filter((i: any) => i.studentId === me.id));
          }
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchMyData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري تجهيز مساحتك التعليمية...</p>
      </div>
    );
  }

  if (!studentInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <AlertCircle size={60} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">عفواً، لم نجد بياناتك!</h2>
        <p className="text-gray-500">يبدو أنه لم يتم استكمال ربط حسابك بملف طالب. يرجى مراجعة الإدارة.</p>
      </div>
    );
  }

  const totalPages = quranRecords.reduce((sum, r) => sum + (r.pagesCount || 0), 0);
  const unPaidInvoices = invoices.filter(i => i.status !== 'PAID');

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* الترحيب بالطالب */}
      <div className="bg-gradient-to-l from-[#1B4F72] to-[#2E86AB] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <Avatar name={studentInfo.nameAr} size="xl" className="border-4 border-white/20 shadow-xl" />
          <div className="text-center md:text-right">
            <h1 className="text-3xl font-black mb-2">أهلاً بك يا {studentInfo.nameAr.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 opacity-90 mb-4">نحن فخورون بتقدمك. استمر في رحلتك القرآنية والأكاديمية.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-bold">
              <span className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">📖 {totalPages} صفحة محفوظة</span>
              <span className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">🎓 {enrollments.length} مسار نشط</span>
            </div>
          </div>
        </div>
        {/* تصميم زخرفي في الخلفية */}
        <BookOpen size={200} className="absolute -left-10 -bottom-10 text-white opacity-5 rotate-12" />
      </div>

      {/* التبويبات */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'overview' ? 'bg-[#1B4F72] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          <BookOpen size={18} /> مساراتي
        </button>
        <button onClick={() => setActiveTab('quran')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'quran' ? 'bg-[#1B4F72] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          <BookMarked size={18} /> سجل القرآن
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'finance' ? 'bg-[#1B4F72] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
          <CreditCard size={18} /> المالية {unPaidInvoices.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unPaidInvoices.length}</span>}
        </button>
      </div>

      {/* المحتوى */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {enrollments.length === 0 ? (
            <div className="col-span-full card p-10 text-center text-gray-400">
              <Award size={50} className="mx-auto mb-3 opacity-50" />
              <p>لست مسجلاً في أي مسار حالياً.</p>
            </div>
          ) : (
            enrollments.map(e => (
              <div key={e.id} className="card p-6 border-t-4 border-t-[#27AE60] hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{e.course?.nameAr}</h3>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2"><Clock size={16}/> المعلم: {e.teacher?.nameAr || 'في انتظار التعيين'}</p>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-[#1B4F72]">نسبة التقدم</span>
                  <span className="text-[#27AE60]">{e.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-gradient-to-l from-[#27AE60] to-[#2E86AB] h-3 rounded-full" style={{ width: `${e.progress}%` }}></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'quran' && (
        <div className="card p-0 overflow-hidden animate-fadeIn">
          {quranRecords.length === 0 ? (
            <div className="p-10 text-center text-gray-400"><BookMarked size={50} className="mx-auto mb-3 opacity-50" /><p>لا توجد سجلات قرآنية بعد.</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {quranRecords.map(record => (
                <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-[#1B4F72] mb-2 inline-block">
                      {record.trackType === 'NEW_MEMORIZATION' ? 'حفظ جديد' : 'مراجعة'}
                    </span>
                    <h4 className="font-bold text-gray-800 text-lg">من: {record.surahStart} - إلى: {record.surahEnd}</h4>
                    <p className="text-sm text-gray-500 mt-1">{new Date(record.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm text-center min-w-[120px]">
                    <p className="text-xs text-gray-400 mb-1">التقييم</p>
                    <p className="font-black text-xl text-[#F39C12]">{record.recitationScore ? `${record.recitationScore}/10` : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="card p-0 overflow-hidden animate-fadeIn">
          {invoices.length === 0 ? (
            <div className="p-10 text-center text-gray-400"><CreditCard size={50} className="mx-auto mb-3 opacity-50" /><p>لا توجد فواتير مسجلة.</p></div>
          ) : (
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr><th className="p-4">رقم الفاتورة</th><th className="p-4">التاريخ</th><th className="p-4">البيان</th><th className="p-4">المبلغ</th><th className="p-4">الحالة</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm text-gray-500">INV-{inv.id.split('-')[0].toUpperCase()}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(inv.issueDate).toLocaleDateString('ar-SA')}</td>
                    <td className="p-4 text-sm font-medium">{inv.notes || 'رسوم دراسية'}</td>
                    <td className="p-4 font-black text-[#1B4F72]">${inv.amount.toFixed(2)}</td>
                    <td className="p-4">
                      {inv.status === 'PAID' ? 
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold w-max"><CheckCircle size={14}/> مدفوعة</span> : 
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-xs font-bold w-max"><AlertCircle size={14}/> مستحقة</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};