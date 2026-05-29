// ============================================================
// TEACHER DASHBOARD - With Scheduling & Attendance
// ============================================================

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, Calendar, Clock, CheckCircle, Video, FileText, Plus, ExternalLink, UserCheck, X } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { QuranTrackingModal } from '../components/teachers/QuranTrackingModal';

export const TeacherDashboard: React.FC = () => {
  const [teacher, setTeacher] = useState<any>(null);
  const [myStudents, setMyStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule'); // جعلنا الجدول هو الافتراضي لنجربه
  
  // حالات النوافذ المنبثقة
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [attendanceSession, setAttendanceSession] = useState<any>(null);

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

        if (currentTeacher) {
          // 2. جلب طلاب المعلم (الاشتراكات)
          const enrollmentsRes = await fetch(`${apiUrl}/enrollments`);
          if (enrollmentsRes.ok) {
            const allEnrollments = await enrollmentsRes.json();
            const teacherEnrollments = allEnrollments.filter((e: any) => e.teacherId === currentTeacher.id);
            setMyStudents(teacherEnrollments);
          }

          // 3. جلب جلسات المعلم
          const sessionsRes = await fetch(`${apiUrl}/sessions`);
          if (sessionsRes.ok) {
            const allSessions = await sessionsRes.json();
            const teacherSessions = allSessions.filter((s: any) => s.teacherId === currentTeacher.id);
            setSessions(teacherSessions);
          }
        }
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات لوحة تحكم المعلم:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  // استخراج الدورات الفريدة التي يدرسها هذا المعلم ليعرضها في قائمة الجدولة
  const myUniqueCourses = Array.from(new Set(myStudents.map(e => e.course?.id)))
    .map(id => myStudents.find(e => e.course?.id === id)?.course)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#27AE60] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري تجهيز مساحة العمل الخاصة بك...</p>
      </div>
    );
  }

  if (!teacher) return <div className="text-center p-10">لم يتم العثور على ملف المعلم</div>;

  const scheduledSessions = sessions.filter(s => s.status === 'SCHEDULED');
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');

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
        </div>

        <div className="card p-5 border-t-4 border-[#27AE60]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-500 text-sm font-medium">جلسات قادمة</p>
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
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className="card p-0 overflow-hidden">
        
        {/* تبويب: الجدول والجلسات */}
        {activeTab === 'schedule' && (
          <div className="p-5 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">جدول الجلسات</h3>
              <button onClick={() => setShowSessionModal(true)} className="btn btn-primary btn-sm gap-2">
                <Plus size={16} /> جدولة جلسة
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                <p>لا توجد جلسات مجدولة. ابدأ بجدولة أول جلسة لك!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => (
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

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {session.status === 'SCHEDULED' ? (
                        <>
                          {session.meetingLink && (
                            <a href={session.meetingLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm flex-1 md:flex-none border-blue-200 text-[#1B4F72] hover:bg-blue-50">
                              <ExternalLink size={14} className="ml-1" /> بدء اللقاء
                            </a>
                          )}
                          <button onClick={() => setAttendanceSession(session)} className="btn btn-success btn-sm flex-1 md:flex-none">
                            <UserCheck size={14} className="ml-1" /> رصد الحضور
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-bold flex items-center gap-1">
                          <CheckCircle size={14} /> جلسة مكتملة
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* تبويب: طلابي */}
        {activeTab === 'students' && (
          <div className="p-0 animate-fadeIn">
            {myStudents.length === 0 ? (
               <div className="text-center py-10 text-gray-400">لا يوجد طلاب مسجلين في مساراتك حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>الطالب</th>
                      <th>المسار / الدورة</th>
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
                            <span className="font-semibold text-gray-800 text-sm">{enrollment.student?.nameAr}</span>
                          </div>
                        </td>
                        <td><span className="text-sm font-medium text-[#1B4F72] bg-blue-50 px-2 py-1 rounded-md">{enrollment.course?.nameAr}</span></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                              <div className="h-full bg-[#27AE60]" style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600">{enrollment.progress.toFixed(1)}%</span>
                          </div>
                        </td>
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
      </div>

      {/* نافذة سجل الحفظ */}
      {selectedEnrollment && (
        <QuranTrackingModal student={selectedEnrollment.student} teacherId={teacher.id} onClose={() => setSelectedEnrollment(null)} onSave={fetchTeacherData} />
      )}

      {/* نافذة جدولة جلسة */}
      {showSessionModal && (
        <ScheduleSessionModal teacherId={teacher.id} courses={myUniqueCourses} onClose={() => setShowSessionModal(false)} onSave={fetchTeacherData} />
      )}

      {/* نافذة رصد الحضور */}
      {attendanceSession && (
        <AttendanceModal session={attendanceSession} enrollments={myStudents.filter(e => e.courseId === attendanceSession.courseId)} onClose={() => setAttendanceSession(null)} onSave={fetchTeacherData} />
      )}
    </div>
  );
};

// ============================================================
// Modals Components
// ============================================================

// 1. نافذة جدولة الجلسة
const ScheduleSessionModal: React.FC<{ teacherId: string, courses: any[], onClose: () => void, onSave: () => void }> = ({ teacherId, courses, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    courseId: courses[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    durationMinutes: '60',
    meetingLink: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) return alert('يرجى اختيار الدورة');
    
    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      
      const res = await fetch(`${apiUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, teacherId, scheduledAt })
      });

      if (res.ok) { onSave(); onClose(); }
    } catch (err) { alert('خطأ في جدولة الجلسة'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">جدولة جلسة جديدة</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label required">الدورة / المسار</label>
            <select required className="form-input form-select" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
              <option value="">اختر الدورة...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">تاريخ الجلسة</label>
              <input required type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label required">الوقت</label>
              <input required type="time" className="form-input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">المدة (بالدقائق)</label>
              <input required type="number" className="form-input" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">رابط اللقاء (Zoom/Meet)</label>
              <input type="url" className="form-input" dir="ltr" placeholder="https://..." value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})} />
            </div>
          </div>
          <div className="modal-footer pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الحفظ...' : 'حفظ الجلسة'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. نافذة رصد الحضور
const AttendanceModal: React.FC<{ session: any, enrollments: any[], onClose: () => void, onSave: () => void }> = ({ session, enrollments, onClose, onSave }) => {
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // تعيين الحالة الافتراضية لكل الطلاب إلى (حاضر)
    const initialStatus: Record<string, string> = {};
    enrollments.forEach(e => { initialStatus[e.studentId] = 'PRESENT'; });
    setAttendance(initialStatus);
  }, [enrollments]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const attendancesArray = Object.keys(attendance).map(studentId => ({
        studentId,
        status: attendance[studentId]
      }));

      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const res = await fetch(`${apiUrl}/sessions/${session.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h2 className="text-lg font-bold">رصد الحضور للجلسة</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={20}/></button>
        </div>
        <div className="modal-body space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between mb-4">
            <span className="font-bold text-[#1B4F72]">{session.course?.nameAr}</span>
            <span className="text-sm text-blue-700">{new Date(session.scheduledAt).toLocaleDateString('ar-SA')}</span>
          </div>

          <div className="space-y-3">
            {enrollments.length === 0 ? <p className="text-center text-gray-500 py-4">لا يوجد طلاب مسجلين في هذه الدورة</p> : null}
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