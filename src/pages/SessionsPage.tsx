// ============================================================
// SESSIONS PAGE - Calendar + List View (Connected to API)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Plus, Video, Clock, User, CheckCircle, 
  XCircle, Trash2, ExternalLink, RefreshCw, UserCheck, X
} from 'lucide-react';
import { DAYS_AR } from '../utils/formatters';

type ViewMode = 'list' | 'calendar';
type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED' | 'ALL';

export const SessionsPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // للتقويم
  const [selectedDate, setSelectedDate] = useState(new Date());

  // للفلترة بالتاريخ في القائمة
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(''); // فارغ يعني عرض الكل
  const [dateTo, setDateTo] = useState('');

  // لرصد الحضور
  const [attendanceSession, setAttendanceSession] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const [sessionsRes, enrollmentsRes] = await Promise.all([
        fetch(`${apiUrl}/sessions`),
        fetch(`${apiUrl}/enrollments`)
      ]);
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة الحذف
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

  // فلترة متقدمة (بالحالة والتاريخ)
  const filtered = useMemo(() => {
    let result = sessions;
    
    // فلتر الحالة
    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // فلتر التاريخ
    if (dateFrom) {
      result = result.filter(s => new Date(s.scheduledAt).toISOString().split('T')[0] >= dateFrom);
    }
    if (dateTo) {
      result = result.filter(s => new Date(s.scheduledAt).toISOString().split('T')[0] <= dateTo);
    }

    return result.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [sessions, statusFilter, dateFrom, dateTo]);

  // للتقويم
  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [selectedDate]);

  const getSessionsForDate = (date: Date | null) => {
    if (!date) return [];
    return sessions.filter((s) => {
      const sessionDate = new Date(s.scheduledAt);
      return sessionDate.getDate() === date.getDate() && sessionDate.getMonth() === date.getMonth() && sessionDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة الجلسات</h1>
          <p className="text-gray-400 text-sm">{filtered.length} جلسة مجدولة ومكتملة</p>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow text-[#1B4F72]' : 'text-gray-500'}`}>قائمة</button>
            <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white shadow text-[#1B4F72]' : 'text-gray-500'}`}>تقويم</button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
            <Plus size={18} />
            <span className="hidden md:inline">جدولة جلسة</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s === 'ALL' ? 'الكل' : s === 'SCHEDULED' ? 'مجدولة' : s === 'COMPLETED' ? 'مكتملة' : 'ملغاة'}
            <span className="text-xs opacity-70 mr-1">
              ({s === 'ALL' ? sessions.length : sessions.filter(x => x.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-10 h-10 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {view === 'calendar' && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))} className="btn btn-ghost btn-sm">◄</button>
                <h3 className="font-bold text-gray-800">{selectedDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}</h3>
                <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))} className="btn btn-ghost btn-sm">►</button>
              </div>
              <div className="calendar-grid mb-2">
                {DAYS_AR.map((day) => <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">{day.slice(0, 3)}</div>)}
              </div>
              <div className="calendar-grid">
                {daysInMonth.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} />;
                  const daySessions = getSessionsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div key={date.toISOString()} className={`calendar-day ${isToday ? 'today' : ''} ${daySessions.length > 0 ? 'has-session' : ''}`}>
                      <span className="text-sm">{date.getDate()}</span>
                      {daySessions.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {daySessions.slice(0, 3).map((s) => (
                            <div key={s.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: s.status === 'COMPLETED' ? '#27AE60' : s.status === 'CANCELLED' ? '#E74C3C' : '#2E86AB' }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'list' && (
             <div className="card overflow-hidden">
               {/* شريط فلترة التواريخ للإدارة */}
               <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
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
                 <div className="flex gap-2">
                   <button onClick={() => { setDateFrom(todayStr); setDateTo(todayStr); }} className="btn btn-sm btn-outline border-blue-200 text-[#1B4F72] hover:bg-blue-50">اليوم فقط</button>
                   <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="btn btn-sm btn-ghost text-gray-500">عرض الكل</button>
                 </div>
               </div>

               <div className="divide-y divide-gray-50">
                 {filtered.length === 0 ? (
                   <div className="text-center py-16 text-gray-400">
                     <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                     <p className="font-medium">لا توجد جلسات مطابقة</p>
                   </div>
                 ) : (
                   filtered.map((session) => (
                     <SessionRow key={session.id} session={session} onDelete={() => handleDeleteSession(session.id)} onRecordAttendance={() => setAttendanceSession(session)} />
                   ))
                 )}
               </div>
             </div>
           )}
        </>
      )}

      {showAddModal && <AddSessionModal onClose={() => setShowAddModal(false)} onSave={fetchData} />}
      
      {attendanceSession && (
        <AttendanceModal 
          session={attendanceSession} 
          enrollments={enrollments.filter(e => e.courseId === attendanceSession.courseId)} 
          onClose={() => setAttendanceSession(null)} 
          onSave={fetchData} 
        />
      )}
    </div>
  );
};

const SessionRow: React.FC<{ session: any, onDelete: () => void, onRecordAttendance: () => void }> = ({ session, onDelete, onRecordAttendance }) => {
  const sessionDate = new Date(session.scheduledAt);
  const isToday = sessionDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isToday ? 'bg-[#1B4F72] text-white' : 'bg-gray-50'}`}>
        <span className={`text-xl font-black ${isToday ? 'text-white' : 'text-[#1B4F72]'}`}>{sessionDate.getDate()}</span>
        <span className={`text-xs ${isToday ? 'text-white/70' : 'text-gray-400'}`}>{sessionDate.toLocaleDateString('ar-SA', { month: 'short' })}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-gray-800 text-sm">{session.course?.nameAr || 'جلسة غير مسماة'}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1 font-bold text-[#1B4F72]">
            <User size={12} /> {session.teacher?.nameAr}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {sessionDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            {' · '}{session.durationMinutes} دقيقة
          </span>
        </div>
      </div>

      {session.status === 'SCHEDULED' && (
        <div className="flex items-center gap-2 hidden md:flex">
          {session.meetingLink && (
            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline border-blue-200 text-[#1B4F72] hover:bg-blue-50">
              <ExternalLink size={14} className="ml-1" /> انضمام
            </a>
          )}
          <button onClick={onRecordAttendance} className="btn btn-sm btn-success">
            <UserCheck size={14} className="ml-1" /> رصد الحضور
          </button>
        </div>
      )}

      <span className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : session.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
        {session.status === 'COMPLETED' ? <CheckCircle size={12}/> : session.status === 'CANCELLED' ? <XCircle size={12}/> : <Clock size={12}/>}
        {session.status === 'COMPLETED' ? 'مكتملة' : session.status === 'CANCELLED' ? 'ملغاة' : 'مجدولة'}
      </span>

      <button onClick={onDelete} className="btn btn-icon btn-ghost btn-sm text-red-400 hover:bg-red-50 hover:text-red-600 tooltip" data-tip="حذف الجلسة">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// ============================================================
// Attendance Modal Component (للإدارة)
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
          <h2 className="text-lg font-bold">رصد الحضور للإدارة</h2>
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

// ============================================================
// ADD SESSION MODAL (With Smart Recurring Logic)
// ============================================================
const AddSessionModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    courseId: '', teacherId: '', date: new Date().toISOString().split('T')[0], time: '16:00', durationMinutes: '60', meetingLink: '', notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const [cRes, tRes] = await Promise.all([fetch(`${apiUrl}/courses`), fetch(`${apiUrl}/teachers`)]);
      if (cRes.ok) setCourses(await cRes.json());
      if (tRes.ok) setTeachers(await tRes.json());
    };
    fetchData();
  }, []);

  const toggleDay = (dayId: number) => setSelectedDays(prev => prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.teacherId) return alert('يرجى اختيار الدورة والمعلم');
    
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
      if (datesToSchedule.length === 0) return alert('لم يتم العثور على تواريخ صالحة للجدولة.');
    } else { datesToSchedule = [formData.date]; }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const promises = datesToSchedule.map(dateStr => {
        const scheduledAt = new Date(`${dateStr}T${formData.time}`).toISOString();
        return fetch(`${apiUrl}/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, scheduledAt })
        });
      });
      await Promise.all(promises);
      onSave(); onClose();
    } catch (err) { alert('حدث خطأ أثناء الجدولة'); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">جدولة جلسة للإدارة</h2>
          <button type="button" onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الدورة / المسار</label>
              <select required className="form-input form-select" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                <option value="">اختر دورة...</option>
                {courses.filter(c => c.isActive).map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">المعلم</label>
              <select required className="form-input form-select" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                <option value="">اختر معلماً...</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label required">التاريخ</label>
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
                <div className={`p-2 rounded-lg ${isRecurring ? 'bg-blue-100 text-[#1B4F72]' : 'bg-gray-100 text-gray-400'}`}><RefreshCw size={18} /></div>
                <div><p className="font-bold text-gray-800 text-sm">تكرار الجلسات تلقائياً (Recurring)</p><p className="text-xs text-gray-500">جدولة شهر كامل أو عدد محدد بضغطة واحدة</p></div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-[#1B4F72]' : 'bg-gray-300'}`}><div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isRecurring ? 'left-1' : 'right-1'}`}></div></div>
            </div>

            {isRecurring && (
              <div className="p-4 border-t border-blue-100 space-y-4 animate-fadeIn">
                <div className="form-group">
                  <label className="form-label required">أيام التكرار</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => (
                      <button type="button" key={day.id} onClick={() => toggleDay(day.id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all ${selectedDays.includes(day.id) ? 'bg-[#1B4F72] text-white border-[#1B4F72]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{day.label}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group flex flex-col justify-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={recurrenceType === 'count'} onChange={() => setRecurrenceType('count')} className="text-[#1B4F72] focus:ring-[#1B4F72]" /><span className="text-sm font-medium">الانتهاء بعد عدد جلسات</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={recurrenceType === 'date'} onChange={() => setRecurrenceType('date')} className="text-[#1B4F72] focus:ring-[#1B4F72]" /><span className="text-sm font-medium">الانتهاء في تاريخ محدد</span></label>
                  </div>
                  <div className="form-group">
                    {recurrenceType === 'count' ? (
                      <><label className="form-label text-xs">إجمالي الجلسات</label><input type="number" min="2" max="100" className="form-input" value={recurrenceCount} onChange={e => setRecurrenceCount(e.target.value)} /></>
                    ) : (
                      <><label className="form-label text-xs">تاريخ آخر جلسة</label><input type="date" className="form-input" value={recurrenceEndDate} onChange={e => setRecurrenceEndDate(e.target.value)} /></>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="form-group"><label className="form-label">ملاحظات الإدارة</label><textarea rows={2} className="form-input resize-none" placeholder="أي ملاحظات..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
        </form>
        <div className="modal-footer pt-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الجدولة...' : 'حفظ وإنشاء الجلسات'}</button>
        </div>
      </div>
    </div>
  );
};