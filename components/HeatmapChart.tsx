import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeatmapChartProps {
    data: number[][]; // [weekIndex][dayIndex]
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data }) => {
    const { t } = useTranslation();
    const weekCount = data.length;
    const dayLabels = [
        t('days.0'),
        t('days.1'),
        t('days.2'),
        t('days.3'),
        t('days.4'),
        t('days.5'),
        t('days.6')
    ];

    const getColorClass = (count: number) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-800/50';
        if (count <= 3) return 'bg-blue-200 dark:bg-blue-900/60';
        if (count <= 6) return 'bg-blue-400 dark:bg-blue-700';
        if (count <= 9) return 'bg-blue-600 dark:bg-blue-500';
        return 'bg-indigo-800 dark:bg-indigo-400';
    };

    return (
        <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-max">
                <div className="flex">
                    {/* Y-Axis Labels (Days) */}
                    <div className="flex flex-col gap-1 mr-2 pt-6">
                        {dayLabels.map((label, i) => (
                            <div key={i} className="h-4 text-[10px] font-bold text-slate-400 flex items-center justify-end leading-none">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex flex-col gap-1">
                        {/* X-Axis Labels (Weeks) - Render every 2 or 5 weeks to avoid clutter */}
                        <div className="flex gap-1 h-5 mb-1">
                            {Array.from({ length: weekCount }).map((_, i) => (
                                <div key={i} className="w-4 text-[9px] text-slate-400 text-center flex-shrink-0">
                                    {(i + 1) % 5 === 0 || i === 0 ? i + 1 : ''}
                                </div>
                            ))}
                        </div>

                        {/* Cells */}
                        {Array.from({ length: 7 }).map((_, dayIndex) => (
                            <div key={dayIndex} className="flex gap-1">
                                {data.map((weekData, weekIndex) => {
                                    const count = weekData[dayIndex];
                                    const isWeekend = dayIndex >= 5;
                                    const dayName = t(`days.${dayIndex}`);
                                    const weekLabel = t('common.week');
                                    const periodLabel = t('common.periods').toLowerCase();

                                    return (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className={`w-4 h-4 rounded-sm transition-colors cursor-default group relative 
                                                ${getColorClass(count)}
                                                ${isWeekend && count > 0 ? 'ring-1 ring-inset ring-black/10 dark:ring-white/10' : ''}
                                            `}
                                            title={`${weekLabel} ${weekIndex + 1}, ${dayName}: ${count} ${periodLabel}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 justify-center">
                    <span>{t('stats.heatmap.less')}</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800/50 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900/60 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-400 dark:bg-blue-700 rounded-sm"></div>
                        <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
                        <div className="w-3 h-3 bg-indigo-800 dark:bg-indigo-400 rounded-sm"></div>
                    </div>
                    <span>{t('stats.heatmap.more')}</span>
                </div>
            </div>
        </div>
    );
};


export default HeatmapChart;
