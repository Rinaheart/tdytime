
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Clock,
    Calendar,
    MapPin,
    Clock3,
    ChevronRight,
    Coffee,
    Sparkles,
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
            <div className={`relative flex gap-3 items-start ${small ? 'p-2' : 'p-3 md:p-4'} rounded-xl md:rounded-2xl ${isLive ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-400 dark:border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50'} shadow-sm md:hover:shadow-md transition-all group`}>
                {isLive && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[8px] md:text-[9px] font-black uppercase rounded-full animate-pulse flex items-center gap-1 shadow-lg z-20">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                    </div>
                )}
                <div className={`flex flex-col items-center justify-center border-r ${isLive ? 'border-blue-200 dark:border-blue-700' : 'border-slate-100 dark:border-slate-800'} pr-2 md:pr-3 ${small ? 'min-w-[48px]' : 'min-w-[55px] md:min-w-[70px]'}`}>
                    <span className={`${small ? 'text-[11px]' : 'text-base md:text-lg'} font-black ${isLive ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'} font-mono leading-none`}>{startTimeStr}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1.5">
                        <p className={`${small ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm'} font-black text-slate-800 dark:text-slate-100 truncate flex-1 tracking-tight`}>{displayName}</p>
                        <span className={`${small ? 'px-1 text-[7px]' : 'px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px]'} font-black rounded-md shrink-0 shadow-sm ${currentType === CourseType.LT ? 'bg-blue-100/80 text-blue-700' : 'bg-sky-100/80 text-sky-700'}`}>
                            {currentType}
                        </span>
                    </div>
                    <p className={`${small ? 'text-[9px]' : 'text-[10px] md:text-xs'} text-slate-500 dark:text-slate-400 font-bold mb-1.5 flex items-center gap-1.5`}>
                        <Users size={small ? 9 : 11} className="shrink-0 opacity-60" /> <span className="truncate">{session.className} <span className="opacity-50 font-medium">({session.group})</span></span>
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[8px] md:text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter shrink-0">{t('common.periodLabel')} {session.timeSlot}</span>
                        <span className="flex items-center gap-1 font-black text-slate-600 dark:text-slate-300 shrink-0 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded text-[9px] border border-black/5 dark:border-white/5">
                            <MapPin size={small ? 9 : 11} strokeWidth={3} className="opacity-60" /> {session.room}
                        </span>
                    </div>
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
        <div className="max-w-[1600px] mx-auto space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700 px-3 md:px-4 overflow-x-hidden">

            {/* 1. DASHBOARD LIGHT HERO */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl md:rounded-[2.5rem] p-5 md:p-10 border border-blue-500/20 shadow-xl shadow-blue-500/20 relative overflow-hidden group transition-all">
                {/* Subtle Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full group-hover:bg-white/15 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 blur-3xl -ml-24 -mb-24 rounded-full"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        {/* Greeting & Time Badge */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">{(() => {
                                const hour = now.getHours();
                                const name = data.metadata.teacher.split(' ').pop() || "";
                                if (hour < 12) return t('stats.today.greeting.morning', { name });
                                if (hour < 18) return t('stats.today.greeting.afternoon', { name });
                                return t('stats.today.greeting.evening', { name });
                            })()}</h2>
                            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] md:text-xs font-black uppercase tracking-wider border border-white/10">
                                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <p className="text-xs md:text-lg font-bold text-blue-50/80 flex items-center gap-2 mb-4">
                            <Sparkles size={14} className="text-amber-300 fill-current md:w-5 md:h-5" />
                            {todaySessions.length > 0
                                ? `Bạn có lịch hôm nay · ${todaySessions.length} buổi · ${todaySessions.reduce((acc, s) => acc + s.periodCount, 0)} tiết`
                                : t('stats.today.status.free')
                            }
                        </p>

                        {/* Date & Location Context */}
                        <div className="flex items-center gap-4 text-blue-100/60 text-[10px] md:text-sm font-bold">
                            <div className="flex items-center gap-2">
                                <CalendarDays size={14} className="opacity-70 md:w-5 md:h-5" />
                                <span>{i18n.language === 'vi' ? `Thứ ${dayOfWeekIdx === 6 ? 'Nhật' : dayOfWeekIdx + 2}` : DAYS_OF_WEEK[dayOfWeekIdx]}, {todayStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Visualization of Progress */}
                    <div className="hidden md:flex gap-6 items-center">
                        <div className="h-16 w-[1px] bg-white/10 mx-2"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-blue-100/40 uppercase tracking-widest mb-1">{t('common.sessions')}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white leading-none tracking-tighter">{todaySessions.length}</span>
                                <span className="text-sm font-bold text-blue-100/60">/ {t('nav.today')}</span>
                            </div>
                        </div>
                    </div>
                </div>




            </div>

            {/* 2. BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 pb-4">

                {/* A. LEFT COLUMN: TIMELINE (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" /> {t('nav.today')}
                    </h3>

                    {todaySessions.length > 0 ? (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
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
                <div className="lg:col-span-5 space-y-3 md:space-y-4">

                    {/* Widget 1: Next Class */}
                    {nextTeaching ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-5">
                                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                    <ArrowRight size={12} className="md:w-[14px] md:h-[14px] text-blue-500" /> {t('stats.today.next')}
                                </h3>

                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700">
                                        <span className="text-[9px] md:text-[10px] font-bold">{t(`days.${nextTeaching.dayIdx}`)}</span>
                                        <span className="text-base md:text-xl font-black leading-none">{nextTeaching.date.getDate()}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                            {t('stats.today.nextDate', { day: t(`days.${nextTeaching.dayIdx}`), date: formatDate(nextTeaching.date) })}
                                        </p>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400">{nextTeaching.sessions.length} {t('common.sessions')}</p>
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
                                    className="mt-4 md:mt-6 w-full py-3 md:py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                                >
                                    {t('common.viewDetails')} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-green-900/20 dark:to-slate-800 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <Calendar size={32} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">{t('stats.today.noMore')}</h4>
                            <p className="text-xs text-slate-400 font-medium">🎉</p>
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default TodayView;
