
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, LayoutDashboard, BarChart3, Zap } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();
    const navItems = [
        { id: TabType.TODAY, label: t('nav.today'), icon: Zap },
        { id: TabType.WEEK, label: t('nav.weekly'), icon: Calendar },
        { id: TabType.OVERVIEW, label: t('nav.semester'), icon: LayoutDashboard },
        { id: TabType.STATS, label: t('nav.statistics'), icon: BarChart3 },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 pb-safe z-50 transition-all duration-300 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center px-2 py-1.5">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`group flex flex-col items-center justify-center min-w-[64px] py-1 rounded-2xl transition-all active:scale-95`}
                        >
                            <div className={`relative p-2.5 rounded-full transition-all duration-300 ${isActive
                                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100 dark:ring-blue-900/30'
                                : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                                }`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold mt-1 tracking-tight transition-all duration-300 ${isActive
                                ? 'text-blue-600 dark:text-blue-400 opacity-100 scale-100'
                                : 'text-slate-400 dark:text-slate-500 opacity-70 scale-95'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
