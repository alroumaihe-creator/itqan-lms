// ============================================================
// REPORTS PAGE
// ============================================================

import React, { useState } from 'react';
import {
  BarChart2, Download, FileText, Users, BookMarked,
  DollarSign, Calendar, TrendingUp, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  mockRevenueData, mockAttendanceData, mockTajweedErrors, mockDashboardStats
} from '../data/mockData';
import { formatCurrency } from '../utils/formatters';

type ReportType = 'overview' | 'students' | 'quran' | 'finance' | 'attendance';

const REPORT_CARDS = [
  { id: 'students', title: 'تقرير الطلاب', desc: 'إحصائيات شاملة عن الطلاب والتحصيل', icon: Users, color: '#1B4F72' },
  { id: 'quran', title: 'تقرير القرآن', desc: 'تقدم الحفظ والتلاوة لجميع الطلاب', icon: BookMarked, color: '#27AE60' },
  { id: 'finance', title: 'التقرير المالي', desc: 'الإيرادات والمدفوعات والمستحقات', icon: DollarSign, color: '#F39C12' },
  { id: 'attendance', title: 'تقرير الحضور', desc: 'معدلات الحضور والغياب بالتفصيل', icon: Calendar, color: '#2E86AB' },
];

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">التقارير والإحصاءات</h1>
          <p className="text-gray-400 text-sm">تحليلات شاملة لأداء الأكاديمية</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm gap-1">
            <Filter size={14} />
            فلتر
          </button>
          <button className="btn btn-secondary btn-sm gap-1">
            <Download size={14} />
            تصدير الكل
          </button>
        </div>
      </div>

      {/* Quick Report Cards */}
      {activeReport === 'overview' && (
        <div className="grid-cards mb-5">
          {REPORT_CARDS.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id as ReportType)}
                className="card p-5 text-right hover:shadow-lg transition-all border-r-4"
                style={{ borderRightColor: report.color }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${report.color}15` }}
                  >
                    <Icon size={20} style={{ color: report.color }} />
                  </div>
                  <h3 className="font-bold text-gray-800">{report.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{report.desc}</p>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-ghost btn-sm gap-1 flex-1">
                    <FileText size={13} />
                    PDF
                  </button>
                  <button className="btn btn-ghost btn-sm gap-1 flex-1">
                    <Download size={13} />
                    Excel
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Overview Charts */}
      {activeReport === 'overview' && (
        <div className="space-y-5">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card" style={{ borderRightColor: '#1B4F72' }}>
              <p className="text-xs text-gray-400">إجمالي الطلاب</p>
              <p className="text-3xl font-black text-[#1B4F72]">{mockDashboardStats.totalStudents}</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#27AE60' }}>
              <p className="text-xs text-gray-400">معدل الحضور</p>
              <p className="text-3xl font-black text-[#27AE60]">{mockDashboardStats.attendanceRate}%</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#F39C12' }}>
              <p className="text-xs text-gray-400">الإيراد السنوي</p>
              <p className="text-2xl font-black text-[#F39C12]">{formatCurrency(mockDashboardStats.totalRevenue)}</p>
            </div>
            <div className="stat-card" style={{ borderRightColor: '#9B59B6' }}>
              <p className="text-xs text-gray-400">الصفحات المحفوظة</p>
              <p className="text-3xl font-black text-[#9B59B6]">{mockDashboardStats.totalPages}</p>
            </div>
          </div>

          {/* Revenue + Attendance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">الإيرادات الشهرية</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1B4F72"
                      strokeWidth={2.5}
                      dot={{ fill: '#1B4F72', r: 4 }}
                      name="الإيراد"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#F39C12"
                      strokeWidth={1.5}
                      strokeDasharray="5 5"
                      dot={false}
                      name="الهدف"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-gray-800 mb-4">الحضور الأسبوعي</h3>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="present" fill="#27AE60" radius={[3, 3, 0, 0]} name="حاضر" />
                    <Bar dataKey="absent" fill="#E74C3C" radius={[3, 3, 0, 0]} name="غائب" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tajweed Errors */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 mb-4">أكثر أخطاء التجويد شيوعاً</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTajweedErrors} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="error" tick={{ fontSize: 12 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="مرات الخطأ">
                    {mockTajweedErrors.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Student Report */}
      {activeReport === 'students' && (
        <StudentReport onBack={() => setActiveReport('overview')} />
      )}

      {/* Finance Report */}
      {activeReport === 'finance' && (
        <FinanceReport onBack={() => setActiveReport('overview')} />
      )}

      {/* Attendance Report */}
      {activeReport === 'attendance' && (
        <AttendanceReport onBack={() => setActiveReport('overview')} />
      )}

      {/* Quran Report */}
      {activeReport === 'quran' && (
        <QuranReport onBack={() => setActiveReport('overview')} />
      )}
    </div>
  );
};

const StudentReport: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="space-y-4 animate-fadeIn">
    <button onClick={onBack} className="text-sm text-[#1B4F72] hover:underline font-semibold">
      ← العودة للتقارير
    </button>
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">تقرير الطلاب التفصيلي</h3>
        <button className="btn btn-ghost btn-sm gap-1">
          <Download size={14} />
          تحميل
        </button>
      </div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { status: 'نشط', count: 6 },
            { status: 'تجريبي', count: 1 },
            { status: 'مهتم', count: 1 },
            { status: 'موقوف', count: 1 },
            { status: 'متخرج', count: 1 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#1B4F72" radius={[4, 4, 0, 0]} name="عدد الطلاب" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const FinanceReport: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="space-y-4 animate-fadeIn">
    <button onClick={onBack} className="text-sm text-[#1B4F72] hover:underline font-semibold">
      ← العودة للتقارير
    </button>
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">التقرير المالي السنوي</h3>
        <button className="btn btn-ghost btn-sm gap-1">
          <Download size={14} />
          تحميل
        </button>
      </div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#27AE60" radius={[4, 4, 0, 0]} name="الإيراد" />
            <Bar dataKey="target" fill="#F39C12" radius={[4, 4, 0, 0]} name="الهدف" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const AttendanceReport: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="space-y-4 animate-fadeIn">
    <button onClick={onBack} className="text-sm text-[#1B4F72] hover:underline font-semibold">
      ← العودة للتقارير
    </button>
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">تقرير الحضور الأسبوعي</h3>
        <button className="btn btn-ghost btn-sm gap-1">
          <Download size={14} />
          تحميل
        </button>
      </div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockAttendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="present" fill="#27AE60" radius={[3, 3, 0, 0]} name="حاضر" />
            <Bar dataKey="absent" fill="#E74C3C" radius={[3, 3, 0, 0]} name="غائب" />
            <Bar dataKey="late" fill="#F39C12" radius={[3, 3, 0, 0]} name="متأخر" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const QuranReport: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="space-y-4 animate-fadeIn">
    <button onClick={onBack} className="text-sm text-[#1B4F72] hover:underline font-semibold">
      ← العودة للتقارير
    </button>
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">تقرير تقدم القرآن</h3>
        <button className="btn btn-ghost btn-sm gap-1">
          <Download size={14} />
          تحميل
        </button>
      </div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockTajweedErrors}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="error" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="عدد الأخطاء">
              {mockTajweedErrors.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);
