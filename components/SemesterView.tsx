import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleData, WeekSchedule, FilterState, DaySchedule, CourseSession } from '../types';
import { DAYS_OF_WEEK, SESSION_COLORS } from '../constants';
import FilterBar from './FilterBar';

interface SemesterViewProps {
  data: ScheduleData;
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

const SemesterView: React.FC<SemesterViewProps> = ({ data }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({ search: '', className: '', room: '', teacher: '', sessionTime: '' });

  const uniqueData = React.useMemo(() => {
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
  return (
    <div className="pb-12 px-3 md:px-0">
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          uniqueRooms={uniqueData.rooms}
          uniqueTeachers={uniqueData.teachers}
          uniqueClasses={uniqueData.classes}
        />
      </div>

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
            <div key={wIdx} className={`relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-950/40 rounded-2xl border ${isCurrent ? 'border-blue-400 dark:border-blue-500 ring-4 ring-blue-100/50 dark:ring-blue-900/20 shadow-lg shadow-blue-500/10' : 'border-slate-200/60 dark:border-slate-800/60 shadow-sm'} overflow-hidden transition-all duration-300`}>
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
                              const showTeacher = !filters.teacher;
                              return (
                                <div key={sidx} className={`p-3 rounded-2xl border-l-4 ${SESSION_COLORS[s.sessionTime]} bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${s.hasConflict ? 'ring-2 ring-red-500/50' : ''}`}>
                                  <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-2 line-clamp-2" title={s.courseName}>{s.courseName}</p>

                                  <div className="flex flex-wrap gap-1.5 items-center mb-2.5">
                                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.className}</span>
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
                                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg uppercase tracking-tight">{s.room}</span>
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

      <div className="text-center text-slate-400 text-[10px] mt-12 pt-8 border-t border-slate-100 dark:border-slate-900">
        {t('about.copyright')}
      </div>
    </div>
  );
};

export default SemesterView;
