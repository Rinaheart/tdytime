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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-all duration-200">
            <div className="flex justify-around items-center px-1 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center justify-center min-w-[48px] p-1.5 rounded-xl transition-all active:scale-95 ${isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'
                                }`}
                        >
                            <div className={`relative ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''} p-1.5 rounded-lg transition-all duration-200`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {isActive && (
                                <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


export default BottomNav;
