import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, Download, GraduationCap, Eye, Edit, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import type { Student, StudentStatus } from '../types';
import { StudentFormModal } from '../components/students/StudentFormModal';

export const StudentsPage: React.FC<{ onNavigate: (page: string, id?: string) => void }> = ({ onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      try {
        const response = await fetch(`${apiUrl}/students`);
        const data = await response.json();
        setStudents(data);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchStudents();
  }, []);

  const handleAddStudent = async (data: Partial<Student>) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
    const response = await fetch(`${apiUrl}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nameAr: data.nameAr,
        email: data.user?.email,
        nationality: data.nationality
      }),
    });
    if (response.ok) {
      const newStudent = await response.json();
      setStudents((prev) => [newStudent, ...prev]);
      setShowAddModal(false);
    }
  };

  if (isLoading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-black">الطلاب ({students.length})</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">إضافة طالب</button>
      </div>
      
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr><th>الطالب</th><th>الحالة</th><th>الإجراءات</th></tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.nameAr}</td>
                <td><StatusBadge status={s.status} /></td>
                <td><button className="btn btn-ghost btn-sm">عرض</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <StudentFormModal onClose={() => setShowAddModal(false)} onSave={handleAddStudent} />
      )}
    </div>
  );
};