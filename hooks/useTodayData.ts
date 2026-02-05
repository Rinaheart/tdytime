import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleData, CourseType, CourseSession } from '../types';
import { DAYS_OF_WEEK, PERIOD_TIMES } from '../constants';
import { parseDateFromRange, isCurrentWeek } from '../utils/scheduleUtils';
import { MockDisplayState } from '../components/DebugPanel';

// ============================================
// TYPES
// ============================================

export type DisplayState =
    | 'NO_DATA'
    | 'BEFORE_SEMESTER'
    | 'AFTER_SEMESTER'
    | 'NO_SESSIONS'
    | 'HAS_SESSIONS';

export type SessionStatus = 'PENDING' | 'LIVE' | 'COMPLETED';

export interface SessionWithStatus extends CourseSession {
    status: SessionStatus;
    startTimeStr: string;
    endTimeStr: string;
}

export interface NextTeachingInfo {
    date: Date;
    sessions: CourseSession[];
    weekIdx: number;
    dayIdx: number;
}

export interface UseTodayDataProps {
    data: ScheduleData;
    mockState?: MockDisplayState;
    mockDate?: string; // YYYY-MM-DD
    mockTime?: string; // HH:mm
}

// ============================================
// HELPERS
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
// HOOK
// ============================================

export const useTodayData = ({ data, mockState = 'REAL', mockDate, mockTime }: UseTodayDataProps) => {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Compute "Now" - either real or mocked
    const now = useMemo(() => {
        const d = new Date(currentTime);

        if (mockState !== 'REAL') {
            if (mockDate) {
                const [y, m, day] = mockDate.split('-').map(Number);
                d.setFullYear(y, m - 1, day);
            }

            if (mockTime) {
                const [h, min] = mockTime.split(':').map(Number);
                d.setHours(h, min, 0, 0);
            } else if (mockDate) {
                // If date is mocked but not time, set to midnight for consistency in date-only mocks
                d.setHours(0, 0, 0, 0);
            }
        }

        return d;
    }, [currentTime, mockDate, mockTime, mockState]);

    const currentJsDay = now.getDay();
    const dayOfWeekIdx = currentJsDay === 0 ? 6 : currentJsDay - 1;
    const dayName = DAYS_OF_WEEK[dayOfWeekIdx];
    const dateInfo = formatDateVN(now);

    const isMainTeacher = (tName: string) => {
        if (!tName || tName === "Chưa rõ" || tName === "Unknown") return true;
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ths\.|ts\.|pgs\.|gs\.|gv\./g, "").trim();
        const main = normalize(data.metadata.teacher);
        const target = normalize(tName);
        return target.includes(main) || main.includes(target);
    };

    const semesterBounds = useMemo(() => {
        if (data.weeks.length === 0) return null;
        const firstWeek = data.weeks[0];
        const lastWeek = data.weeks[data.weeks.length - 1];
        return {
            start: parseDateFromRange(firstWeek.dateRange, 'start'),
            end: parseDateFromRange(lastWeek.dateRange, 'end')
        };
    }, [data.weeks]);

    const currentWeek = useMemo(() => {
        const idx = data.weeks.findIndex(w => isCurrentWeek(w.dateRange, now));
        return idx !== -1 ? data.weeks[idx] : null;
    }, [data.weeks, now]);

    const todaySessionsRaw = useMemo(() => {
        if (!currentWeek) return [];
        const dayData = currentWeek.days[dayName];
        if (!dayData) return [];

        return [...dayData.morning, ...dayData.afternoon, ...dayData.evening]
            .filter(s => isMainTeacher(s.teacher));
    }, [currentWeek, dayName]);

    const todaySessions = useMemo(() => {
        return todaySessionsRaw
            .map(s => ({
                ...s,
                status: getSessionStatus(s, now),
                ...getTimeStrings(s)
            }))
            .sort((a, b) => {
                const priority = { LIVE: 0, PENDING: 1, COMPLETED: 2 };
                if (priority[a.status] !== priority[b.status]) {
                    return priority[a.status] - priority[b.status];
                }
                return parseInt(a.timeSlot.split('-')[0]) - parseInt(b.timeSlot.split('-')[0]);
            });
    }, [todaySessionsRaw, now]);

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

    const displayState: DisplayState = useMemo(() => {
        if (mockState !== 'REAL') {
            const mapping: Record<string, DisplayState> = {
                'HAS_SESSIONS': 'HAS_SESSIONS',
                'NO_SESSIONS': 'NO_SESSIONS',
                'BEFORE_SEMESTER': 'BEFORE_SEMESTER',
                'AFTER_SEMESTER': 'AFTER_SEMESTER',
                'NO_DATA': 'NO_DATA'
            };
            return mapping[mockState] || 'HAS_SESSIONS';
        }

        if (data.weeks.length === 0) return 'NO_DATA';
        if (semesterBounds?.start) {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            if (todayStart < semesterBounds.start) return 'BEFORE_SEMESTER';
        }
        if (semesterBounds?.end) {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            if (todayStart > semesterBounds.end) return 'AFTER_SEMESTER';
        }
        if (todaySessions.length === 0) return 'NO_SESSIONS';
        return 'HAS_SESSIONS';
    }, [data.weeks.length, semesterBounds, todaySessions.length, now, mockState]);

    const greeting = useMemo(() => {
        const hour = now.getHours();
        const name = data.metadata.teacher.split(' ').pop() || "";
        if (hour < 12) return t('stats.today.greeting.morning', { name });
        if (hour < 18) return t('stats.today.greeting.afternoon', { name });
        return t('stats.today.greeting.evening', { name });
    }, [now, data.metadata.teacher, t]);

    const totalPeriods = todaySessions.reduce((acc, s) => acc + s.periodCount, 0);

    const daysUntilSemester = useMemo(() => {
        if (!semesterBounds?.start) return null;
        const diffTime = semesterBounds.start.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [semesterBounds, now]);

    return {
        now,
        dateInfo,
        dayOfWeekIdx,
        displayState,
        todaySessions,
        nextTeaching,
        totalPeriods,
        daysUntilSemester,
        greeting
    };
};
