// ============================================================
// STUDENTS PAGE - Full CRUD connected to API (Vercel + PostgreSQL)
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Filter, Download,
  GraduationCap, Edit, Trash2, Eye, UserCheck, UserX,
  ChevronUp, ChevronDown, CheckSquare, Square, RefreshCw, X
} from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { StudentDetailPage } from './StudentDetailPage';

const STATUS_TABS = [
  { value: 'ALL', label: 'الكل' },
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'LEAD', label: 'محتمل (Lead)' },
  { value: 'SUSPENDED', label: 'موقوف' }
];

export const StudentsPage: React.FC<{ onNavigate: (page: string, id?: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState<string>('nameAr');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const [studentsRes, coursesRes, teachersRes] = await Promise.all([
        fetch(`${apiUrl}/students`),
        fetch(`${apiUrl}/courses`),
        fetch(`${apiUrl}/teachers`)
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/students/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setStudents((prev) => prev.filter(s => s.id !== id));
      } else {
        alert('فشل الحذف');
      }
    } catch (error) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
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

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (genderFilter) {
      result = result.filter((s) => s.gender === genderFilter);
    }

    result.sort((a, b) => {
      let valA: string = a[sortBy] || '';
      let valB: string = b[sortBy] || '';
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

  if (selectedStudentId) {
    return (
      <StudentDetailPage
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
        onNavigate={onNavigate}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب البيانات من الخادم...</p>
      </div>
    );
  }

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
            <Download size={16} /> تصدير
          </button>
          <button onClick={() => { setEditingStudent(null); setShowAddModal(true); }} className="btn btn-primary gap-2">
            <Plus size={18} /> <span className="hidden md:inline">إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="tabs-scrollable">
        <div className="tabs" style={{ minWidth: 'max-content' }}>
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'ALL' ? students.length : students.filter(s => s.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`tab ${statusFilter === tab.value ? 'active' : ''}`}
              >
                {tab.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === tab.value ? 'bg-[#1B4F72] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
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
        <button onClick={() => setShowFilters((v) => !v)} className={`btn btn-ghost gap-2 ${showFilters ? 'border-[#1B4F72] text-[#1B4F72]' : ''}`}>
          <Filter size={16} /> فلاتر
          {(genderFilter) && <span className="w-2 h-2 rounded-full bg-[#F39C12]" />}
        </button>
        <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setGenderFilter(''); setPage(1); }} className="btn btn-ghost btn-icon" title="إعادة تعيين">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card p-4 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">الجنس</label>
              <select className="form-input form-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                <option value="">الكل</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">المعلم</label>
              <select className="form-input form-select" value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)}>
                <option value="">الكل</option>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">الدورة</label>
              <select className="form-input form-select">
                <option value="">الكل</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">تاريخ التسجيل</label>
              <input type="date" className="form-input" />
            </div>
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
                    {selectedIds.length === paginated.length && paginated.length > 0 ? <CheckSquare size={16} className="text-[#1B4F72]" /> : <Square size={16} className="text-gray-300" />}
                  </button>
                </th>
                <th onClick={() => toggleSort('nameAr')} className="cursor-pointer">
                  <span className="flex items-center gap-1">الطالب <SortIcon field="nameAr" /></span>
                </th>
                <th>الحالة</th>
                <th className="hidden md:table-cell">الجنسية</th>
                <th className="hidden md:table-cell">تاريخ التسجيل</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <GraduationCap size={48} className="text-gray-200" />
                      <p className="font-medium">لا يوجد طلاب مطابقين للبحث</p>
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
                        <Avatar name={student.nameAr} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{student.nameAr}</p>
                          <p className="text-xs text-gray-400">{student.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={student.status} /></td>
                    <td className="hidden md:table-cell text-gray-500 text-sm">{student.nationality || '—'}</td>
                    <td className="hidden md:table-cell text-gray-500 text-sm">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-SA') : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 hover-actions">
                        <button onClick={() => setSelectedStudentId(student.id)} className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="عرض">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => { setEditingStudent(student); setShowAddModal(true); }} className="btn btn-icon btn-ghost btn-sm tooltip" data-tip="تعديل">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-50">
            <p className="text-sm text-gray-400">
              عرض {(page - 1) * limit + 1}–{Math.min(page * limit, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost btn-sm">السابق</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-ghost btn-sm">التالي</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <StudentFormModal
          student={editingStudent}
          courses={courses}
          onClose={() => setShowAddModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

// ============================================================
// Modal Component (Integrated)
// ============================================================
const StudentFormModal: React.FC<{ student?: any, courses: any[], onClose: () => void, onSave: () => void }> = ({ student, courses, onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: student?.nameAr || '',
    email: student?.user?.email || '',
    status: student?.status || 'ACTIVE',
    nationality: student?.nationality || '',
    courseId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const url = student ? `${apiUrl}/students/${student.id}` : `${apiUrl}/students`;
      const method = student ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const savedStudent = await res.json();
        
        if (!student && formData.courseId) {
            await fetch(`${apiUrl}/enrollments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: savedStudent.id, courseId: formData.courseId })
            });
        }
        onSave();
        onClose();
      } else {
        alert('حدث خطأ أثناء حفظ البيانات.');
      }
    } catch (error) {
      alert('فشل الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label required">اسم الطالب</label>
            <input required type="text" className="form-input" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} placeholder="الاسم الكامل" />
          </div>
          <div className="form-group">
            <label className="form-label required">البريد الإلكتروني</label>
            <input required type="email" className="form-input" dir="ltr" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="student@academy.com" />
          </div>
          <div className="form-group">
            <label className="form-label">الجنسية</label>
            <input type="text" className="form-input" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} placeholder="مثال: مصري..." />
          </div>

          {!student && (
            <div className="form-group">
              <label className="form-label">تسجيل في دورة / مسار (اختياري)</label>
              <select className="form-input form-select" value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})}>
                <option value="">بدون تسجيل حالياً...</option>
                {courses.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">حالة الحساب</label>
            <select className="form-input form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">نشط</option>
              <option value="LEAD">محتمل</option>
              <option value="SUSPENDED">موقوف</option>
            </select>
          </div>
        </form>
        <div className="modal-footer">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الحفظ...' : 'حفظ البيانات'}</button>
        </div>
      </div>
    </div>
  );
};