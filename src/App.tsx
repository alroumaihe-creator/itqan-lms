// ============================================================
// APP.TSX - Main Application Entry Point
// Academic Management System - أكاديمية النور
// ============================================================

import React, { useEffect, Suspense } from 'react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { CoursesPage } from './pages/CoursesPage';
import { SessionsPage } from './pages/SessionsPage';
import { QuranTrackingPage } from './pages/QuranTrackingPage';
import { FinancePage } from './pages/FinancePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { LibraryPage } from './pages/LibraryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PageLoader } from './components/shared/LoadingSpinner';

// Page title mapping
const PAGE_TITLES: Record<string, { title: string; breadcrumbs?: { label: string; page?: string }[] }> = {
  dashboard: { title: 'لوحة التحكم', breadcrumbs: [{ label: 'الرئيسية' }] },
  students: { title: 'الطلاب', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الطلاب' }] },
  teachers: { title: 'المعلمون', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المعلمون' }] },
  parents: { title: 'أولياء الأمور', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'أولياء الأمور' }] },
  courses: { title: 'الدورات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الدورات' }] },
  sessions: { title: 'الجلسات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الجلسات' }] },
  schedule: { title: 'الجدول', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الجدول' }] },
  attendance: { title: 'الحضور', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الحضور' }] },
  'quran-tracking': { title: 'تتبع القرآن', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'تتبع القرآن' }] },
  exams: { title: 'الاختبارات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الاختبارات' }] },
  finance: { title: 'المالية', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المالية' }] },
  'finance-invoices': { title: 'الفواتير', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المالية', page: 'finance' }, { label: 'الفواتير' }] },
  'finance-payments': { title: 'المدفوعات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المالية', page: 'finance' }, { label: 'المدفوعات' }] },
  'finance-subscriptions': { title: 'الاشتراكات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المالية', page: 'finance' }, { label: 'الاشتراكات' }] },
  library: { title: 'المكتبة', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المكتبة' }] },
  certificates: { title: 'الشهادات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الشهادات' }] },
  notifications: { title: 'الإشعارات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الإشعارات' }] },
  reports: { title: 'التقارير', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'التقارير' }] },
  settings: { title: 'الإعدادات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الإعدادات' }] },
};

// Simple Attendance page placeholder
const AttendancePage: React.FC = () => (
  <div className="space-y-5 animate-fadeIn">
    <h1 className="text-2xl font-black text-gray-800">سجل الحضور</h1>
    <div className="card p-8 text-center text-gray-400">
      <p className="text-lg mb-2">تسجيل الحضور</p>
      <p className="text-sm">اختر الجلسة لتسجيل حضور الطلاب</p>
    </div>
  </div>
);

// Exams page placeholder
const ExamsPage: React.FC = () => (
  <div className="space-y-5 animate-fadeIn">
    <h1 className="text-2xl font-black text-gray-800">الاختبارات</h1>
    <div className="card p-8 text-center text-gray-400">
      <p className="text-lg mb-2">إدارة الاختبارات</p>
      <p className="text-sm">إنشاء وإدارة اختبارات الطلاب</p>
    </div>
  </div>
);

// Parents page placeholder
const ParentsPage: React.FC = () => (
  <div className="space-y-5 animate-fadeIn">
    <h1 className="text-2xl font-black text-gray-800">أولياء الأمور</h1>
    <div className="card p-8 text-center text-gray-400">
      <p className="text-lg mb-2">إدارة أولياء الأمور</p>
      <p className="text-sm">ربط الطلاب بأولياء أمورهم والتواصل معهم</p>
    </div>
  </div>
);

// Schedule page placeholder
const SchedulePage: React.FC = () => (
  <div className="space-y-5 animate-fadeIn">
    <h1 className="text-2xl font-black text-gray-800">الجدول الأسبوعي</h1>
    <div className="card p-8 text-center text-gray-400">
      <p className="text-lg mb-2">جدول الجلسات</p>
      <p className="text-sm">عرض جميع الجلسات بشكل أسبوعي</p>
    </div>
  </div>
);

// Notifications center page
const NotificationsPage: React.FC = () => {
  const { mockNotifications } = require('./data/mockData');
  const [notifs, setNotifs] = React.useState(mockNotifications);
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">الإشعارات</h1>
        <button
          onClick={() => setNotifs((prev: any[]) => prev.map((n: any) => ({ ...n, isRead: true })))}
          className="btn btn-ghost btn-sm"
        >
          قراءة الكل
        </button>
      </div>
      <div className="card overflow-hidden">
        {notifs.map((notif: any) => (
          <div
            key={notif.id}
            onClick={() => setNotifs((prev: any[]) => prev.map((n: any) => n.id === notif.id ? { ...n, isRead: true } : n))}
            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <span className="text-lg">🔔</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{notif.title}</p>
              <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.body}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.createdAt).toLocaleString('ar-SA')}
              </p>
            </div>
            {!notif.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B4F72] flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Application Layout Component
 * Handles routing, sidebar, header, and page rendering
 */
const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const { sidebarCollapsed } = useUIStore();

  const handleNavigate = (page: string, _id?: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const pageInfo = PAGE_TITLES[currentPage] || { title: currentPage, breadcrumbs: [] };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'students':
        return <StudentsPage onNavigate={handleNavigate} />;
      case 'teachers':
        return <TeachersPage onNavigate={handleNavigate} />;
      case 'parents':
        return <ParentsPage />;
      case 'courses':
        return <CoursesPage />;
      case 'sessions':
        return <SessionsPage onNavigate={handleNavigate} />;
      case 'schedule':
        return <SchedulePage />;
      case 'attendance':
        return <AttendancePage />;
      case 'quran-tracking':
        return <QuranTrackingPage />;
      case 'exams':
        return <ExamsPage />;
      case 'finance':
      case 'finance-invoices':
      case 'finance-payments':
      case 'finance-subscriptions':
        return <FinancePage />;
      case 'library':
        return <LibraryPage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]" dir="rtl">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{
          marginRight: `var(${sidebarCollapsed ? '--sidebar-collapsed' : '--sidebar-width'})`,
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Header
          title={pageInfo.title}
          breadcrumbs={pageInfo.breadcrumbs}
          onNavigate={handleNavigate}
        />

        {/* Page Content */}
        <main
          className="p-4 md:p-6"
          style={{ paddingTop: `calc(var(--header-height) + 16px)` }}
        >
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

/**
 * Root App Component
 * Handles authentication state and routing
 */
const App: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();

  // Handle login success
  const handleLogin = () => {
    toast.success('مرحباً بك في أكاديمية النور! 🎉');
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster
          position="bottom-left"
          dir="rtl"
          toastOptions={{
            style: { fontFamily: 'Cairo, sans-serif' },
          }}
        />
      </>
    );
  }

  return (
    <>
      <AppLayout />
      <Toaster
        position="bottom-left"
        dir="rtl"
        richColors
        toastOptions={{
          style: { fontFamily: 'Cairo, sans-serif' },
          duration: 4000,
        }}
      />
    </>
  );
};

export default App;
