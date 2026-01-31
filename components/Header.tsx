
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabType, Metadata } from '../types';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';

interface HeaderProps {
  activeTab: TabType;
  metadata: Metadata;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onTabChange: (tab: TabType) => void;
  onReset: () => void;
  version: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  metadata,
  darkMode,
  onToggleDarkMode,
  onTabChange,
  onReset,
  version,
  collapsed,
  onToggleSidebar
}) => {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (activeTab) {
      case TabType.TODAY: return t('nav.today');
      case TabType.WEEK: return t('nav.weekly');
      case TabType.STATS: return t('nav.statistics');
      case TabType.OVERVIEW: return t('nav.semester');
      case TabType.SETTINGS: return t('nav.settings');
      case TabType.ABOUT: return t('nav.about');
      default: return "Dashboard";
    }
  };

  return (
    <header className="h-12 md:h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 md:px-6 flex items-center justify-between z-50 fixed top-0 left-0 right-0 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Desktop only sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all active:scale-90"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-row items-center gap-2 md:gap-3">
          <h1 className="text-sm md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">{getTitle()}</h1>
          <span className="inline-block text-[10px] text-slate-400 font-mono font-bold opacity-60">v{version}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <UserMenu
          metadata={metadata}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onTabChange={onTabChange}
          onReset={onReset}
          version={version}
        />
      </div>
    </header>
  );
};

export default Header;
