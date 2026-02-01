import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, User } from 'lucide-react';
import { CourseSession, CourseType } from '../types';
import { SESSION_COLORS } from '../constants';

interface SessionCardProps {
    session: CourseSession;
    isVertical?: boolean;
    isCurrent?: boolean;
    isHorizontal?: boolean;
    overrides?: Record<string, CourseType>;
    abbreviations?: Record<string, string>;
    showTeacher?: boolean;
}

const getTeacherColor = (name: string) => {
    const colors = [
        'bg-red-100 text-red-700 border-red-200',
        'bg-orange-100 text-orange-700 border-orange-200',
        'bg-amber-100 text-amber-700 border-amber-200',
        'bg-lime-100 text-lime-700 border-lime-200',
        'bg-cyan-100 text-cyan-700 border-cyan-200',
        'bg-teal-100 text-teal-700 border-teal-200',
        'bg-emerald-100 text-emerald-700 border-emerald-200',
        'bg-sky-100 text-sky-700 border-sky-200',
        'bg-pink-100 text-pink-700 border-pink-200'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const SESSION_TIME_COLORS: Record<string, string> = {
    morning: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50',
    afternoon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50',
    evening: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/50'
};

const SessionCard: React.FC<SessionCardProps> = ({
    session,
    isVertical = false,
    isCurrent = false,
    isHorizontal = false,
    overrides = {},
    abbreviations = {},
    showTeacher = true
}) => {
    const { t } = useTranslation();

    const currentType = overrides[session.courseCode] || session.type;
    const displayName = abbreviations[session.courseName] || session.courseName;

    return (
        <div
            className={`
        p-2.5 rounded-xl shadow-sm text-left relative transition-all duration-300 border flex flex-col
        ${isHorizontal ? 'h-full' : ''}
        ${SESSION_COLORS[session.sessionTime]} dark:bg-opacity-5 dark:border-opacity-40
        ${session.hasConflict ? 'conflict-border border-red-500/50' : 'border-slate-100/50 dark:border-slate-800/50'}
        ${isCurrent ? 'ring-2 ring-blue-500/80 bg-blue-50/50 dark:bg-blue-900/10 z-10' : ''}
      `}
        >
            {/* Row 1: Course Name [LT/TH] */}
            <div className="flex justify-between items-start gap-1">
                <p className="text-[11px] md:text-xs font-black leading-tight text-slate-900 dark:text-slate-100" title={session.courseName}>
                    {displayName}
                    <span className={`ml-1 text-[10px] md:text-[11px] font-bold ${currentType === CourseType.LT ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        [{currentType}]
                    </span>
                </p>

                {isCurrent && (
                    <span className="shrink-0 flex h-2 w-2 mt-0.5">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                )}
                {session.hasConflict && <AlertCircle size={10} className="text-red-500 shrink-0 mt-0.5" />}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                {/* Row 2: Class (Group) */}
                <div className="mt-1.5 flex items-center gap-1 text-[10px] md:text-[11px] text-slate-600 dark:text-slate-400 overflow-hidden">
                    <span className="font-bold truncate">{session.className}</span>
                    <span className="opacity-40">({session.group})</span>
                </div>

                {/* Row 3: Tiết x-y -- Phòng */}
                <div className="mt-1.5 flex items-center justify-between gap-1 text-[10px] md:text-[11px] font-bold">
                    <span className="text-slate-500 dark:text-slate-500">{t('weekly.period', { number: session.timeSlot })}</span>
                    <span className={`px-2 py-0.5 rounded border shadow-sm text-center min-w-[36px] ${SESSION_TIME_COLORS[session.sessionTime]}`}>
                        {session.room}
                    </span>
                </div>
            </div>

            {/* Small Teacher label if needed (compact) */}
            {showTeacher && (
                <div className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center gap-1 text-[8px] text-slate-400 truncate">
                    <User size={8} />
                    <span>{session.teacher}</span>
                </div>
            )}
        </div>
    );
};

export default SessionCard;
