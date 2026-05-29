// ============================================================
// TEACHERS PAGE - Full Management (Connected to API)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Star, CheckCircle, Eye, Edit, Trash2, BookOpen, DollarSign, Percent, Mail, Phone, Clock
} from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import type { Teacher } from '../types';

export const TeachersPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY'>('ALL');
  
  // حالات النوافذ (Modals)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [viewingTeacher, setViewingTeacher] = useState<any>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        const response = await fetch(`${apiUrl}/teachers`);
        if (!response.ok) throw new Error('فشل الاتصال');
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error("خطأ في جلب بيانات المعلمين:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleSaveTeacher = async (formData: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const isEditing = !!formData.id;
      const url = isEditing ? `${apiUrl}/teachers/${formData.id}` : `${apiUrl}/teachers`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          email: formData.email,
          specialization: formData.specializations,
          paymentMethod: formData.paymentMethod,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          percentageRate: formData.percentageRate ? parseFloat(formData.percentageRate) : null,
          status: formData.status || 'ACTIVE'
        }),
      });

      if (!response.ok) throw new Error('فشل حفظ المعلم');
      const savedTeacher = await response.json();

      if (isEditing) {
        setTeachers((prev) => prev.map((t) => t.id === savedTeacher.id ? savedTeacher : t));
        setEditingTeacher(null);
      } else {
        setTeachers((prev) => [savedTeacher, ...prev]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ المعلم.");
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المعلم نهائياً؟')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/teachers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('فشل الحذف');
      setTeachers((prev) => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
      alert("حدث خطأ أثناء حذف المعلم.");
    }
  };

  const filtered = useMemo(() => {
    let result = [...teachers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.nameAr?.includes(q) || t.nameEn?.toLowerCase().includes(q) ||
          t.specialization?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [teachers, search, availFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب بيانات المعلمين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المعلمون</h1>
          <p className="text-gray-400 text-sm">{teachers.length} معلم</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">إضافة معلم</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو التخصص أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pr-10"
          />
        </div>
      </div>

      <div className="grid-cards">
        {filtered.map((teacher) => (
          <TeacherCard 
            key={teacher.id} 
            teacher={teacher} 
            onView={() => setViewingTeacher(teacher)}
            onEdit={() => setEditingTeacher(teacher)}
            onDelete={() => handleDeleteTeacher(teacher.id)} 
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
             <BookOpen size={48} className="mb-3 text-gray-200" />
            <p>لا يوجد معلمون في قاعدة البيانات</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <TeacherFormModal onClose={() => setShowAddModal(false)} onSave={handleSaveTeacher} />
      )}
      
      {editingTeacher && (
        <TeacherFormModal teacher={editingTeacher} onClose={() => setEditingTeacher(null)} onSave={handleSaveTeacher} />
      )}

      {viewingTeacher && (
        <TeacherViewModal teacher={viewingTeacher} onClose={() => setViewingTeacher(null)} />
      )}
    </div>
  );
};

// ==========================================
// مكون البطاقة (Teacher Card)
// ==========================================
const TeacherCard: React.FC<{ teacher: any, onView: () => void, onEdit: () => void, onDelete: () => void }> = ({ teacher, onView, onEdit, onDelete }) => (
  <div className="card p-5 card-interactive">
    <div className="flex items-start gap-4 mb-4">
      <Avatar name={teacher.nameAr} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{teacher.nameAr}</h3>
          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <CheckCircle size={12} /> نشط
          </span>
        </div>
        {teacher.user?.email && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{teacher.user.email}</p>
        )}
      </div>
    </div>

    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
      {teacher.specialization ? (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
          {teacher.specialization}
        </span>
      ) : (
        <span className="text-xs text-gray-400">لم يحدد تخصص</span>
      )}
    </div>

    <div className="bg-gray-50 rounded-lg p-2 flex items-center justify-center gap-2 mb-4 border border-gray-100">
      {teacher.paymentMethod === 'PERCENTAGE' ? (
        <>
          <Percent size={14} className="text-[#F39C12]" />
          <span className="text-xs font-bold text-gray-700">نسبة من الحلقات: {teacher.percentageRate || 0}%</span>
        </>
      ) : (
        <>
          <DollarSign size={14} className="text-[#27AE60]" />
          <span className="text-xs font-bold text-gray-700">أجر بالساعة: {teacher.hourlyRate || 0}$</span>
        </>
      )}
    </div>

    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 mb-4">
      <div className="text-center">
        <p className="text-lg font-black text-[#1B4F72]">0</p>
        <p className="text-[10px] text-gray-400">طالب</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-[#27AE60]">0</p>
        <p className="text-[10px] text-gray-400">جلسة</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-0.5">
          <Star size={12} className="text-gray-300 fill-gray-100" />
          <p className="text-lg font-black text-gray-500">-</p>
        </div>
        <p className="text-[10px] text-gray-400">تقييم</p>
      </div>
    </div>

    <div className="flex gap-2">
      <button onClick={onView} className="btn btn-primary btn-sm flex-1 gap-1">
        <Eye size={14} /> عرض
      </button>
      <button onClick={onEdit} className="btn btn-ghost btn-icon btn-sm tooltip" data-tip="تعديل">
        <Edit size={14} />
      </button>
      <button onClick={onDelete} className="btn btn-ghost btn-icon btn-sm text-red-400 tooltip" data-tip="حذف">
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

// ==========================================
// نافذة الإضافة والتعديل (Form Modal)
// ==========================================
const TeacherFormModal: React.FC<{ teacher?: any, onClose: () => void, onSave: (data: any) => void }> = ({ teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: teacher?.id || '',
    nameAr: teacher?.nameAr || '', 
    nameEn: teacher?.nameEn || '', 
    email: teacher?.user?.email || '', 
    specializations: teacher?.specialization || '', 
    timezone: 'Asia/Riyadh',
    paymentMethod: teacher?.paymentMethod || 'HOURLY',
    hourlyRate: teacher?.hourlyRate?.toString() || '', 
    percentageRate: teacher?.percentageRate?.toString() || '',
    status: teacher?.status || 'ACTIVE'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">{teacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label required">الاسم بالعربي</label>
                <input required type="text" className="form-input" placeholder="الاسم الكامل" 
                  value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label required">البريد الإلكتروني</label>
                <input required type="email" className="form-input" placeholder="teacher@academy.com" dir="ltr" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">التخصصات (مسارات البحث والتطوير)</label>
              <input type="text" className="form-input" placeholder="مثال: لغة عربية، مسار تقني..." 
                value={formData.specializations} onChange={e => setFormData({...formData, specializations: e.target.value})} />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <div className="form-group">
                <label className="form-label font-bold text-[#1B4F72]">نظام المحاسبة المالية *</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paymentMethod" value="HOURLY"
                      checked={formData.paymentMethod === 'HOURLY'}
                      onChange={() => setFormData({...formData, paymentMethod: 'HOURLY', percentageRate: ''})}
                      className="text-[#1B4F72] focus:ring-[#1B4F72]" />
                    <span className="text-sm font-medium text-gray-700">الأجر بالساعة ($)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="paymentMethod" value="PERCENTAGE"
                      checked={formData.paymentMethod === 'PERCENTAGE'}
                      onChange={() => setFormData({...formData, paymentMethod: 'PERCENTAGE', hourlyRate: ''})}
                      className="text-[#1B4F72] focus:ring-[#1B4F72]" />
                    <span className="text-sm font-medium text-gray-700">نسبة من دخل الطلاب (%)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.paymentMethod === 'HOURLY' ? (
                  <div className="form-group animate-fadeIn">
                    <label className="form-label required">الأجر بالساعة ($)</label>
                    <input type="number" required min="0" step="0.5" className="form-input" placeholder="مثال: 15" dir="ltr" 
                      value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
                  </div>
                ) : (
                  <div className="form-group animate-fadeIn">
                    <label className="form-label required">نسبة المعلم من الدخل (%)</label>
                    <input type="number" required min="0" max="100" className="form-input" placeholder="مثال: 40" dir="ltr" 
                      value={formData.percentageRate} onChange={e => setFormData({...formData, percentageRate: e.target.value})} />
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">حالة الحساب</label>
                  <select className="form-input form-select" 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">نشط</option>
                    <option value="SUSPENDED">موقوف</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
            <button type="submit" className="btn btn-primary">حفظ التعديلات</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// نافذة عرض البيانات (View Modal)
// ==========================================
const TeacherViewModal: React.FC<{ teacher: any, onClose: () => void }> = ({ teacher, onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal animate-slideUp" style={{ maxWidth: 500 }}>
      <div className="modal-header">
        <h2 className="text-lg font-bold">الملف التعريفي للمعلم</h2>
        <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
      </div>
      <div className="modal-body space-y-6">
        
        <div className="flex flex-col items-center text-center">
          <Avatar name={teacher.nameAr} size="xl" />
          <h3 className="text-xl font-bold text-gray-800 mt-3">{teacher.nameAr}</h3>
          <p className="text-sm text-gray-500">{teacher.specialization || 'لم يحدد تخصص'}</p>
          <div className="mt-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {teacher.status === 'ACTIVE' ? 'حساب نشط' : 'موقوف'}
             </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
             <Mail className="text-gray-400" size={18} />
             <div>
               <p className="text-xs text-gray-400">البريد الإلكتروني</p>
               <p className="font-semibold text-gray-800 text-sm" dir="ltr">{teacher.user?.email}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
             <Clock className="text-gray-400" size={18} />
             <div>
               <p className="text-xs text-gray-400">تاريخ الانضمام</p>
               <p className="font-semibold text-gray-800 text-sm">
                 {new Date(teacher.createdAt).toLocaleDateString('ar-EG')}
               </p>
             </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
             {teacher.paymentMethod === 'PERCENTAGE' ? (
               <Percent className="text-[#1B4F72]" size={18} />
             ) : (
               <DollarSign className="text-[#1B4F72]" size={18} />
             )}
             <div>
               <p className="text-xs text-blue-600">النظام المالي</p>
               <p className="font-bold text-[#1B4F72] text-sm">
                 {teacher.paymentMethod === 'PERCENTAGE' ? `نسبة من الدخل (${teacher.percentageRate}%)` : `أجر بالساعة (${teacher.hourlyRate}$)`}
               </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  </div>
);