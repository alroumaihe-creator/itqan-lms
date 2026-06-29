// ============================================================
// TEACHER DASHBOARD - Dedicated Interface for Teachers
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, BookOpen, DollarSign, Calendar, Clock, CheckCircle, 
  Video, FileText, UserCheck, X, Trash2, ExternalLink, RefreshCw, Plus 
} from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { QuranTrackingModal } from '../components/teachers/QuranTrackingModal';
import { useAuthStore } from '../stores/authStore'; // 💡 التحديث 1: استيراد المخزن المركزي

export const TeacherDashboard: React.FC = () => {
  const { user: currentUser } = useAuthStore(); // 💡 التحديث 2: جلب المستخدم النشط حالياً من المخزن
  const [teacher, setTeacher] = useState<any>(null);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState<any>(null);

  const fetchTeacherData = async () => {
    // 💡 التحديث 3: التأكد من وجود بيانات المستخدم في المخزن قبل البحث
    if (!currentUser || !currentUser.email) {
      setIsLoading(false);
      return; 
    }

    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';

      const teachersRes = await fetch(`${apiUrl}/teachers`);
      if (teachersRes.ok) {
        const teachersList = await teachersRes.json();
        
        // البحث عن المعلم بالإيميل المسجل حالياً في المتصفح
        const currentTeacher = teachersList.find((t: any) => 
          t.userId === currentUser.id || 
          (t.user && t.user.email?.toLowerCase() === currentUser.email?.toLowerCase())
        );
        
        setTeacher(currentTeacher);

        if (currentTeacher) {
          const [enrollmentsRes, sessionsRes] = await Promise.all([
            fetch(`${apiUrl}/enrollments`),
            fetch(`${apiUrl}/sessions`)
          ]);

          if (enrollmentsRes.ok) {
            const allEnrollments = await enrollmentsRes.json();
            setMyStudents(allEnrollments.filter((e: any) => e.teacherId === currentTeacher.id));
          }

          if (sessionsRes.ok) {
            const allSessions = await sessionsRes.json();
            setSessions(allSessions.filter((s: any) => s.teacherId === currentTeacher.id));
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [currentUser]); // 💡 التحديث 4: إعادة الجلب تلقائياً إذا تغير المستخدم

  // دالة حذف الجلسة
  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الجلسة؟')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const res = await fetch(`${apiUrl}/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
      } else {
        alert('فشل حذف الجلسة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  // استخراج الدورات الفريدة
  const myUniqueCourses = Array.from(new Set(myStudents.map(e => e.course?.id)))
    .map(id => myStudents.find(e => e.course?.id === id)?.course)
    .filter(Boolean);

  // فلترة الجلسات بالتاريخ
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt).toISOString().split('T')[0];
      return sessionDate >= dateFrom && sessionDate <= dateTo;
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [sessions, dateFrom, dateTo]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#27AE60] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري مطابقة البيانات وفتح مساحة العمل...</p>
      </div>
    );
  }

  if (!teacher) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
      <Users size={64} className="text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على ملف المعلم</h2>
      <p className="text-gray-500 max-w-md">عذراً، البريد الإلكتروني <strong className="text-gray-700">({currentUser?.email})</strong> غير مرتبط بأي ملف معلم في قاعدة البيانات الحقيقية. يرجى مراجعة الإدارة لإضافتك كمعلم.</p>
    </div>
  );

  const scheduledSessions = sessions.filter(s => s.status === 'SCHEDULED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* الترويسة */}
      <div className="bg-gradient-to-l from-[#1B4F72] to-[#27AE60] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1">مرحباً بك، أستاذ {teacher.nameAr} 👋</h1>
          <p className="text-white/80 text-sm">مساحة العمل الخاصة بك - {teacher.specialization || 'مسار عام'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 border-t-4 border-[#1B4F72]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">طلابي الحاليين</p>
            <div className="p-2 bg-blue-50 text-[#1B4F72] rounded-lg"><Users size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">{myStudents.length}</p>
        </div>

        <div className="card p-5 border-t-4 border-[#27AE60]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">إجمالي الجلسات القادمة</p>
            <div className="p-2 bg-green-50 text-[#27AE60] rounded-lg"><Calendar size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">{scheduledSessions.length}</p>
        </div>

        <div className="card p-5 border-t-4 border-[#F39C12]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">جلسات مكتملة</p>
            <div className="p-2 bg-amber-50 text-[#F39C12] rounded-lg"><CheckCircle size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-800">{completedSessions.length}</p>
        </div>
      </div>

      {/* شريط التنقل */}
      <div className="tabs-scrollable">
        <div className="tabs bg-white rounded-xl border border-gray-100 px-2 overflow-hidden" style={{ minWidth: 'max-content' }}>
          <button onClick={() => setActiveTab('schedule')} className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}>
            <Calendar size={15} /> الجدول والجلسات
          </button>
          <button onClick={() => setActiveTab('students')} className={`tab ${activeTab === 'students' ? 'active' : ''}`}>
            <Users size={15} /> طلابي ({myStudents.length})
          </button>
          <button onClick={() => setActiveTab('reports')} className={`tab ${activeTab === 'reports' ? 'active' : ''}`}>
            <FileText size={15} /> التقارير الأكاديمية
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        
        {/* تبويب الجلسات */}
        {activeTab === 'schedule' && (
          <div className="p-5 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">جدول الجلسات</h3>
              <button onClick={() => setShowSessionModal(true)} className="btn btn-primary btn-sm gap-2">
                <Plus size={16} /> جدولة جلسة
              </button>
            </div>
            
            {/* شريط فلترة التواريخ */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-700">من:</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input text-sm py-1.5" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-700">إلى:</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input text-sm py-1.5" />
                </div>
              </div>
              <button 
                onClick={() => { setDateFrom(todayStr); setDateTo(todayStr); }} 
                className="btn btn-sm btn-outline border-blue-200 text-[#1B4F72] hover:bg-blue-50"
              >
                جلسات اليوم فقط
              </button>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                <p>لا توجد جلسات مجدولة في هذا النطاق الزمني.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map(session => (
                  <div key={session.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-[#1B4F72]'}`}>
                        <Video size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{session.course?.nameAr}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(session.scheduledAt).toLocaleDateString('ar-SA')}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {new Date(session.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit'})}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {session.durationMinutes} دقيقة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                      {session.status === 'SCHEDULED' ? (
                        <>
                          {session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm border-blue-200 text-[#1B4F72] hover:bg-blue-50">
                              <ExternalLink size={14} className="ml-1" /> بدء اللقاء
                            </a>
                          )}
                          <button onClick={() => setAttendanceSession(session)} className="btn btn-success btn-sm">
                            <UserCheck size={14} className="ml-1" /> رصد الحضور
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold flex items-center gap-1">
                          <CheckCircle size={14} /> مكتملة
                        </span>
                      )}
                      
                      <button onClick={() => handleDeleteSession(session.id)} className="btn btn-icon btn-ghost btn-sm text-red-400 hover:bg-red-50 hover:text-red-600 tooltip" data-tip="حذف الجلسة">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* تبويب الطلاب */}
        {activeTab === 'students' && (
          <div className="p-0 animate-fadeIn">
            {myStudents.length === 0 ? (
               <div className="text-center py-10 text-gray-400">لا يوجد طلاب مسجلين في مساراتك.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>الدورة</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={enrollment.student?.nameAr} size="sm" />
                            <span className="font-semibold text-gray-800 text-sm">{enrollment.student?.nameAr}</span>
                          </div>
                        </td>
                        <td><span className="text-sm font-medium text-[#1B4F72] bg-blue-50 px-2 py-1 rounded-md">{enrollment.course?.nameAr}</span></td>
                        <td>
                          <button onClick={() => setSelectedEnrollment(enrollment)} className="btn btn-outline btn-sm border-gray-200 text-gray-600 hover:text-[#1B4F72]">
                            <BookOpen size={14} className="ml-1" /> سجل الحفظ
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

        {/* تبويب التقارير الأكاديمية */}
        {activeTab === 'reports' && (
          <div className="p-12 text-center text-gray-400 animate-fadeIn">
            <FileText size={48} className="mx-auto mb-3 text-gray-200" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">التقارير الأكاديمية</h3>
            <p className="text-sm">هذه المساحة مخصصة لرفع تقييمات الطلاب ولجنة البحث والتطوير.</p>
          </div>
        )}
      </div>

      {selectedEnrollment && (
        <QuranTrackingModal 
          student={selectedEnrollment.student} 
          teacherId={teacher.id} 
          onClose={() => setSelectedEnrollment(null)} 
          onSave={fetchTeacherData} 
        />
      )}

      {showSessionModal && (
        <ScheduleSessionModal 
          teacherId={teacher.id} 
          courses={myUniqueCourses} 
          onClose={() => setShowSessionModal(false)} 
          onSave={fetchTeacherData} 
        />
      )}

      {attendanceSession && (
        <AttendanceModal 
          session={attendanceSession} 
          enrollments={myStudents.filter(e => e.courseId === attendanceSession.courseId)} 
          onClose={() => setAttendanceSession(null)} 
          onSave={fetchTeacherData} 
        />
      )}
    </div>
  );
};

// ============================================================
// Schedule Session Modal (With Smart Recurring Logic)
// ============================================================
const ScheduleSessionModal: React.FC<{ teacherId: string, courses: any[], onClose: () => void, onSave: () => void }> = ({ teacherId, courses, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);

  // States for Smart Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]); 
  const [recurrenceType, setRecurrenceType] = useState<'count' | 'date'>('count');
  const [recurrenceCount, setRecurrenceCount] = useState('8');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const WEEK_DAYS = [
    { id: 0, label: 'الأحد' }, { id: 1, label: 'الإثنين' }, { id: 2, label: 'الثلاثاء' },
    { id: 3, label: 'الأربعاء' }, { id: 4, label: 'الخميس' }, { id: 5, label: 'الجمعة' }, { id: 6, label: 'السبت' }
  ];

  const [formData, setFormData] = useState({
    courseId: courses.length > 0 ? courses[0].id : '',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    durationMinutes: '60',
    meetingLink: '',
    notes: ''
  });

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) return alert('يرجى اختيار الدورة أولاً');
    
    let datesToSchedule: string[] = [];
    
    if (isRecurring) {
      if (selectedDays.length === 0) return alert('يرجى تحديد الأيام المطلوبة للتكرار');
      
      let currentDate = new Date(formData.date);
      let addedCount = 0;
      let limitDate = recurrenceType === 'date' && recurrenceEndDate ? new Date(recurrenceEndDate) : null;
      let maxLimit = parseInt(recurrenceCount) || 1;

      for (let i = 0; i < 365; i++) {
        if (recurrenceType === 'count' && addedCount >= maxLimit) break;
        if (recurrenceType === 'date' && limitDate && currentDate > limitDate) break;

        if (selectedDays.includes(currentDate.getDay())) {
          const yyyy = currentDate.getFullYear();
          const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
          const dd = String(currentDate.getDate()).padStart(2, '0');
          datesToSchedule.push(`${yyyy}-${mm}-${dd}`);
          addedCount++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (datesToSchedule.length === 0) return alert('لم يتم العثور على تواريخ صالحة للجدولة ضمن النطاق المحدد.');
    } else {
      datesToSchedule = [formData.date]; 
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      
      const promises = datesToSchedule.map(dateStr => {
        const scheduledAt = new Date(`${dateStr}T${formData.time}`).toISOString();
        return fetch(`${apiUrl}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: formData.courseId,
            teacherId,
            durationMinutes: formData.durationMinutes,
            meetingLink: formData.meetingLink,
            notes: formData.notes,
            scheduledAt
          })
        });
      });

      await Promise.all(promises);
      onSave(); 
      onClose();
    } catch (err) { 
      alert('حدث خطأ أثناء جدولة الجلسات'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">جدولة جلسة (للمعلم)</h2>
          <button type="button" onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <div className="form-group">
            <label className="form-label required">الدورة / المسار</label>
            <select required className="form-input form-select" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
              <option value="">اختر دورة...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label required">التاريخ (الابتدائي)</label>
              <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label required">الوقت</label>
              <input required type="time" className="form-input" dir="ltr" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">المدة (دقيقة)</label>
              <select className="form-input form-select" dir="ltr" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})}>
                <option value="30">30</option><option value="45">45</option><option value="60">60</option><option value="90">90</option><option value="120">120</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">رابط الاجتماع (Zoom / Meet)</label>
            <input type="url" className="form-input" placeholder="https://..." dir="ltr" value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} />
          </div>

          <div className={`border-2 rounded-xl transition-all ${isRecurring ? 'border-[#1B4F72] bg-blue-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isRecurring ? 'bg-blue-100 text-[#1B4F72]' : 'bg-gray-100 text-gray-400'}`}>
                  <RefreshCw size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">تكرار الجلسات تلقائياً (Recurring)</p>
                  <p className="text-xs text-gray-500">قم بجدولة شهر كامل أو عدد محدد بضغطة واحدة</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-[#1B4F72]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isRecurring ? 'left-1' : 'right-1'}`}></div>
              </div>
            </div>

            {isRecurring && (
              <div className="p-4 border-t border-blue-100 space-y-4 animate-fadeIn">
                <div className="form-group">
                  <label className="form-label required">أيام التكرار</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => (
                      <button type="button" key={day.id} onClick={() => toggleDay(day.id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${selectedDays.includes(day.id) ? 'bg-[#1B4F72] text-white border-[#1B4F72]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group flex flex-col justify-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={recurrenceType === 'count'} onChange={() => setRecurrenceType('count')} className="text-[#1B4F72] focus:ring-[#1B4F72]" /><span className="text-sm font-medium">الانتهاء بعد عدد جلسات</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={recurrenceType === 'date'} onChange={() => setRecurrenceType('date')} className="text-[#1B4F72] focus:ring-[#1B4F72]" /><span className="text-sm font-medium">الانتهاء في تاريخ محدد</span></label>
                  </div>
                  
                  <div className="form-group">
                    {recurrenceType === 'count' ? (
                      <><label className="form-label text-xs">إجمالي عدد الجلسات</label><input type="number" min="2" max="100" className="form-input" value={recurrenceCount} onChange={e => setRecurrenceCount(e.target.value)} /></>
                    ) : (
                      <><label className="form-label text-xs">تاريخ آخر جلسة</label><input type="date" className="form-input" value={recurrenceEndDate} onChange={e => setRecurrenceEndDate(e.target.value)} /></>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">ملاحظات للمنصة</label>
            <textarea rows={2} className="form-input resize-none" placeholder="أي ملاحظات..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
        </form>
        <div className="modal-footer pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الجدولة...' : 'حفظ وإنشاء الجلسات'}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Attendance Modal Component
// ============================================================
const AttendanceModal: React.FC<{ session: any, enrollments: any[], onClose: () => void, onSave: () => void }> = ({ session, enrollments, onClose, onSave }) => {
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialStatus: Record<string, string> = {};
    enrollments.forEach(e => { initialStatus[e.studentId] = 'PRESENT'; });
    setAttendance(initialStatus);
  }, [enrollments]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const attendancesArray = Object.keys(attendance).map(studentId => ({ studentId, status: attendance[studentId] }));
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const res = await fetch(`${apiUrl}/sessions/${session.id}/attendance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances: attendancesArray })
      });
      if (res.ok) { onSave(); onClose(); }
    } catch (err) { alert('خطأ في رصد الحضور'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">رصد الحضور وإغلاق الجلسة</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={20}/></button>
        </div>
        <div className="modal-body space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between mb-4">
            <span className="font-bold text-[#1B4F72]">{session.course?.nameAr}</span>
            <span className="text-sm text-blue-700">{new Date(session.scheduledAt).toLocaleDateString('ar-SA')}</span>
          </div>

          <div className="space-y-3">
            {enrollments.length === 0 ? <p className="text-center text-gray-500 py-4">لا يوجد طلاب مسجلين في هذه الدورة للرصد</p> : null}
            {enrollments.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                <span className="font-semibold text-gray-800">{e.student?.nameAr}</span>
                <div className="flex gap-2">
                  <button onClick={() => setAttendance({...attendance, [e.studentId]: 'PRESENT'})} className={`px-3 py-1 text-sm rounded-lg border font-bold transition-colors ${attendance[e.studentId] === 'PRESENT' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200'}`}>حاضر</button>
                  <button onClick={() => setAttendance({...attendance, [e.studentId]: 'LATE'})} className={`px-3 py-1 text-sm rounded-lg border font-bold transition-colors ${attendance[e.studentId] === 'LATE' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200'}`}>متأخر</button>
                  <button onClick={() => setAttendance({...attendance, [e.studentId]: 'ABSENT'})} className={`px-3 py-1 text-sm rounded-lg border font-bold transition-colors ${attendance[e.studentId] === 'ABSENT' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200'}`}>غائب</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading || enrollments.length === 0} className="btn btn-primary">{isLoading ? 'جاري الحفظ...' : 'حفظ وإنهاء الجلسة'}</button>
        </div>
      </div>
    </div>
  );
};