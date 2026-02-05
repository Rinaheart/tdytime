import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarPlus, LayoutTemplate, Columns, Zap, Search } from 'lucide-react';
import { WeekSchedule, Thresholds, CourseSession, DaySchedule, FilterState, CourseType, Metadata } from '../types';
import { DAYS_OF_WEEK, SESSION_COLORS, SESSION_ACCENT_COLORS, PERIOD_TIMES } from '../constants';
import { isCurrentWeek, getDayDateString as getDateString } from '../utils/scheduleUtils';

import FilterBar from './FilterBar';
import SessionCard from './SessionCard';
import ExportModal from './ExportModal';

interface WeeklyViewProps {
  week: WeekSchedule;
  onNext: () => void;
  onPrev: () => void;
  onCurrent: () => void;
  isFirst: boolean;
  isLast: boolean;
  totalWeeks: number;
  weekIdx: number;
  thresholds: Thresholds;
  allWeeks: WeekSchedule[];
  overrides: Record<string, CourseType>;
  abbreviations: Record<string, string>;
  metadata?: Metadata;
}

// Keep for rendering check (isCurrent)
const SLOT_TIMES_LOOKUP: Record<number, string> = {
  1: "070000", 2: "075500", 3: "085000", 4: "094500",
  5: "104000",
  6: "133000", 7: "142500", 8: "152000", 9: "161500",
  11: "171000", 12: "180000", 13: "185000"
};

const isSessionCurrent = (session: CourseSession, sessionDateStr: string, now: Date): boolean => {
  const [d, m, y] = sessionDateStr.split('/').map(Number);
  const sessionDate = new Date(y, m - 1, d);

  if (now.getDate() !== sessionDate.getDate() ||
    now.getMonth() !== sessionDate.getMonth() ||
    now.getFullYear() !== sessionDate.getFullYear()) {
    return false;
  }

  const [startP, endP] = session.timeSlot.split('-').map(Number);
  const startStr = SLOT_TIMES_LOOKUP[startP];

  const durationMin = session.type === CourseType.LT ? 45 : 60;

  if (!startStr) return false;

  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentTotalM = currentH * 60 + currentM;

  const startH = parseInt(startStr.substring(0, 2));
  const startM = parseInt(startStr.substring(2, 4));
  const startTotalM = startH * 60 + startM;

  const lastStartStr = SLOT_TIMES_LOOKUP[endP] || startStr;
  const lastStartH = parseInt(lastStartStr.substring(0, 2));
  const lastStartM = parseInt(lastStartStr.substring(2, 4));
  const endTotalM = (lastStartH * 60 + lastStartM) + durationMin;

  return currentTotalM >= startTotalM && currentTotalM <= endTotalM;
};


const WeeklyView: React.FC<WeeklyViewProps> = ({
  week,
  onNext,
  onPrev,
  onCurrent,
  isFirst,
  isLast,
  totalWeeks,
  weekIdx,
  thresholds,
  allWeeks,
  overrides,
  abbreviations,
  metadata
}) => {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    className: '',
    room: '',
    teacher: metadata?.teacher || '',
    sessionTime: ''
  });

  // Default to vertical on mobile, horizontal on desktop (SSR-safe)
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('vertical');
  }, []);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || filters.className !== '' || filters.room !== '' || (filters.teacher !== '' && filters.teacher !== metadata?.teacher);
  }, [filters, metadata]);

  // Memoized current time for session checks (refreshes on component mount)
  const now = useMemo(() => new Date(), []);

  // Memoize isCurrentWeek check to avoid recalculating on every render
  const isCurrentWeekDisplayed = useMemo(() => isCurrentWeek(week.dateRange, now), [week.dateRange, now]);

  // Wrapper for getDayDateString to use week.dateRange
  const getDayDateString = (dayIndex: number) => getDateString(week.dateRange, dayIndex);

  const formatDateRange = (range: string) => {
    const dates = range.match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dates && dates.length >= 2) return `${dates[0]} → ${dates[1]}`;
    return range;
  };

  const isDayToday = (dayIdx: number) => {
    const dayDate = getDayDateString(dayIdx);
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    return dayDate === todayStr;
  };

  const uniqueData = useMemo(() => {
    const rooms = new Set<string>();
    const teachers = new Set<string>();
    const classes = new Set<string>();
    allWeeks.forEach(w => {
      Object.values(w.days).forEach(d => {
        const day = d as DaySchedule;
        [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
          rooms.add(s.room);
          teachers.add(s.teacher);
          if (s.className) classes.add(s.className);
        });
      });
    });
    return {
      rooms: Array.from(rooms).sort(),
      teachers: Array.from(teachers).sort(),
      classes: Array.from(classes).sort()
    };
  }, [allWeeks]);

  // Handle Opening Export Modal
  const openExportModal = () => setIsExportModalOpen(true);

  const semesterProgress = useMemo(() => {
    let total = 0;
    let done = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const parseDate = (dr: string, pos: 'start' | 'end') => {
      const matches = dr.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
      if (!matches || matches.length < 2) return null;
      const [d, m, y] = (pos === 'start' ? matches[0] : matches[1]).split('/').map(Number);
      return new Date(y, m - 1, d);
    };

    allWeeks.forEach((w, wIdx) => {
      const start = parseDate(w.dateRange, 'start');
      if (!start) return;

      Object.entries(w.days).forEach(([dName, dData], dIdx) => {
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + dIdx);
        const day = dData as DaySchedule;
        const daySessions = [...day.morning, ...day.afternoon, ...day.evening];
        const periods = daySessions.reduce((acc, s) => acc + s.periodCount, 0);
        total += periods;
        if (targetDate < now) done += periods;
      });
    });

    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [allWeeks]);

  const filterSession = (s: CourseSession) => {
    if (filters.search && !s.courseName.toLowerCase().includes(filters.search.toLowerCase()) && !s.courseCode.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.className && s.className !== filters.className) return false;
    if (filters.room && s.room !== filters.room) return false;
    if (filters.teacher && s.teacher !== filters.teacher) return false;

    return true;
  };

  const renderSessionCell = (sessions: CourseSession[], dayIdx: number, isVertical: boolean = false) => {
    const filtered = sessions.filter(filterSession);
    const dateStr = getDayDateString(dayIdx);

    if (filtered.length === 0) return isVertical ? <div className="text-[10px] text-slate-300 dark:text-slate-700 italic">{t('weekly.noClasses')}</div> : null;
    return (
      <div className={`flex flex-col gap-1.5 h-full ${isVertical ? 'w-full' : ''}`}>
        {filtered.map((session, sidx) => {
          const isCurrent = isSessionCurrent(session, dateStr, now);
          return (
            <SessionCard
              key={`${session.courseCode}-${session.timeSlot}-${sidx}`}
              session={session}
              variant="weekly"
              overrides={overrides}
              abbreviations={abbreviations}
              showTeacher={!filters.teacher}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-12 max-w-full animate-in fade-in duration-500 relative">

      {/* EXPORT MODAL */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        week={week}
        weekIdx={weekIdx}
        overrides={overrides}
        abbreviations={abbreviations}
        getDayDateString={getDayDateString}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">{t('weekly.week', { number: weekIdx + 1 })}</h3>
            {isCurrentWeekDisplayed && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
                {t('weekly.currentWeek')}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">{formatDateRange(week.dateRange)}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={onCurrent}
            className={`flex items-center gap-2 h-11 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${isCurrentWeekDisplayed
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/20'}`}
          >
            <Zap size={16} className="fill-current" />
            <span className="hidden sm:inline">{t('common.current')}</span>
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            title={viewMode === 'vertical' ? 'Chuyển sang lịch ngang' : 'Chuyển sang lịch dọc'}
          >
            {viewMode === 'vertical' ? <LayoutTemplate size={16} className="text-blue-500" /> : <Columns size={16} className="text-blue-500" />}
            <span className="hidden sm:inline">{viewMode === 'vertical' ? 'Lịch ngang' : 'Lịch dọc'}</span>
          </button>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 h-11 px-4 border rounded-xl text-xs font-bold transition-all shadow-sm relative ${isFilterOpen ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
          >
            <Search size={16} className={isFilterOpen ? 'text-white' : 'text-indigo-500'} />
            <span className="hidden sm:inline">Lọc</span>
            {hasActiveFilters && !isFilterOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </button>

          <button
            onClick={openExportModal}
            className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <CalendarPlus size={16} className="text-blue-500" />
            <span className="hidden sm:inline">{t('weekly.exportICS.copy') === 'Copy Content' ? 'Export' : t('upload.features.export')}</span>
          </button>

          <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-11">
            <button onClick={onPrev} disabled={isFirst} aria-label={t('common.prevWeek', { defaultValue: 'Previous Week' })} className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 border-r border-slate-200 dark:border-slate-800 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={onNext} disabled={isLast} aria-label={t('common.nextWeek', { defaultValue: 'Next Week' })} className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            uniqueRooms={uniqueData.rooms}
            uniqueTeachers={uniqueData.teachers}
            uniqueClasses={uniqueData.classes}
          />
        </div>
      )}

      {viewMode === 'horizontal' ? (
        <div className="relative group">
          {/* Scroll Hint Icon for Mobile */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none md:hidden animate-pulse">
            <div className="bg-blue-600/20 text-blue-600 p-2 rounded-full backdrop-blur-sm">
              <ChevronRight size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto w-full custom-scrollbar touch-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="min-w-[1024px]">
                <table className="w-full border-collapse border-hidden">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="w-14 p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 dark:bg-slate-800/80 sticky left-0 z-20 backdrop-blur-md"></th>
                      {DAYS_OF_WEEK.map((day, idx) => {
                        const isToday = isDayToday(idx);
                        return (
                          <th key={day} className={`min-w-[140px] p-3 border border-slate-100 dark:border-slate-800 text-center transition-all ${isToday ? 'bg-blue-600 dark:bg-blue-600 z-10 relative ring-2 ring-blue-400 dark:ring-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : ''}`}>
                            <div className="flex flex-col items-center gap-0.5">
                              {isToday && (
                                <span className="text-[8px] font-black text-white/80 uppercase tracking-widest mb-0.5">{t('weekly.today')}</span>
                              )}
                              <p className={`text-[11px] font-black uppercase tracking-widest ${isToday ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {(t(`days.${idx}`))}
                              </p>
                              <p className={`text-xs font-mono font-bold ${isToday ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                {getDayDateString(idx)}
                              </p>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { key: 'morning', label: 'S', fullLabel: t('weekly.morning') },
                      { key: 'afternoon', label: 'C', fullLabel: t('weekly.afternoon') },
                      { key: 'evening', label: 'T', fullLabel: t('weekly.evening') }
                    ].map((shift) => (
                      <tr key={shift.key} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4 border border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/80 align-middle sticky left-0 z-20 backdrop-blur-md shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          <div className="flex flex-col items-center justify-center">
                            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20">{shift.label}</span>
                          </div>
                        </td>
                        {DAYS_OF_WEEK.map((day, dayIdx) => {
                          const isToday = isDayToday(dayIdx);
                          return (
                            <td key={`${day}-${shift.key}`} className={`p-2 border border-slate-100 dark:border-slate-800 align-top min-h-[160px] transition-colors ${isToday ? 'bg-blue-50/40 dark:bg-blue-900/10 border-x-blue-200/50 dark:border-x-blue-800/50' : ''}`}>
                              <div className="h-full">
                                {week.days[day] && renderSessionCell(week.days[day][shift.key as keyof DaySchedule], dayIdx)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day, idx) => {
            const dayData = week.days[day];
            if (!dayData) return null; // Skip days with no data in vertical view
            const sessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening];
            if (sessions.length === 0) return null;
            const hasAny = sessions.some(filterSession);
            const isToday = isDayToday(idx);

            if (!hasAny && (filters.search || filters.className || filters.room || filters.teacher)) return null;

            return (
              <div key={day} className={`bg-white dark:bg-slate-900 rounded-2xl border ${isToday ? 'border-blue-400 dark:border-blue-500 ring-4 ring-blue-100/50 dark:ring-blue-900/20' : 'border-slate-200/60 dark:border-slate-800/60'} shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md relative group`}>
                <div className={`md:w-32 ${isToday ? 'bg-blue-600 dark:bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800/30'} p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 transition-colors`}>
                  {isToday && (
                    <span className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-80">{t('weekly.today')}</span>
                  )}
                  <p className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>{t(`days.${idx}`)}</p>
                  <p className={`text-sm font-black mt-1 font-mono ${isToday ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{getDayDateString(idx)}</p>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                  <div className={`p-3 ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : ''}`}>
                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center justify-between">{t('weekly.morning')} <span className="font-mono opacity-60">07:00</span></div>
                    {renderSessionCell(dayData.morning, idx, true)}
                  </div>
                  <div className={`p-3 ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : ''}`}>
                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center justify-between">{t('weekly.afternoon')} <span className="font-mono opacity-60">13:30</span></div>
                    {renderSessionCell(dayData.afternoon, idx, true)}
                  </div>
                  <div className={`p-3 ${isToday ? 'bg-blue-50/10 dark:bg-blue-900/5' : ''}`}>
                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mb-2 flex items-center justify-between">{t('weekly.evening')} <span className="font-mono opacity-60">17:10</span></div>
                    {renderSessionCell(dayData.evening, idx, true)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )
      }
    </div >
  );
};

export default WeeklyView;
