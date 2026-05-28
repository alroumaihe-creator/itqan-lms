// ============================================================
// STUDENTS PAGE - Full CRUD with Advanced Filtering
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Filter, Download, MoreVertical,
  GraduationCap, Edit, Trash2, Eye, UserCheck, UserX,
  ChevronUp, ChevronDown, CheckSquare, Square, RefreshCw
} from 'lucide-react';
import { mockStudents, mockTeachers, mockCourses } from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import type { Student, StudentStatus } from '../types';
import { STUDENT_STATUS_LABELS } from '../utils/formatters';
import { StudentFormModal } from '../components/students/StudentFormModal';
import { StudentDetailPage } from './StudentDetailPage';

const STATUS_TABS: { value: StudentStatus | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'الكل', color: 'bg-gray-100 text-gray-600' },
  { value: 'ACTIVE', label: 'نشط', color: 'bg-green-100 text-green-700' },
  { value: 'TRIAL', label: 'تجريبي', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'LEAD', label: 'مهتم', color: 'bg-blue-100 text-blue-700' },
  { value: 'SUSPENDED', label: 'موقوف', color: 'bg-red-100 text-red-700' },
  { value: 'GRADUATED', label: 'متخرج', color: 'bg-purple-100 text-purple-700' },
  { value: 'DROPPED', label: 'منسحب', color: 'bg-gray-100 text-gray-500' },
];

export const StudentsPage: React.FC<{ onNavigate: (page: string, id?: string) => void }> = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>('nameAr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState(mockStudents);
  const [page, setPage] = useState(1);
  const limit = 10;

  const filtered = useMemo(() => {
    let result = [...students];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.nameAr.includes(q) ||
          s.nameEn?.toLowerCase().includes(q) ||
          s.user.email.toLowerCase().includes(q) ||
          s.nationality?.includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (genderFilter) {
      result = result.filter((s) => s.gender === genderFilter);
    }

    result.sort((a, b) => {
      let valA: string | number = a[sortBy as keyof Student] as string || '';
      let valB: string | number = b[sortBy as keyof Student] as string || '';
      if (sortDir === 'asc') return valA < valB ? -1 : valA > valB ? 1 : 0;
      return valA > valB ? -1 : valA < valB ? 1 : 0;
    });

    return result;
  }, [students, search, statusFilter, genderFilter, sortBy, sortDir]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronUp size={12} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-[#1B4F72]" />
      : <ChevronDown size={12} className="text-[#1B4F72]" />;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((s) => s.id));
    }
  };

  const handleAddStudent = (data: Partial<Student>) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      userId: `user-${Date.now()}`,
      nameAr: data.nameAr || '',
      nameEn: data.nameEn,
      status: 'LEAD',
      timezone: 'UTC',
      user: { id: `user-${Date.now()}`, email: data.user?.email || '', role: 'STUDENT', isActive: true, createdAt: new Date() },
      createdAt: new Date().toISOString(),
      ...data,
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  if (selectedStudent) {
    return (
      <StudentDetailPage
        studentId={selectedStudent}
        onBack={() => setSelectedStudent(null)}
        onNavigate={onNavigate}
      />
    );
  }

  const statusCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === 'ALL' ? students.length : students.filter((s) => s.status === tab.value).length,
  }));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الطلاب</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} طالب</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm gap-2 hidden md:flex">
            <Download size={16} />
            تصدير
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            <span className="hidden md:inline">إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tabs-scrollable">
        <div className="tabs" style={{ minWidth: 'max-content' }}>
          {statusCounts.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`tab ${statusFilter === tab.value ? 'active' : ''}`}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.value ? 'bg-[#1B4F72] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد أو الجنسية..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input pr-10"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`btn btn-ghost gap-2 ${showFilters ? 'border-[#1B4F72] text-[#1B4F72]' : ''}`}
        >
          <Filter size={16} />
          فلاتر
          {(genderFilter) && (
            <span className="w-2 h-2 rounded-full bg-[#F39C12]" />
          )}
        </button>
        <button
          onClick={() => { setSearch(''); setStatusFilter('ALL'); setGenderFilter(''); setPage(1); }}
          className="btn btn-ghost btn-icon"
          title="إعادة تعيين"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card p-4 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">الجنس</label>
              <select
                className="form-input form-select"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">الكل</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">المعلم</label>
              <select
                className="form-input form-select"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <option value="">الكل</option>
                {mockTeachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">الدورة</label>
              <select className="form-input form-select">
                <option value="">الكل</option>
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ التسجيل</label>
              <input type="date" className="form-input" />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1B4F72]/5 border border-[#1B4F72]/20 rounded-xl p-3 animate-fadeIn">
          <span className="text-sm font-bold text-[#1B4F72]">
            تم تحديد {selectedIds.length} طالب
          </span>
          <div className="flex gap-2 mr-auto">
            <button className="btn btn-sm btn-ghost gap-1 text-green-600">
              <UserCheck size={15} />
              تنشيط
            </button>
            <button className="btn btn-sm btn-ghost gap-1 text-amber-600">
              <UserX size={15} />
              تعليق
            </button>
            <button className="btn btn-sm btn-ghost gap-1 text-[#1B4F72]">
              <Download size={15} />
              تصدير
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <button onClick={toggleAll}>
                    {selectedIds.length === paginated.length && paginated.length > 0
                      ? <CheckSquare size={16} className="text-[#1B4F72]" />
                      : <Square size={16} className="text-gray-300" />}
                  </button>
                </th>
                <th onClick={() => toggleSort('nameAr')} className="cursor-pointer">
                  <span className="flex items-center gap-1">الطالب <SortIcon field="nameAr" /></span>
                </th>
                <th>الحالة</th>
                <th className="hidden md:table-cell">الجنسية</th>
                <th className="hidden md:table-cell">تاريخ التسجيل</th>
                <th className="hidden lg:table-cell">الجلسات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <GraduationCap size={48} className="text-gray-200" />
                      <p className="font-medium">لا يوجد طلاب</p>
                      <p className="text-sm">جرّب تغيير معايير البحث</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <button onClick={() => toggleSelect(student.id)}>
                        {selectedIds.includes(student.id)
                          ? <CheckSquare size={16} className="text-[#1B4F72]" />
                          : <Square size={16} className="text-gray-300" />}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.nameAr} size="sm" imageUrl={student.profileImageUrl} />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{student.nameAr}</p>
                          <p className="text-xs text-gray-400">{student.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={student.status} /></td>
                    <td className="hidden md:table-cell text-gray-500 text-sm">{student.nationality || '—'}</td>
                    <td className="hidden md:table-cell text-gray-500 text-sm">
                      {student.enrollmentDate
                        ? new Date(student.enrollmentDate).toLocaleDateString('ar-SA')
                        : '—'}
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="text-sm">
                        <span className="font-bold text-[#1B4F72]">12</span>
                        <span className="text-gray-400"> / 20</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 hover-actions">
                        <button
                          onClick={() => setSelectedStudent(student.id)}
                          className="btn btn-icon btn-ghost btn-sm tooltip"
                          data-tip="عرض"
                        >
                          <Eye size={15} />
                        </button>
                        <button className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="تعديل">
                          <Edit size={15} />
                        </button>
                        <button className="btn btn-icon btn-ghost btn-sm text-red-400 tooltip" data-tip="حذف">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-50">
            <p className="text-sm text-gray-400">
              عرض {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost btn-sm"
              >
                السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-ghost btn-sm"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <StudentFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStudent}
        />
      )}
    </div>
  );
};
