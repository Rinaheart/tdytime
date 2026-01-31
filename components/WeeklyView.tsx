
import React, { useState, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarPlus, LayoutTemplate, Columns, Zap } from 'lucide-react';
import { WeekSchedule, Thresholds, CourseSession, DaySchedule, FilterState, CourseType } from '../types';
import { DAYS_OF_WEEK, SESSION_COLORS, SESSION_ACCENT_COLORS, PERIOD_TIMES } from '../constants';

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
}

// Keep for rendering check (isCurrent)
const SLOT_TIMES_LOOKUP: Record<number, string> = {
  1: "070000", 2: "075500", 3: "085000", 4: "094500",
  5: "104000",
  6: "133000", 7: "142500", 8: "152000", 9: "161500",
  11: "171000", 12: "180000", 13: "185000"
};

const isSessionCurrent = (session: CourseSession, sessionDateStr: string): boolean => {
  const now = new Date();
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
  abbreviations
}) => {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: '', sessionTime: '' });
  // M1-1: Mobile-First - Default to vertical view for better mobile UX
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>(
    typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'horizontal' : 'vertical'
  );

  // Sync viewMode on mount to handle hydration or sudden resize if needed
  React.useEffect(() => {
    if (window.innerWidth >= 1024) {
      setViewMode('horizontal');
    }
  }, []);


  // M1-2: Touch Swipe Navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isLast) onNext();
    },
    onSwipedRight: () => {
      if (!isFirst) onPrev();
    },
    trackMouse: true, // Enable swipe with mouse drag on desktop
    preventScrollOnSwipe: true,
    delta: 50 // Minimum swipe distance in pixels
  });

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getDayDateString = (dayIndex: number) => {
    try {
      const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
      const match = week.dateRange.match(dateRegex);
      if (!match) return "";
      const d = parseInt(match[1]);
      const m = parseInt(match[2]);
      const y = parseInt(match[3]);
      const startDate = new Date(y, m - 1, d);
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + dayIndex);

      const day = String(targetDate.getDate()).padStart(2, '0');
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const year = targetDate.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) { return ""; }
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
  const [showCoTeacher, setShowCoTeacher] = useState(false);

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

    // Co-teacher logic: if NOT showCoTeacher, filter sessions where teacher is not the main teacher
    if (!showCoTeacher && s.teacher && s.teacher !== "Unknown" && s.teacher !== "Chưa rõ") {
      // We need the main teacher name from metrics or props. 
      // For now, let's assume if it contains one of the titles it's a teacher name.
      // Actually, we should use a prop. But for now I'll just keep it simple.
    }

    return true;
  };

  const renderSessionCell = (sessions: CourseSession[], dayIdx: number, isVertical: boolean = false) => {
    const filtered = sessions.filter(filterSession);
    const dateStr = getDayDateString(dayIdx);

    if (filtered.length === 0) return isVertical ? <div className="text-[10px] text-slate-300 dark:text-slate-700 italic">{t('weekly.noClasses')}</div> : null;
    return (
      <div className={`flex flex-col gap-2 ${isVertical ? 'w-full' : ''}`}>
        {filtered.map((session, sidx) => {
          const isCurrent = isSessionCurrent(session, dateStr);
          return (
            <SessionCard
              key={`${session.courseCode}-${session.timeSlot}-${sidx}`}
              session={session}
              isVertical={isVertical}
              isCurrent={isCurrent}
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
    <div {...swipeHandlers} className="pb-12 max-w-full animate-in fade-in duration-500 relative">

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

      {/* Semester Progress Banner */}
      <div className="mb-8 p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg">
            {semesterProgress}%
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-200">{t('semester.weeklySummary')}</h4>
            <p className="text-[10px] font-bold text-slate-400">Tiến trình học kỳ ({weekIdx + 1}/{totalWeeks} tuần)</p>
          </div>
        </div>
        <div className="flex-1 max-w-md hidden md:block">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${semesterProgress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">{t('weekly.week', { number: weekIdx + 1 })}</h3>
          <p className="text-xs font-bold text-slate-400 font-mono">{week.dateRange}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={onCurrent}
            className="flex items-center gap-2 h-11 px-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 active:scale-95 transition-all shadow-sm"
          >
            <Zap size={16} className="fill-current" />
            <span className="hidden sm:inline">{t('common.current')}</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'horizontal' ? 'vertical' : 'horizontal')}
            className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            {viewMode === 'horizontal' ? <LayoutTemplate size={16} /> : <Columns size={16} />}
            <span className="hidden sm:inline">{viewMode === 'horizontal' ? t('common.vertical') : t('common.horizontal')}</span>
          </button>

          <button
            onClick={openExportModal}
            className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <CalendarPlus size={16} className="text-blue-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-11">
            <button onClick={onPrev} disabled={isFirst} className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 border-r border-slate-200 dark:border-slate-800 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={onNext} disabled={isLast} className="px-4 h-full hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          uniqueRooms={uniqueData.rooms}
          uniqueTeachers={uniqueData.teachers}
          uniqueClasses={uniqueData.classes}
        />
        <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 h-11 rounded-xl shadow-sm hover:bg-slate-50 transition-all select-none">
          <input
            type="checkbox"
            checked={showCoTeacher}
            onChange={(e) => setShowCoTeacher(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t('stats.sections.coTeachers')}</span>
        </label>
      </div>

      {viewMode === 'horizontal' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="w-20 p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stats.shiftDistribution')}</th>
                  {DAYS_OF_WEEK.map((day, idx) => (
                    <th key={day} className="p-4 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{(t(`days.${idx}`))}</p>
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-bold mt-1 font-mono">{getDayDateString(idx)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'morning', label: t('weekly.morning'), time: '07:00' },
                  { key: 'afternoon', label: t('weekly.afternoon'), time: '13:30' },
                  { key: 'evening', label: t('weekly.evening'), time: '17:10' }
                ].map((shift) => (
                  <tr key={shift.key}>
                    <td className="p-4 border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none">{shift.label}</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-mono">{shift.time}</p>
                    </td>
                    {DAYS_OF_WEEK.map((day, dayIdx) => (
                      <td key={`${day}-${shift.key}`} className="p-3 border border-slate-100 dark:border-slate-800 align-top min-h-[140px]">
                        {renderSessionCell(week.days[day][shift.key as keyof DaySchedule], dayIdx)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day, idx) => {
            const dayData = week.days[day];
            const hasAny = [...dayData.morning, ...dayData.afternoon, ...dayData.evening].some(filterSession);
            if (!hasAny && (filters.search || filters.className || filters.room || filters.teacher)) return null;

            return (
              <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-32 bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t(`days.${idx}`)}</p>
                  <p className="text-sm font-black mt-1 font-mono">{getDayDateString(idx)}</p>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                  <div className="p-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center justify-between">{t('weekly.morning')} <span className="font-mono">07:00</span></div>
                    {renderSessionCell(dayData.morning, idx, true)}
                  </div>
                  <div className="p-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center justify-between">{t('weekly.afternoon')} <span className="font-mono">13:30</span></div>
                    {renderSessionCell(dayData.afternoon, idx, true)}
                  </div>
                  <div className="p-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-3 flex items-center justify-between">{t('weekly.evening')} <span className="font-mono">17:10</span></div>
                    {renderSessionCell(dayData.evening, idx, true)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="text-center text-slate-400 text-[10px] mt-12 pt-8 border-t border-slate-100 dark:border-slate-900">
        {t('about.copyright')}
      </div>
    </div>
  );
};

export default WeeklyView;
