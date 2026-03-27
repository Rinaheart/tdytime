/**
 * WeekAccordion — Collapsible week section for SemesterView.
 * Uses Shared UI (WeekTableLayout, WeekCardLayout) to guarantee consistency.
 * 100% compliant with React.memo pattern for optimization.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import type { WeekSchedule, CourseType } from '@/core/schedule/schedule.types';
import { isCurrentWeek as checkIsCurrentWeek, isPastWeek as checkIsPastWeek } from '@/core/schedule/schedule.utils';
import WeekTableLayout from '../shared/WeekTableLayout';
import WeekCardLayout from '../shared/WeekCardLayout';

interface WeekAccordionProps {
    week: WeekSchedule;
    weekIdx: number;
    isExpanded: boolean;
    onToggle: () => void;
    showTeacher: boolean;
    viewMode: 'horizontal' | 'vertical';
    now: Date;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
}

const formatDateRange = (range: string) => {
    const dates = range.match(/\d{2}\/\d{2}\/\d{4}/g);
    if (dates && dates.length >= 2) return `${dates[0]} → ${dates[1]}`;
    return range;
};

const WeekAccordion: React.FC<WeekAccordionProps> = ({ 
    week, weekIdx, isExpanded, onToggle, showTeacher, viewMode, now, overrides, abbreviations 
}) => {
    const { t } = useTranslation();

    const isCurrent = checkIsCurrentWeek(week.dateRange, now);
    const isPast = checkIsPastWeek(week.dateRange, now);

    if (viewMode === 'vertical') {
        return (
            <div
                id={`week-card-${weekIdx}`}
                className={`relative z-10 bg-white dark:bg-slate-900 rounded-2xl border ${isCurrent ? 'border-accent-500 dark:border-accent-500 ring-2 ring-accent-500/20 shadow-sm' : 'border-slate-200/60 dark:border-slate-800/60 shadow-sm'} overflow-hidden transition-all duration-300`}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '100px 500px' }}
            >
                {/* Timeline dot */}
                <div className={`absolute left-4 md:left-[20px] top-6 w-2 h-2 rounded-full z-20 ${isCurrent ? 'bg-accent-500 ring-4 ring-accent-100 dark:ring-accent-900/40' : isPast ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-800'}`} />

                {/* Header */}
                <button onClick={onToggle} className={`w-full flex items-center justify-between p-3 md:p-4 text-left transition-colors ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'}`}>
                    <div className="flex items-center gap-4 pl-6 md:pl-8">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-lg md:text-xl shadow-sm tracking-tighter shrink-0 ${isCurrent ? 'bg-accent-600 text-white shadow-accent-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                            {week.weekNumber}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className={`text-base md:text-lg font-black uppercase tracking-tight leading-none ${isCurrent ? 'text-accent-600 dark:text-accent-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {t('weekly.week', { number: week.weekNumber })}
                                </h4>
                                {isCurrent && <span className="px-1.5 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-[8px] font-black uppercase tracking-widest animate-pulse">{t('common.current')}</span>}
                            </div>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-num font-bold tracking-tight">{formatDateRange(week.dateRange)}</p>
                        </div>
                    </div>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-slate-300 dark:text-slate-600" />
                    </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-3 md:p-6 border-t border-slate-100 dark:border-slate-800/60">
                            {/* We use WeekCardLayout directly so Semester vertical matches Weekly vertical perfectly */}
                            <WeekCardLayout 
                                week={week} 
                                now={now} 
                                overrides={overrides} 
                                abbreviations={abbreviations} 
                                showTeacher={showTeacher} 
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── HORIZONTAL TABLE MODE ───
    return (
        <div id={`week-card-${weekIdx}`} className="relative group/week" style={{ contentVisibility: 'auto', containIntrinsicSize: '1024px 500px' }}>
            <button onClick={onToggle} className="w-full flex items-center justify-between mb-4 pl-2 text-left group/header">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${isCurrent ? 'bg-accent-600 text-white shadow-lg shadow-accent-500/30 ring-2 ring-accent-100 dark:ring-accent-900/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/header:bg-slate-200 dark:group-hover/header:bg-slate-700'}`}>
                        {week.weekNumber}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-black uppercase tracking-tight ${isCurrent ? 'text-accent-600 dark:text-accent-400' : 'text-slate-800 dark:text-slate-100 group-hover/header:text-accent-600'}`}>
                                {t('weekly.week', { number: week.weekNumber })}
                            </h4>
                            {isCurrent && <span className="px-1.5 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-[8px] font-black uppercase tracking-[0.15em] animate-pulse">{t('common.current')}</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-num font-bold">{formatDateRange(week.dateRange)}</p>
                    </div>
                </div>
                <div className={`mr-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
            </button>

            {isExpanded && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <WeekTableLayout 
                        week={week} 
                        now={now} 
                        overrides={overrides} 
                        abbreviations={abbreviations} 
                        showTeacher={showTeacher} 
                    />
                </div>
            )}
        </div>
    );
};

export default React.memo(WeekAccordion);
