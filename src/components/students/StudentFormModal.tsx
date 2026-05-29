// ============================================================
// STUDENT FORM MODAL - Multi-step Student Registration
// ============================================================

import React, { useState, useEffect } from 'react';
import { X, User, Users, BookOpen, CreditCard, Check, ChevronLeft } from 'lucide-react';
import type { Student } from '../../types';
import { mockCourses } from '../../data/mockData';

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
  const [realTeachers, setRealTeachers] = useState<any[]>([]); // حالة المعلمين الحقيقيين

  const [formData, setFormData] = useState({
    // Step 1
    nameAr: student?.nameAr || '',
    nameEn: student?.nameEn || '',
    email: student?.user?.email || '',
    phone: '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    nationality: student?.nationality || '',
    timezone: student?.timezone || 'Asia/Riyadh',
    notes: student?.notes || '',
    // Step 2
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelation: 'father',
    // Step 3
    selectedCourses: [] as string[],
    teacherId: '',
    sessionType: 'INDIVIDUAL',
    sessionsPerWeek: '2',
    preferredTime: '',
    // Step 4
    packageName: 'باقة الحفظ المكثف',
    monthlyFee: '150',
    paymentMethod: 'bank_transfer',
    startDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // جلب المعلمين الحقيقيين من السيرفر
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        const response = await fetch(`${apiUrl}/teachers`);
        if (response.ok) {
          const data = await response.json();
          setRealTeachers(data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!formData.nameAr) newErrors.nameAr = 'الاسم بالعربي مطلوب';
      if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
      if (!formData.gender) newErrors.gender = 'الجنس مطلوب';
    }
    if (stepNum === 2) {
      if (!formData.parentName) newErrors.parentName = 'اسم ولي الأمر مطلوب';
      if (!formData.parentPhone) newErrors.parentPhone = 'رقم الهاتف مطلوب';
    }
    if (stepNum === 3) {
      if (formData.selectedCourses.length === 0) newErrors.selectedCourses = 'يجب اختيار دورة واحدة على الأقل';
      if (!formData.teacherId) newErrors.teacherId = 'يجب اختيار معلم';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(STEPS.length, s + 1));
    }
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;

    const studentData: Partial<Student> = {
      nameAr: formData.nameAr,
      nameEn: formData.nameEn,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationality: formData.nationality,
      timezone: formData.timezone,
      notes: formData.notes,
      status: 'LEAD',
      user: { id: '', email: formData.email, role: 'STUDENT', isActive: true, createdAt: new Date() },
    };

    onSave(studentData);
    onClose();
  };

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter((id) => id !== courseId)
        : [...prev.selectedCourses, courseId],
    }));
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
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
                      className={`step-circle cursor-pointer ${
                        isDone ? 'done' : isActive ? 'active' : 'pending'
                      }`}
                      onClick={() => isDone && setStep(s.id)}
                    >
                      {isDone ? <Check size={16} /> : <StepIcon size={16} />}
                    </div>
                    {!step && (
                      <span className="text-xs text-gray-500 hidden md:block">{s.label}</span>
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`step-line ${step > s.id ? 'done' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 px-0">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`text-xs font-medium ${step === s.id ? 'text-[#1B4F72]' : 'text-gray-400'}`}
                style={{ width: '25%', textAlign: 'center' }}
              >
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
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => updateField('nameAr', e.target.value)}
                    placeholder="الاسم الكامل بالعربي"
                    className={`form-input ${errors.nameAr ? 'error' : ''}`}
                  />
                  {errors.nameAr && <p className="form-error">{errors.nameAr}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">الاسم بالإنجليزي</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => updateField('nameEn', e.target.value)}
                    placeholder="Full Name in English"
                    className="form-input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="student@example.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    dir="ltr"
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    className="form-input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">تاريخ الميلاد</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">الجنس</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className={`form-input form-select ${errors.gender ? 'error' : ''}`}
                  >
                    <option value="">اختر...</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                  {errors.gender && <p className="form-error">{errors.gender}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">الجنسية</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="سعودي"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">المنطقة الزمنية</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                    <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                    <option value="Europe/London">لندن (GMT+0)</option>
                    <option value="America/New_York">نيويورك (GMT-5)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ملاحظات</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="ملاحظات إضافية..."
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Parent Info */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
                <p>سيتم ربط هذا الحساب بحساب ولي الأمر للمتابعة والتواصل</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">اسم ولي الأمر</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => updateField('parentName', e.target.value)}
                    placeholder="الاسم الكامل"
                    className={`form-input ${errors.parentName ? 'error' : ''}`}
                  />
                  {errors.parentName && <p className="form-error">{errors.parentName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">صلة القرابة</label>
                  <select
                    value={formData.parentRelation}
                    onChange={(e) => updateField('parentRelation', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="father">الأب</option>
                    <option value="mother">الأم</option>
                    <option value="guardian">الوصي</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label required">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => updateField('parentPhone', e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    className={`form-input ${errors.parentPhone ? 'error' : ''}`}
                    dir="ltr"
                  />
                  {errors.parentPhone && <p className="form-error">{errors.parentPhone}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">رقم واتساب</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => updateField('parentPhone', e.target.value)}
                    placeholder="نفس رقم الهاتف أو مختلف"
                    className="form-input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني لولي الأمر</label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => updateField('parentEmail', e.target.value)}
                  placeholder="parent@example.com"
                  className="form-input"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* Step 3: Course Selection */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              {errors.selectedCourses && (
                <p className="form-error">{errors.selectedCourses}</p>
              )}
              <div className="grid grid-cols-1 gap-3">
                {mockCourses.map((course) => {
                  const selected = formData.selectedCourses.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selected
                          ? 'border-[#1B4F72] bg-blue-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selected ? 'border-[#1B4F72] bg-[#1B4F72]' : 'border-gray-300'
                          }`}
                        >
                          {selected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{course.nameAr}</p>
                          <p className="text-sm text-gray-400">{course.description}</p>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-[#1B4F72]">${course.price}/شهر</p>
                          <p className="text-xs text-gray-400">المستوى {course.level}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label className="form-label required">المعلم</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => updateField('teacherId', e.target.value)}
                    className={`form-input form-select ${errors.teacherId ? 'error' : ''}`}
                  >
                    <option value="">اختر معلماً...</option>
                    {/* هنا نستخدم قائمة المعلمين الحقيقية من قاعدة البيانات */}
                    {realTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameAr} {t.specialization ? `(${t.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && <p className="form-error">{errors.teacherId}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">نوع الجلسة</label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) => updateField('sessionType', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="INDIVIDUAL">فردي</option>
                    <option value="GROUP">مجموعة</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">اسم الباقة</label>
                  <select
                    value={formData.packageName}
                    onChange={(e) => updateField('packageName', e.target.value)}
                    className="form-input form-select"
                  >
                    <option>باقة المبتدئين</option>
                    <option>باقة الحفظ المكثف</option>
                    <option>باقة التجويد</option>
                    <option>باقة الإجازة</option>
                    <option>باقة مخصصة</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">الرسوم الشهرية ($)</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => updateField('monthlyFee', e.target.value)}
                    className="form-input"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">طريقة الدفع</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => updateField('paymentMethod', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="paypal">باي بال</option>
                    <option value="stripe">بطاقة ائتمان</option>
                    <option value="cash">نقداً</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <h4 className="font-bold text-gray-700 mb-3">ملخص التسجيل</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">الطالب</span>
                    <span className="font-semibold">{formData.nameAr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الدورات المختارة</span>
                    <span className="font-semibold">{formData.selectedCourses.length} دورة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الرسوم الشهرية</span>
                    <span className="font-bold text-[#1B4F72]">${formData.monthlyFee}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="btn btn-outline gap-1">
              <ChevronLeft size={16} />
              السابق
            </button>
          )}
          {step < STEPS.length ? (
            <button onClick={handleNext} className="btn btn-primary gap-1">
              التالي
              <ChevronLeft size={16} className="rotate-180" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-success gap-1">
              <Check size={16} />
              حفظ الطالب
            </button>
          )}
        </div>
      </div>
    </div>
  );
};