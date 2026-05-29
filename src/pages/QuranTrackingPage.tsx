// ============================================================
// QURAN TRACKING PAGE - Record & View Progress (Connected to API)
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookMarked, Plus, Star, CheckCircle, XCircle, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { mockQuranProgressData } from '../data/mockData';
import { Avatar } from '../components/shared/Avatar';
import { TRACK_TYPE_LABELS, getSurahName, formatRelativeTime } from '../utils/formatters';
import type { QuranTrackType } from '../types';

export const QuranTrackingPage: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/quran-records`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("خطأ في جلب السجلات:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // حساب المؤشرات تلقائياً من البيانات الحقيقية
  const totalPages = useMemo(() => records.reduce((s, r) => s + (r.pagesCount || 0), 0), [records]);
  const avgScore = useMemo(() => records.length > 0 ? records.reduce((s, r) => s + (r.recitationScore || 0), 0) / records.length : 0, [records]);
  const highAchieversCount = useMemo(() => records.filter((r) => r.recitationScore >= 8.5).length, [records]);

  const filteredRecords = useMemo(() => {
    if (!search) return records;
    return records.filter(r => r.student?.nameAr?.toLowerCase().includes(search.toLowerCase()) || r.surahStart?.toLowerCase().includes(search.toLowerCase()));
  }, [records, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4F72] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">جاري جلب سجلات تتبع القرآن...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">تتبع القرآن</h1>
          <p className="text-gray-400 text-sm">{filteredRecords.length} سجل متاح</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">تسجيل جلسة</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card" style={{ borderRightColor: '#1B4F72' }}>
          <p className="text-xs text-gray-400 mb-1">إجمالي الصفحات</p>
          <p className="text-3xl font-black text-[#1B4F72]">{totalPages.toFixed(1)}</p>
        </div>
        <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
          <p className="text-xs text-gray-400 mb-1">متوسط الدرجة</p>
          <p className="text-3xl font-black text-[#27AE60]">{avgScore.toFixed(1)}/10</p>
        </div>
        <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
          <p className="text-xs text-gray-400 mb-1">حلقات رُصدت</p>
          <p className="text-3xl font-black text-[#F39C12]">{records.length}</p>
        </div>
        <div className="stat-card" style={{ borderRightColor: '#9B59B6' }}>
          <p className="text-xs text-gray-400 mb-1">ممتاز (8.5+)</p>
          <p className="text-3xl font-black text-[#9B59B6]">{highAchieversCount}</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4">التقدم الأسبوعي للجميع</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockQuranProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip />
              <Bar dataKey="pages" fill="#1B4F72" radius={[4, 4, 0, 0]} name="صفحات محفوظة" />
              <Bar dataKey="goal" fill="#F39C12" radius={[4, 4, 0, 0]} name="الهدف" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">السجلات الأخيرة</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="بحث باسم الطالب..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input pr-8 py-1.5 text-sm" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>النوع</th>
                <th>السور</th>
                <th>الصفحات</th>
                <th>الدرجة</th>
                <th>أخطاء التجويد</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={record.student?.nameAr || 'طالب'} size="xs" />
                      <span className="text-sm font-medium">{record.student?.nameAr || 'طالب محذوف'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {TRACK_TYPE_LABELS[record.trackType] || record.trackType}
                    </span>
                  </td>
                  <td className="text-sm">
                    {record.surahStart && (
                      <span>
                        {getSurahName(record.surahStart) || record.surahStart} ({record.ayahStart || 1})
                        {record.surahEnd && ` ← ${getSurahName(record.surahEnd) || record.surahEnd} (${record.ayahEnd || 1})`}
                      </span>
                    )}
                  </td>
                  <td className="font-bold text-[#1B4F72]">{record.pagesCount}</td>
                  <td>
                    <div className="flex items-center gap-0.5">
                      <Star size={12} className="text-[#F39C12] fill-[#F39C12]" />
                      <span className="text-sm font-bold">{record.recitationScore}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-0.5">
                      {record.tajweedErrors?.slice(0, 2).map((e: string) => (
                        <span key={e} className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                          {e}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {record.recitationScore >= 8 ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-400" />
                    )}
                  </td>
                  <td className="text-xs text-gray-400">{formatRelativeTime(record.createdAt)}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">لا توجد سجلات مطابقة للبحث</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <QuranRecordModal onClose={() => setShowAddModal(false)} onSave={fetchRecords} />}
    </div>
  );
};

const QuranRecordModal: React.FC<{ onClose: () => void, onSave: () => void }> = ({ onClose, onSave }) => {
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [realTeachers, setRealTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trackType, setTrackType] = useState<QuranTrackType>('NEW_MEMORIZATION');
  const [score, setScore] = useState(10);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [studentId, setStudentId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [surahStart, setSurahStart] = useState('');
  const [ayahStart, setAyahStart] = useState('');
  const [surahEnd, setSurahEnd] = useState('');
  const [ayahEnd, setAyahEnd] = useState('');
  const [pagesCount, setPagesCount] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');

  useEffect(() => {
    const loadFormData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const [sRes, tRes] = await Promise.all([fetch(`${apiUrl}/students`), fetch(`${apiUrl}/teachers`)]);
      if (sRes.ok) setRealStudents(await sRes.json());
      if (tRes.ok) setRealTeachers(await tRes.json());
    };
    loadFormData();
  }, []);

  const toggleError = (err: string) => {
    setSelectedErrors((prev) => prev.includes(err) ? prev.filter((e) => e !== err) : [...prev, err]);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !teacherId) return alert('يرجى اختيار الطالب والمعلم');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://itqan-lms.vercel.app';
      const response = await fetch(`${apiUrl}/quran-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, teacherId, trackType, surahStart, ayahStart, surahEnd, ayahEnd,
          pagesCount, recitationScore: score, tajweedErrors: selectedErrors, teacherNotes
        })
      });

      if (response.ok) {
        onSave();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookMarked size={20} className="text-[#1B4F72]" />
            تسجيل جلسة قرآنية إدارية
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <form onSubmit={handleFormSubmit} className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الطالب</label>
              <select required className="form-input form-select" value={studentId} onChange={e => setStudentId(e.target.value)}>
                <option value="">اختر طالباً...</option>
                {realStudents.map((s) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">المعلم المسؤول</label>
              <select required className="form-input form-select" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                <option value="">اختر معلماً...</option>
                {realTeachers.map((t) => <option key={t.id} value={t.id}>{t.nameAr}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">نوع الجلسة</label>
            <div className="grid grid-cols-2 gap-2">
              {(['NEW_MEMORIZATION', 'REVISION', 'READING', 'TAJWEED'] as QuranTrackType[]).map((type) => (
                <button type="button" key={type} onClick={() => setTrackType(type)} className={`py-2 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${trackType === type ? 'border-[#1B4F72] bg-blue-50 text-[#1B4F72]' : 'border-gray-100 text-gray-500'}`}>
                  {TRACK_TYPE_LABELS[type] || type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <input required type="text" className="form-input text-sm" placeholder="من سورة" value={surahStart} onChange={e => setSurahStart(e.target.value)} />
            <input type="number" className="form-input text-sm" placeholder="الآية" value={ayahStart} onChange={e => setAyahStart(e.target.value)} />
            <input type="text" className="form-input text-sm" placeholder="إلى سورة (اختياري)" value={surahEnd} onChange={e => setSurEnd(e.target.value)} />
            <input type="number" className="form-input text-sm" placeholder="الآية" value={ayahEnd} onChange={e => setAyahEnd(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">عدد الصفحات</label>
              <input required type="number" step="0.5" className="form-input" placeholder="2.5" value={pagesCount} onChange={e => setPagesCount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">الدرجة (من 10)</label>
              <select className="form-input form-select font-bold text-amber-600" value={score} onChange={e => setScore(parseInt(e.target.value))}>
                {[10,9,8,7,6,5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 10</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ملاحظات المعلم والإدارة</label>
            <textarea rows={2} className="form-input resize-none" placeholder="اكتب ملاحظات الأداء..." value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)} />
          </div>

          <div className="modal-footer pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-ghost">إلغاء</button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">{isLoading ? 'جاري الحفظ...' : 'حفظ السجل'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};