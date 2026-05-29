// ============================================================
// QURAN TRACKING MODAL - Save student recitation progress
// ============================================================

import React, { useState } from 'react';
import { X, Check, BookOpen, AlertCircle } from 'lucide-react';

interface QuranTrackingModalProps {
  student: any;
  teacherId: string;
  onClose: () => void;
  onSave: () => void;
}

const TAJWEED_ERRORS_OPTIONS = ['مخارج الحروف', 'صفات الحروف', 'أحكام النون الساكنة والتنوين', 'أحكام الميم الساكنة', 'المدود', 'الغنة', 'اللحن الجلي'];

export const QuranTrackingModal: React.FC<QuranTrackingModalProps> = ({ student, teacherId, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    trackType: 'NEW_MEMORIZATION', // الحفظ الجديد
    surahStart: '',
    ayahStart: '',
    surahEnd: '',
    ayahEnd: '',
    pagesCount: '',
    recitationScore: '10',
    teacherNotes: '',
    tajweedErrors: [] as string[]
  });

  const toggleError = (errorTag: string) => {
    setFormData(prev => ({
      ...prev,
      tajweedErrors: prev.tajweedErrors.includes(errorTag)
        ? prev.tajweedErrors.filter(e => e !== errorTag)
        : [...prev.tajweedErrors, errorTag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/quran-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          teacherId,
          ...formData
        }),
      });

      if (!response.ok) throw new Error('فشل تسجيل الحلقة');
      
      onSave();
      onClose();
    } catch (error) {
      alert('حدث خطأ أثناء حفظ السجل الأكاديمي.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 550 }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <BookOpen className="text-[#27AE60]" size={20} />
            <h2 className="text-lg font-bold">تسجيل إنجاز الطالب: {student.nameAr}</h2>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            
            {/* نوع المسار */}
            <div className="form-group">
              <label className="form-label required">نوع المسار الحالي</label>
              <select className="form-input form-select" value={formData.trackType} onChange={e => setFormData({...formData, trackType: e.target.value})}>
                <option value="NEW_MEMORIZATION">حفظ جديد (New Memorization)</option>
                <option value="REVISION">مراجعة (Revision)</option>
                <option value="READING">تلاوة وتصحيح نظر (Reading)</option>
              </select>
            </div>

            {/* نطاق التسميع */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="form-group">
                <label className="form-label required text-xs">من سورة</label>
                <input required type="text" className="form-input form-input-sm" placeholder="الفاتحة" value={formData.surahStart} onChange={e => setFormData({...formData, surahStart: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">الآية</label>
                <input type="number" className="form-input form-input-sm" placeholder="1" value={formData.ayahStart} onChange={e => setFormData({...formData, ayahStart: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">إلى سورة</label>
                <input type="text" className="form-input form-input-sm" placeholder="البقرة" value={formData.surahEnd} onChange={e => setFormData({...formData, surahEnd: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">الآية</label>
                <input type="number" className="form-input form-input-sm" placeholder="5" value={formData.ayahEnd} onChange={e => setFormData({...formData, ayahEnd: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label required">عدد الصفحات المنجزة</label>
                <input required type="number" step="0.25" min="0" className="form-input" placeholder="مثال: 2.5" value={formData.pagesCount} onChange={e => setFormData({...formData, pagesCount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label required">التقييم والدرجة (من 10)</label>
                <select className="form-input form-select font-bold text-amber-600" value={formData.recitationScore} onChange={e => setFormData({...formData, recitationScore: e.target.value})}>
                  {[10,9,8,7,6,5,4,3,2,1].map(score => <option key={score} value={score}>{score} / 10</option>)}
                </select>
              </div>
            </div>

            {/* أخطاء التجويد المرصودة */}
            <div className="form-group">
              <label className="form-label">ملاحظات تجويدية (انقر للاختيار)</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {TAJWEED_ERRORS_OPTIONS.map(err => {
                  const selected = formData.tajweedErrors.includes(err);
                  return (
                    <button type="button" key={err} onClick={() => toggleError(err)} className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${selected ? 'bg-red-50 text-red-600 border-red-300' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {err}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">توجيهات وملاحظات المعلم</label>
              <textarea rows={2} className="form-input resize-none text-sm" placeholder="اكتب توجيهاتك للطالب ليراها في لوحته الشخصية..." value={formData.teacherNotes} onChange={e => setFormData({...formData, teacherNotes: e.target.value})} />
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
            <button type="submit" disabled={isLoading} className="btn btn-success gap-1">
              {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              رصد الحلقة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};