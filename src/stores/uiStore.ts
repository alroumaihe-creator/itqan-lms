// ============================================================
// UI STORE - Global UI State
// ============================================================

import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile
  currentPage: string;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  currentPage: 'dashboard',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setCurrentPage: (page) => set({ currentPage: page }),
}));
