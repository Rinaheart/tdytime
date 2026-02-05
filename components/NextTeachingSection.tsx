import React from 'react';
import { ChevronRight, Clock, Play } from 'lucide-react';
import { CourseSession, CourseType } from '../types';
import { NextTeachingInfo } from '../hooks/useTodayData';
import { PERIOD_TIMES } from '../constants';

interface NextTeachingSectionProps {
    nextTeaching: NextTeachingInfo;
    abbreviations: Record<string, string>;
    overrides: Record<string, CourseType>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
    isBeforeSemester?: boolean;
    isTodayFinished?: boolean;
    isNoSessionsToday?: boolean;
    t: any;
}

const getTimeStr = (session: CourseSession) => {
    const startP = parseInt(session.timeSlot.split('-')[0]);
    const periodStart = PERIOD_TIMES[startP];
    return periodStart
        ? `${String(periodStart.start[0]).padStart(2, '0')}:${String(periodStart.start[1]).padStart(2, '0')}`
        : "07:00";
};

const NextTeachingSection: React.FC<NextTeachingSectionProps> = ({
    nextTeaching,
    abbreviations,
    overrides,
    onSwitchTab,
    setCurrentWeekIndex,
    isBeforeSemester = false,
    isTodayFinished = false,
    isNoSessionsToday = false,
    t
}) => {
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[nextTeaching.date.getDay()];
    const dateStr = `${String(nextTeaching.date.getDate()).padStart(2, '0')}/${String(nextTeaching.date.getMonth() + 1).padStart(2, '0')}/${nextTeaching.date.getFullYear()}`;

    // Highlight means Blue Play icon
    const showHighlight = isTodayFinished || isBeforeSemester || isNoSessionsToday;

    return (
        <div className="px-6 mt-8">
            {/* Section Header - Synchronized with SessionList */}
            <div className="flex items-center gap-2 mb-4">
                <Play
                    size={12}
                    fill="currentColor"
                    className={showHighlight ? "text-blue-600 dark:text-blue-500" : "text-slate-400"}
                />
                <h2 className={`text-[12px] font-black uppercase tracking-wider ${showHighlight
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-slate-700 dark:text-slate-300"
                    }`}>
                    {isBeforeSemester
                        ? t('stats.today.firstOfSemester', { defaultValue: 'Lịch giảng đầu kỳ' })
                        : t('stats.today.next', { defaultValue: 'Lịch giảng tiếp theo' })
                    }
                </h2>
            </div>

            {/* Card */}
            <button
                onClick={() => {
                    setCurrentWeekIndex(nextTeaching.weekIdx);
                    onSwitchTab('WEEK');
                }}
                className={`w-full text-left rounded-2xl p-5 border-2 transition-all group ${showHighlight
                    ? "bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/10"
                    : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-400 dark:border-slate-500"
                    } hover:bg-slate-100 dark:hover:bg-slate-800/50`}
            >
                <div className="flex items-start justify-between">
                    <div>
                        {/* Date */}
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            {dayName}, {dateStr}
                        </p>

                        {/* Session Count */}
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {nextTeaching.sessions.length} buổi giảng
                        </p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white transition-all text-slate-400 dark:text-slate-500">
                        <ChevronRight size={18} />
                    </div>
                </div>

                {/* Preview Sessions */}
                <div className="mt-4 space-y-2">
                    {nextTeaching.sessions.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <Clock size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                                {getTimeStr(s)}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 truncate">
                                {abbreviations[s.courseName] || s.courseName}
                            </span>
                        </div>
                    ))}
                    {nextTeaching.sessions.length > 2 && (
                        <p className="text-xs text-slate-400 pl-7">
                            +{nextTeaching.sessions.length - 2} buổi khác
                        </p>
                    )}
                </div>
            </button>
        </div>
    );
};

export default React.memo(NextTeachingSection);
