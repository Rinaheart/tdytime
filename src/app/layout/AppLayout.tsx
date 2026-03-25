/**
 * App Layout — TdyTime v2
 * Main layout wrapper with Header, Sidebar (desktop), BottomNav (mobile).
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Zap, LayoutGrid, BarChart3, Settings,
    CalendarDays, Menu, X, Upload, Globe,
} from 'lucide-react';
import { useUIStore, useScheduleStore } from '@/core/stores';
import { Toast } from '@/ui/primitives';
import { APP_VERSION } from '@/core/constants';
import ThemePicker from '@/ui/composites/ThemePicker';


// Navigation items for both Desktop Sidebar and Mobile BottomNav
const NAV_ITEMS = [
    { path: '/semester', icon: LayoutGrid, labelKey: 'nav.semester' },
    { path: '/week', icon: CalendarDays, labelKey: 'nav.weekly' },
    { path: '/today', icon: Zap, labelKey: 'nav.today' },
    { path: '/stats', icon: BarChart3, labelKey: 'nav.statistics' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

const AppLayout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const metadata = useScheduleStore((s) => s.data?.metadata);
    const lastActiveRef = useRef<number>(Date.now());

    // Smart Session Auto-Reset Logic
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const idleTime = now - lastActiveRef.current;
                const THRESHOLD = 30 * 60 * 1000; // 30 minutes

                if (idleTime > THRESHOLD && location.pathname !== '/today') {
                    navigate('/today', { replace: true });
                }
                lastActiveRef.current = now;
            } else {
                lastActiveRef.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [location.pathname, navigate]);

    const handleReset = useCallback(() => {
        navigate('/', { state: { forceUpload: true } });
    }, [navigate]);

    const toggleLanguage = useCallback(() => {
        const next = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(next);
    }, [i18n]);

    return (
        <div className="min-h-dvh transition-colors duration-200 bg-white dark:bg-slate-950 selection:bg-accent-100 dark:selection:bg-accent-900/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 h-12 md:h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between h-full px-3 md:px-6">
                    {/* Left: Menu toggle + Teacher name */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-1.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
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
                            className="p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            aria-label={t('common.switchLanguage')}
                            title={i18n.language === 'vi' ? 'English' : 'Tiếng Việt'}
                        >
                            <Globe size={18} />
                        </button>
                        <ThemePicker />
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
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
                                        ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
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

            {/* Bottom Nav (mobile only) — San bằng 5 Tabs phẳng */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center h-16">
                    {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className={`flex-1 flex flex-col items-center justify-center h-full pb-1 cursor-pointer transition-none ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400 dark:text-slate-500'}`}
                            >
                                <div className="">
                                    <Icon size={24} className={isActive ? 'opacity-100' : 'opacity-[0.65]'} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] mt-0.5 truncate w-full text-center px-1 tracking-tight ${isActive ? 'font-bold' : 'font-medium opacity-80'}`}>
                                    {t(labelKey)}
                                </span>
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
