// ============================================================
// DASHBOARD PAGE - Main Analytics Overview
// ============================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, GraduationCap, Calendar, DollarSign,
  BookMarked, Award, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Mic2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import {
  mockDashboardStats, mockRevenueData, mockAttendanceData,
  mockStudents, mockSessions
} from '../data/mockData';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Avatar } from '../components/shared/Avatar';
import { formatCurrency } from '../utils/formatters';



interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, change, icon: Icon, color, bgColor, subtitle
}) => (
  <div className="stat-card" style={{ borderRightColor: color }}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-black" style={{ color }}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span style={{ color }}><Icon size={22} /></span>
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-1">
        {change >= 0 ? (
          <ArrowUpRight size={14} className="text-green-500" />
        ) : (
          <ArrowDownRight size={14} className="text-red-500" />
        )}
        <span
          className={`text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-gray-400">مقارنة بالشهر الماضي</span>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="font-bold text-gray-700 mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold">{typeof entry.value === 'number' && entry.value > 100
              ? formatCurrency(entry.value)
              : entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Student status distribution data
const studentStatusData = [
  { name: 'نشط', value: 6, color: '#27AE60' },
  { name: 'تجريبي', value: 1, color: '#F39C12' },
  { name: 'مهتم', value: 1, color: '#2E86AB' },
  { name: 'موقوف', value: 1, color: '#E74C3C' },
  { name: 'متخرج', value: 1, color: '#9B59B6' },
];

export const DashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const stats = mockDashboardStats;

  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role || '');
  const isTeacher = user?.role === 'TEACHER';
  const isAccountant = user?.role === 'ACCOUNTANT';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="bg-gradient-to-l from-[#1B4F72] to-[#2E86AB] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/2 translate-y-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm mb-1">مرحباً بك،</p>
          <h2 className="text-2xl font-bold mb-1">{user?.nameAr} 👋</h2>
          <p className="text-white/60 text-sm">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-black">{stats.sessionsThisWeek}</p>
              <p className="text-white/70 text-xs">جلسات هذا الأسبوع</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-black">{stats.attendanceRate}%</p>
              <p className="text-white/70 text-xs">معدل الحضور</p>
            </div>
            {!isTeacher && (
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-2xl font-black">{stats.activeStudents}</p>
                <p className="text-white/70 text-xs">طالب نشط</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <KPICard
          title="إجمالي الطلاب"
          value={stats.totalStudents}
          change={15}
          icon={GraduationCap}
          color="#1B4F72"
          bgColor="#EFF6FF"
          subtitle={`${stats.activeStudents} طالب نشط`}
        />
        <KPICard
          title="المعلمون"
          value={stats.totalTeachers}
          icon={Users}
          color="#27AE60"
          bgColor="#F0FDF4"
          subtitle="4 متاحون الآن"
        />
        <KPICard
          title="الجلسات"
          value={stats.totalSessions}
          change={8}
          icon={Mic2}
          color="#2E86AB"
          bgColor="#EFF6FF"
          subtitle={`${stats.sessionsThisWeek} هذا الأسبوع`}
        />
        {(isAdmin || isAccountant) && (
          <KPICard
            title="الإيرادات الشهرية"
            value={formatCurrency(stats.monthlyRevenue)}
            change={12}
            icon={DollarSign}
            color="#F39C12"
            bgColor="#FFFBEB"
            subtitle={`${stats.overdueInvoices} فاتورة متأخرة`}
          />
        )}
        <KPICard
          title="صفحات محفوظة"
          value={stats.totalPages}
          change={5}
          icon={BookMarked}
          color="#9B59B6"
          bgColor="#FAF5FF"
          subtitle="مجموع جميع الطلاب"
        />
        <KPICard
          title="الشهادات"
          value={stats.certificatesIssued}
          icon={Award}
          color="#E67E22"
          bgColor="#FFF7ED"
          subtitle="صادرة هذا العام"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {(isAdmin || isAccountant) && (
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800">الإيرادات الشهرية</h3>
                <p className="text-sm text-gray-400">مقارنة بالهدف المحدد</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#1B4F72] inline-block" />
                  الإيرادات
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#F39C12] inline-block" />
                  الهدف
                </span>
              </div>
            </div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4F72" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1B4F72" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F39C12" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#F39C12" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1B4F72"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                    name="الإيرادات"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#F39C12"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#colorTarget)"
                    name="الهدف"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Student Status Donut */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-800 mb-1">توزيع الطلاب</h3>
          <p className="text-sm text-gray-400 mb-4">حسب الحالة</p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {studentStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} طالب`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {studentStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800">إحصائيات الحضور - هذا الأسبوع</h3>
            <p className="text-sm text-gray-400">توزيع الحضور والغياب يومياً</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#27AE60]" /> حاضر</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#E74C3C]" /> غائب</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#F39C12]" /> متأخر</span>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAttendanceData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="present" fill="#27AE60" radius={[4, 4, 0, 0]} name="حاضر" />
              <Bar dataKey="absent" fill="#E74C3C" radius={[4, 4, 0, 0]} name="غائب" />
              <Bar dataKey="late" fill="#F39C12" radius={[4, 4, 0, 0]} name="متأخر" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">آخر الطلاب</h3>
            <button
              onClick={() => onNavigate('students')}
              className="text-sm text-[#1B4F72] font-semibold hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {mockStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <Avatar name={student.nameAr} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{student.nameAr}</p>
                  <p className="text-xs text-gray-400">{student.nationality}</p>
                </div>
                <StatusBadge status={student.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">الجلسات القادمة</h3>
            <button
              onClick={() => onNavigate('sessions')}
              className="text-sm text-[#1B4F72] font-semibold hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {mockSessions.filter(s => s.status === 'SCHEDULED').map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{session.course?.nameAr}</p>
                  <p className="text-xs text-gray-400">{session.teacher?.nameAr}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#1B4F72]">
                    {new Date(session.scheduledAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(session.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-700 text-sm">فاتورة متأخرة</p>
              <p className="text-xs text-red-500">INV-2024-0002 - يوسف أحمد</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Clock size={20} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-700 text-sm">جلسة خلال ساعة</p>
              <p className="text-xs text-amber-500">{mockSessions[0]?.course?.nameAr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-700 text-sm">طالب جديد تسجّل</p>
              <p className="text-xs text-green-500">سارة أحمد اليمنية</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
