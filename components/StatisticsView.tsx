import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Metrics, ScheduleData, CourseType } from '../types';
import {
  Calendar, MapPin, Users, Activity,
  LayoutGrid, Clock, AlertOctagon
} from 'lucide-react';
import { DAYS_OF_WEEK, PERIOD_TIMES } from '../constants';
import HeatmapCard from './HeatmapCard';
import InsightCard from './InsightCard';
import StatsHeader from './StatsHeader';
import WeeklyTrendChart from './WeeklyTrendChart';
import DailyBarChart from './DailyBarChart';
import TeachingStructureCard from './TeachingStructureCard';
import TopSubjectsCard from './TopSubjectsCard';
import CoTeachersTable from './CoTeachersTable';
import ProgressCard from './ProgressCard';
import { CourseSession } from '../types';

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
  const { t, i18n } = useTranslation();

  // Auto-refresh every 60s for realtime progress
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const now = currentTime;

  if (!metrics) return null;

  // Helpers
  const isMainTeacher = (tName: string) => {
    if (!tName || tName === "Chưa rõ" || tName === "Unknown") return true;
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ths\.|ts\.|pgs\.|gs\.|gv\./g, "").trim();
    const main = normalize(data.metadata.teacher);
    const target = normalize(tName);
    return target.includes(main) || main.includes(target);
  };

  // 1. Data Mapping
  const weeklyData = useMemo(() =>
    Object.entries(metrics.hoursByWeek).map(([w, h]) => ({ name: `T${w}`, value: h })),
    [metrics.hoursByWeek]);

  const dailyData = useMemo(() =>
    Object.entries(metrics.hoursByDay).map(([d, h], i) => ({ name: t(`days.${i}`), value: h })),
    [metrics.hoursByDay, t]);

  const subjectWeights = useMemo(() =>
    metrics.subjectDistribution.map(s => ({ name: s.name, value: s.periods })),
    [metrics.subjectDistribution]);

  // 2. Progress Logic (Migrated from TodayView + Semester)
  const progress = useMemo(() => {
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    const todayDate = new Date(now); todayDate.setHours(0, 0, 0, 0);

    const isSessionFinished = (s: CourseSession, sessionDate: Date) => {
      const d = new Date(sessionDate); d.setHours(0, 0, 0, 0);
      if (d < todayDate) return true;
      if (d > todayDate) return false;
      const endP = parseInt(s.timeSlot.split('-')[1] || s.timeSlot.split('-')[0]);
      const pData = PERIOD_TIMES[endP];
      return pData ? (pData.end[0] * 60 + pData.end[1]) < currentTotalMin : false;
    };

    let todayT = 0, todayD = 0, weekT = 0, weekD = 0, monthT = 0, monthD = 0, semT = 0, semD = 0;

    data.weeks.forEach(w => {
      const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
      const matches = w.dateRange.match(dateRegex);
      if (!matches) return;
      const [ds, ms, ys] = matches[0].split('/').map(Number);
      const weekStart = new Date(ys, ms - 1, ds);

      // Check current week
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
      const isCurrentWeek = now >= weekStart && now < weekEnd;

      DAYS_OF_WEEK.forEach((_, dIdx) => {
        const targetDate = new Date(weekStart); targetDate.setDate(weekStart.getDate() + dIdx);
        const isToday = targetDate.getTime() === todayDate.getTime();
        const dName = DAYS_OF_WEEK[dIdx];
        const sessions = [...w.days[dName].morning, ...w.days[dName].afternoon, ...w.days[dName].evening].filter(s => isMainTeacher(s.teacher));

        sessions.forEach(s => {
          const finished = isSessionFinished(s, targetDate);
          const p = s.periodCount;
          semT += p; if (finished) semD += p;
          if (isCurrentWeek) { weekT += p; if (finished) weekD += p; }
          if (isToday) { todayT += p; if (finished) todayD += p; }
          if (targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear()) {
            monthT += p; if (finished) monthD += p;
          }
        });
      });
    });

    const getP = (d: number, t: number) => ({ percent: t > 0 ? Math.round((d / t) * 100) : 0, done: d, total: t });
    return { today: getP(todayD, todayT), week: getP(weekD, weekT), month: getP(monthD, monthT), semester: getP(semD, semT) };
  }, [data, now]);

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

      {/* 2. Control Center: Progress & Insight Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Progress Card (6/12) - Visible first on mobile */}
        <div className="lg:col-span-6">
          <ProgressCard
            progress={progress}
            currentDate={now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          />
        </div>

        {/* Right: Alerts Grid (6/12) */}
        <div className="lg:col-span-6 grid grid-cols-4 gap-2 md:gap-6">
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
      </div>

      {/* 3. Main Body - Reorganized Layout */}
      <div className="space-y-6">

        {/* Row 1: Key Distributions (3 Columns Balance) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* Col 1: Heatmap */}
          <HeatmapCard heatmapData={metrics.heatmapData} />

          {/* Col 2: Structure */}
          <TeachingStructureCard metrics={metrics} pieColors={PIE_COLORS} />

          {/* Col 3: Top Subjects (Now Balanced) */}
          <TopSubjectsCard subjects={subjectWeights} abbreviations={data.abbreviations} />
        </div>

        {/* Row 2: Trend Charts (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WeeklyTrendChart data={weeklyData} color={COLORS.primary} />
          <DailyBarChart data={dailyData} color={COLORS.secondary} />
        </div>

      </div>

      {/* 4. INFRASTRUCTURE INSIGHTS (Compact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Classes Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group transition-all hover:shadow-md flex flex-col h-full">
          <h3 className="relative z-10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Users size={14} className="text-indigo-500" />
            {t('stats.topClasses')}
          </h3>
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {metrics.classDistribution.slice(0, 6).map((c, i) => (
              <div key={i} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-sm border border-slate-100/60 dark:border-slate-800/60 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{c.className}</span>
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{c.periods}</span>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-sm"
                    style={{ width: `${Math.min(100, (c.periods / metrics.totalHours) * 350)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Classrooms Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden group transition-all hover:shadow-md flex flex-col h-full">
          <h3 className="relative z-10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <MapPin size={14} className="text-sky-500" />
            {t('stats.topClassrooms')}
          </h3>
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {metrics.topRooms.slice(0, 6).map((r, i) => (
              <div key={i} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-sm border border-slate-100/60 dark:border-slate-800/60 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{r.room}</span>
                  <span className="text-[9px] font-black text-sky-600 dark:text-sky-400">{r.periods}</span>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-sm"
                    style={{ width: `${Math.min(100, (r.periods / metrics.totalHours) * 350)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Co-Teachers Table Card */}
      <CoTeachersTable coTeachers={metrics.coTeachers} abbreviations={data.abbreviations} />

    </div>
  );
};

export default StatisticsView;
