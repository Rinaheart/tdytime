import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleData, DaySchedule, AggregatedCourse } from '../types';
import { ChevronUp, ChevronDown, BookOpen, Layers, Calendar } from 'lucide-react';

interface OverviewViewProps {
  data: ScheduleData;
}

type SortField = 'code' | 'name' | 'sessions' | 'periods' | 'groups' | 'classes';
type SortOrder = 'asc' | 'desc';

const OverviewView: React.FC<OverviewViewProps> = ({ data }) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const coursesBySubject = useMemo(() => {
    const map = new Map<string, { code: string, name: string, sessions: number, periods: number, groups: number, classes: string[] }>();
    data.allCourses.forEach(c => {
      const lastDot = c.code.lastIndexOf('.');
      const subjectCode = lastDot !== -1 ? c.code.substring(0, lastDot) : c.code;

      if (!map.has(subjectCode)) {
        map.set(subjectCode, { code: subjectCode, name: c.name, sessions: 0, periods: 0, groups: 0, classes: [] });
      }
      const existing = map.get(subjectCode)!;
      existing.sessions += c.totalSessions;
      existing.periods += c.totalPeriods;
      existing.groups += 1;
      c.classes.forEach(cls => {
        if (!existing.classes.includes(cls)) existing.classes.push(cls);
      });
    });
    return Array.from(map.values());
  }, [data.allCourses]);

  const sortedSummary = useMemo(() => {
    return [...coursesBySubject].sort((a, b) => {
      let valA: any = a[sortField === 'sessions' ? 'sessions' : sortField === 'periods' ? 'periods' : sortField as keyof typeof a];
      let valB: any = b[sortField === 'sessions' ? 'sessions' : sortField === 'periods' ? 'periods' : sortField as keyof typeof b];

      if (Array.isArray(valA)) valA = valA.length;
      if (Array.isArray(valB)) valB = valB.length;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [coursesBySubject, sortField, sortOrder]);

  const sortedDetailed = useMemo(() => {
    return [...data.allCourses].sort((a, b) => {
      let valA: any = a[sortField === 'sessions' ? 'totalSessions' : sortField === 'periods' ? 'totalPeriods' : sortField as keyof AggregatedCourse];
      let valB: any = b[sortField === 'sessions' ? 'totalSessions' : sortField === 'periods' ? 'totalPeriods' : sortField as keyof AggregatedCourse];

      if (Array.isArray(valA)) valA = valA.length;
      if (Array.isArray(valB)) valB = valB.length;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [data.allCourses, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-3 h-3 opacity-20"><ChevronUp size={12} /></div>;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
  };

  const getHeaderLabel = (col: string) => {
    switch (col) {
      case 'code': return t('semester.table.code');
      case 'name': return t('semester.table.course');
      case 'groups': return t('semester.table.groups');
      case 'classes': return t('semester.table.classes');
      case 'sessions': return t('semester.table.sessions');
      case 'periods': return t('semester.table.periods');
      default: return col;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 px-4 sm:px-0">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{t('semester.summaryBySubject')}</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800">
            {sortedSummary.map((s) => (
              <div key={s.code} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{s.code}</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">{s.name}</h5>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{s.sessions} <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.sessions')}</span></span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{s.periods} <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.periods')}</span></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[9px] font-black px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase">
                    {s.groups} {t('semester.table.groups')}
                  </span>
                  {s.classes.map(cls => (
                    <span key={cls} className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20 backdrop-blur-sm">
                <tr>
                  {['code', 'name', 'groups', 'classes', 'sessions', 'periods'].map((col) => (
                    <th
                      key={col}
                      onClick={() => col !== 'classes' && toggleSort(col as SortField)}
                      className={`px-8 py-5 ${col !== 'classes' ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {getHeaderLabel(col)}
                        </span>
                        {col !== 'classes' && <SortIcon field={col as SortField} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sortedSummary.map((s) => (
                  <tr key={s.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-8 py-6"><span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300">{s.code}</span></td>
                    <td className="px-8 py-6"><span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">{s.name}</span></td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-600 dark:text-slate-400">{s.groups}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {s.classes.map(cls => (
                          <span key={cls} className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-black text-blue-600 dark:text-blue-400">{s.sessions}</td>
                    <td className="px-8 py-6 text-center text-sm font-black text-slate-800 dark:text-slate-100">{s.periods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{t('semester.detailByGroup')}</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800">
            {sortedDetailed.map((course) => (
              <div key={course.code} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{course.code}</span>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase">{course.name}</h5>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{course.totalSessions} <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.sessions')}</span></span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{course.totalPeriods} <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.periods')}</span></span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('semester.table.groups')}:</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{course.groups.join(', ')}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('semester.table.classes')}:</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{course.classes.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20 backdrop-blur-sm">
                <tr>
                  {['code', 'name', 'groups', 'classes', 'sessions', 'periods'].map((col) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col as SortField)}
                      className="px-8 py-5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {getHeaderLabel(col)}
                        </span>
                        <SortIcon field={col as SortField} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sortedDetailed.map((course) => (
                  <tr key={course.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-bold font-mono text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {course.code}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">{course.name}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{course.groups.join(', ')}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{course.classes.join(', ')}</span>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-blue-600 dark:text-blue-400">{course.totalSessions}</td>
                    <td className="px-8 py-6 text-center text-sm font-black text-slate-800 dark:text-slate-100">{course.totalPeriods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{t('semester.weeklySummary')}</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {data.weeks.map((week, idx) => {
            const weekStats = (Object.values(week.days) as DaySchedule[]).reduce((acc, day) => {
              const dayTotal = [...day.morning, ...day.afternoon, ...day.evening].reduce((a, s) => a + s.periodCount, 0);
              let sessions = 0;
              if (day.morning.length > 0) sessions++;
              if (day.afternoon.length > 0) sessions++;
              if (day.evening.length > 0) sessions++;
              return { hours: acc.hours + dayTotal, sessions: acc.sessions + sessions };
            }, { hours: 0, sessions: 0 });

            return (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 md:p-8 hover:shadow-2xl transition-all group border-b-4 border-b-blue-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">{t('weekly.week', { number: idx + 1 })}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold font-mono">{week.dateRange}</p>
                  </div>
                </div>
                <div className="flex gap-4 md:gap-8">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">{t('common.periods')}</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 text-center">{weekStats.hours}</p>
                  </div>
                  <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">{t('common.sessions')}</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400 text-center">{weekStats.sessions}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>
    </div>
  );
};


export default OverviewView;
