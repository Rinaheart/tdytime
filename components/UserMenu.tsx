
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Moon,
    Sun,
    Languages,
    Settings,
    Info,
    LogOut,
    ChevronRight,
    User
} from 'lucide-react';
import { TabType, Metadata } from '../types';

interface UserMenuProps {
    metadata: Metadata;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    onTabChange: (tab: TabType) => void;
    onReset: () => void;
    version: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
    metadata,
    darkMode,
    onToggleDarkMode,
    onTabChange,
    onReset,
    version
}) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const getAvatarChar = () => {
        if (!metadata.teacher) return 'U';
        const names = metadata.teacher.trim().split(' ');
        return names[names.length - 1].charAt(0).toUpperCase();
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs md:text-sm font-black shadow-md ring-2 ring-white dark:ring-slate-900 transition-all active:scale-90 hover:shadow-blue-500/20"
            >
                {getAvatarChar()}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header Info */}
                    <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800/60 mb-1 bg-slate-50/50 dark:bg-slate-800/20">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{metadata.teacher}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">HK{metadata.semester}, {metadata.academicYear}</p>
                        <div className="mt-2 text-[9px] font-mono font-bold text-slate-300 dark:text-slate-600">v{version}</div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-2 space-y-1">
                        <button
                            onClick={() => { toggleLanguage(); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                                    <Languages size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('common.switchLanguage')}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{i18n.language}</span>
                        </button>

                        <button
                            onClick={() => { onToggleDarkMode(); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {i18n.language === 'vi'
                                        ? (darkMode ? 'Nền sáng' : 'Nền tối')
                                        : (darkMode ? 'Light Mode' : 'Dark Mode')
                                    }
                                </span>
                            </div>
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1 mx-2" />

                        <button
                            onClick={() => { onTabChange(TabType.SETTINGS); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                    <Settings size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('nav.settings')}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                        </button>

                        <button
                            onClick={() => { onTabChange(TabType.ABOUT); setIsOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                                    <Info size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('nav.about')}</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-300" />
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1 mx-2" />

                        <button
                            onClick={() => { onReset(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                                <LogOut size={16} />
                            </div>
                            <span className="text-xs font-black">{t('nav.loadData')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
