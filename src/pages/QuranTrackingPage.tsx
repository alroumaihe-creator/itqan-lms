// ============================================================
// QURAN TRACKING PAGE - Record & View Progress
// ============================================================

import React, { useState } from 'react';
import {
  BookMarked, Plus, Star, CheckCircle, XCircle, Filter, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { mockQuranRecords, mockStudents, mockQuranProgressData } from '../data/mockData';
import { Avatar } from '../components/shared/Avatar';
import {
  TRACK_TYPE_LABELS, TAJWEED_ERRORS, getSurahName, formatRelativeTime
} from '../utils/formatters';
import type { QuranTrackType } from '../types';

export const QuranTrackingPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  const totalPages = mockQuranRecords.reduce((s, r) => s + (r.pagesCount || 0), 0);
  const avgScore = mockQuranRecords.length > 0
    ? mockQuranRecords.reduce((s, r) => s + (r.recitationScore || 0), 0) / mockQuranRecords.length
    : 0;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">تتبع القرآن</h1>
          <p className="text-gray-400 text-sm">{mockQuranRecords.length} سجل</p>
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
          <p className="text-xs text-gray-400 mb-1">جلسات هذا الأسبوع</p>
          <p className="text-3xl font-black text-[#F39C12]">4</p>
        </div>
        <div className="stat-card" style={{ borderRightColor: '#9B59B6' }}>
          <p className="text-xs text-gray-400 mb-1">حققوا الهدف</p>
          <p className="text-3xl font-black text-[#9B59B6]">
            {mockQuranRecords.filter((r) => r.weeklyGoalMet).length}
          </p>
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
              <input type="text" placeholder="بحث..." className="form-input pr-8 py-1.5 text-sm" />
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
                <th>الهدف</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {mockQuranRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={record.student?.nameAr || 'طالب'} size="xs" />
                      <span className="text-sm font-medium">{record.student?.nameAr}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                      {TRACK_TYPE_LABELS[record.trackType]}
                    </span>
                  </td>
                  <td className="text-sm">
                    {record.surahStart && (
                      <span>
                        {getSurahName(record.surahStart)} ({record.ayahStart})
                        {record.surahEnd && ` ← ${getSurahName(record.surahEnd)} (${record.ayahEnd})`}
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
                      {record.tajweedErrors.slice(0, 2).map((e) => (
                        <span key={e} className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded">
                          {e}
                        </span>
                      ))}
                      {record.tajweedErrors.length > 2 && (
                        <span className="text-xs text-gray-400">+{record.tajweedErrors.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {record.weeklyGoalMet === true ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : record.weeklyGoalMet === false ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : '—'}
                  </td>
                  <td className="text-xs text-gray-400">{formatRelativeTime(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && <QuranRecordModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

const QuranRecordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [trackType, setTrackType] = useState<QuranTrackType>('NEW_MEMORIZATION');
  const [score, setScore] = useState(0);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<boolean | null>(null);

  const toggleError = (err: string) => {
    setSelectedErrors((prev) =>
      prev.includes(err) ? prev.filter((e) => e !== err) : [...prev, err]
    );
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookMarked size={20} className="text-[#1B4F72]" />
            تسجيل جلسة قرآنية
          </h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <div className="modal-body space-y-5">
          {/* Student & Session */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الطالب</label>
              <select className="form-input form-select">
                <option value="">اختر طالباً...</option>
                {mockStudents.filter((s) => s.status === 'ACTIVE').map((s) => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">تاريخ الجلسة</label>
              <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {/* Track Type */}
          <div className="form-group">
            <label className="form-label required">نوع الجلسة</label>
            <div className="grid grid-cols-2 gap-2">
              {(['NEW_MEMORIZATION', 'REVISION', 'READING', 'TAJWEED'] as QuranTrackType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTrackType(type)}
                  className={`py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    trackType === type
                      ? 'border-[#1B4F72] bg-blue-50 text-[#1B4F72]'
                      : 'border-gray-100 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {TRACK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Quran Position */}
          <div>
            <p className="form-label mb-2">الموضع في القرآن</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2 font-semibold">من</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label text-xs">السورة</label>
                    <input type="number" min={1} max={114} className="form-input text-sm" placeholder="1" dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">الآية</label>
                    <input type="number" min={1} className="form-input text-sm" placeholder="1" dir="ltr" />
                  </div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-2 font-semibold">إلى</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="form-group">
                    <label className="form-label text-xs">السورة</label>
                    <input type="number" min={1} max={114} className="form-input text-sm" placeholder="1" dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">الآية</label>
                    <input type="number" min={1} className="form-input text-sm" placeholder="7" dir="ltr" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pages & Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">عدد الصفحات</label>
              <input type="number" step="0.5" min="0" className="form-input" placeholder="2.5" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">درجة التلاوة (1-10)</label>
              <div className="star-rating justify-start flex-wrap">
                {Array.from({ length: 10 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setScore(i + 1)}
                    className={`star ${i < score ? 'filled' : ''}`}
                    style={{ fontSize: 22 }}
                  >
                    ★
                  </button>
                ))}
                {score > 0 && (
                  <span className="text-sm font-bold text-gray-500 self-center mr-1">{score}/10</span>
                )}
              </div>
            </div>
          </div>

          {/* Tajweed Errors */}
          <div className="form-group">
            <label className="form-label">أخطاء التجويد (اختر كل ما ينطبق)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TAJWEED_ERRORS.map((err) => (
                <button
                  key={err}
                  onClick={() => toggleError(err)}
                  className={`error-chip ${selectedErrors.includes(err) ? 'selected' : ''}`}
                >
                  {err}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="form-group">
            <label className="form-label">هل تحقق الهدف الأسبوعي؟</label>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setWeeklyGoal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  weeklyGoal === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <CheckCircle size={16} />
                نعم، تحقق
              </button>
              <button
                onClick={() => setWeeklyGoal(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  weeklyGoal === false
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <XCircle size={16} />
                لا، لم يتحقق
              </button>
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="form-group">
            <label className="form-label">ملاحظات المعلم</label>
            <textarea
              rows={3}
              placeholder="اكتب ملاحظاتك حول أداء الطالب..."
              className="form-input resize-none"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          <button onClick={onClose} className="btn btn-primary">حفظ السجل</button>
        </div>
      </div>
    </div>
  );
};
