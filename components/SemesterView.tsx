import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  LayoutTemplate,
  Columns,
  Search,
  ChevronRight,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  Layers,
  Users,
  User
} from 'lucide-react';
import { ScheduleData, WeekSchedule, FilterState, DaySchedule, CourseSession, CourseType } from '../types';
import { DAYS_OF_WEEK, SESSION_COLORS } from '../constants';
import FilterBar from './FilterBar';

interface SemesterViewProps {
  data: ScheduleData;
  overrides?: Record<string, CourseType>;
  abbreviations?: Record<string, string>;
}

const getTeacherColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-700 border-red-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-lime-100 text-lime-700 border-lime-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-pink-100 text-pink-700 border-pink-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const SemesterView: React.FC<SemesterViewProps> = ({ data, overrides = {}, abbreviations = {} }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: data.metadata.teacher || '', sessionTime: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'vertical' : 'horizontal';
  });

  const currentWeekRef = useRef<HTMLDivElement>(null);

  const uniqueData = useMemo(() => {
    const rooms = new Set<string>();
    const teachers = new Set<string>();
    const classes = new Set<string>();
    data.weeks.forEach(w => {
      Object.values(w.days).forEach(d => {
        const day = d as DaySchedule;
        [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
          rooms.add(s.room);
          teachers.add(s.teacher);
          if (s.className) classes.add(s.className);
        });
      });
    });
    return { rooms: Array.from(rooms).sort(), teachers: Array.from(teachers).sort(), classes: Array.from(classes).sort() };
  }, [data]);

  const filterSession = (s: CourseSession) => {
    if (filters.search && !s.courseName.toLowerCase().includes(filters.search.toLowerCase()) && !s.courseCode.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.className && s.className !== filters.className) return false;
    if (filters.room && s.room !== filters.room) return false;
    if (filters.teacher && s.teacher !== filters.teacher) return false;
    return true;
  };

  const getDayDateString = (week: WeekSchedule, dayIndex: number) => {
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

  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});

  const toggleWeek = (wIdx: number) => {
    setExpandedWeeks(prev => ({ ...prev, [wIdx]: !prev[wIdx] }));
  };

  const isCurrentWeek = (week: WeekSchedule) => {
    const now = new Date();
    const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
    const matches = week.dateRange.match(dateRegex);
    if (!matches || matches.length < 2) return false;

    const [ds, ms, ys] = matches[0].split('/').map(Number);
    const [de, me, ye] = matches[1].split('/').map(Number);

    const start = new Date(ys, ms - 1, ds);
    const end = new Date(ye, me - 1, de);
    const check = new Date(now);
    check.setHours(0, 0, 0, 0);
    return check >= start && check <= end;
  };

  const isPastWeek = (week: WeekSchedule) => {
    const now = new Date();
    const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
    const matches = week.dateRange.match(dateRegex);
    if (!matches || matches.length < 2) return false;

    const [de, me, ye] = matches[1].split('/').map(Number);
    const end = new Date(ye, me - 1, de);
    const check = new Date(now);
    check.setHours(23, 59, 59, 999);
    return check > end;
  };

  const scrollToCurrentWeek = () => {
    if (currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' || filters.className !== '' || filters.room !== '' || (filters.teacher !== '' && filters.teacher !== data.metadata.teacher);
  }, [filters, data.metadata]);

  return (
    <div className="pb-12 px-3 md:px-0 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-none mb-1">
            {t('nav.semester')} {data.metadata.semester}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">{data.metadata.academicYear}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          <button
            onClick={scrollToCurrentWeek}
            className="flex items-center gap-2 h-11 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Zap size={16} className="fill-current" />
            <span className="hidden sm:inline">{t('common.current')}</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
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

      {viewMode === 'vertical' ? (
        <div className="relative space-y-8 before:absolute before:left-[19px] md:before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
          {data.weeks.map((week, wIdx) => {
            const hasData = Object.values(week.days).some(d => {
              const day = d as DaySchedule;
              return [...day.morning, ...day.afternoon, ...day.evening].some(filterSession);
            });

            if (!hasData && (filters.search || filters.className || filters.room || filters.teacher)) return null;

            const isCurrent = isCurrentWeek(week);
            const isPast = isPastWeek(week);
            const isExpanded = expandedWeeks[wIdx] ?? (!isPast || isCurrent);

            return (
              <div
                key={wIdx}
                ref={isCurrent ? currentWeekRef : null}
                className={`relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-950/40 rounded-2xl border ${isCurrent ? 'border-blue-400 dark:border-blue-500 ring-4 ring-blue-100/50 dark:ring-blue-900/20 shadow-lg shadow-blue-500/10' : 'border-slate-200/60 dark:border-slate-800/60 shadow-sm'} overflow-hidden transition-all duration-300`}
              >
                {/* Timeline Dot */}
                <div className={`absolute left-4 md:left-[20px] top-6 w-2 h-2 rounded-full z-20 ${isCurrent ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/40' : (isPast ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-800')}`}></div>

                {/* Enhanced Header - Collapsible */}
                <button
                  onClick={() => toggleWeek(wIdx)}
                  className={`w-full flex items-center justify-between p-3 md:p-4 text-left transition-colors ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}
                >
                  <div className="flex items-center gap-4 pl-6 md:pl-8">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-sm tracking-tighter shrink-0 ${isCurrent ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {week.weekNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-base md:text-lg font-black uppercase tracking-tight leading-none ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {t('weekly.week', { number: week.weekNumber })}
                        </h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-mono font-bold tracking-tight">{week.dateRange}</p>
                    </div>
                  </div>

                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 dark:text-slate-600">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-6 relative z-10 border-t border-slate-100 dark:border-slate-800/60 pl-8 md:pl-12">
                      {DAYS_OF_WEEK.map((dayName, dIdx) => {
                        const day = week.days[dayName];
                        const sessions = [...day.morning, ...day.afternoon, ...day.evening].filter(filterSession);

                        if (sessions.length === 0) return null; // Hide empty days on mobile grid

                        return (
                          <div key={dayName} className="min-h-[100px] flex flex-col group border-l-2 border-slate-100 dark:border-slate-800 md:border-transparent md:hover:border-slate-100 md:dark:hover:border-slate-800 pl-3 md:pl-2 transition-all">
                            <div className="mb-3 pb-1.5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center sm:flex-col sm:items-center">
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t(`days.${dIdx}`)}</span>
                              <span className="text-[10px] md:text-[11px] font-black text-slate-400 tracking-tighter">{getDayDateString(week, dIdx)}</span>
                            </div>
                            <div className="space-y-3 flex-1">
                              {sessions.map((s, sidx) => {
                                const currentType = overrides[s.courseCode] || s.type;
                                const displayName = abbreviations[s.courseName] || s.courseName;
                                const showTeacher = !filters.teacher;
                                return (
                                  <div key={sidx} className={`p-3 rounded-2xl border-l-4 ${SESSION_COLORS[s.sessionTime]} bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${s.hasConflict ? 'ring-2 ring-red-500/50' : ''}`}>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2" title={s.courseName}>{displayName}</p>

                                    <div className="flex flex-wrap gap-1.5 items-center mb-2.5">
                                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{s.className}</span>
                                      <span className={`text-[7px] md:text-[8px] font-black px-1.5 py-0.5 rounded-lg border border-transparent shadow-sm ${currentType === CourseType.LT ? 'bg-blue-100/80 text-blue-700' : 'bg-sky-100/80 text-sky-700'}`}>
                                        {currentType}
                                      </span>
                                      {showTeacher && (
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg border border-transparent shadow-sm truncate max-w-[90px] ${getTeacherColor(s.teacher)}`}>
                                          {s.teacher}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                                      <div className="flex items-center gap-1 opacity-60">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{t('common.periodShort', { defaultValue: 'T' })}</span>
                                        <span className="text-[10px] font-mono font-black text-slate-600 dark:text-slate-300">{s.timeSlot}</span>
                                      </div>
                                      <div className="highlight-room inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                                        <MapPin size={9} strokeWidth={3} />
                                        <span>{s.room}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-12">
          {data.weeks.map((week, wIdx) => {
            const hasData = Object.values(week.days).some(d => {
              const day = d as DaySchedule;
              return [...day.morning, ...day.afternoon, ...day.evening].some(filterSession);
            });

            if (!hasData && (filters.search || filters.className || filters.room || filters.teacher)) return null;

            const isCurrent = isCurrentWeek(week);

            return (
              <div key={wIdx} ref={isCurrent ? currentWeekRef : null} className={`relative group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className="flex items-center gap-3 mb-4 pl-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {week.weekNumber}
                  </div>
                  <div>
                    <h4 className={`text-sm font-black uppercase tracking-tight ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {t('weekly.week', { number: week.weekNumber })}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono font-bold">{week.dateRange}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto w-full custom-scrollbar touch-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="min-w-[1024px]">
                      <table className="w-full border-collapse border-hidden">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                            <th className="w-14 p-4 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 dark:bg-slate-800/80 sticky left-0 z-20 backdrop-blur-md"></th>
                            {DAYS_OF_WEEK.map((dayName, dIdx) => {
                              return (
                                <th key={dayName} className={`min-w-[140px] p-4 border border-slate-100 dark:border-slate-800 text-center`}>
                                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    {(t(`days.${dIdx}`))}
                                  </p>
                                  <p className="text-xs font-mono font-bold text-slate-400">
                                    {getDayDateString(week, dIdx)}
                                  </p>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { key: 'morning', label: 'S' },
                            { key: 'afternoon', label: 'C' },
                            { key: 'evening', label: 'T' }
                          ].map((shift) => (
                            <tr key={shift.key} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                              <td className="p-4 border border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/80 align-middle sticky left-0 z-20 backdrop-blur-md shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black mx-auto shadow-lg shadow-blue-500/20">{shift.label}</span>
                              </td>
                              {DAYS_OF_WEEK.map((dayName) => {
                                const sessions = week.days[dayName][shift.key as keyof DaySchedule].filter(filterSession);
                                return (
                                  <td key={`${dayName}-${shift.key}`} className={`p-3 border border-slate-100 dark:border-slate-800 align-top min-h-[160px]`}>
                                    <div className="space-y-2">
                                      {sessions.map((s, sidx) => {
                                        const currentType = overrides[s.courseCode] || s.type;
                                        const displayName = abbreviations[s.courseName] || s.courseName;
                                        return (
                                          <div key={sidx} className={`p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm`}>
                                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2">{displayName}</p>
                                            <div className="flex items-center justify-between gap-1">
                                              <span className="text-[8px] font-black text-slate-400 uppercase">{s.room}</span>
                                              <span className={`text-[7px] font-black px-1 py-0.5 rounded ${currentType === CourseType.LT ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'}`}>{currentType}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SemesterView;
