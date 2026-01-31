
import React, { useMemo, useState, useEffect } from 'react';
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
    MoreHorizontal,
    Users
} from 'lucide-react';
import { ScheduleData, CourseType, CourseSession } from '../types';
import { DAYS_OF_WEEK, PERIOD_TIMES } from '../constants';
import SessionCard from './SessionCard';

interface TodayViewProps {
    data: ScheduleData;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
}

const UpcomingSessionCard: React.FC<{
    session: CourseSession,
    small?: boolean,
    isLive?: boolean,
    overrides?: Record<string, CourseType>,
    abbreviations?: Record<string, string>
}> = ({
    session,
    small = false,
    isLive = false,
    overrides = {},
    abbreviations = {}
}) => {
        const { t } = useTranslation();
        const startP = parseInt(session.timeSlot.split('-')[0]);
        const periodData = PERIOD_TIMES[startP];
        const startTimeStr = periodData ? `${String(periodData.start[0]).padStart(2, '0')}:${String(periodData.start[1]).padStart(2, '0')}` : "07:00";
        const currentType = overrides[session.courseCode] || session.type;
        const displayName = abbreviations[session.courseName] || session.courseName;

        return (
            <div className={`relative flex gap-3 items-start ${small ? 'p-2' : 'p-3 md:p-4'} rounded-xl md:rounded-2xl ${isLive ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-400 dark:border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'} shadow-sm md:hover:shadow-md transition-all group`}>
                {isLive && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase rounded-full animate-pulse flex items-center gap-1 shadow-lg">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                    </div>
                )}
                <div className={`flex flex-col items-center justify-center border-r ${isLive ? 'border-blue-200 dark:border-blue-700' : 'border-slate-100 dark:border-slate-800'} pr-2 md:pr-3 ${small ? 'min-w-[50px]' : 'min-w-[60px] md:min-w-[70px]'}`}>
                    <span className={`${small ? 'text-xs' : 'text-base md:text-lg'} font-black ${isLive ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'} font-mono`}>{startTimeStr}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <p className={`${small ? 'text-xs' : 'text-xs md:text-sm'} font-black text-slate-800 dark:text-slate-100 truncate flex-1`}>{displayName}</p>
                        <span className={`${small ? 'px-1 text-[7px]' : 'px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px]'} font-bold rounded shrink-0 ${currentType === CourseType.LT ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'}`}>
                            {currentType}
                        </span>
                    </div>
                    <p className={`${small ? 'text-[9px]' : 'text-[10px] md:text-xs'} text-slate-500 font-bold mb-1 flex items-center gap-1`}>
                        <Users size={small ? 10 : 11} className="shrink-0" /> <span className="truncate">{session.className} ({session.group})</span>
                    </p>
                    <p className={`${small ? 'text-[9px]' : 'text-[10px] md:text-xs'} text-slate-400 flex items-center justify-between gap-2`}>
                        <span className="font-mono">{t('common.periodLabel')} {session.timeSlot}</span>
                        <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300 shrink-0">
                            <MapPin size={small ? 9 : 11} /> {session.room}
                        </span>
                    </p>
                </div>
            </div>
        );
    };

const TodayView: React.FC<TodayViewProps> = ({
    data,
    overrides,
    abbreviations,
    onSwitchTab,
    setCurrentWeekIndex
}) => {
    const { t, i18n } = useTranslation();

    // Real-time clock state
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const now = currentTime;

    // State for mobile expand/collapse
    const [expandNextSessions, setExpandNextSessions] = useState(false);
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

    const isMainTeacher = (tName: string) => {
        if (!tName || tName === "Chưa rõ" || tName === "Unknown") return true;
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ths\.|ts\.|pgs\.|gs\.|gv\./g, "").trim();
        const main = normalize(data.metadata.teacher);
        const target = normalize(tName);
        return target.includes(main) || main.includes(target);
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
            const check = new Date(now);
            check.setHours(0, 0, 0, 0);
            return check >= start && check <= end;
        });

        return {
            currentWeek: idx !== -1 ? data.weeks[idx] : null,
            currentWeekIdx: idx
        };
    }, [data, now]);

    // 2. Get Today's Sessions (Main Teacher Only)
    const todaySessions = useMemo(() => {
        if (!currentWeek) return [];
        const dayData = currentWeek.days[dayName];
        return [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
            .filter(s => isMainTeacher(s.teacher));
    }, [currentWeek, dayName]);

    // 3. Find Next Teaching Day (Main Teacher Only)
    const nextTeaching = useMemo(() => {
        let searchDate = new Date(now);
        searchDate.setDate(searchDate.getDate() + 1); // Start from tomorrow

        for (let i = 0; i < 60; i++) {
            const dJsIdx = searchDate.getDay();
            const dIdx = dJsIdx === 0 ? 6 : dJsIdx - 1;
            const dName = DAYS_OF_WEEK[dIdx];

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
                const sessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
                    .filter(s => isMainTeacher(s.teacher));
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

    // 4. Progress Calculations
    const progress = useMemo(() => {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMin = currentHour * 60 + currentMinute;

        const getSessionEndMin = (s: CourseSession) => {
            const startP = parseInt(s.timeSlot.split('-')[0]);
            const endP = parseInt(s.timeSlot.split('-')[1] || s.timeSlot.split('-')[0]);
            const periodData = PERIOD_TIMES[endP] || PERIOD_TIMES[startP];
            if (!periodData) return 7 * 60;
            return periodData.end[0] * 60 + periodData.end[1];
        };

        const isSessionFinished = (s: CourseSession, sessionDate: Date) => {
            const checkDate = new Date(sessionDate);
            checkDate.setHours(0, 0, 0, 0);
            const todayDate = new Date(now);
            todayDate.setHours(0, 0, 0, 0);
            if (checkDate < todayDate) return true;
            if (checkDate > todayDate) return false;
            return getSessionEndMin(s) < currentTotalMin;
        };

        // Day Progress
        let todayTotal = 0;
        let todayDone = 0;
        todaySessions.forEach(s => {
            todayTotal += s.periodCount;
            if (isSessionFinished(s, new Date(now))) todayDone += s.periodCount;
        });

        // Week Progress
        let weekTotal = 0;
        let weekDone = 0;
        if (currentWeek) {
            DAYS_OF_WEEK.forEach((dName, dIdx) => {
                const daySessions = [...currentWeek.days[dName].morning, ...currentWeek.days[dName].afternoon, ...currentWeek.days[dName].evening]
                    .filter(s => isMainTeacher(s.teacher));
                const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
                const matches = currentWeek.dateRange.match(dateRegex);
                if (matches) {
                    const [ds, ms, ys] = matches[0].split('/').map(Number);
                    const startDate = new Date(ys, ms - 1, ds);
                    const targetDate = new Date(startDate);
                    targetDate.setDate(startDate.getDate() + dIdx);

                    daySessions.forEach(s => {
                        weekTotal += s.periodCount;
                        if (isSessionFinished(s, targetDate)) weekDone += s.periodCount;
                    });
                }
            });
        }

        // Month Progress
        let monthTotal = 0;
        let monthDone = 0;
        data.weeks.forEach(w => {
            DAYS_OF_WEEK.forEach((dName, dIdx) => {
                const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/g;
                const matches = w.dateRange.match(dateRegex);
                if (matches) {
                    const [ds, ms, ys] = matches[0].split('/').map(Number);
                    const startDate = new Date(ys, ms - 1, ds);
                    const targetDate = new Date(startDate);
                    targetDate.setDate(startDate.getDate() + dIdx);

                    if (targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear()) {
                        const daySessions = [...w.days[dName].morning, ...w.days[dName].afternoon, ...w.days[dName].evening]
                            .filter(s => isMainTeacher(s.teacher));
                        daySessions.forEach(s => {
                            monthTotal += s.periodCount;
                            if (isSessionFinished(s, targetDate)) monthDone += s.periodCount;
                        });
                    }
                }
            });
        });

        return {
            today: { percent: todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0, done: todayDone, total: todayTotal },
            week: { percent: weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0, done: weekDone, total: weekTotal },
            month: { percent: monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0, done: monthDone, total: monthTotal }
        };
    }, [data, now, todaySessions, currentWeek]);

    // 5. Check if session is currently LIVE
    const isSessionLive = (session: CourseSession) => {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMin = currentHour * 60 + currentMinute;

        const startP = parseInt(session.timeSlot.split('-')[0]);
        const endP = parseInt(session.timeSlot.split('-')[1] || session.timeSlot.split('-')[0]);

        const startPeriod = PERIOD_TIMES[startP];
        const endPeriod = PERIOD_TIMES[endP] || startPeriod;

        if (!startPeriod || !endPeriod) return false;

        const startMin = startPeriod.start[0] * 60 + startPeriod.start[1];
        const endMin = endPeriod.end[0] * 60 + endPeriod.end[1];

        return currentTotalMin >= startMin && currentTotalMin <= endMin;
    };

    const getGreeting = () => {
        const hour = now.getHours();
        const name = data.metadata.teacher.split(' ').pop() || "";
        if (hour < 12) return t('stats.today.greeting.morning', { name });
        if (hour < 18) return t('stats.today.greeting.afternoon', { name });
        return t('stats.today.greeting.evening', { name });
    };

    const getStatusMessage = () => {
        if (todaySessions.length === 0) return t('stats.today.status.free');
        return t('stats.today.status.teaching');
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-700 px-3 md:px-0 overflow-x-hidden">

            {/* 1. HERO HEADER */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 md:p-12 text-white shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] rounded-full border-[30px] md:border-[40px] border-white/20 blur-3xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-white/20 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    {/* Time badge */}
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-white/10">{t('stats.today.currentTime')}</span>
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Greeting */}
                    <h2 className="text-2xl md:text-5xl font-black mb-1 md:mb-2 tracking-tight leading-tight">{getGreeting()}</h2>

                    {/* Status message */}
                    <p className="text-sm md:text-base font-medium text-blue-100 mb-3">
                        {todaySessions.length > 0
                            ? `${getStatusMessage()} (${todaySessions.length} ${t('common.sessions')}, ${todaySessions.reduce((acc, s) => acc + s.periodCount, 0)} ${t('common.periods')})`
                            : getStatusMessage()
                        }
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-blue-100 text-xs md:text-lg font-medium opacity-90">
                        <CalendarDays size={16} className="md:w-5 md:h-5" />
                        {i18n.language === 'vi' ? `Thứ ${dayOfWeekIdx === 6 ? 'Nhật' : dayOfWeekIdx + 2}` : DAYS_OF_WEEK[dayOfWeekIdx]}, {todayStr}
                    </div>
                </div>

                {/* Desktop Stats */}
                <div className="hidden md:flex gap-4 absolute top-12 right-12">
                    <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col items-center min-w-[100px]">
                        <span className="text-3xl font-black">{todaySessions.length}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{t('common.sessions')}</span>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col items-center min-w-[100px]">
                        <span className="text-3xl font-black">{todaySessions.reduce((acc, s) => acc + s.periodCount, 0)}</span>
                        <span className="text-[10px] font-bold uppercase opacity-80">{t('common.periods')}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:mt-6">
                    <button
                        onClick={() => onSwitchTab('WEEK')}
                        className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                        <Calendar size={12} className="md:w-[14px] md:h-[14px]" /> {t('nav.weekly')}
                    </button>
                    <button
                        onClick={() => onSwitchTab('STATS')}
                        className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider border border-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                        <TrendingUp size={12} className="md:w-[14px] md:h-[14px]" /> {t('nav.statistics')}
                    </button>
                </div>
            </div>

            {/* 2. BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                {/* A. LEFT COLUMN: TIMELINE (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" /> {t('nav.today')}
                    </h3>

                    {todaySessions.length > 0 ? (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {todaySessions.map((session, idx) => (
                                <UpcomingSessionCard
                                    key={idx}
                                    session={session}
                                    isLive={isSessionLive(session)}
                                    overrides={overrides}
                                    abbreviations={abbreviations}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-[300px] bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-colors">
                            <div className="w-24 h-24 bg-gradient-to-tr from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-slate-800 text-orange-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Coffee size={48} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{t('stats.today.status.free')}</h4>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto">{t('stats.today.freeMessage')}</p>
                        </div>
                    )}
                </div>

                {/* B. RIGHT COLUMN: WIDGETS (5/12) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Widget 1: Next Class */}
                    {nextTeaching ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <ArrowRight size={14} className="text-blue-500" /> {t('stats.today.next')}
                                </h3>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700">
                                        <span className="text-[10px] font-bold">{t(`days.${nextTeaching.dayIdx}`)}</span>
                                        <span className="text-xl font-black leading-none">{nextTeaching.date.getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                            {t('stats.today.nextDate', { day: t(`days.${nextTeaching.dayIdx}`), date: formatDate(nextTeaching.date) })}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400">{nextTeaching.sessions.length} {t('common.sessions')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {/* Mobile: show 2, Desktop: show 3 */}
                                    {nextTeaching.sessions.slice(0, expandNextSessions ? undefined : (window.innerWidth < 768 ? 2 : 3)).map((s, i) => (
                                        <UpcomingSessionCard key={i} session={s} small={true} overrides={overrides} abbreviations={abbreviations} />
                                    ))}

                                    {/* Expand/Collapse button for mobile */}
                                    {nextTeaching.sessions.length > 2 && (
                                        <button
                                            onClick={() => setExpandNextSessions(!expandNextSessions)}
                                            className="w-full py-2 text-center text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            {expandNextSessions
                                                ? `▲ ${t('common.close')}`
                                                : `+${nextTeaching.sessions.length - 2} ${t('common.sessions')} ▼`
                                            }
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setCurrentWeekIndex(nextTeaching.weekIdx); onSwitchTab('WEEK'); }}
                                    className="mt-6 w-full py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                                >
                                    {t('common.viewDetails')} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-green-900/20 dark:to-slate-800 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <Calendar size={32} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">{t('stats.today.noMore')}</h4>
                            <p className="text-xs text-slate-400 font-medium">🎉</p>
                        </div>
                    )}

                    {/* Widget 2: Detailed Progress */}
                    <div className="bg-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl shadow-indigo-500/20 space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 text-indigo-200">
                            <TrendingUp size={14} className="md:w-4 md:h-4" />
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t('stats.today.progress')}</h3>
                        </div>

                        {[
                            { label: t('stats.today.progressDay'), val: progress.today, color: 'bg-blue-400' },
                            { label: t('stats.today.progressWeek'), val: progress.week, color: 'bg-indigo-400' },
                            { label: t('stats.today.progressMonth'), val: progress.month, color: 'bg-violet-400' }
                        ].map((p, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.label}</span>
                                    <span className="text-sm font-black">{p.val.percent}% <span className="text-[10px] opacity-40">({p.val.done}/{p.val.total})</span></span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${p.color} transition-all duration-1000`} style={{ width: `${p.val.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Copyright Footer */}
            <div className="text-center text-slate-400 text-[10px] mt-12 pt-8 border-t border-slate-100 dark:border-slate-900">
                {t('about.copyright')}
            </div>
        </div>
    );
};

export default TodayView;
