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
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 font-sans">

      {/* 1. Header KPI Card */}
      <StatsHeader metadata={data.metadata} metrics={metrics} />

      {/* 2. Insight Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard
          icon={Activity} title={t('stats.intensity')}
          value={`${intensityStatus} (${Math.round(metrics.totalHours / metrics.totalWeeks)} ${t('common.periods')}/${t('common.weeks')})`}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-6 overflow-hidden">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <LayoutGrid size={16} className="text-blue-600" /> {t('stats.heatmapTitle')}
            </h3>
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="min-w-[700px]">
                <HeatmapChart data={metrics.heatmapData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeeklyTrendChart data={weeklyData} color={COLORS.primary} />
            <DailyBarChart data={dailyData} color={COLORS.secondary} />
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <TeachingStructureCard metrics={metrics} pieColors={PIE_COLORS} />
          <TopSubjectsCard subjects={subjectWeights} />
        </div>
      </div>


      {/* 4. Infrastructure Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users size={16} className="text-blue-500" /> {t('stats.topClasses')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {metrics.classDistribution.slice(0, 8).map((c, i) => (
              <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {c.className} <span className="text-blue-500">({c.periods})</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-sky-500" /> {t('stats.topClassrooms')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {metrics.topRooms.slice(0, 8).map((r, i) => (
              <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {r.room} <span className="text-sky-500">({r.periods})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Co-Teachers Table */}
      <CoTeachersTable coTeachers={metrics.coTeachers} />

      <div className="text-center text-slate-400 text-[10px] mt-8 pt-4 border-t border-slate-100 dark:border-slate-900">
        © 2026 TdyPhan | Google AI Studio
      </div>
    </div>
  );
};

export default StatisticsView;

