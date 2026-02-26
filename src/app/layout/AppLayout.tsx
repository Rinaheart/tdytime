/**
 * App Layout — TdyTime v2
 * Main layout wrapper with Header, Sidebar (desktop), BottomNav (mobile).
 */

import React, { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Zap, LayoutGrid, BarChart3, Settings,
    CalendarDays, Menu, X, Moon, Sun, Upload,
} from 'lucide-react';
import { useUIStore, useScheduleStore } from '@/core/stores';
import { Toast } from '@/ui/primitives';
import { APP_VERSION } from '@/core/constants';


// Navigation items
const NAV_ITEMS = [
    { path: '/today', icon: Zap, labelKey: 'nav.today' },
    { path: '/week', icon: CalendarDays, labelKey: 'nav.weekly' },
    { path: '/semester', icon: LayoutGrid, labelKey: 'nav.semester' },
    { path: '/stats', icon: BarChart3, labelKey: 'nav.statistics' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

const BOTTOM_NAV_ITEMS = NAV_ITEMS;

const AppLayout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar } = useUIStore();
    const metadata = useScheduleStore((s) => s.data?.metadata);

    const handleReset = useCallback(() => {
        navigate('/', { state: { forceUpload: true } });
    }, [navigate]);

    const toggleLanguage = useCallback(() => {
        const next = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(next);
    }, [i18n]);

    return (
        <div className="min-h-dvh transition-colors duration-200 bg-white dark:bg-slate-950 selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 h-12 md:h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between h-full px-3 md:px-6">
                    {/* Left: Menu toggle + Teacher name */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
                        </button>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-none">
                            {metadata?.teacher || 'TdyTime'}
                        </div>
                        {metadata && (
                            <span className="hidden md:inline text-xs text-slate-400 dark:text-slate-500">
                                HK{metadata.semester} • {metadata.academicYear}
                            </span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleLanguage}
                            className="w-10 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            aria-label={t('common.switchLanguage')}
                        >
                            <span className="text-[11px] font-black uppercase tracking-tight">{i18n.language}</span>
                        </button>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                            aria-label={t('nav.appearance')}
                        >
                            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                            aria-label={t('nav.loadData')}
                        >
                            <Upload size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <div className="flex h-[calc(100dvh-48px)] md:h-[calc(100dvh-56px)] pt-12 md:pt-14 relative">
                {/* Sidebar (desktop only) */}
                <aside
                    className={`hidden lg:flex flex-col fixed top-12 md:top-14 bottom-0 left-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
                        }`}
                >
                    <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
                        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
                            const isActive = location.pathname === path;
                            return (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {!sidebarCollapsed && <span>{t(labelKey)}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Version */}
                    {!sidebarCollapsed && (
                        <div className="p-4 text-xs text-slate-400 dark:text-slate-600">
                            v{APP_VERSION}
                        </div>
                    )}
                </aside>

                {/* Content */}
                <main
                    className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
                        }`}
                >
                    <div className="h-full overflow-y-auto custom-scrollbar p-3 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Bottom Nav (mobile only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {BOTTOM_NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 ${isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-medium">{t(labelKey)}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Global Toast Notification */}
            <Toast />
        </div>
    );
};

export default AppLayout;
