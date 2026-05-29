// ============================================================
// COURSES PAGE (Connected to Vercel API)
// ============================================================

import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Users, Clock, DollarSign, Edit, Eye, Trash2 } from 'lucide-react';
import { COURSE_TYPE_LABELS } from '../utils/formatters';
import type { Course } from '../types';

const COURSE_TYPE_COLORS: Record<string, string> = {
  QURAN_QAIDA: '#27AE60',
  QURAN_READING: '#2E86AB',
  QURAN_MEMORIZATION: '#1B4F72',
  QURAN_TAJWEED: '#F39C12',
  QURAN_IJAZAH: '#9B59B6',
  ACADEMIC: '#E74C3C',
};

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  // جلب الدورات من السيرفر
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/courses`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("خطأ في جلب الدورات:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // دالة الحفظ (إضافة أو تعديل)
  const handleSaveCourse = async (formData: any) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const isEditing = !!formData.id;
      const url = isEditing ? `${apiUrl}/courses/${formData.id}` : `${apiUrl}/courses`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          type: formData.type,
          level: parseInt(formData.level),
          price: formData.price ? parseFloat(formData.price) : null,
          isActive: formData.isActive
        }),
      });

      if (!response.ok) throw new Error('فشل الحفظ');
      
      fetchCourses(); // تحديث القائمة بعد الحفظ
      setShowModal(false);
      setEditingCourse(null);
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ أثناء حفظ الدورة.");
    }
  };

  // دالة الحذف
  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدورة نهائياً؟')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/courses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCourses((prev) => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      alert("حدث خطأ أثناء حذف الدورة.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب الدورات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الدورات</h1>
          <p className="text-gray-400 text-sm">{courses.length} دورة</p>
        </div>
        <button onClick={() => { setEditingCourse(null); setShowModal(true); }} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">دورة جديدة</span>
        </button>
      </div>

      <div className="grid-cards">
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onEdit={() => { setEditingCourse(course); setShowModal(true); }}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
        {courses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
             <BookOpen size={48} className="mb-3 text-gray-200" />
            <p>لا توجد دورات مسجلة حالياً</p>
          </div>
        )}
      </div>

      {showModal && (
        <CourseFormModal 
          course={editingCourse}
          onClose={() => { setShowModal(false); setEditingCourse(null); }} 
          onSave={handleSaveCourse}
        />
      )}
    </div>
  );
};

const CourseCard: React.FC<{ course: any, onEdit: () => void, onDelete: () => void }> = ({ course, onEdit, onDelete }) => {
  // استخدام اللون الافتراضي إذا لم يتم العثور على النوع
  const color = COURSE_TYPE_COLORS[course.type] || '#1B4F72';
  
  // مؤقتاً: عدد الطلاب 0 حتى نقوم ببرمجة مسار الاشتراكات (Enrollments)
  const enrollmentCount = 0; 

  return (
    <div className="card p-5 card-interactive border-t-4" style={{ borderTopColor: color }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-0.5">{course.nameAr}</h3>
          {course.nameEn && <p className="text-xs text-gray-400 mb-1">{course.nameEn}</p>}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {COURSE_TYPE_LABELS[course.type] || course.type}
          </span>
        </div>
        <div className="flex items-center gap-1 mr-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <span className="font-black text-sm" style={{ color }}>م{course.level}</span>
          </div>
        </div>
      </div>

      {/* ملاحظة: حقل الوصف تم إخفاؤه مؤقتاً لأنه غير موجود في قاعدة البيانات الحالية، يمكن إضافته لاحقاً */}

      <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-50 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} className="text-gray-400" />
          <span>{enrollmentCount} طالب</span>
        </div>
        {course.price ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <DollarSign size={13} className="text-gray-400" />
            <span className="text-[#1B4F72]">{course.price}$ /شهر</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign size={13} className="text-gray-400" />
            <span>مجانية</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs col-span-2">
          <div className={`w-2 h-2 rounded-full ${course.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={course.isActive ? 'text-green-600 font-bold' : 'text-gray-400'}>
            {course.isActive ? 'متاحة للتسجيل' : 'غير متاحة حالياً'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm flex-1 gap-1">
          <Eye size={13} /> عرض
        </button>
        <button onClick={onEdit} className="btn btn-ghost btn-icon btn-sm tooltip" data-tip="تعديل">
          <Edit size={13} />
        </button>
        <button onClick={onDelete} className="btn btn-ghost btn-icon btn-sm text-red-400 tooltip" data-tip="حذف">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const CourseFormModal: React.FC<{ course?: any, onClose: () => void, onSave: (data: any) => void }> = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: course?.id || '',
    nameAr: course?.nameAr || '',
    nameEn: course?.nameEn || '',
    type: course?.type || 'QURAN_MEMORIZATION',
    level: course?.level?.toString() || '1',
    price: course?.price?.toString() || '',
    isActive: course ? course.isActive : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">{course ? 'تعديل الدورة' : 'دورة جديدة'}</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-medium border border-blue-100 flex gap-2">
              <span className="text-xl">💡</span>
              <p>تخضع جميع المسارات الأكاديمية والتقنية لإشراف وتقييم <strong>لجنة البحث والتطوير</strong> المباشر لضمان أعلى معايير الجودة.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label required">الاسم بالعربي</label>
                <input required type="text" className="form-input" placeholder="اسم الدورة" 
                  value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">الاسم بالإنجليزي</label>
                <input type="text" className="form-input" placeholder="Course Name" dir="ltr" 
                  value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label required">النوع</label>
                <select className="form-input form-select" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  {Object.entries(COURSE_TYPE_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{val as string}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">المستوى</label>
                <select className="form-input form-select" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                  {[1,2,3,4,5,6,7].map(l => <option key={l} value={l}>المستوى {l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الرسوم الشهرية ($)</label>
                <input type="number" step="0.5" min="0" className="form-input" placeholder="0.00" dir="ltr" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="form-group flex flex-col justify-center mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                  className="rounded border-gray-300 text-[#1B4F72] focus:ring-[#1B4F72] w-4 h-4" />
                <span className="text-sm font-bold text-gray-700">الدورة متاحة ونشطة للتسجيل</span>
              </label>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">إلغاء</button>
            <button type="submit" className="btn btn-primary">حفظ الدورة</button>
          </div>
        </form>
      </div>
    </div>
  );
};