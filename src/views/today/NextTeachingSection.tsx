/**
 * NextTeachingSection — Preview of the next teaching day.
 * Displays date, session count, and preview of first 2 sessions.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '@/core/stores';
import { getPeriodTimes } from '@/core/constants';
import type { CourseSession } from '@/core/schedule/schedule.types';
import type { NextTeachingInfo, DisplayState } from './useTodayData';

interface NextTeachingSectionProps {
    nextTeaching: NextTeachingInfo;
    displayState: DisplayState;
    isTodayFinished: boolean;
    isWeekEmpty?: boolean;
}

const getTimeStr = (session: CourseSession) => {
    const startP = parseInt(session.timeSlot.split('-')[0]);
    const times = getPeriodTimes(session.type);
    const periodStart = times[startP];
    return periodStart ? `${String(periodStart.start[0]).padStart(2, '0')}:${String(periodStart.start[1]).padStart(2, '0')}` : '07:00';
};

const NextTeachingSection: React.FC<NextTeachingSectionProps> = ({ nextTeaching, displayState, isTodayFinished, isWeekEmpty }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const abbreviations = useScheduleStore((s) => s.abbreviations);
    const setCurrentWeekIndex = useScheduleStore((s) => s.setCurrentWeekIndex);

    const dayNames = [t('days.6'), t('days.0'), t('days.1'), t('days.2'), t('days.3'), t('days.4'), t('days.5')];
    const dayName = dayNames[nextTeaching.date.getDay()];
    const dateStr = `${String(nextTeaching.date.getDate()).padStart(2, '0')}/${String(nextTeaching.date.getMonth() + 1).padStart(2, '0')}/${nextTeaching.date.getFullYear()}`;

    const isBeforeSemester = displayState === 'BEFORE_SEMESTER';
    const isNoSessions = displayState === 'NO_SESSIONS';
    const showHighlight = isTodayFinished || isBeforeSemester || isNoSessions;

    const handleClick = () => {
        setCurrentWeekIndex(nextTeaching.weekIdx);
        if (isWeekEmpty) {
            navigate('/semester', { state: { autoExpandWeek: nextTeaching.weekIdx } });
        } else {
            navigate('/week');
        }
    };

    return (
        <div className="px-2 mt-8">
            <div className="flex items-center gap-2 mb-4">
                <Play size={12} fill="currentColor" className={showHighlight ? 'text-accent-600 dark:text-accent-500' : 'text-slate-400'} />
                <h2 className={`text-[12px] font-black uppercase tracking-wider ${showHighlight ? 'text-accent-600 dark:text-accent-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isBeforeSemester ? t('stats.today.firstOfSemester') : t('stats.today.next')}
                </h2>
            </div>

            <button
                onClick={handleClick}
                className={`w-full text-left rounded-2xl p-5 border-2 transition-all group ${showHighlight
                    ? 'bg-white dark:bg-slate-900 border-accent-600 dark:border-accent-500 shadow-lg shadow-accent-500/10 ring-1 ring-accent-500/10'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-400 dark:border-slate-500'
                    } hover:bg-slate-100 dark:hover:bg-slate-800/50`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-semibold text-accent-600 dark:text-accent-400 mb-1">{dayName}, {dateStr}</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('stats.today.sessionsCount', { count: nextTeaching.sessions.length })}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:bg-accent-500 group-hover:border-accent-500 group-hover:text-white transition-all text-slate-400 dark:text-slate-500">
                        <ChevronRight size={18} />
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {nextTeaching.sessions.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <Clock size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-600 dark:text-slate-300">{getTimeStr(s)}</span>
                            <span className="text-slate-500 dark:text-slate-400 truncate">{abbreviations[s.courseName] || s.courseName}</span>
                        </div>
                    ))}
                    {nextTeaching.sessions.length > 2 && (
                        <p className="text-xs text-slate-400 pl-7">{t('stats.today.otherSessions', { count: nextTeaching.sessions.length - 2 })}</p>
                    )}
                </div>
            </button>
        </div>
    );
};

export default React.memo(NextTeachingSection);
