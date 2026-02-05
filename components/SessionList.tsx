import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import SessionCard from './SessionCard';
import { SessionWithStatus } from '../hooks/useTodayData';
import { CourseType } from '../types';

interface SessionListProps {
    sessions: SessionWithStatus[];
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
}

const SessionList: React.FC<SessionListProps> = ({
    sessions,
    overrides,
    abbreviations
}) => {
    const { t } = useTranslation();

    const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
    const activeSessions = sessions.filter(s => s.status !== 'COMPLETED');

    const liveCount = sessions.filter(s => s.status === 'LIVE').length;
    const pendingCount = sessions.filter(s => s.status === 'PENDING').length;
    const isTodayFinished = sessions.length > 0 && sessions.every(s => s.status === 'COMPLETED');
    const totalPeriods = sessions.reduce((acc, s) => acc + s.periodCount, 0);

    return (
        <div className="px-6">
            {/* Section Header - Responsive Wrap and Alignment */}
            <div className="flex flex-wrap items-center justify-between gap-y-1 mb-3">
                <div className="flex items-center gap-2">
                    <Play
                        size={12}
                        fill="currentColor"
                        className={!isTodayFinished ? "text-blue-600 dark:text-blue-500" : "text-slate-400"}
                    />
                    <h2 className={`text-[12px] font-black uppercase tracking-wider ${!isTodayFinished
                        ? "text-blue-600 dark:text-blue-500"
                        : "text-slate-700 dark:text-slate-300"
                        }`}>
                        {isTodayFinished
                            ? `Đã hoàn thành ${sessions.length} buổi, ${totalPeriods} tiết`
                            : `Hôm nay có ${sessions.length} buổi, ${totalPeriods} tiết`
                        }
                    </h2>
                </div>

                {/* Status Badges - Always right-aligned, even on wrap */}
                {!isTodayFinished && (
                    <div className="flex items-center gap-2 text-xs ml-auto">
                        {liveCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold animate-pulse">
                                {liveCount} LIVE
                            </span>
                        )}
                        {pendingCount > 0 && (
                            <span className="text-slate-400 font-medium whitespace-nowrap">
                                {pendingCount} sắp tới
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Cards Content */}
            <div className="space-y-3">
                {/* 1. Active & Pending Sessions (Individual Cards) */}
                {activeSessions.map((session, idx) => (
                    <SessionCard
                        key={`${session.courseCode}-${idx}`}
                        session={session}
                        status={session.status}
                        overrides={overrides}
                        abbreviations={abbreviations}
                    />
                ))}

                {/* 2. Completed Sessions (Consolidated List Card) */}
                {completedSessions.length > 0 && (
                    <div className="bg-slate-50/80 dark:bg-slate-900/60 border-2 border-slate-400 dark:border-slate-500 rounded-2xl p-5 mt-6 shadow-sm">
                        {!isTodayFinished && (
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                {t('common.completed', { defaultValue: 'Đã hoàn thành' })}
                            </h3>
                        )}
                        <div className="space-y-4">
                            {completedSessions.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    {/* Time Block - Very close to subject */}
                                    <div className="flex items-center gap-1 font-bold shrink-0 min-w-[78px] text-[12px]">
                                        <span className="text-slate-500 dark:text-slate-400">{s.startTimeStr}</span>
                                        <span className="text-slate-300 dark:text-slate-700 font-light">/</span>
                                        <span className="text-slate-400 dark:text-slate-500 font-medium">{s.endTimeStr}</span>
                                    </div>

                                    {/* Subject - Primary Focus */}
                                    <div className="flex-1 min-w-0">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400 truncate block">
                                            {abbreviations[s.courseName] || s.courseName}
                                        </span>
                                    </div>

                                    {/* Class & Group - Unified Right Aligned */}
                                    <div className="shrink-0 text-right ml-2">
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
                                            {s.className} <span className="opacity-70">({s.group})</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(SessionList);
