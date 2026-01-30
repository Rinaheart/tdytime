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

  return (
    <div className="pb-12">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        uniqueRooms={uniqueData.rooms}
        uniqueTeachers={uniqueData.teachers}
        uniqueClasses={uniqueData.classes}
      />

      <div className="space-y-12">
        {data.weeks.map((week, wIdx) => {
          const hasData = Object.values(week.days).some(d => {
            const day = d as DaySchedule;
            return [...day.morning, ...day.afternoon, ...day.evening].some(filterSession);
          });

          if (!hasData && (filters.search || filters.className || filters.room || filters.teacher)) return null;

          return (
            <div key={wIdx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900/40 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-md relative overflow-hidden">
              {/* Enhanced Header */}
              <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg md:text-xl shadow-md shadow-blue-500/20 shrink-0">
                  {week.weekNumber}
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">{t('weekly.week', { number: week.weekNumber })}</h4>
                  <p className="text-[10px] md:text-xs text-slate-500 font-mono font-bold">{week.dateRange}</p>
                </div>
              </div>

              <div className="p-3 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-6 relative z-10">
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
                            <div key={sidx} className={`p-2 rounded-xl border-l-4 ${SESSION_COLORS[s.sessionTime]} dark:bg-opacity-10 shadow-sm transition-all ${s.hasConflict ? 'conflict-border' : ''}`}>
                              <p className="text-[10px] font-bold leading-tight mb-1" title={s.courseName}>{s.courseName}</p>
                              <div className="flex flex-wrap gap-1 items-center mb-1">
                                <span className="text-[9px] font-black text-slate-700 dark:text-slate-300 opacity-80 uppercase leading-none">{s.className}</span>
                                {showTeacher && (
                                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded border truncate max-w-[80px] ${getTeacherColor(s.teacher)}`}>
                                    {s.teacher}
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-between items-center mt-1 pt-1 border-t border-black/5 dark:border-white/5">
                                <span className="text-[8px] font-mono opacity-60 font-bold">{t('common.periodShort', { defaultValue: 'T' })}{s.timeSlot}</span>
                                <span className="text-[8px] font-black bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md uppercase tracking-tight">{s.room}</span>
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

          );
        })}
      </div>
      <div className="text-center text-slate-400 text-[10px] mt-12 pt-4 border-t border-slate-100 dark:border-slate-900">
        {t('about.copyright')}
      </div>
    </div>
  );
};


export default SemesterView;
