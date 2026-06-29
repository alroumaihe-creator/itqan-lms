// ============================================================
// APP.TSX - Main Application Entry Point (Secured & Bulletproof Responsive)
// Academic Management System - أكاديمية إتقان
// ============================================================

import React, { Suspense } from 'react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
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

const PAGE_TITLES: Record<string, { title: string; breadcrumbs?: { label: string; page?: string }[] }> = {
  dashboard: { title: 'لوحة التحكم', breadcrumbs: [{ label: 'الرئيسية' }] },
  students: { title: 'الطلاب', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الطلاب' }] },
  teachers: { title: 'المعلمون', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'المعلمون' }] },
  parents: { title: 'أولياء الأمور', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'أولياء الأمور' }] },
  courses: { title: 'المسارات والدورات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الدورات' }] },
  sessions: { title: 'إدارة الجلسات', breadcrumbs: [{ label: 'الرئيسية', page: 'dashboard' }, { label: 'الجلسات' }] },
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

const ParentsPage: React.FC = () => <div className="space-y-5 animate-fadeIn"><h1 className="text-2xl font-black text-gray-800">أولياء الأمور</h1><div className="card p-8 text-center text-gray-400">قريباً</div></div>;
const ExamsPage: React.FC = () => <div className="space-y-5 animate-fadeIn"><h1 className="text-2xl font-black text-gray-800">الاختبارات</h1><div className="card p-8 text-center text-gray-400">قريباً</div></div>;
const NotificationsPage: React.FC = () => <div className="space-y-5 animate-fadeIn"><h1 className="text-2xl font-black text-gray-800">الإشعارات</h1><div className="card p-8 text-center text-gray-400">لا توجد إشعارات جديدة</div></div>;

const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const { sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();

  const handleNavigate = (page: string, _id?: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const pageInfo = PAGE_TITLES[currentPage] || { title: currentPage, breadcrumbs: [] };

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      if (user?.role === 'TEACHER') return <TeacherDashboard />;
      if (user?.role === 'STUDENT') return <StudentDashboardPage />;
      return <DashboardPage onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'students': return <StudentsPage onNavigate={handleNavigate} />;
      case 'teachers': return <TeachersPage onNavigate={handleNavigate} />;
      case 'parents': return <ParentsPage />;
      case 'courses': return <CoursesPage />;
      case 'sessions': return <SessionsPage onNavigate={handleNavigate} />;
      case 'quran-tracking': return <QuranTrackingPage />;
      case 'exams': return <ExamsPage />;
      case 'finance':
      case 'finance-invoices':
      case 'finance-payments':
      case 'finance-subscriptions': return <FinancePage />;
      case 'library': return <LibraryPage />;
      case 'certificates': return <CertificatesPage />;
      case 'notifications': return <NotificationsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default:
        if (user?.role === 'TEACHER') return <TeacherDashboard />;
        if (user?.role === 'STUDENT') return <StudentDashboardPage />;
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  // المتغير الذي يحدد العرض بناءً على حالة الطي
  const sidebarWidth = sidebarCollapsed ? '80px' : '256px';

  return (
    <div className="min-h-screen bg-[#F0F4F8]" dir="rtl">
      
      {/* 💡 السحر الخفي: التحكم المركزي المطلق في الهوامش للكمبيوتر والموبايل */}
      <style>
        {`
          :root {
            --dynamic-sidebar: ${sidebarWidth};
          }
          @media (max-width: 768px) {
            :root {
              --dynamic-sidebar: 0px !important;
            }
          }
          .main-content-wrapper {
            margin-right: var(--dynamic-sidebar);
            transition: margin-right 0.3s ease;
          }
        `}
      </style>

      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      
      <div className="main-content-wrapper min-h-screen flex flex-col">
        <Header title={pageInfo.title} breadcrumbs={pageInfo.breadcrumbs} onNavigate={handleNavigate} />
        
        <main className="p-4 md:p-6" style={{ paddingTop: 'calc(4rem + 16px)' }}>
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const handleLogin = () => {
    toast.success('مرحباً بك في أكاديمية إتقان! 🎉');
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="bottom-left" dir="rtl" toastOptions={{ style: { fontFamily: 'Cairo, sans-serif' } }} />
      </>
    );
  }

  return (
    <>
      <AppLayout />
      <Toaster position="bottom-left" dir="rtl" richColors toastOptions={{ style: { fontFamily: 'Cairo, sans-serif' }, duration: 4000 }} />
    </>
  );
};

export default App;