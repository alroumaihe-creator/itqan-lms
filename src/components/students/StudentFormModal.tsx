// ============================================================
// STUDENT FORM MODAL - Multi-step Student Registration (Connected to API)
// ============================================================

import React, { useState, useEffect } from 'react';
import { X, User, Users, BookOpen, CreditCard, Check, ChevronLeft } from 'lucide-react';
import type { Student } from '../../types';

interface StudentFormModalProps {
  onClose: () => void;
  onSave: (data: Partial<Student>) => void;
  student?: Partial<Student>;
}

const STEPS = [
  { id: 1, label: 'المعلومات الشخصية', icon: User },
  { id: 2, label: 'معلومات ولي الأمر', icon: Users },
  { id: 3, label: 'اختيار الدورة', icon: BookOpen },
  { id: 4, label: 'الاشتراك والدفع', icon: CreditCard },
];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  onClose,
  onSave,
  student,
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // بيانات حقيقية من السيرفر
  const [realTeachers, setRealTeachers] = useState<any[]>([]);
  const [realCourses, setRealCourses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: student?.id || '',
    nameAr: student?.nameAr || '',
    nameEn: student?.nameEn || '',
    email: student?.user?.email || '',
    phone: '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    nationality: student?.nationality || '',
    timezone: student?.timezone || 'Asia/Riyadh',
    notes: student?.notes || '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'father',
    selectedCourses: [] as string[],
    teacherId: '',
    sessionType: 'INDIVIDUAL',
    packageName: 'باقة مخصصة',
    monthlyFee: '0',
    paymentMethod: 'bank_transfer',
    status: student?.status || 'LEAD'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // جلب المعلمين والدورات عند فتح النافذة
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        
        const [teachersRes, coursesRes] = await Promise.all([
          fetch(`${apiUrl}/teachers`),
          fetch(`${apiUrl}/courses`)
        ]);

        if (teachersRes.ok) setRealTeachers(await teachersRes.json());
        if (coursesRes.ok) setRealCourses(await coursesRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // دالة اختيار الدورة وحساب الإجمالي التلقائي
  const toggleCourse = (courseId: string) => {
    setFormData((prev) => {
      const selected = prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter((id) => id !== courseId)
        : [...prev.selectedCourses, courseId];
      
      // تحديث السعر التلقائي بناءً على الدورات المختارة
      const newTotal = realCourses
        .filter(c => selected.includes(c.id))
        .reduce((sum, c) => sum + (c.price || 0), 0);

      return { ...prev, selectedCourses: selected, monthlyFee: newTotal.toString() };
    });
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (stepNum === 1) {
      if (!formData.nameAr) newErrors.nameAr = 'الاسم بالعربي مطلوب';
      if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    }
    // يمكن تخطي اختيار الدورة عند التعديل
    if (stepNum === 3 && !student) {
      if (formData.selectedCourses.length === 0) newErrors.selectedCourses = 'يجب اختيار دورة واحدة على الأقل';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(STEPS.length, s + 1));
  };

  // دالة الحفظ التي ترسل الطالب والاشتراكات للسيرفر
  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const isEditing = !!formData.id;
      const url = isEditing ? `${apiUrl}/students/${formData.id}` : `${apiUrl}/students`;
      const method = isEditing ? 'PUT' : 'POST';

      // 1. حفظ بيانات الطالب
      const studentResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!studentResponse.ok) throw new Error('فشل حفظ الطالب');
      const savedStudent = await studentResponse.json();

      // 2. إنشاء الاشتراكات (إذا كانت هناك دورات مختارة)
      if (formData.selectedCourses.length > 0) {
        for (const courseId of formData.selectedCourses) {
          await fetch(`${apiUrl}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentId: savedStudent.id,
              courseId: courseId,
              teacherId: formData.teacherId || null
            }),
          });
        }
      }

      onSave(savedStudent); // تحديث الواجهة
      onClose();
    } catch (error) {
      console.error("خطأ:", error);
      alert("حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-lg font-bold text-gray-800">
            {student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="step-indicator">
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="step">
                    <div
                      className={`step-circle cursor-pointer ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
                      onClick={() => isDone && setStep(s.id)}
                    >
                      {isDone ? <Check size={16} /> : <StepIcon size={16} />}
                    </div>
                    {!step && <span className="text-xs text-gray-500 hidden md:block">{s.label}</span>}
                  </div>
                  {idx < STEPS.length - 1 && <div className={`step-line ${step > s.id ? 'done' : ''}`} />}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-0">
            {STEPS.map((s) => (
              <span key={s.id} className={`text-xs font-medium ${step === s.id ? 'text-[#1B4F72]' : 'text-gray-400'}`} style={{ width: '25%', textAlign: 'center' }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">الاسم بالعربي</label>
                  <input type="text" value={formData.nameAr} onChange={(e) => updateField('nameAr', e.target.value)} placeholder="الاسم الكامل" className={`form-input ${errors.nameAr ? 'error' : ''}`} />
                  {errors.nameAr && <p className="form-error">{errors.nameAr}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">الاسم بالإنجليزي</label>
                  <input type="text" value={formData.nameEn} onChange={(e) => updateField('nameEn', e.target.value)} placeholder="Full Name" className="form-input" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">البريد الإلكتروني</label>
                  <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="student@example.com" className={`form-input ${errors.email ? 'error' : ''}`} dir="ltr" />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">الجنسية</label>
                  <input type="text" value={formData.nationality} onChange={(e) => updateField('nationality', e.target.value)} placeholder="مثال: سعودي" className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group flex flex-col justify-center">
                  <label className="form-label">حالة الطالب</label>
                  <select value={formData.status} onChange={(e) => updateField('status', e.target.value)} className="form-input form-select">
                    <option value="LEAD">مهتم (Lead)</option>
                    <option value="TRIAL">تجريبي (Trial)</option>
                    <option value="ACTIVE">نشط (Active)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parent Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
                <p>إضافة بيانات ولي الأمر اختيارية وتساعد في المتابعة.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">اسم ولي الأمر</label>
                  <input type="text" value={formData.parentName} onChange={(e) => updateField('parentName', e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">رقم الهاتف</label>
                  <input type="tel" value={formData.parentPhone} onChange={(e) => updateField('parentPhone', e.target.value)} className="form-input" dir="ltr" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Course Selection */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              {errors.selectedCourses && <p className="form-error mb-2">{errors.selectedCourses}</p>}
              
              {realCourses.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">لا توجد مسارات متاحة حالياً. يرجى إضافة مسار من قسم الدورات.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {realCourses.filter(c => c.isActive).map((course) => {
                    const selected = formData.selectedCourses.includes(course.id);
                    return (
                      <div key={course.id} onClick={() => toggleCourse(course.id)} className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${selected ? 'border-[#1B4F72] bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[#1B4F72] bg-[#1B4F72]' : 'border-gray-300'}`}>
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-sm">{course.nameAr}</p>
                            <p className="text-xs text-gray-400">المستوى {course.level} • {course.type}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-[#1B4F72]">${course.price || 0}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="form-group mt-4 pt-4 border-t border-gray-100">
                <label className="form-label">تعيين معلم (اختياري)</label>
                <select value={formData.teacherId} onChange={(e) => updateField('teacherId', e.target.value)} className="form-input form-select">
                  <option value="">سيتم التعيين لاحقاً...</option>
                  {realTeachers.filter(t => t.status === 'ACTIVE').map((t) => (
                    <option key={t.id} value={t.id}>{t.nameAr} - {t.specialization || 'عام'}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">إجمالي الرسوم الشهرية ($)</label>
                  <input type="number" readOnly value={formData.monthlyFee} className="form-input bg-gray-50 font-bold text-[#1B4F72]" dir="ltr" />
                </div>
                <div className="form-group">
                  <label className="form-label">طريقة الدفع المتوقعة</label>
                  <select value={formData.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)} className="form-input form-select">
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="paypal">باي بال</option>
                    <option value="stripe">بطاقة ائتمان</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <h4 className="font-bold text-gray-700 mb-3">ملخص التسجيل والاشتراك</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">الطالب</span>
                    <span className="font-semibold">{formData.nameAr || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">المسارات المختارة</span>
                    <span className="font-semibold">{formData.selectedCourses.length} مسار</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-800 font-bold">الإجمالي الشهري</span>
                    <span className="font-black text-[#1B4F72]">${formData.monthlyFee}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} disabled={isLoading} className="btn btn-outline gap-1">
              <ChevronLeft size={16} /> السابق
            </button>
          )}
          
          {step < STEPS.length ? (
            <button onClick={handleNext} className="btn btn-primary gap-1">
              التالي <ChevronLeft size={16} className="rotate-180" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="btn btn-success gap-1">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {isLoading ? 'جاري الحفظ...' : 'حفظ وإنشاء الاشتراك'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};