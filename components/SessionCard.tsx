import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle, ChevronDown, ChevronUp, Users, User } from 'lucide-react';
import { CourseSession, CourseType } from '../types';
import { SESSION_COLORS } from '../constants';

interface SessionCardProps {
    session: CourseSession;
    isVertical?: boolean;
    isCurrent?: boolean;
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

const SessionCard: React.FC<SessionCardProps> = ({
    session,
    isVertical = false,
    isCurrent = false,
    overrides = {},
    abbreviations = {},
    showTeacher = true
}) => {
    const { t } = useTranslation();
    // Default expanded only if NOT vertical (desktop), or if it's the current session
    const [isExpanded, setIsExpanded] = useState(!isVertical || isCurrent);

    const currentType = overrides[session.courseCode] || session.type;
    const displayName = abbreviations[session.courseName] || session.courseName;

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            onClick={() => isVertical && setIsExpanded(!isExpanded)}
            className={`
        p-2 md:p-3 rounded-xl shadow-sm text-left relative transition-all duration-300
        ${SESSION_COLORS[session.sessionTime]} dark:bg-opacity-5 dark:border-opacity-40
        ${session.hasConflict ? 'conflict-border' : ''}
        ${isCurrent ? 'ring-2 ring-blue-500/80 bg-blue-50/50 dark:bg-blue-900/10 shadow-indigo-500/10 shadow-lg z-10' : 'border border-slate-100/50 dark:border-slate-800/50'}
        ${isVertical ? 'cursor-pointer active:scale-[0.97]' : ''}
      `}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start gap-1 mb-1">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-[11px] font-black leading-tight text-slate-800 dark:text-slate-100 line-clamp-2" title={session.courseName}>
                        {displayName}
                    </p>
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-0.5 flex-shrink-0 -mt-0.5 opacity-80">
                    {session.hasConflict && <AlertCircle size={11} className="text-red-500 md:w-[13px] md:h-[13px]" />}
                    {isVertical && (
                        <div className="text-slate-400">
                            {isExpanded ? <ChevronUp size={12} strokeWidth={3} className="md:w-[14px] md:h-[14px]" /> : <ChevronDown size={12} strokeWidth={3} className="md:w-[14px] md:h-[14px]" />}
                        </div>
                    )}
                </div>

                {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                )}
            </div>

            {/* Primary Info (Always Visible) */}
            <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t('weekly.period', { number: session.timeSlot })}</span>
                    <span className={`text-[7px] md:text-[8px] font-black px-1 py-0.5 rounded-md ${currentType === CourseType.LT ? 'bg-blue-100/80 text-blue-700' : 'bg-sky-100/80 text-sky-700'}`}>
                        {currentType}
                    </span>
                </div>

                <div className="highlight-room inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-black shrink-0 shadow-sm border border-black/5 dark:border-white/5">
                    <MapPin size={9} strokeWidth={3} className="md:w-[10px] md:h-[10px]" />
                    <span>{session.room}</span>
                </div>
            </div>

            {/* Collapsible Details */}
            <div className={`
        grid transition-all duration-300 ease-in-out
        ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2 pt-2 border-t border-slate-400/5' : 'grid-rows-[0fr] opacity-0'}
      `}>
                <div className="overflow-hidden">
                    <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Users size={9} className="text-slate-400/80 md:w-[10px] md:h-[10px]" />
                        <span className="font-black text-slate-700 dark:text-slate-200">{session.className}</span>
                        <span className="font-bold opacity-50 sm:block hidden">({session.group})</span>
                    </p>

                    {showTeacher && (
                        <div className={`flex items-center gap-1 text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-md border border-transparent max-w-full ${getTeacherColor(session.teacher)}`}>
                            <User size={9} strokeWidth={3} className="flex-shrink-0 md:w-[10px] md:h-[10px]" />
                            <span className="truncate">{session.teacher}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
