// ============================================================
// TEACHERS PAGE - Connected to API (With View Details)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, BookOpen, Eye } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { TeacherDetailPage } from './TeacherDetailPage'; // استيراد صفحة التفاصيل

export const TeachersPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null); // حالة اختيار المعلم للعرض
  const [search, setSearch] = useState('');

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/teachers`);
      if (response.ok) {
        setTeachers(await response.json());
      }
    } catch (error) {
      console.error("خطأ في جلب المعلمين:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم؟ سيتم حذف حسابه نهائياً.')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const res = await fetch(`${apiUrl}/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) setTeachers(prev => prev.filter(t => t.id !== id));
    } catch (err) { alert('خطأ في الاتصال بالخادم'); }
  };

  const filteredTeachers = teachers.filter(t => 
    t.nameAr.toLowerCase().includes(search.toLowerCase()) || 
    (t.user?.email && t.user.email.toLowerCase().includes(search.toLowerCase()))
  );

  // إذا تم اختيار معلم للعرض، نعرض صفحة التفاصيل بدلاً من الجدول
  if (selectedTeacherId) {
    return <TeacherDetailPage teacherId={selectedTeacherId} onBack={() => setSelectedTeacherId(null)} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة المعلمين</h1>
          <p className="text-gray-400 text-sm">{teachers.length} معلم في الأكاديمية</p>
        </div>
        <button onClick={() => { setEditingTeacher(null); setShowModal(true); }} className="btn btn-primary gap-2">
          <Plus size={18} /> <span className="hidden md:inline">إضافة معلم</span>
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="ابحث باسم المعلم أو الإيميل..." className="form-input pr-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><div className="w-10 h-10 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">لا يوجد معلمين مطابقين للبحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المعلم</th>
                  <th>التخصص</th>
                  <th>نظام المحاسبة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={teacher.nameAr} size="md" />
                        <div>
                          <p className="font-bold text-gray-800">{teacher.nameAr}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><Mail size={10} /> {teacher.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                        <BookOpen size={14} className="text-[#1B4F72]" /> {teacher.specialization || 'مسار عام'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        {teacher.paymentMethod === 'HOURLY' ? <span className="font-bold text-[#F39C12]">{teacher.hourlyRate}$ / ساعة</span> : <span className="font-bold text-[#27AE60]">{teacher.percentageRate}% من الدخل</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {teacher.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {/* زر العرض الجديد */}
                        <button onClick={() => setSelectedTeacherId(teacher.id)} className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="عرض التفاصيل">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditingTeacher(teacher); setShowModal(true); }} className="btn btn-icon btn-ghost btn-sm text-[#1B4F72] tooltip" data-tip="تعديل">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(teacher.id)} className="btn btn-icon btn-ghost btn-sm text-red-500 hover:bg-red-50 tooltip" data-tip="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <TeacherFormModal teacher={editingTeacher} onClose={() => setShowModal(false)} onSave={fetchTeachers} />}
    </div>
  );
};

// ============================================================
// Teacher Form Modal
// ============================================================
const TeacherFormModal: React.FC<{ teacher?: any, onClose: () => void, onSave: () => void }> = ({ teacher, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: teacher?.nameAr || '',
    email: teacher?.user?.email || '',
    specialization: teacher?.specialization || 'القرآن الكريم والتجويد',
    paymentMethod: teacher?.paymentMethod || 'HOURLY',
    hourlyRate: teacher?.hourlyRate?.toString() || '15',
    percentageRate: teacher?.percentageRate?.toString() || '50',
    status: teacher?.status || 'ACTIVE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const url = teacher ? `${apiUrl}/teachers/${teacher.id}` : `${apiUrl}/teachers`;
      const method = teacher ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { onSave(); onClose(); } else { alert('حدث خطأ أثناء الحفظ.'); }
    } catch (error) { alert('فشل الاتصال بالخادم.'); } finally { setIsLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">{teacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div className="form-group"><label className="form-label required">اسم المعلم</label><input required type="text" className="form-input" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} /></div>
          <div className="form-group"><label className="form-label required">البريد الإلكتروني</label><input required type="email" className="form-input" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">التخصص</label><input type="text" className="form-input" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} /></div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
            <p className="font-bold text-gray-700 text-sm">النظام المالي</p>
            <div className="form-group">
              <label className="form-label">طريقة الحساب</label>
              <select className="form-input form-select" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option value="HOURLY">أجر ثابت بالساعة</option>
                <option value="PERCENTAGE">نسبة مئوية من الدخل</option>
              </select>
            </div>
            {formData.paymentMethod === 'HOURLY' ? (
              <div className="form-group"><label className="form-label">الأجر بالساعة ($)</label><input type="number" className="form-input" dir="ltr" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} /></div>
            ) : (
              <div className="form-group"><label className="form-label">النسبة المئوية (%)</label><input type="number" className="form-input" dir="ltr" value={formData.percentageRate} onChange={e => setFormData({...formData, percentageRate: e.target.value})} /></div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">حالة الحساب</label>
            <select className="form-input form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">نشط</option>
              <option value="SUSPENDED">موقوف</option>
            </select>
          </div>
        </form>
        <div className="modal-footer">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الحفظ...' : 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
};