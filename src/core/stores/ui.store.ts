/**
 * UI Store — TdyTime v2
 * Theme (dark mode, accent color) and layout state.
 */

import { create } from 'zustand';

export type AccentTheme = 'blueTheme' | 'pinkTheme' | 'greenTheme';


interface UIState {
    darkMode: boolean;
    accentTheme: AccentTheme;
    sidebarCollapsed: boolean;
    toggleDarkMode: () => void;
    setAccentTheme: (theme: AccentTheme) => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    resetAll: () => void;
}

/** Apply accent theme attribute to <html> */
function applyAccentTheme(theme: AccentTheme) {
    document.documentElement.setAttribute('data-accent', theme);
}

export const useUIStore = create<UIState>((set) => ({
    darkMode: (() => {
        try {
            const saved = localStorage.getItem('color-theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
            return false;
        }
    })(),

    accentTheme: (() => {
        try {
            const saved = localStorage.getItem('accent-theme') as AccentTheme;
            // Handle migration from old 'blue'/'pink' names
            if (saved === 'blue' as any) return 'blueTheme';
            if (saved === 'pink' as any) return 'pinkTheme';
            return saved || 'blueTheme';
        } catch {
            return 'blueTheme';
        }
    })(),

    sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 1024 : true,

    toggleDarkMode: () =>
        set((state) => {
            const newDark = !state.darkMode;
            const theme = newDark ? 'dark' : 'light';
            localStorage.setItem('color-theme', theme);
            if (newDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            return { darkMode: newDark };
        }),

    setAccentTheme: (theme: AccentTheme) => {
        localStorage.setItem('accent-theme', theme);
        applyAccentTheme(theme);
        set({ accentTheme: theme });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    resetAll: () => {
        localStorage.removeItem('color-theme');
        localStorage.removeItem('accent-theme');
        // Fallback to system preference on reset
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        applyAccentTheme('blueTheme');

        set({
            darkMode: systemDark,
            accentTheme: 'blueTheme',
            sidebarCollapsed: typeof window !== 'undefined' ? window.innerWidth < 1024 : true
        });
    },
}));

// Apply initial classes on load
if (typeof window !== 'undefined') {
    try {
        const savedDark = localStorage.getItem('color-theme');
        if (savedDark === 'dark' || (!savedDark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
        
        let accent = localStorage.getItem('accent-theme') as AccentTheme;
        // Migration
        if (accent === 'blue' as any) accent = 'blueTheme';
        if (accent === 'pink' as any) accent = 'pinkTheme';
        
        if (accent) {
            applyAccentTheme(accent);
        } else {
            applyAccentTheme('blueTheme');
        }
    } catch {
        // Ignore
    }
}
