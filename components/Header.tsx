
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
    <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-50 fixed top-0 left-0 right-0 transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-md font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">{getTitle()}</h1>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">v{version}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">{metadata.teacher}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {getAvatarChar()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
