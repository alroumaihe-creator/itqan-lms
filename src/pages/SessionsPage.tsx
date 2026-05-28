// ============================================================
// SESSIONS PAGE - Calendar + List View
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar, Plus, Video, Clock, User, Filter,
  CheckCircle, XCircle, PlayCircle, AlertCircle, MoreVertical
} from 'lucide-react';
import { mockSessions, mockTeachers, mockCourses, mockStudents } from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import type { Session, SessionStatus } from '../types';
import { DAYS_AR } from '../utils/formatters';

type ViewMode = 'list' | 'calendar';

const SESSION_STATUS_ICONS: Record<SessionStatus, React.ReactNode> = {
  SCHEDULED: <Clock size={15} className="text-blue-500" />,
  IN_PROGRESS: <PlayCircle size={15} className="text-amber-500" />,
  COMPLETED: <CheckCircle size={15} className="text-green-500" />,
  CANCELLED: <XCircle size={15} className="text-red-500" />,
  POSTPONED: <AlertCircle size={15} className="text-orange-400" />,
};

export const SessionsPage: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return mockSessions;
    return mockSessions.filter((s) => s.status === statusFilter);
  }, [statusFilter]);

  // Generate calendar month view
  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // padding start
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [selectedDate]);

  const getSessionsForDate = (date: Date | null) => {
    if (!date) return [];
    return mockSessions.filter((s) => {
      const sessionDate = new Date(s.scheduledAt);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">الجلسات</h1>
          <p className="text-gray-400 text-sm">{mockSessions.length} جلسة</p>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow text-[#1B4F72]' : 'text-gray-500'}`}
            >
              قائمة
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white shadow text-[#1B4F72]' : 'text-gray-500'}`}
            >
              تقويم
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary gap-2"
          >
            <Plus size={18} />
            <span className="hidden md:inline">جلسة جديدة</span>
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
          >
            {s === 'ALL' ? 'الكل' :
             s === 'SCHEDULED' ? 'مجدولة' :
             s === 'IN_PROGRESS' ? 'جارية' :
             s === 'COMPLETED' ? 'مكتملة' :
             s === 'CANCELLED' ? 'ملغاة' : 'مؤجلة'}
            <span className="text-xs opacity-70 mr-1">
              ({s === 'ALL' ? mockSessions.length : mockSessions.filter(x => x.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card p-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
              className="btn btn-ghost btn-sm"
            >
              ◄
            </button>
            <h3 className="font-bold text-gray-800">
              {selectedDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
            </h3>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
              className="btn btn-ghost btn-sm"
            >
              ►
            </button>
          </div>

          {/* Day Headers */}
          <div className="calendar-grid mb-2">
            {DAYS_AR.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid">
            {daysInMonth.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;
              const sessions = getSessionsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-day ${isToday ? 'today' : ''} ${sessions.length > 0 ? 'has-session' : ''}`}
                >
                  <span className="text-sm">{date.getDate()}</span>
                  {sessions.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {sessions.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              s.status === 'COMPLETED' ? '#27AE60' :
                              s.status === 'CANCELLED' ? '#E74C3C' :
                              s.status === 'SCHEDULED' ? '#2E86AB' : '#F39C12'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            {[
              { color: '#2E86AB', label: 'مجدولة' },
              { color: '#27AE60', label: 'مكتملة' },
              { color: '#E74C3C', label: 'ملغاة' },
              { color: '#F39C12', label: 'مؤجلة' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
                <p className="font-medium">لا توجد جلسات</p>
              </div>
            ) : (
              filtered.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddModal && (
        <AddSessionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

const SessionRow: React.FC<{ session: Session }> = ({ session }) => {
  const sessionDate = new Date(session.scheduledAt);
  const isToday = sessionDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      {/* Date block */}
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isToday ? 'bg-[#1B4F72] text-white' : 'bg-gray-50'}`}>
        <span className={`text-xl font-black ${isToday ? 'text-white' : 'text-[#1B4F72]'}`}>
          {sessionDate.getDate()}
        </span>
        <span className={`text-xs ${isToday ? 'text-white/70' : 'text-gray-400'}`}>
          {sessionDate.toLocaleDateString('ar-SA', { month: 'short' })}
        </span>
      </div>

      {/* Session Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-gray-800 text-sm">{session.course?.nameAr || 'جلسة عامة'}</p>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {session.type === 'INDIVIDUAL' ? 'فردي' : 'مجموعة'}
          </span>
          {session.isRecurring && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">متكررة</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <User size={12} />
            {session.teacher?.nameAr}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {sessionDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            {' · '}{session.durationMinutes} دقيقة
          </span>
        </div>
      </div>

      {/* Meeting link */}
      {session.meetingLink && session.status === 'SCHEDULED' && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-secondary gap-1 hidden md:flex"
        >
          <Video size={14} />
          انضمام
        </a>
      )}

      <StatusBadge status={session.status} size="sm" />

      <button className="btn btn-icon btn-ghost btn-sm">
        <MoreVertical size={16} />
      </button>
    </div>
  );
};

const AddSessionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isRecurring, setIsRecurring] = useState(false);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h2 className="text-lg font-bold">جلسة جديدة</h2>
          <button onClick={onClose} className="btn btn-icon btn-ghost">✕</button>
        </div>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label required">الطالب</label>
              <select className="form-input form-select">
                <option value="">اختر طالباً...</option>
                {mockStudents.filter(s => s.status === 'ACTIVE').map((s) => (
                  <option key={s.id} value={s.id}>{s.nameAr}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">المعلم</label>
              <select className="form-input form-select">
                <option value="">اختر معلماً...</option>
                {mockTeachers.filter(t => t.isAvailable).map((t) => (
                  <option key={t.id} value={t.id}>{t.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">الدورة</label>
            <select className="form-input form-select">
              <option value="">اختر دورة...</option>
              {mockCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label required">التاريخ</label>
              <input type="date" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label required">الوقت</label>
              <input type="time" className="form-input" dir="ltr" />
            </div>
            <div className="form-group">
              <label className="form-label">المدة (دقيقة)</label>
              <select className="form-input form-select" dir="ltr">
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60" selected>60</option>
                <option value="90">90</option>
                <option value="120">120</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">نوع الجلسة</label>
              <select className="form-input form-select">
                <option value="INDIVIDUAL">فردي</option>
                <option value="GROUP">مجموعة</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">المنطقة الزمنية</label>
              <select className="form-input form-select">
                <option>Asia/Riyadh</option>
                <option>Africa/Cairo</option>
                <option>Asia/Dubai</option>
                <option>UTC</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">رابط الاجتماع</label>
            <div className="flex gap-2">
              <input type="url" className="form-input flex-1" placeholder="https://meet.google.com/..." dir="ltr" />
              <button className="btn btn-ghost btn-sm whitespace-nowrap">توليد تلقائي</button>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-gray-700 text-sm">جلسة متكررة</p>
              <p className="text-xs text-gray-400">يتكرر تلقائياً أسبوعياً</p>
            </div>
            <button
              onClick={() => setIsRecurring((v) => !v)}
              className={`w-12 h-6 rounded-full transition-colors ${isRecurring ? 'bg-[#1B4F72]' : 'bg-gray-300'}`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${isRecurring ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          {isRecurring && (
            <div className="form-group animate-fadeIn">
              <label className="form-label">تاريخ الانتهاء</label>
              <input type="date" className="form-input" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ملاحظات</label>
            <textarea rows={2} className="form-input resize-none" placeholder="أي ملاحظات خاصة بالجلسة..." />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">إلغاء</button>
          <button onClick={onClose} className="btn btn-primary">حفظ الجلسة</button>
        </div>
      </div>
    </div>
  );
};
