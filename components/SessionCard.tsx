import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MapPin } from 'lucide-react';
import { CourseSession, CourseType } from '../types';
import { PERIOD_TIMES } from '../constants';

interface SessionCardProps {
    session: CourseSession;
    status?: 'PENDING' | 'LIVE' | 'COMPLETED';
    variant?: 'today' | 'weekly';
    overrides?: Record<string, CourseType>;
    abbreviations?: Record<string, string>;
    showTeacher?: boolean;
    t?: any;
}

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

const SessionCard: React.FC<SessionCardProps> = ({
    session,
    status = 'PENDING',
    variant = 'today',
    overrides = {},
    abbreviations = {},
    showTeacher = false,
}) => {
    const { t } = useTranslation();
    const { startTimeStr, endTimeStr } = getTimeStrings(session);
    const currentType = overrides[session.courseCode] || session.type;
    const displayName = abbreviations[session.courseName] || session.courseName;

    const isLive = status === 'LIVE';
    const isCompleted = status === 'COMPLETED';

    // 1. WEEKLY VARIANT (Compact 3-Line Optimized Card)
    if (variant === 'weekly') {
        return (
            <div className="p-2.5 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-none transition-all group">
                {/* Line 1: Time (Left) & Room (Right) */}
                <div className="flex items-center justify-between text-[10px] mb-1">
                    <div className="flex items-center font-bold">
                        <span className="text-slate-700 dark:text-slate-200">{startTimeStr}</span>
                        <span className="text-slate-300 dark:text-slate-600 font-light mx-px">-</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium">{endTimeStr}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-black">
                        {session.room}
                    </div>
                </div>

                {/* Line 2: Subject */}
                <h3 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight mb-1.5 line-clamp-2">
                    {displayName}
                </h3>

                {/* Line 3: Class (Group) [Type] */}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between gap-2">
                    <div className="truncate flex items-center gap-1">
                        <span className="truncate">{session.className}</span>
                        <span className="shrink-0 opacity-70">({session.group})</span>
                    </div>
                    <span className={`shrink-0 font-black px-1 rounded ${currentType === CourseType.LT
                        ? 'text-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20'
                        }`}>
                        [{currentType}]
                    </span>
                </div>

                {/* Optional Teacher Row - Styled as a Footer Strip */}
                {showTeacher && (
                    <div className="mt-2.5 -mx-2.5 -mb-2.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-b-xl text-[10px] font-bold border-t border-blue-100/50 dark:border-blue-800/30">
                        <span className="text-slate-900 dark:text-blue-100">{session.teacher}</span>
                    </div>
                )}
            </div>
        );
    }

    // 2. TODAY VARIANT (Existing Detailed Style)
    if (isCompleted) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 opacity-70 transition-all">
                <div className="flex flex-col gap-0.5">
                    {/* Compact Time Range */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Clock size={12} />
                        <span>{startTimeStr}</span>
                        <span className="text-slate-300 dark:text-slate-600 font-light mx-px">-</span>
                        <span>{endTimeStr}</span>
                    </div>
                    {/* Subject - Class */}
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate">
                        {displayName} — {session.className}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`
            relative rounded-2xl p-5 
            border transition-all duration-300
            ${isLive
                ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 shadow-none ring-1 ring-blue-500/10'
                : 'bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-500 shadow-none'
            }
        `}>
            {/* Live Indicator */}
            {isLive && (
                <div className="absolute top-5 right-5 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Live</span>
                </div>
            )}

            {/* Time - Primary Focus (18px Bold) */}
            <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-slate-400" />
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {startTimeStr}
                </span>
                <span className="text-slate-300 dark:text-slate-600">—</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {endTimeStr}
                </span>
            </div>

            {/* Subject Name */}
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug mb-3">
                {displayName}
            </h3>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span className="font-medium">{session.room}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{session.className}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className={`font-semibold ${currentType === CourseType.LT
                    ? 'text-blue-500'
                    : 'text-emerald-500'
                    }`}>
                    {currentType}
                </span>
            </div>

            {/* Optional Teacher Row - Styled as a Footer Strip */}
            {showTeacher && (
                <div className="mt-5 -mx-5 -mb-5 px-5 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-b-2xl border-t border-blue-100 dark:border-blue-800/50 text-[13px] font-black">
                    <span className="text-slate-900 dark:text-blue-50">{session.teacher}</span>
                </div>
            )}
        </div>
    );
};

export default React.memo(SessionCard);
