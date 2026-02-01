import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

interface TopSubjectsCardProps {
    subjects: { name: string; value: number }[];
    abbreviations?: Record<string, string>;
}

const TopSubjectsCard: React.FC<TopSubjectsCardProps> = ({ subjects, abbreviations = {} }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Layers size={16} className="text-blue-600" /> {t('stats.topSubjects')}
            </h3>
            <div className="flex-1 flex flex-col justify-between gap-4">
                {subjects.slice(0, 5).map((s, i) => {
                    const maxVal = subjects[0]?.value || 1;
                    const percent = (s.value / maxVal) * 100;

                    // Logic màu sắc Blue tone
                    const rankColor = i === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        i === 1 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            i === 2 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                'bg-transparent text-slate-400';

                    const barColor = i === 0 ? 'bg-blue-600' :
                        i === 1 ? 'bg-blue-500' :
                            i === 2 ? 'bg-blue-400' : 'bg-slate-300 dark:bg-slate-700';

                    return (
                        <div key={i} className="group w-full">
                            <div className="flex items-center justify-between mb-1.5 w-full">
                                {/* Left side: Rank + Name (Flex-1 to take available space) */}
                                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                                    <span className={`text-[11px] font-black w-6 h-6 shrink-0 flex items-center justify-center rounded-full ${rankColor}`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={s.name}>
                                        {abbreviations[s.name] || s.name}
                                    </span>
                                </div>

                                {/* Right side: Value only (No 'tiết') */}
                                <span className="text-sm font-black text-blue-700 dark:text-blue-400 shrink-0">
                                    {s.value}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopSubjectsCard;
