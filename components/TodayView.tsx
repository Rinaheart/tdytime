
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
    ArrowRight
} from 'lucide-react';
import { ScheduleData, CourseSession, CourseType, DaySchedule } from '../types';
import { SESSION_COLORS, DAYS_OF_WEEK } from '../constants';
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
    const dayOfWeekIdx = [6, 0, 1, 2, 3, 4, 5][now.getDay()]; // Adjust to Mon-Sun (0-6)
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
        // Start searching from today onwards
        let searchDate = new Date(now);
        searchDate.setDate(searchDate.getDate() + 1); // Start from tomorrow

        // Safety limit: search up to 30 days ahead
        for (let i = 0; i < 30; i++) {
            const dStr = formatDate(searchDate);
            const dIdx = [6, 0, 1, 2, 3, 4, 5][searchDate.getDay()];
            const dName = DAYS_OF_WEEK[dIdx];

            // Find which week this date belongs to
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
        let done = 0;

        DAYS_OF_WEEK.forEach((dName, idx) => {
            const dayData = currentWeek.days[dName];
            const daySessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening];
            const periods = daySessions.reduce((acc, s) => acc + s.periodCount, 0);

            total += periods;
            if (idx < dayOfWeekIdx) {
                done += periods;
            } else if (idx === dayOfWeekIdx) {
                // For today, we could count finished sessions, but for simplicity let's count start of day
                // Or count based on time... let's just count previous days as "done" for now
            }
        });

        return {
            done,
            total,
            percent: total > 0 ? Math.round((done / total) * 100) : 0
        };
    }, [currentWeek, dayOfWeekIdx]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = data.metadata.teacher.split(' ').pop() || "";
        if (hour < 12) return t('stats.today.greeting.morning', { name });
        if (hour < 18) return t('stats.today.greeting.afternoon', { name });
        return t('stats.today.greeting.evening', { name });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* HEADER SECTION */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={120} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                    <p className="text-blue-100 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">{t('stats.today.currentTime')}: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <h2 className="text-3xl md:text-4xl font-black mb-1">{getGreeting()}</h2>
                    <p className="text-blue-100 text-lg font-medium">
                        {i18n.language === 'vi' ? `Thứ ${dayOfWeekIdx === 6 ? 'Nhật' : dayOfWeekIdx + 2}` : DAYS_OF_WEEK[dayOfWeekIdx]}, {todayStr}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* MAIN FOCUS: TODAY'S TIMELINE */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={16} /> {t('nav.today')}
                        </h3>
                    </div>

                    {todaySessions.length > 0 ? (
                        <div className="space-y-4">
                            {todaySessions.map((session, idx) => (
                                <div key={idx} className="relative pl-8">
                                    {/* Timeline Line */}
                                    {idx !== todaySessions.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-slate-100 dark:bg-slate-800"></div>
                                    )}
                                    <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-blue-50 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                                    </div>

                                    <SessionCard
                                        session={session}
                                        isVertical={true}
                                        isCurrent={false} // Would need real-time check
                                        overrides={overrides}
                                        abbreviations={abbreviations}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coffee size={40} />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{t('stats.today.status.free')}</h4>
                            <p className="text-slate-400 font-medium">{t('stats.today.freeMessage')}</p>
                        </div>
                    )}
                </div>

                {/* SIDE COLUMN: UPCOMING & PROGRESS */}
                <div className="space-y-6">

                    {/* UPCOMING SESSION CARD */}
                    {nextTeaching && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ArrowRight size={14} className="text-blue-500" /> {t('stats.today.next')}
                            </h3>

                            <div>
                                <p className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">
                                    {t(`days.${nextTeaching.dayIdx}`)}, {formatDate(nextTeaching.date)}
                                </p>
                                <div className="space-y-2">
                                    {nextTeaching.sessions.slice(0, 2).map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.sessionTime === 'morning' ? 'bg-blue-500' : s.sessionTime === 'afternoon' ? 'bg-orange-500' : 'bg-purple-600'}`}></span>
                                            <span className="truncate">{abbreviations[s.courseName] || s.courseName}</span>
                                        </div>
                                    ))}
                                    {nextTeaching.sessions.length > 2 && <p className="text-[10px] text-slate-400 pl-4">+{nextTeaching.sessions.length - 2} môn khác...</p>}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setCurrentWeekIndex(nextTeaching.weekIdx);
                                    onSwitchTab('WEEK');
                                }}
                                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
                            >
                                {t('common.next')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* WEEKLY PROGRESS */}
                    {currentWeek && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock3 size={14} className="text-indigo-500" /> {t('stats.today.progress')}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{weeklyProgress.percent}%</span>
                                    <span className="text-[10px] font-bold text-slate-400">{weeklyProgress.done} / {weeklyProgress.total} {t('common.periods')}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${weeklyProgress.percent}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 italic">
                                    {t('stats.today.remaining', { count: weeklyProgress.total - weeklyProgress.done })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodayView;
