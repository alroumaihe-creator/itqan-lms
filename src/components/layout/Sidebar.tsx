// ============================================================
// SIDEBAR COMPONENT - RTL Navigation
// ============================================================

import React from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, BookMarked, CreditCard, FileText, Library,
  Award, Bell, BarChart3, Settings, LogOut, ChevronRight,
  ChevronLeft, Users2, Mic2, Scroll
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import type { Role } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  roles?: Role[];
  children?: Omit<NavItem, 'children'>[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
  },
  {
    id: 'students',
    label: 'الطلاب',
    icon: GraduationCap,
    badge: 10,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'TEACHER'],
  },
  {
    id: 'teachers',
    label: 'المعلمون',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR'],
  },
  {
    id: 'parents',
    label: 'أولياء الأمور',
    icon: Users2,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: 'courses',
    label: 'الدورات',
    icon: BookOpen,
  },
  {
    id: 'sessions',
    label: 'الجلسات',
    icon: Mic2,
    badge: 3,
  },
  {
    id: 'schedule',
    label: 'الجدول',
    icon: Calendar,
  },
  {
    id: 'attendance',
    label: 'الحضور',
    icon: ClipboardList,
  },
  {
    id: 'quran-tracking',
    label: 'تتبع القرآن',
    icon: BookMarked,
  },
  {
    id: 'exams',
    label: 'الاختبارات',
    icon: Scroll,
  },
  {
    id: 'finance',
    label: 'المالية',
    icon: CreditCard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'],
    children: [
      { id: 'finance-invoices', label: 'الفواتير', icon: FileText },
      { id: 'finance-payments', label: 'المدفوعات', icon: CreditCard },
      { id: 'finance-subscriptions', label: 'الاشتراكات', icon: Scroll },
    ],
  },
  {
    id: 'library',
    label: 'المكتبة',
    icon: Library,
  },
  {
    id: 'certificates',
    label: 'الشهادات',
    icon: Award,
  },
  {
    id: 'notifications',
    label: 'الإشعارات',
    icon: Bell,
    badge: 3,
  },
  {
    id: 'reports',
    label: 'التقارير',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['finance']);

  const isCollapsed = sidebarCollapsed;

  const canAccess = (roles?: Role[]): boolean => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const filteredItems = NAV_ITEMS.filter((item) => canAccess(item.roles));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          flex flex-col
          transition-all duration-300 ease-in-out
          sidebar
          ${sidebarOpen ? 'open' : ''}
          ${isCollapsed ? 'collapsed' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="w-9 h-9 rounded-xl bg-[#F39C12] flex items-center justify-center text-white font-bold text-base">
                ن
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">أكاديمية النور</h1>
                <p className="text-white/60 text-xs">نظام الإدارة</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-9 h-9 rounded-xl bg-[#F39C12] flex items-center justify-center text-white font-bold mx-auto">
              ن
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all flex-shrink-0 hidden md:flex"
          >
            {isCollapsed ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll p-3 space-y-0.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.id);
            const isChildActive = item.children?.some(
              (child) => currentPage === child.id
            );

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      if (!isCollapsed) toggleExpanded(item.id);
                    } else {
                      handleNavigate(item.id);
                    }
                  }}
                  className={`nav-item w-full ${isActive || isChildActive ? 'active' : ''}`}
                >
                  <Icon size={20} className="nav-icon flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-right">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                      {hasChildren && (
                        <ChevronLeft
                          size={14}
                          className={`transition-transform ${isExpanded ? '-rotate-90' : ''}`}
                        />
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-0 left-0 w-4 h-4 bg-[#F39C12] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && !isCollapsed && (
                  <div className="mt-1 mr-4 space-y-0.5 border-r border-white/10 pr-3">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildCurrent = currentPage === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNavigate(child.id)}
                          className={`nav-item w-full text-sm py-2 ${isChildCurrent ? 'active' : ''}`}
                        >
                          <ChildIcon size={16} className="nav-icon" />
                          <span className="flex-1 text-right">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F39C12] to-[#E67E22] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user.nameAr.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.nameAr}</p>
                <p className="text-white/50 text-[11px] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
          >
            <LogOut size={18} className="nav-icon" />
            {!isCollapsed && <span className="flex-1 text-right">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
