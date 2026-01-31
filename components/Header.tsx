
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabType, Metadata } from '../types';
import { Moon, Sun, Menu } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  activeTab: TabType;
  metadata: Metadata;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  version: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  metadata,
  darkMode,
  onToggleDarkMode,
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

  const getAvatarChar = () => {
    if (!metadata.teacher) return 'U';
    const names = metadata.teacher.trim().split(' ');
    return names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <header className="h-11 md:h-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-3 md:px-4 flex items-center justify-between z-50 fixed top-0 left-0 right-0 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all active:scale-90"
        >
          <Menu size={18} className="md:w-5 md:h-5" />
        </button>
        <div className="flex items-center gap-1.5 md:gap-3">
          <h1 className="text-sm md:text-md font-black text-slate-800 dark:text-slate-100 truncate max-w-[110px] sm:max-w-none tracking-tight">{getTitle()}</h1>
          <span className="hidden md:inline-block text-[9px] text-slate-400 font-mono font-bold opacity-60">v{version}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="scale-[0.85] md:scale-100 origin-right transition-transform">
          <LanguageSwitcher />
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 md:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
        >
          {darkMode ? <Sun size={17} className="md:w-[18px] md:h-[18px]" /> : <Moon size={17} className="md:w-[18px] md:h-[18px]" />}
        </button>

        <div className="flex items-center gap-1.5 md:gap-3 pl-1.5 md:pl-3 border-l border-slate-200/50 dark:border-slate-800/50">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-none">{metadata.teacher}</p>
          </div>
          <div className="w-6.5 h-6.5 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] md:text-sm font-black shadow-md ring-2 ring-white dark:ring-slate-900 transition-transform active:scale-95">
            {getAvatarChar()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
