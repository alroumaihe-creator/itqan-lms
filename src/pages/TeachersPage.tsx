// ============================================================
// TEACHERS PAGE - Full Management
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Star, CheckCircle, XCircle, Eye,
  Edit, Trash2, Mail, Phone, Clock, BookOpen
} from 'lucide-react';
import { mockTeachers } from '../data/mockData';
import { Avatar } from '../components/shared/Avatar';
import type { Teacher } from '../types';

export const TeachersPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let result = [...mockTeachers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.nameAr.includes(q) ||
          t.nameEn?.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.includes(q))
      );
    }
    if (availFilter === 'AVAILABLE') result = result.filter((t) => t.isAvailable);
    if (availFilter === 'BUSY') result = result.filter((t) => !t.isAvailable);
    return result;
  }, [mockTeachers, search, availFilter]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">المعلمون</h1>
          <p className="text-gray-400 text-sm">{mockTeachers.length} معلم</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <Plus size={18} />
          <span className="hidden md:inline">إضافة معلم</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو التخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pr-10"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'AVAILABLE', 'BUSY'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAvailFilter(f)}
              className={`btn btn-sm ${availFilter === f ? 'btn-primary' : 'btn-ghost'}`}
            >
              {f === 'ALL' ? 'الكل' : f === 'AVAILABLE' ? 'متاح' : 'مشغول'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid-cards">
        {filtered.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <p>لا يوجد معلمون</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <TeacherFormModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

const TeacherCard: React.FC<{ teacher: Teacher }> = ({ teacher }) => (
  <div className="card p-5 card-interactive">
    <div className="flex items-start gap-4 mb-4">
      <Avatar name={teacher.nameAr} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{teacher.nameAr}</h3>
          {teacher.isAvailable ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
              <CheckCircle size={12} /> متاح
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
              <XCircle size={12} /> مشغول
            </span>
          )}
        </div>
        {teacher.nameEn && (
          <p className="text-xs text-gray-400 mt-0.5">{teacher.nameEn}</p>
        )}
      </div>
    </div>

    {/* Specializations */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      {teacher.specializations.slice(0, 3).map((spec) => (
        <span
          key={spec}
          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
        >
          {spec}
        </span>
      ))}
    </div>

    {/* Bio */}
    {teacher.bio && (
      <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{teacher.bio}</p>
    )}

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 mb-4">
      <div className="text-center">
        <p className="text-lg font-black text-[#1B4F72]">12</p>
        <p className="text-[10px] text-gray-400">طالب</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-black text-[#27AE60]">45</p>
        <p className="text-[10px] text-gray-400">جلسة</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-0.5">
          <Star size={12} className="text-[#F39C12] fill-[#F39C12]" />
          <p className="text-lg font-black text-[#F39C12]">4.8</p>
        </div>
        <p className="text-[10px] text-gray-400">تقييم</p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <button className="btn btn-primary btn-sm flex-1 gap-1">
        <Eye size={14} />
        عرض
      </button>
      <button className="btn btn-ghost btn-icon btn-sm">
        <Mail size={14} />
      </button>
      <button className="btn btn-ghost btn-icon btn-sm">
        <Edit size={14} />
      </button>
    </div>
  </div>
);

const TeacherFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth: 560 }}>
      <div className="modal-header">
        <h2 className="text-lg font-bold">إضافة معلم جديد</h2>
        <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
      </div>
      <div className="modal-body space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label required">الاسم بالعربي</label>
            <input type="text" className="form-input" placeholder="الاسم الكامل" />
          </div>
          <div className="form-group">
            <label className="form-label">الاسم بالإنجليزي</label>
            <input type="text" className="form-input" placeholder="Full Name" dir="ltr" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label required">البريد الإلكتروني</label>
            <input type="email" className="form-input" placeholder="teacher@academy.com" dir="ltr" />
          </div>
          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input type="tel" className="form-input" placeholder="+966..." dir="ltr" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">التخصصات (افصل بفاصلة)</label>
          <input type="text" className="form-input" placeholder="تحفيظ القرآن، التجويد، الإجازة" />
        </div>
        <div className="form-group">
          <label className="form-label">نبذة مختصرة</label>
          <textarea rows={3} className="form-input resize-none" placeholder="اكتب نبذة تعريفية..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">الأجر بالساعة ($)</label>
            <input type="number" className="form-input" placeholder="100" dir="ltr" />
          </div>
          <div className="form-group">
            <label className="form-label">المنطقة الزمنية</label>
            <select className="form-input form-select">
              <option>Asia/Riyadh</option>
              <option>Africa/Cairo</option>
              <option>Asia/Dubai</option>
            </select>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
        <button onClick={onClose} className="btn btn-primary">حفظ المعلم</button>
      </div>
    </div>
  </div>
);
