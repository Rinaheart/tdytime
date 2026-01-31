import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { TabType, CourseType } from './types';
import { useSchedule } from './hooks/useSchedule';

import { parseScheduleHTML } from './services/parser';
import { APP_VERSION } from './constants';

import WeeklyView from './components/WeeklyView';
const SemesterView = lazy(() => import('./components/SemesterView'));
const StatisticsView = lazy(() => import('./components/StatisticsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const AboutView = lazy(() => import('./components/AboutView'));
const TodayView = lazy(() => import('./components/TodayView'));

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import WelcomeView from './components/WelcomeView';
import SuccessScreen from './components/SuccessScreen';
import WeeklySkeleton from './components/WeeklySkeleton';
import StatsSkeleton from './components/StatsSkeleton';
import ReloadPrompt from './components/ReloadPrompt';

const App: React.FC = () => {
  const { t } = useTranslation();
  const {
    data, metrics, currentWeekIndex, setCurrentWeekIndex,
    thresholds, setThresholds, overrides, setOverrides,
    abbreviations, setAbbreviations, error, setError,
    isProcessing, toastMessage, handleFileUpload, processLoadedData,
    jumpToCurrentWeek, historyList, loadHistoryItem, deleteHistoryItem
  } = useSchedule();

  const [activeTab, setActiveTab] = useState<TabType>(TabType.TODAY);
  const [darkMode, setDarkMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : true
  );

  const mainContentRef = useRef<HTMLDivElement>(null);

  // Update Page Title
  useEffect(() => {
    document.title = t('app.title', { version: APP_VERSION });
  }, [t]);

  // Dark Mode Sync
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    if (savedDark) document.documentElement.classList.add('dark');
  }, []);

  // Show success screen when toastMessage changes
  useEffect(() => {
    if (toastMessage) {
      setShowSuccess(true);
      setIsUploading(false); // <--- Ensure this is set to false
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Keyboard Shortcuts (Arrow Left/Right for Week Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === TabType.WEEK && data && !isUploading) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === 'ArrowRight') {
          setCurrentWeekIndex(prev => Math.min(prev + 1, data.weeks.length - 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentWeekIndex(prev => Math.max(prev - 1, 0));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, data, isUploading, setCurrentWeekIndex]);

  // Scroll to Top on Tab Change
  useEffect(() => {
    const scrollContainer = document.querySelector('main > div.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('darkMode', String(newDark));
    if (newDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleDemoLoad = async (code: string) => {
    try {
      const jsonRes = await fetch(`/demo/${code}.json`).catch(() => null);
      if (jsonRes?.ok) {
        processLoadedData(await jsonRes.json());
        return;
      }

      const htmlRes = await fetch(`/demo/${code}.html`).catch(() => null);
      if (htmlRes?.ok) {
        processLoadedData(parseScheduleHTML(await htmlRes.text()));
        return;
      }

      setError(t('error.demoNotFound', { code }));
    } catch (err) {
      setError(t('error.loadDemoError'));
    }
  };

  const handleSaveOverrides = (newOverrides: Record<CourseType, CourseType>) => {
    // Note: CourseType.LT/TH are keys
    setOverrides(newOverrides as any);
    if (data) {
      localStorage.setItem('last_schedule_data', JSON.stringify({ ...data, overrides: newOverrides }));
    }
  };

  const handleSaveAbbreviations = (newAbbr: Record<string, string>) => {
    setAbbreviations(newAbbr);
    if (data) {
      localStorage.setItem('last_schedule_data', JSON.stringify({ ...data, abbreviations: newAbbr }));
    }
  };

  if (showSuccess) return <SuccessScreen message={toastMessage} />;

  const renderContent = () => {
    if (!data || isUploading) {
      return (
        <WelcomeView
          onFileUpload={handleFileUpload}
          historyList={historyList}
          onLoadHistory={loadHistoryItem}
          onDeleteHistory={deleteHistoryItem}
          version={APP_VERSION}
          isProcessing={isProcessing}
        />
      );
    }

    if (isProcessing) {
      switch (activeTab) {
        case TabType.WEEK:
          return <WeeklySkeleton />;
        case TabType.STATS:
          return <StatsSkeleton />;
        default:
          return (
            <div className="flex items-center justify-center min-vh-[60vh]">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );
      }
    }

    const dataWithOverrides = { ...data, overrides, abbreviations };

    switch (activeTab) {
      case TabType.TODAY:
        return <TodayView
          data={dataWithOverrides}
          overrides={overrides}
          abbreviations={abbreviations}
          onSwitchTab={setActiveTab}
          setCurrentWeekIndex={setCurrentWeekIndex}
        />;
      case TabType.WEEK:
        return (
          <WeeklyView
            week={data.weeks[currentWeekIndex]}
            allWeeks={data.weeks}
            onNext={() => setCurrentWeekIndex(prev => Math.min(prev + 1, data.weeks.length - 1))}
            onPrev={() => setCurrentWeekIndex(prev => Math.max(prev - 1, 0))}
            onCurrent={() => jumpToCurrentWeek(data)}
            isFirst={currentWeekIndex === 0}
            isLast={currentWeekIndex === data.weeks.length - 1}
            totalWeeks={data.weeks.length}
            weekIdx={currentWeekIndex}
            thresholds={thresholds}
            overrides={overrides}
            abbreviations={abbreviations}
            metadata={data.metadata}
          />
        );
      case TabType.OVERVIEW:
        return (
          <Suspense fallback={<WeeklySkeleton />}>
            <SemesterView data={dataWithOverrides} />
          </Suspense>
        );
      case TabType.STATS:
        return (
          <Suspense fallback={<StatsSkeleton />}>
            <StatisticsView metrics={metrics!} data={dataWithOverrides} />
          </Suspense>
        );
      case TabType.SETTINGS:
        return (
          <Suspense fallback={<WeeklySkeleton />}>
            <SettingsView
              thresholds={thresholds}
              onSave={setThresholds}
              version={APP_VERSION}
              data={dataWithOverrides}
              overrides={overrides}
              onSaveOverrides={handleSaveOverrides as any}
              abbreviations={abbreviations}
              onSaveAbbreviations={handleSaveAbbreviations}
              onReset={() => { setIsUploading(true); setError(null); }}
            />
          </Suspense>
        );
      case TabType.ABOUT:
        return (
          <Suspense fallback={<WeeklySkeleton />}>
            <AboutView version={APP_VERSION} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-slate-950 overflow-x-hidden">
      {data && !isUploading && (
        <Header
          activeTab={activeTab}
          metadata={data.metadata}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onTabChange={setActiveTab}
          onReset={() => { setIsUploading(true); setError(null); }}
          version={APP_VERSION}
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <div className="flex h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] relative">
        {data && !isUploading && (
          <div className="hidden lg:block">
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onReset={() => { setIsUploading(true); setError(null); }}
              collapsed={sidebarCollapsed}
              toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        )}

        <main className={`flex-1 transition-all duration-300 ${data && !isUploading ? (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''}`}>
          <div className="h-full overflow-y-auto custom-scrollbar p-3 md:p-8 pt-14 md:pt-20" ref={mainContentRef}>
            {error && !data && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm max-w-lg mx-auto">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>

      <ReloadPrompt />
      {data && !isUploading && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

export default App;
