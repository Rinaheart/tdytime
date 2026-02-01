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

    // Status-based styling (no icons, no bright colors)
    const statusStyles = {
        PENDING: {
            container: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900',
            text: 'text-slate-900 dark:text-white',
            statusText: 'text-slate-500 dark:text-slate-400'
        },
        LIVE: {
            container: 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20',
            text: 'text-slate-900 dark:text-white font-bold',
            statusText: 'text-blue-600 dark:text-blue-400 font-bold'
        },
        COMPLETED: {
            container: 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50',
            text: 'text-slate-400 dark:text-slate-500',
            statusText: 'text-slate-400 dark:text-slate-500'
        }
    };

    const styles = statusStyles[status];

    return (
        <div className={`flex items-stretch rounded-xl overflow-hidden mb-3 border ${styles.container}`}>
            {/* LEFT: Time */}
            <div className="w-[60px] md:w-[68px] flex flex-col items-end py-2.5 px-2 bg-slate-100 dark:bg-slate-800 shrink-0">
                <span className={`text-sm md:text-base font-bold leading-[1.2] ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {startTimeStr}
                </span>
                <span className={`text-[10px] leading-tight ${status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {endTimeStr}
                </span>
            </div>

            {/* CENTER: Info */}
            <div className="flex-1 py-2.5 px-3 min-w-0 flex flex-col">
                {/* Course Name */}
                <h4 className={`text-xs md:text-sm font-bold leading-[1.2] mb-2 truncate ${styles.text}`}>
                    {displayName}
                </h4>

                {/* Class & Group */}
                <div className={`flex items-center gap-1 text-[10px] md:text-xs mb-1.5 ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    <span className="font-medium truncate">{session.className}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>({session.group})</span>
                </div>

                {/* Period & Type + Status */}
                <div className="flex items-center gap-2 text-[9px] md:text-[10px]">
                    <span className={`${status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                        {t('common.periodLabel')} {session.timeSlot}
                    </span>
                    <span className={`uppercase font-bold ${status === 'COMPLETED'
                        ? 'text-slate-400'
                        : currentType === CourseType.LT
                            ? 'text-blue-600'
                            : 'text-emerald-600'
                        }`}>
                        {currentType}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className={styles.statusText}>
                        {t(`stats.today.sessionStatus.${status.toLowerCase()}`)}
                    </span>
                </div>
            </div>

            {/* RIGHT: Room */}
            <div className="w-[52px] md:w-[60px] flex items-start py-2.5 px-2 bg-slate-50 dark:bg-slate-800/50 shrink-0 border-l border-slate-100 dark:border-slate-700">
                <span className={`text-xs md:text-sm font-bold leading-[1.2] text-left ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
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
    t: any;
}> = ({ type, date, t }) => {
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
    t: any;
}> = ({ nextTeaching, abbreviations, overrides, onSwitchTab, setCurrentWeekIndex, isCompact = false, t }) => {
    const dateInfo = formatDateVN(nextTeaching.date);

    if (isCompact) {
        // Compact version shown below today's sessions
        return (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowRight size={14} className="text-blue-500" />
                    {t('stats.today.next')}
                </h3>
                <div
                    onClick={() => { setCurrentWeekIndex(nextTeaching.weekIdx); onSwitchTab('WEEK'); }}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                    {t('stats.today.next')}
                </h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {t(`days.${nextTeaching.dayIdx}`)}, {dateInfo.full} — {nextTeaching.sessions.length} {t('common.sessions')}
                </span>
            </div>

            {/* Sessions List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
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

            {/* Action Button */}
            <button
                onClick={() => { setCurrentWeekIndex(nextTeaching.weekIdx); onSwitchTab('WEEK'); }}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2"
            >
                {t('common.viewDetails')}
                <ArrowRight size={14} />
            </button>
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

    // Today's sessions
    const todaySessions = useMemo(() => {
        if (!currentWeek) return [];
        const dayData = currentWeek.days[dayName];
        if (!dayData) return [];
        return [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
            .filter(s => isMainTeacher(s.teacher))
            .sort((a, b) => parseInt(a.timeSlot.split('-')[0]) - parseInt(b.timeSlot.split('-')[0]));
    }, [currentWeek, dayName]);

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

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* HEADER: Date & Time */}
            <header className="pt-2 pb-4 flex items-end justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm z-30">
                <div>
                    <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                        {t(`days.${dayOfWeekIdx}`)}
                    </p>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {dateInfo.day}
                        <span className="text-lg md:text-2xl text-slate-300 dark:text-slate-600 font-bold"> / {dateInfo.month}</span>
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded mb-1">
                        {dateInfo.year}
                    </span>
                    <div className="text-3xl md:text-5xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight text-right">
                        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                </div>
            </header>

            {/* GREETING & SUMMARY */}
            {displayState === 'HAS_SESSIONS' && (
                <div className="mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                        {getGreeting()}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('stats.today.summary', { sessions: todaySessions.length, periods: totalPeriods })}
                    </p>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="space-y-4">
                {/* Empty States */}
                {displayState === 'NO_DATA' && (
                    <EmptyStateCard type="noData" t={t} />
                )}

                {displayState === 'BEFORE_SEMESTER' && (
                    <EmptyStateCard
                        type="beforeSemester"
                        date={semesterBounds?.start ? formatDateVN(semesterBounds.start).full : ''}
                        t={t}
                    />
                )}

                {displayState === 'AFTER_SEMESTER' && (
                    <EmptyStateCard
                        type="afterSemester"
                        date={semesterBounds?.end ? formatDateVN(semesterBounds.end).full : ''}
                        t={t}
                    />
                )}

                {displayState === 'NO_SESSIONS' && (
                    <>
                        <div className="mb-4">
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {getGreeting()}
                            </h2>
                        </div>
                        <EmptyStateCard type="noSessions" t={t} />
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
