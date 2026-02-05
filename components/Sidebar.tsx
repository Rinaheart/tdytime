
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Info
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onReset: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onReset, collapsed, toggleCollapse }) => {
  const { t } = useTranslation();

  const menuItems = [
    { id: TabType.TODAY, label: t('nav.today'), icon: Zap },
    { id: TabType.WEEK, label: t('nav.weekly'), icon: Calendar },
    { id: TabType.OVERVIEW, label: t('nav.semester'), icon: LayoutDashboard },
    { id: TabType.STATS, label: t('nav.statistics'), icon: BarChart3 },
    { id: TabType.SETTINGS, label: t('nav.settings'), icon: SettingsIcon },
    { id: TabType.ABOUT, label: t('nav.about'), icon: Info },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={toggleCollapse}
        />
      )}

      <aside
        className={`
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          flex flex-col transition-all duration-300 z-40 fixed top-14 bottom-0 left-0
          ${collapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-16'
            : 'translate-x-0 w-64 shadow-2xl lg:shadow-none'
          }
        `}
      >
        <nav className="flex-1 px-2 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  // On mobile (window width < 1024), close sidebar after click
                  if (window.innerWidth < 1024) toggleCollapse();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  } ${collapsed ? 'lg:justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`${collapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onReset}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'lg:justify-center' : ''}`}
            title={collapsed ? t('nav.loadData') : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`${collapsed ? 'lg:hidden' : ''}`}>{t('nav.loadData')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
