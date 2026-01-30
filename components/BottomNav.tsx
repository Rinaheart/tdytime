import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, LayoutDashboard, BarChart3, Settings, Info, Zap } from 'lucide-react';
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
        { id: TabType.SETTINGS, label: t('nav.settings'), icon: Settings },
        { id: TabType.ABOUT, label: t('nav.about'), icon: Info },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-all duration-300">
            <div className="flex justify-around items-center px-2 py-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded-xl transition-all ${isActive
                                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className={`relative ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-50 dark:ring-blue-900/20' : ''} p-1.5 rounded-full transition-all duration-300`}>
                                <Icon size={20} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] ${isActive ? 'opacity-100 translate-y-0' : 'opacity-70'} transition-all duration-300`}>
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
