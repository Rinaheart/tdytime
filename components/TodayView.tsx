import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coffee, ArrowRight, CalendarDays } from 'lucide-react';
import { ScheduleData, CourseType, CourseSession } from '../types';
import { DAYS_OF_WEEK, PERIOD_TIMES } from '../constants';
import { parseDateFromRange, isCurrentWeek } from '../utils/scheduleUtils';

// ============================================
// TYPES
// ============================================

type DisplayState =
    | 'NO_DATA'           // 1. Không có dữ liệu lịch giảng
    | 'BEFORE_SEMESTER'   // 2. Hôm nay trước ngày bắt đầu học kỳ
    | 'AFTER_SEMESTER'    // 3. Hôm nay sau ngày kết thúc học kỳ
    | 'NO_SESSIONS'       // 4. Trong học kỳ nhưng không có buổi giảng
    | 'HAS_SESSIONS';     // 5. Có buổi giảng hôm nay

type SessionStatus = 'PENDING' | 'LIVE' | 'COMPLETED';

interface TodayViewProps {
    data: ScheduleData;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getSessionStatus = (session: CourseSession, now: Date): SessionStatus => {
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const startP = parseInt(session.timeSlot.split('-')[0]);
    const endP = parseInt(session.timeSlot.split('-')[1] || String(startP));
    const startPeriod = PERIOD_TIMES[startP];
    const endPeriod = PERIOD_TIMES[endP] || startPeriod;

    if (!startPeriod || !endPeriod) return 'PENDING';

    const startMin = startPeriod.start[0] * 60 + startPeriod.start[1];
    const endMin = endPeriod.end[0] * 60 + endPeriod.end[1];

    if (currentMin < startMin) return 'PENDING';
    if (currentMin <= endMin) return 'LIVE';
    return 'COMPLETED';
};

const getTimeStrings = (session: CourseSession) => {
    const startP = parseInt(session.timeSlot.split('-')[0]);
    const endP = parseInt(session.timeSlot.split('-')[1] || String(startP));
    const periodStart = PERIOD_TIMES[startP];
    const periodEnd = PERIOD_TIMES[endP] || periodStart;

    const startTimeStr = periodStart
        ? `${String(periodStart.start[0]).padStart(2, '0')}:${String(periodStart.start[1]).padStart(2, '0')}`
        : "07:00";
    const endTimeStr = periodEnd
        ? `${String(periodEnd.end[0]).padStart(2, '0')}:${String(periodEnd.end[1]).padStart(2, '0')}`
        : "09:00";

    return { startTimeStr, endTimeStr };
};

const formatDateVN = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return { day, month, year, full: `${day}/${month}/${year}` };
};

// ============================================
// SESSION CARD COMPONENT
// ============================================

const SessionCard: React.FC<{
    session: CourseSession;
    status: SessionStatus;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    t: any;
}> = ({ session, status, overrides, abbreviations, t }) => {
    const { startTimeStr, endTimeStr } = getTimeStrings(session);
    const currentType = overrides[session.courseCode] || session.type;
    const displayName = abbreviations[session.courseName] || session.courseName;

    // Status-based styling
    const statusStyles = {
        PENDING: {
            container: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
            text: 'text-slate-900 dark:text-white font-bold',
            statusText: 'text-slate-500 dark:text-slate-400'
        },
        LIVE: {
            container: 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/10 dark:bg-blue-900/10',
            text: 'text-slate-900 dark:text-white font-bold',
            statusText: 'text-blue-600 dark:text-blue-400 font-bold'
        },
        COMPLETED: {
            container: 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50',
            text: 'text-slate-400 dark:text-slate-500 font-bold',
            statusText: 'text-slate-400 dark:text-slate-500'
        }
    };

    const styles = statusStyles[status];

    // Badge Colors
    const isLT = currentType === CourseType.LT;
    const badgeClass = status === 'COMPLETED'
        ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700'
        : isLT
            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';

    return (
        <div className={`flex items-stretch rounded-2xl overflow-hidden mb-3 border bg-white dark:bg-slate-900 shadow-sm ${styles.container}`}>
            {/* LEFT: Time (Emphasized) */}
            <div className="w-[72px] flex flex-col items-end justify-center py-3 px-3 border-r border-slate-100 dark:border-slate-800 shrink-0">
                <span className={`text-xl font-black leading-none tracking-tight mb-1 ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {startTimeStr}
                </span>
                <span className={`text-xs font-medium ${status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {endTimeStr}
                </span>
            </div>

            {/* CENTER: Info */}
            <div className="flex-1 py-3 px-4 min-w-0 flex flex-col justify-center">
                {/* Line 1: Name + Badge */}
                <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm md:text-base leading-tight truncate ${styles.text}`}>
                        {displayName}
                    </h4>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                        {currentType}
                    </span>
                </div>

                {/* Line 2: Class Info */}
                <div className={`text-xs mb-1 truncate ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {session.className} <span className="opacity-50">·</span> ({session.group})
                </div>

                {/* Line 3: Period & Status */}
                <div className="flex items-center gap-2 text-[11px]">
                    <span className={`font-medium ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-500'}`}>
                        {t('common.periodLabel')} {session.timeSlot}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <span className={styles.statusText}>
                        {t(`stats.today.sessionStatus.${status.toLowerCase()}`)}
                    </span>
                </div>
            </div>

            {/* RIGHT: Room */}
            <div className="w-[60px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 shrink-0 border-l border-slate-100 dark:border-slate-800 px-2">
                <span className={`text-sm font-bold text-center leading-tight ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {session.room}
                </span>
            </div>
        </div>
    );
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================

const EmptyStateCard: React.FC<{
    type: 'noData' | 'beforeSemester' | 'afterSemester' | 'noSessions';
    date?: string;
    onAction?: (action: 'WEEK' | 'OVERVIEW') => void;
    t: any;
}> = ({ type, date, onAction, t }) => {
    const showCoffee = type === 'noSessions';

    return (
        <div className="py-12 flex flex-col items-center text-center">
            {showCoffee && (
                <div className="w-20 h-20 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Coffee size={32} strokeWidth={1.5} />
                </div>
            )}
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {t(`stats.today.emptyStates.${type}`)}
            </h3>
            {(type === 'noData' || type === 'beforeSemester' || type === 'afterSemester') && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {t(`stats.today.emptyStates.${type}Hint`, { date })}
                </p>
            )}

            {/* CTA for No Sessions */}
            {type === 'noSessions' && onAction && (
                <div className="flex items-center justify-center gap-6 mt-2">
                    <span
                        onClick={() => onAction('WEEK')}
                        className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    >
                        {t('nav.weekly')}
                    </span>
                    <span
                        onClick={() => onAction('OVERVIEW')}
                        className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    >
                        {t('nav.semester')}
                    </span>
                </div>
            )}
        </div>
    );
};

// ============================================
// NEXT TEACHING SECTION
// ============================================

const NextTeachingSection: React.FC<{
    nextTeaching: {
        date: Date;
        sessions: CourseSession[];
        weekIdx: number;
        dayIdx: number;
    };
    abbreviations: Record<string, string>;
    overrides: Record<string, CourseType>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
    isCompact?: boolean;
    isBeforeSemester?: boolean;
    t: any;
}> = ({ nextTeaching, abbreviations, overrides, onSwitchTab, setCurrentWeekIndex, isCompact = false, isBeforeSemester = false, t }) => {
    const dateInfo = formatDateVN(nextTeaching.date);
    // Use distinctive label for Before Semester vs In-Semester
    const titleKey = isBeforeSemester ? 'stats.today.firstOfSemester' : 'stats.today.next';

    if (isCompact) {
        // Compact version shown below today's sessions
        return (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-500" />
                    {t(titleKey)}
                </h3>
                <div
                    onClick={() => { setCurrentWeekIndex(nextTeaching.weekIdx); onSwitchTab('WEEK'); }}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {t(`days.${nextTeaching.dayIdx}`)}, {dateInfo.full}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                            {nextTeaching.sessions.length} {t('common.sessions')}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CalendarDays size={16} className="text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                                {abbreviations[nextTeaching.sessions[0].courseName] || nextTeaching.sessions[0].courseName}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                    {getTimeStrings(nextTeaching.sessions[0]).startTimeStr}
                                </span>
                                <div className="flex items-center gap-1.5 truncate">
                                    <span>{nextTeaching.sessions[0].className} ({nextTeaching.sessions[0].group})</span>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{nextTeaching.sessions[0].room}</span>
                                    {nextTeaching.sessions.length > 1 && <span className="text-blue-500 ml-1">+{nextTeaching.sessions.length - 1}</span>}
                                </div>
                            </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400 shrink-0" />
                    </div>
                </div>
            </div>
        );
    }

    // Full version when no sessions today
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ArrowRight size={16} className="text-blue-500" />
                    {t(titleKey)}
                </h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {t(`days.${nextTeaching.dayIdx}`)}, {dateInfo.full} — {nextTeaching.sessions.length} {t('common.sessions')}
                </span>
            </div>

            {/* Sessions List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {nextTeaching.sessions.map((s, idx) => {
                    const { startTimeStr } = getTimeStrings(s);
                    const displayName = abbreviations[s.courseName] || s.courseName;
                    const currentType = overrides[s.courseCode] || s.type;

                    return (
                        <div key={idx} className="p-4 flex flex-col gap-1.5">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {displayName}
                            </p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                    {startTimeStr}
                                </span>
                                <div className="flex items-center gap-1.5 truncate">
                                    <span>{s.className} ({s.group})</span>
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{s.room}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Text Link (Replaced Button) */}
            <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <span
                    onClick={() => { setCurrentWeekIndex(nextTeaching.weekIdx); onSwitchTab('WEEK'); }}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide cursor-pointer hover:underline flex items-center gap-2"
                >
                    {t('common.viewDetails')} <ArrowRight size={12} />
                </span>
            </div>
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

const TodayView: React.FC<TodayViewProps> = ({
    data,
    overrides,
    abbreviations,
    onSwitchTab,
    setCurrentWeekIndex
}) => {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const now = currentTime;
    const currentJsDay = now.getDay();
    const dayOfWeekIdx = currentJsDay === 0 ? 6 : currentJsDay - 1;
    const dayName = DAYS_OF_WEEK[dayOfWeekIdx];
    const dateInfo = formatDateVN(now);

    // Check if teacher matches
    const isMainTeacher = (tName: string) => {
        if (!tName || tName === "Chưa rõ" || tName === "Unknown") return true;
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ths\.|ts\.|pgs\.|gs\.|gv\./g, "").trim();
        const main = normalize(data.metadata.teacher);
        const target = normalize(tName);
        return target.includes(main) || main.includes(target);
    };

    // Semester boundaries
    const semesterBounds = useMemo(() => {
        if (data.weeks.length === 0) return null;
        const firstWeek = data.weeks[0];
        const lastWeek = data.weeks[data.weeks.length - 1];
        return {
            start: parseDateFromRange(firstWeek.dateRange, 'start'),
            end: parseDateFromRange(lastWeek.dateRange, 'end')
        };
    }, [data.weeks]);

    // Find current week
    const currentWeek = useMemo(() => {
        const idx = data.weeks.findIndex(w => isCurrentWeek(w.dateRange, now));
        return idx !== -1 ? data.weeks[idx] : null;
    }, [data.weeks, now]);

    // Today's sessions (SORTED BY PRIORITY)
    const todaySessions = useMemo(() => {
        if (!currentWeek) return [];
        const dayData = currentWeek.days[dayName];
        if (!dayData) return [];

        const sessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
            .filter(s => isMainTeacher(s.teacher));

        // PRIORITY SORT: LIVE -> PENDING -> COMPLETED
        // If status is same, sort by time
        return sessions.sort((a, b) => {
            const statusA = getSessionStatus(a, now);
            const statusB = getSessionStatus(b, now);

            const priority = { LIVE: 0, PENDING: 1, COMPLETED: 2 };
            if (priority[statusA] !== priority[statusB]) {
                return priority[statusA] - priority[statusB];
            }

            return parseInt(a.timeSlot.split('-')[0]) - parseInt(b.timeSlot.split('-')[0]);
        });
    }, [currentWeek, dayName, now]);

    // Find next teaching day
    const nextTeaching = useMemo(() => {
        let searchDate = new Date(now);
        searchDate.setDate(searchDate.getDate() + 1);
        for (let i = 0; i < 60; i++) {
            const dJsIdx = searchDate.getDay();
            const dIdx = dJsIdx === 0 ? 6 : dJsIdx - 1;
            const dName = DAYS_OF_WEEK[dIdx];
            const wIdx = data.weeks.findIndex(w => isCurrentWeek(w.dateRange, searchDate));

            if (wIdx !== -1) {
                const week = data.weeks[wIdx];
                const dayData = week.days[dName];
                if (dayData) {
                    const sessions = [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
                        .filter(s => isMainTeacher(s.teacher))
                        .sort((a, b) => parseInt(a.timeSlot.split('-')[0]) - parseInt(b.timeSlot.split('-')[0]));
                    if (sessions.length > 0) {
                        return { date: new Date(searchDate), sessions, weekIdx: wIdx, dayIdx: dIdx };
                    }
                }
            }
            searchDate.setDate(searchDate.getDate() + 1);
        }
        return null;
    }, [data.weeks, now]);

    // Determine display state (PRIORITY ORDER)
    const displayState: DisplayState = useMemo(() => {
        // 1. No data
        if (data.weeks.length === 0) return 'NO_DATA';

        // 2. Before semester
        if (semesterBounds?.start) {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            if (todayStart < semesterBounds.start) return 'BEFORE_SEMESTER';
        }

        // 3. After semester
        if (semesterBounds?.end) {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            if (todayStart > semesterBounds.end) return 'AFTER_SEMESTER';
        }

        // 4. No sessions today
        if (todaySessions.length === 0) return 'NO_SESSIONS';

        // 5. Has sessions
        return 'HAS_SESSIONS';
    }, [data.weeks.length, semesterBounds, todaySessions.length, now]);

    // Greeting
    const getGreeting = () => {
        const hour = now.getHours();
        const name = data.metadata.teacher.split(' ').pop() || "";
        if (hour < 12) return t('stats.today.greeting.morning', { name });
        if (hour < 18) return t('stats.today.greeting.afternoon', { name });
        return t('stats.today.greeting.evening', { name });
    };

    // Calculate total periods
    const totalPeriods = todaySessions.reduce((acc, s) => acc + s.periodCount, 0);

    // Switch action handler
    const handleAction = (tab: 'WEEK' | 'OVERVIEW') => {
        if (tab === 'WEEK') {
            onSwitchTab('WEEK');
        } else if (tab === 'OVERVIEW') {
            onSwitchTab('OVERVIEW');
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* HEADER: Apple Style Layout v2 */}
            <header className="pt-6 pb-6 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-30 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-stretch justify-between h-[88px]"> {/* Fixed height for consistency */}
                    {/* LEFT: Day / Date / Year - Tight Stack */}
                    <div className="flex flex-col justify-between py-1">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">
                            {t(`days.${dayOfWeekIdx}`)}
                        </span>
                        <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none -ml-0.5">
                            {dateInfo.day}<span className="text-slate-300 dark:text-slate-700 font-light mx-1">/</span>{dateInfo.month}
                        </h1>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-500 leading-none">
                            {dateInfo.year}
                        </span>
                    </div>

                    {/* RIGHT: Big Time - Balanced Height */}
                    <div className="flex items-center h-full">
                        <div className="text-6xl font-medium text-blue-600 dark:text-blue-500 tracking-tighter font-mono leading-none">
                            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                    </div>
                </div>
            </header>

            {/* GREETING & SUMMARY */}
            {displayState === 'HAS_SESSIONS' && (
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        {getGreeting()}
                    </h2>
                    <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-lg">
                        <span>{t('stats.today.summary', { sessions: todaySessions.length, periods: totalPeriods })}</span>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="space-y-4">
                {/* Empty States */}
                {displayState === 'NO_DATA' && (
                    <EmptyStateCard type="noData" t={t} />
                )}

                {displayState === 'BEFORE_SEMESTER' && (
                    <>
                        {/* Greeting even if before semester */}
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {getGreeting()}
                            </h2>
                        </div>

                        <EmptyStateCard
                            type="beforeSemester"
                            date={semesterBounds?.start ? formatDateVN(semesterBounds.start).full : ''}
                            t={t}
                        />

                        {/* Show First Teaching Day */}
                        {nextTeaching && (
                            <NextTeachingSection
                                nextTeaching={nextTeaching}
                                abbreviations={abbreviations}
                                overrides={overrides}
                                onSwitchTab={onSwitchTab}
                                setCurrentWeekIndex={setCurrentWeekIndex}
                                isCompact={false}
                                isBeforeSemester={true} // Distinction flag
                                t={t}
                            />
                        )}
                    </>
                )}

                {displayState === 'AFTER_SEMESTER' && (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {getGreeting()}
                            </h2>
                        </div>
                        <EmptyStateCard
                            type="afterSemester"
                            date={semesterBounds?.end ? formatDateVN(semesterBounds.end).full : ''}
                            t={t}
                        />
                    </>
                )}

                {displayState === 'NO_SESSIONS' && (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {getGreeting()}
                            </h2>
                        </div>
                        <EmptyStateCard
                            type="noSessions"
                            t={t}
                            onAction={handleAction} // Pass action handler
                        />
                        {nextTeaching && (
                            <NextTeachingSection
                                nextTeaching={nextTeaching}
                                abbreviations={abbreviations}
                                overrides={overrides}
                                onSwitchTab={onSwitchTab}
                                setCurrentWeekIndex={setCurrentWeekIndex}
                                t={t}
                            />
                        )}
                    </>
                )}

                {/* Sessions List */}
                {displayState === 'HAS_SESSIONS' && (
                    <>
                        <div>
                            {todaySessions.map((session) => (
                                <SessionCard
                                    key={`${session.courseCode}-${session.timeSlot}-${session.group}`}
                                    session={session}
                                    status={getSessionStatus(session, now)}
                                    overrides={overrides}
                                    abbreviations={abbreviations}
                                    t={t}
                                />
                            ))}
                        </div>

                        {/* Next Teaching (Compact) */}
                        {nextTeaching && (
                            <NextTeachingSection
                                nextTeaching={nextTeaching}
                                abbreviations={abbreviations}
                                overrides={overrides}
                                onSwitchTab={onSwitchTab}
                                setCurrentWeekIndex={setCurrentWeekIndex}
                                isCompact={true}
                                t={t}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TodayView;
