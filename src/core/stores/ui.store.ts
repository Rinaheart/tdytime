/**
 * UI Store — TdyTime v2
 * Theme (dark mode) and layout state.
 */

import { create } from 'zustand';

interface UIState {
    darkMode: boolean;
    sidebarCollapsed: boolean;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    resetAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    darkMode: (() => {
        try {
            return localStorage.getItem('darkMode') === 'true';
        } catch {
            return false;
        }
    })(),

    sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 1024 : true,

    toggleDarkMode: () =>
        set((state) => {
            const newDark = !state.darkMode;
            localStorage.setItem('darkMode', String(newDark));
            if (newDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            return { darkMode: newDark };
        }),

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    resetAll: () => {
        localStorage.removeItem('darkMode');
        document.documentElement.classList.remove('dark');
        set({
            darkMode: false,
            sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 1024 : true
        });
    },
}));

// Apply initial dark mode class
if (typeof window !== 'undefined') {
    try {
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    } catch {
        // Ignore
    }
}
