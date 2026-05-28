// ============================================================
// AUTH STORE - Zustand State Management
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  nameAr: string;
  nameEn?: string;
  profileImageUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Authentication store with persistence
 * Handles user session, token management, and auth state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'academy-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Test accounts for demo
export const TEST_ACCOUNTS = [
  {
    email: 'admin@academy.com',
    password: 'Admin@123',
    role: 'SUPER_ADMIN' as Role,
    nameAr: 'أحمد المدير العام',
    id: 'user-admin-1',
  },
  {
    email: 'teacher@academy.com',
    password: 'Teacher@123',
    role: 'TEACHER' as Role,
    nameAr: 'الشيخ أحمد محمد العلي',
    id: 'user-teacher-1',
  },
  {
    email: 'parent@academy.com',
    password: 'Parent@123',
    role: 'PARENT' as Role,
    nameAr: 'محمد علي السعيد',
    id: 'user-parent-1',
  },
  {
    email: 'accountant@academy.com',
    password: 'Account@123',
    role: 'ACCOUNTANT' as Role,
    nameAr: 'سارة المحاسبة',
    id: 'user-accountant-1',
  },
];
