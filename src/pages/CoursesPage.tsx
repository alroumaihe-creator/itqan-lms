// ============================================================
// COURSES PAGE
// ============================================================

import React, { useState } from 'react';
import { Plus, BookOpen, Users, Clock, DollarSign, Edit, Eye, Trash2 } from 'lucide-react';
import { mockCourses, mockEnrollments } from '../data/mockData';
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
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الدورات</h1>
          <p className="text-gray-400 text-sm">{mockCourses.length} دورة</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">دورة جديدة</span>
        </button>
      </div>

      <div className="grid-cards">
        {mockCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {showModal && <CourseFormModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const color = COURSE_TYPE_COLORS[course.type] || '#1B4F72';
  const enrollmentCount = mockEnrollments.filter((e) => e.courseId === course.id && e.isActive).length;

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
            {COURSE_TYPE_LABELS[course.type]}
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

      {course.description && (
        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} className="text-gray-400" />
          <span>{enrollmentCount} طالب</span>
        </div>
        {course.durationWeeks && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} className="text-gray-400" />
            <span>{course.durationWeeks} أسبوع</span>
          </div>
        )}
        {course.price && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign size={13} className="text-gray-400" />
            <span>${course.price}/شهر</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`w-2 h-2 rounded-full ${course.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className={course.isActive ? 'text-green-600' : 'text-gray-400'}>
            {course.isActive ? 'نشطة' : 'غير نشطة'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm flex-1 gap-1">
          <Eye size={13} />
          عرض
        </button>
        <button className="btn btn-ghost btn-icon btn-sm">
          <Edit size={13} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const CourseFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth: 580 }}>
      <div className="modal-header">
        <h2 className="text-lg font-bold">دورة جديدة</h2>
        <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
      </div>
      <div className="modal-body space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label required">الاسم بالعربي</label>
            <input type="text" className="form-input" placeholder="اسم الدورة" />
          </div>
          <div className="form-group">
            <label className="form-label">الاسم بالإنجليزي</label>
            <input type="text" className="form-input" placeholder="Course Name" dir="ltr" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">الوصف</label>
          <textarea rows={2} className="form-input resize-none" placeholder="وصف الدورة..." />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label required">النوع</label>
            <select className="form-input form-select">
              {Object.entries(COURSE_TYPE_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">المستوى</label>
            <select className="form-input form-select">
              {[1,2,3,4,5].map(l => <option key={l} value={l}>المستوى {l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">المدة (أسبوع)</label>
            <input type="number" className="form-input" placeholder="24" dir="ltr" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">الرسوم الشهرية ($)</label>
          <input type="number" className="form-input" placeholder="120" dir="ltr" />
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
        <button onClick={onClose} className="btn btn-primary">حفظ الدورة</button>
      </div>
    </div>
  </div>
);
