// ============================================================
// AUTH STORE - Authentication & Role Management
// ============================================================

import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: async (email, password) => {
    // محاكاة تأخير الاتصال بالسيرفر
    await new Promise(resolve => setTimeout(resolve, 800));

    let role = 'STUDENT';
    let name = 'طالب تجريبي';

    // 💡 التحقق الذكي من الصلاحيات بناءً على الإيميل
    if (email.includes('admin')) {
      role = 'SUPER_ADMIN';
      name = 'مدير النظام';
    } else if (email.includes('teacher')) {
      role = 'TEACHER';
      name = 'معلم تجريبي';
    } else if (email.includes('parent')) {
      role = 'PARENT';
      name = 'ولي أمر';
    }

    set({
      isAuthenticated: true,
      user: {
        id: '1',
        nameAr: name,
        email: email,
        role: role,
      },
    });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}));