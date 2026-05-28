// ============================================================
// HEADER COMPONENT
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, Globe, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Avatar } from '../shared/Avatar';
import { mockNotifications } from '../../data/mockData';
import { formatRelativeTime } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/formatters';

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; page?: string }[];
  onNavigate?: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumbs, onNavigate }) => {
  const { user } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [notifs, setNotifs] = useState(mockNotifications);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const notifsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUser(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => {
    setNotifs((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
  };

  const markRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100"
      style={{
        height: 'var(--header-height)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center h-full px-4 gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden btn btn-ghost btn-icon"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb / Title */}
        <div className="flex-1">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx < breadcrumbs.length - 1 ? (
                    <>
                      <button
                        onClick={() => crumb.page && onNavigate?.(crumb.page)}
                        className="text-gray-400 hover:text-[#1B4F72] transition-colors"
                      >
                        {crumb.label}
                      </button>
                      <span className="text-gray-300">/</span>
                    </>
                  ) : (
                    <span className="text-[#2C3E50] font-semibold">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : (
            <h1 className="text-lg font-bold text-[#2C3E50]">{title}</h1>
          )}
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 w-64">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="بحث سريع..."
            className="bg-transparent border-none outline-none text-sm text-gray-600 w-full placeholder-gray-400 font-medium"
            dir="rtl"
          />
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          className="btn btn-ghost btn-sm gap-1 text-gray-500 hidden md:flex"
        >
          <Globe size={15} />
          <span className="text-xs font-bold">{lang === 'ar' ? 'EN' : 'عر'}</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifsRef}>
          <button
            onClick={() => {
              setShowNotifs((v) => !v);
              setShowUser(false);
            }}
            className="btn btn-ghost btn-icon relative"
          >
            <Bell size={20} className="text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">الإشعارات</h3>
                <div className="flex gap-2">
                  <span className="badge badge-lead">{unreadCount} جديد</span>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#1B4F72] hover:underline font-medium"
                  >
                    قراءة الكل
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notif.isRead ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Bell size={16} className={!notif.isRead ? 'text-blue-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">{notif.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notif.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                    </div>
                    {notif.isRead && <Check size={14} className="text-green-400 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowNotifs(false);
                    onNavigate?.('notifications');
                  }}
                  className="w-full text-center text-sm text-[#1B4F72] font-semibold hover:underline"
                >
                  عرض جميع الإشعارات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setShowUser((v) => !v);
              setShowNotifs(false);
            }}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-all"
          >
            <Avatar name={user?.nameAr || 'مستخدم'} size="sm" />
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.nameAr}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role || '']}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>

          {showUser && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{user?.nameAr}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setShowUser(false); onNavigate?.('settings'); }}
                  className="w-full text-right px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  الإعدادات
                </button>
                <button
                  onClick={() => { setShowUser(false); }}
                  className="w-full text-right px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  الملف الشخصي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
