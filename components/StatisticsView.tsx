import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Metrics, ScheduleData, CourseType } from '../types';
import {
  Calendar, MapPin, Users, Activity,
  LayoutGrid, Clock, AlertOctagon
} from 'lucide-react';
import HeatmapChart from './HeatmapChart';
import InsightCard from './InsightCard';
import StatsHeader from './StatsHeader';
import WeeklyTrendChart from './WeeklyTrendChart';
import DailyBarChart from './DailyBarChart';
import TeachingStructureCard from './TeachingStructureCard';
import TopSubjectsCard from './TopSubjectsCard';
import CoTeachersTable from './CoTeachersTable';

interface StatisticsViewProps {
  metrics: Metrics;
  data: ScheduleData;
}

const COLORS = {
  primary: '#2563eb',   // blue-600
  secondary: '#0ea5e9', // sky-500
  tertiary: '#6366f1',  // indigo-500
  accent: '#f59e0b',    // amber-500
  danger: '#e11d48',    // rose-600
  success: '#10b981',   // emerald-500
  slate: '#64748b'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

const StatisticsView: React.FC<StatisticsViewProps> = ({ metrics, data }) => {
  const { t } = useTranslation();

  if (!metrics) return null;

  // Data Mapping
  const weeklyData = useMemo(() =>
    Object.entries(metrics.hoursByWeek).map(([w, h]) => ({ name: `T${w}`, value: h })),
    [metrics.hoursByWeek]);

  const dailyData = useMemo(() =>
    Object.entries(metrics.hoursByDay).map(([d, h], i) => ({ name: t(`days.${i}`), value: h })),
    [metrics.hoursByDay, t]);

  const subjectWeights = useMemo(() =>
    metrics.subjectDistribution.map(s => ({ name: s.name, value: s.periods })),
    [metrics.subjectDistribution]);

  // Insight Logic
  const overloadWeeksBoundary = 25;
  const overloadWeeks = metrics.warnings.filter(w => w.includes('ngưỡng cảnh báo') || w.includes('threshold')).length;

  const intensityStatus = overloadWeeks > 0
    ? t('stats.levels.high')
    : (metrics.totalHours / metrics.totalWeeks > 12 ? t('stats.levels.medium') : t('stats.levels.low'));

  const eveningSessions = metrics.shiftStats.evening.sessions;
  const weekendWarning = metrics.warnings.find(w => w.includes('buổi dạy cuối tuần') || w.includes('weekend sessions'));
  const weekendSessions = weekendWarning ? weekendWarning.split(' ')[0] + ' ' + t('common.sessions') : t('common.none');

  // Status Borders
  const getStatusBorder = (condition: boolean) => condition ? 'border-orange-500' : 'border-blue-200 dark:border-blue-900';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700 font-sans">

      {/* 1. Header KPI Card */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-md"></div>
        <StatsHeader metadata={data.metadata} metrics={metrics} />
      </div>

      {/* 2. Insight Alert Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <InsightCard
          icon={Activity} title={t('stats.intensity')}
          value={intensityStatus}
          statusColor={getStatusBorder(overloadWeeks > 0)}
        />
        <InsightCard
          icon={Clock} title={t('stats.eveningTeaching')}
          value={eveningSessions > 0 ? `${eveningSessions} ${t('common.sessions')}` : t('common.none')}
          statusColor={getStatusBorder(eveningSessions > 0)}
        />
        <InsightCard
          icon={Calendar} title={t('stats.weekendTeaching')}
          value={weekendSessions}
          statusColor={getStatusBorder(weekendSessions !== t('common.none'))}
        />
        <InsightCard
          icon={AlertOctagon} title={t('stats.overloadWeeks', { threshold: overloadWeeksBoundary })}
          value={overloadWeeks > 0 ? `${overloadWeeks} ${t('common.weeks')}` : t('common.none')}
          statusColor={getStatusBorder(overloadWeeks > 0)}
        />
      </div>


      {/* 3. Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Aspect: Heatmap & Trends (8/12) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Heatmap Card */}
          <div className="bg-white dark:bg-slate-950/20 rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-5 md:p-8 relative overflow-hidden group transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-blue-500/10 transition-colors"></div>

            <h3 className="relative z-10 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <LayoutGrid size={16} />
              </div>
              {t('stats.heatmapTitle')}
            </h3>

            <div className="relative z-10 overflow-x-auto custom-scrollbar-thin pb-4">
              <div className="min-w-[800px] px-2">
                <HeatmapChart data={metrics.heatmapData} />
              </div>
            </div>
          </div>

          {/* Combined Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-950/20 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 overflow-hidden transition-all hover:shadow-md">
              <WeeklyTrendChart data={weeklyData} color={COLORS.primary} />
            </div>
            <div className="bg-white dark:bg-slate-950/20 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 overflow-hidden transition-all hover:shadow-md">
              <DailyBarChart data={dailyData} color={COLORS.secondary} />
            </div>
          </div>
        </div>

        {/* Right Aspect: Distribution & Subjects (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <TeachingStructureCard metrics={metrics} pieColors={PIE_COLORS} />
          <TopSubjectsCard subjects={subjectWeights} />
        </div>
      </div>


      {/* 4. INFRASTRUCTURE INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Classes Card */}
        <div className="bg-white dark:bg-slate-950/20 p-6 md:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl -mr-24 -mt-24 rounded-full group-hover:bg-blue-500/10 transition-colors"></div>

          <h3 className="relative z-10 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <Users size={16} />
            </div>
            {t('stats.topClasses')}
          </h3>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.classDistribution.slice(0, 6).map((c, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all group/item">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{c.className}</span>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{c.periods}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 group-hover/item:scale-x-105 origin-left"
                    style={{ width: `${Math.min(100, (c.periods / metrics.totalHours) * 350)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Classrooms Card */}
        <div className="bg-white dark:bg-slate-950/20 p-6 md:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 blur-3xl -mr-24 -mt-24 rounded-full group-hover:bg-sky-500/10 transition-colors"></div>

          <h3 className="relative z-10 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
              <MapPin size={16} />
            </div>
            {t('stats.topClassrooms')}
          </h3>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.topRooms.slice(0, 6).map((r, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all group/item">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">{r.room}</span>
                  <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">{r.periods}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 group-hover/item:scale-x-105 origin-left"
                    style={{ width: `${Math.min(100, (r.periods / metrics.totalHours) * 350)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Co-Teachers Table Card */}
      <div className="bg-white dark:bg-slate-950/20 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <CoTeachersTable coTeachers={metrics.coTeachers} />
      </div>

      <div className="text-center text-slate-400 text-[10px] mt-12 pt-8 border-t border-slate-100 dark:border-slate-900">
        {t('about.copyright')}
      </div>
    </div>
  );
};

export default StatisticsView;

