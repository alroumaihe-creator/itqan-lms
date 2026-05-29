// ============================================================
// STUDENTS PAGE - Full CRUD with Advanced Filtering (Connected to Vercel API)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Filter, Download, MoreVertical,
  GraduationCap, Edit, Trash2, Eye, UserCheck, UserX,
  ChevronUp, ChevronDown, CheckSquare, Square, RefreshCw
} from 'lucide-react';
import { mockTeachers, mockCourses } from '../data/mockData';
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
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null); // حالة التعديل
  const [sortBy, setSortBy] = useState<string>('nameAr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
        const response = await fetch(`${apiUrl}/students`);
        if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("خطأ في جلب بيانات الطلاب:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // دالة مدمجة للحفظ والتعديل معاً
  const handleSaveStudent = async (data: Partial<Student>) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const studentId = editingStudent?.id || data.id; // تحديد ما إذا كان طالباً جديداً أم موجوداً
      const url = studentId ? `${apiUrl}/students/${studentId}` : `${apiUrl}/students`;
      const method = studentId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          email: data.user?.email,
          nationality: data.nationality,
          status: data.status || 'LEAD'
        }),
      });

      if (!response.ok) throw new Error('فشل حفظ الطالب');
      const savedStudent = await response.json();

      if (studentId) {
        // تحديث الطالب في القائمة الحالية
        setStudents((prev) => prev.map((s) => s.id === studentId ? savedStudent : s));
        setEditingStudent(null);
      } else {
        // إضافة طالب جديد للقائمة
        setStudents((prev) => [savedStudent, ...prev]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("خطأ أثناء الحفظ:", error);
      alert("حدث خطأ أثناء حفظ الطالب، يرجى المحاولة مرة أخرى.");
    }
  };

  // دالة الحذف
  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('فشل الحذف');
      setStudents((prev) => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
      alert("حدث خطأ أثناء حذف الطالب.");
    }
  };

  const filtered = useMemo(() => {
    let result = [...students];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.nameAr.includes(q) || s.nameEn?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q) || s.nationality?.includes(q)
      );
    }
    if (statusFilter !== 'ALL') result = result.filter((s) => s.status === statusFilter);
    if (genderFilter) result = result.filter((s) => s.gender === genderFilter);
    
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
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronUp size={12} className="text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#1B4F72]" /> : <ChevronDown size={12} className="text-[#1B4F72]" />;
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map((s) => s.id));

  if (selectedStudent) {
    return <StudentDetailPage studentId={selectedStudent} onBack={() => setSelectedStudent(null)} onNavigate={onNavigate} />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب بيانات الطلاب من الخادم...</p>
      </div>
    );
  }

  const statusCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === 'ALL' ? students.length : students.filter((s) => s.status === tab.value).length,
  }));

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الطلاب</h1>
          <p className="text-gray-400 text-sm">{filtered.length} طالب</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
            <Plus size={18} />
            <span className="hidden md:inline">إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tabs-scrollable">
        <div className="tabs" style={{ minWidth: 'max-content' }}>
          {statusCounts.map((tab) => (
            <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setPage(1); }} className={`tab ${statusFilter === tab.value ? 'active' : ''}`}>
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.value ? 'bg-[#1B4F72] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-10">
                  <button onClick={toggleAll}>
                    {selectedIds.length === paginated.length && paginated.length > 0 ? <CheckSquare size={16} className="text-[#1B4F72]" /> : <Square size={16} className="text-gray-300" />}
                  </button>
                </th>
                <th onClick={() => toggleSort('nameAr')} className="cursor-pointer">
                  <span className="flex items-center gap-1">الطالب <SortIcon field="nameAr" /></span>
                </th>
                <th>الحالة</th>
                <th className="hidden md:table-cell">الجنسية</th>
                <th className="hidden lg:table-cell">الجلسات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <GraduationCap size={48} className="text-gray-200" />
                      <p className="font-medium">لا يوجد طلاب في قاعدة البيانات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <button onClick={() => toggleSelect(student.id)}>
                        {selectedIds.includes(student.id) ? <CheckSquare size={16} className="text-[#1B4F72]" /> : <Square size={16} className="text-gray-300" />}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={student.nameAr} size="sm" imageUrl={student.profileImageUrl} />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{student.nameAr}</p>
                          <p className="text-xs text-gray-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={student.status} /></td>
                    <td className="hidden md:table-cell text-gray-500 text-sm">{student.nationality || '—'}</td>
                    <td className="hidden lg:table-cell">
                      <div className="text-sm">
                        <span className="font-bold text-[#1B4F72]">0</span>
                        <span className="text-gray-400"> / 0</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 hover-actions">
                        <button onClick={() => setSelectedStudent(student.id)} className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="عرض">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setEditingStudent(student)} className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="تعديل">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id)} className="btn btn-icon btn-ghost btn-sm text-red-400 tooltip" data-tip="حذف">
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
      </div>

      {showAddModal && <StudentFormModal onClose={() => setShowAddModal(false)} onSave={handleSaveStudent} />}
      
      {/* نافذة التعديل تظهر من الجدول مباشرة */}
      {editingStudent && <StudentFormModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={handleSaveStudent} />}
    </div>
  );
};