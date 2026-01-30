
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Clock,
    Calendar,
    MapPin,
    Clock3,
    ChevronRight,
    Coffee,
    Zap,
    ArrowRight,
    TrendingUp,
    CalendarDays,
    MoreHorizontal
} from 'lucide-react';
import { ScheduleData, CourseType } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import SessionCard from './SessionCard';

interface TodayViewProps {
    data: ScheduleData;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
}

const TodayView: React.FC<TodayViewProps> = ({
    data,
    overrides,
    abbreviations,
    onSwitchTab,
    setCurrentWeekIndex
}) => {
    const { t, i18n } = useTranslation();

    const now = new Date();
    // Adjust to Mon-Sun (0-6)
    const currentJsDay = now.getDay();
    const dayOfWeekIdx = currentJsDay === 0 ? 6 : currentJsDay - 1;
    const dayName = DAYS_OF_WEEK[dayOfWeekIdx];

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const todayStr = formatDate(now);

    // 1. Find Current Week
    const { currentWeek, currentWeekIdx } = useMemo(() => {
        const idx = data.weeks.findIndex(w => {
            const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
            const matches = w.dateRange.match(dateRegex);
            if (!matches || matches.length < 2) return false;

            const [ds, ms, ys] = matches[0].split('/').map(Number);
            const [de, me, ye] = matches[1].split('/').map(Number);

            const start = new Date(ys, ms - 1, ds);
            const end = new Date(ye, me - 1, de);
            now.setHours(0, 0, 0, 0);
            return now >= start && now <= end;
        });

        return {
            currentWeek: idx !== -1 ? data.weeks[idx] : null,
            currentWeekIdx: idx
        };
    }, [data, now]);

    // 2. Get Today's Sessions
    const todaySessions = useMemo(() => {
        if (!currentWeek) return [];
        const dayData = currentWeek.days[dayName];
        return [...dayData.morning, ...dayData.afternoon, ...dayData.evening];
    }, [currentWeek, dayName]);

    // 3. Find Next Teaching Day
    const nextTeaching = useMemo(() => {
        let searchDate = new Date(now);
        searchDate.setDate(searchDate.getDate() + 1); // Start from tomorrow

        // Safety limit: search up to 60 days ahead
        for (let i = 0; i < 60; i++) {
            const dJsIdx = searchDate.getDay(); // 0=Sun
            const dIdx = dJsIdx === 0 ? 6 : dJsIdx - 1;
            const dName = DAYS_OF_WEEK[dIdx];

            // Find week
            const wIdx = data.weeks.findIndex(w => {
                const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
                const matches = w.dateRange.match(dateRegex);
                if (!matches || matches.length < 2) return false;
                const [ds, ms, ys] = matches[0].split('/').map(Number);
                const [de, me, ye] = matches[1].split('/').map(Number);
                const start = new Date(ys, ms - 1, ds);
                const end = new Date(ye, me - 1, de);
                const check = new Date(searchDate);
                check.setHours(0, 0, 0, 0);
                return check >= start && check <= end;
            });

            if (wIdx !== -1) {
                const week = data.weeks[wIdx];
                const dayData = week.days[dName];
                const sessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening];
                if (sessions.length > 0) {
                    return {
                        date: new Date(searchDate),
                        sessions,
                        weekIdx: wIdx,
                        dayName: dName,
                        dayIdx: dIdx
                    };
                }
            }
            searchDate.setDate(searchDate.getDate() + 1);
        }
        return null;
    }, [data, now]);

    // 4. Weekly Progress
    const weeklyProgress = useMemo(() => {
        if (!currentWeek) return { done: 0, total: 0, percent: 0 };

        let total = 0;
        let done = 0; // Past days

        DAYS_OF_WEEK.forEach((dName, idx) => {
            const dayData = currentWeek.days[dName];
            const daySessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening];
            const periods = daySessions.reduce((acc, s) => acc + s.periodCount, 0);

            total += periods;
            // Count previous days fully
            if (idx < dayOfWeekIdx) {
                done += periods;
            }
            // For today, count it as done if we want to show "Current Progress" roughly
            // or we can implement time-based check. For simplicity: count half if today? 
            // Let's just count strictly past days + active ratio in real app.
            // Here: Simply previous days count.
        });

        // Add today's completed sessions logic? (Skip for now to keep simple)

        return {
            done,
            total,
            percent: total > 0 ? Math.round(((done + (todaySessions.length > 0 ? 0 : 0)) / total) * 100) : 0
        };
    }, [currentWeek, dayOfWeekIdx, todaySessions]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = data.metadata.teacher.split(' ').pop() || "";
        if (hour < 12) return t('stats.today.greeting.morning', { name });
        if (hour < 18) return t('stats.today.greeting.afternoon', { name });
        return t('stats.today.greeting.evening', { name });
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700">

            {/* 1. HERO HEADER */}
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/20">
                {/* Abstract Background Texture */}
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full border-[40px] border-white/20 blur-3xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white/20 blur-3xl"></div>
                    <div className="absolute top-[20%] right-[20%] w-[100px] h-[100px] rounded-full border-[20px] border-white/10 decoration-clone animate-spin-slow"></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3 opacity-90">
                            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/10">Today</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-tight">{getGreeting()}</h2>
                        <div className="flex items-center gap-3 text-blue-100 text-sm md:text-lg font-medium opacity-90">
                            <CalendarDays size={20} />
                            {i18n.language === 'vi' ? `Thứ ${dayOfWeekIdx === 6 ? 'Nhật' : dayOfWeekIdx + 2}` : DAYS_OF_WEEK[dayOfWeekIdx]}, {todayStr}
                        </div>
                    </div>

                    {/* Quick Stat */}
                    <div className="hidden md:flex gap-4">
                        <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col items-center min-w-[100px]">
                            <span className="text-3xl font-black">{todaySessions.length}</span>
                            <span className="text-[10px] font-bold uppercase opacity-80">{t('common.sessions')} today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* A. LEFT COLUMN: TIMELINE (8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <Clock size={20} className="text-blue-500" /> {t('nav.today')}
                        </h3>
                        {todaySessions.length > 0 && (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {todaySessions[0].sessionTime === 'morning' ? 'Morning Start' : 'Checking In'}
                            </span>
                        )}
                    </div>

                    {todaySessions.length > 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative">
                            {/* Continuous Line */}
                            <div className="absolute left-[39px] md:left-[47px] top-10 bottom-10 w-[2px] bg-slate-100 dark:bg-slate-800 z-0"></div>

                            <div className="space-y-8 relative z-10">
                                {todaySessions.map((session, idx) => {
                                    // Determine status roughly simply for UI demo
                                    const isFirst = idx === 0;
                                    return (
                                        <div key={idx} className="flex gap-4 md:gap-6 group">
                                            {/* Timeline Node */}
                                            <div className="flex flex-col items-center gap-2 shrink-0 w-10 md:w-12 pt-1">
                                                <div className={`
                                            w-4 h-4 md:w-5 md:h-5 rounded-full border-4 flex items-center justify-center transition-all duration-300
                                            ${isFirst
                                                        ? 'bg-blue-600 border-blue-100 dark:border-blue-900 shadow-lg shadow-blue-500/30 scale-110'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-blue-400'}
                                        `}>
                                                    {isFirst && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">
                                                    {session.timeSlot.split('-')[0].padStart(2, '0')}:00
                                                </span>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 transition-transform duration-300 group-hover:translate-x-1">
                                                <SessionCard
                                                    session={session}
                                                    isVertical={true}
                                                    isCurrent={false}
                                                    overrides={overrides}
                                                    abbreviations={abbreviations}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px] bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-colors">
                            <div className="w-24 h-24 bg-gradient-to-tr from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-slate-800 text-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Coffee size={48} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t('stats.today.status.free')}</h4>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">{t('stats.today.freeMessage')}</p>
                        </div>
                    )}
                </div>

                {/* B. RIGHT COLUMN: WIDGETS (4/12) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Widget 1: Next Class (Ticket Style) */}
                    {nextTeaching && (
                        <div className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 w-full"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CalendarDays size={14} className="text-blue-500" /> {t('stats.today.next')}
                                    </h3>
                                    <button className="text-slate-300 hover:text-blue-600 transition-colors"><MoreHorizontal size={18} /></button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                                        <span className="text-[10px] font-bold uppercase">{t(`days.${nextTeaching.dayIdx}`)}</span>
                                        <span className="text-2xl font-black">{nextTeaching.date.getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-0.5">
                                            {t('month', { defaultValue: 'Tháng' })} {nextTeaching.date.getMonth() + 1}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400">{nextTeaching.sessions.length} {t('common.sessions')}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {nextTeaching.sessions.slice(0, 3).map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className={`w-1 h-8 rounded-full ${s.sessionTime === 'morning' ? 'bg-blue-500' : s.sessionTime === 'afternoon' ? 'bg-orange-500' : 'bg-purple-600'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{abbreviations[s.courseName] || s.courseName}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {t('common.room', { defaultValue: 'Phòng' })} {s.room} • {s.periodCount}t
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => {
                                            setCurrentWeekIndex(nextTeaching.weekIdx);
                                            onSwitchTab('WEEK');
                                        }}
                                        className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group border border-slate-100 dark:border-slate-700"
                                    >
                                        {t('common.viewDetails', { defaultValue: 'Xem chi tiết tuần này' })} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Widget 2: Weekly Progress (Radial or Bar) */}
                    {currentWeek && (
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6"></div>

                            <h3 className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                                <TrendingUp size={14} /> {t('stats.today.progress')}
                            </h3>

                            <div className="flex items-end justify-between mb-2 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black tracking-tighter">{weeklyProgress.percent}%</span>
                                    <span className="text-xs text-indigo-200 font-medium">Completed</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{weeklyProgress.done}/{weeklyProgress.total}</p>
                                    <p className="text-[10px] text-indigo-300 uppercase">Periods</p>
                                </div>
                            </div>

                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden relative z-10">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                                    style={{ width: `${weeklyProgress.percent}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TodayView;
