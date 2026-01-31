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
                            className={`flex flex-col items-center justify-center min-w-[50px] p-2 rounded-2xl transition-all ${isActive
                                ? 'text-blue-600 dark:text-blue-400 scale-110'
                                : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <div className={`relative ${isActive ? 'bg-blue-100 dark:bg-blue-900/30' : ''} p-2 rounded-xl transition-all duration-300`}>
                                <Icon size={24} className={isActive ? 'fill-current' : ''} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


export default BottomNav;
