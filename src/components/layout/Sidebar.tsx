// ============================================================
// SIDEBAR COMPONENT - Etqan Academy (Premium & Responsive)
// ============================================================

import React from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CreditCard, Settings, LogOut, Bell, Library, Award, Mic2, FileText,
  ChevronRight, ChevronLeft, Users2
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
}

// 💡 تم ترتيب الصلاحيات وإلغاء القوائم الفرعية للاعتماد على التبويبات الداخلية
const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { id: 'students', label: 'الطلاب', icon: GraduationCap, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'teachers', label: 'المعلمون', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'parents', label: 'أولياء الأمور', icon: Users2, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'courses', label: 'المسارات والدورات', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'sessions', label: 'إدارة الجلسات', icon: Mic2, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { id: 'finance', label: 'المالية', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  { id: 'library', label: 'المكتبة', icon: Library, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'] },
  { id: 'certificates', label: 'الشهادات', icon: Award, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
  { id: 'reports', label: 'التقارير', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  // التحقق من الصلاحيات لظهور القوائم
  const canAccess = (roles?: Role[]): boolean => {
    if (!roles || roles.length === 0) return true;
    if (!user) return false;
    return roles.includes(user.role);
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    // إغلاق القائمة في الموبايل بعد اختيار صفحة
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const filteredItems = NAV_ITEMS.filter((item) => canAccess(item.roles));

  return (
    <>
      {/* 📱 Mobile Overlay (الخلفية الشفافة للموبايل) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0A192F]/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🖥️ Sidebar Container */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          flex flex-col
          transition-all duration-300 ease-in-out
          bg-gradient-to-b from-[#0A192F] to-[#1B4F72] text-white shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          md:translate-x-0
          ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* 🌟 Header Section (Logo & Toggle) */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-20">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* الشعار المصغر */}
            <div className="flex-shrink-0 bg-white/10 p-1.5 rounded-xl">
              <img 
                src="/etqan-logo.png" 
                alt="إتقان" 
                className="w-8 h-8 object-contain drop-shadow-md"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=E'; }}
              />
            </div>
            
            {/* النص يظهر فقط إذا لم تكن القائمة مطوية */}
            {!sidebarCollapsed && (
              <div className="animate-fadeIn whitespace-nowrap">
                <h1 className="text-white font-black text-sm tracking-wide">أكاديمية إتقان</h1>
                <p className="text-[#F39C12] text-[10px] font-bold">نظام الإدارة</p>
              </div>
            )}
          </div>

          {/* 🔘 زر الطي والفرد (Desktop Only) */}
          <button
            onClick={toggleSidebar}
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all hidden md:flex flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 🧭 Navigation Menu */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#F39C12] to-[#D68910] text-white font-bold shadow-lg shadow-orange-900/20' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                } ${sidebarCollapsed ? 'justify-center md:px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                
                {!sidebarCollapsed && (
                  <span className="flex-1 text-right whitespace-nowrap animate-fadeIn">{item.label}</span>
                )}

                {/* Badge Notification */}
                {item.badge !== undefined && (
                  <span className={`
                    flex items-center justify-center font-bold
                    ${sidebarCollapsed 
                      ? 'absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full shadow-sm' 
                      : 'bg-white/20 text-white text-xs px-2 py-0.5 rounded-full'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 👤 User Footer Section */}
        <div className="p-3 border-t border-white/10 bg-black/10">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-3 animate-fadeIn">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F39C12] to-[#D68910] flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {user.nameAr.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{user.nameAr}</p>
                <p className="text-white/50 text-[10px] truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-red-300 hover:text-red-100 hover:bg-red-500/20 group ${sidebarCollapsed ? 'justify-center md:px-0' : ''}`}
            title={sidebarCollapsed ? 'تسجيل الخروج' : undefined}
          >
            <LogOut size={18} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!sidebarCollapsed && <span className="flex-1 text-right font-semibold whitespace-nowrap animate-fadeIn">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>
    </>
  );
};