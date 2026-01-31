import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';

interface ProgressStat {
    percent: number;
    done: number;
    total: number;
}

interface ProgressCardProps {
    progress: {
        today: ProgressStat;
        week: ProgressStat;
        month: ProgressStat;
        semester: ProgressStat;
    };
    currentDate: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ progress, currentDate }) => {
    const { t } = useTranslation();

    const stats = [
        { label: t('stats.today.progressDay'), val: progress.today, color: 'bg-blue-400' },
        { label: t('stats.today.progressWeek'), val: progress.week, color: 'bg-indigo-400' },
        { label: t('stats.today.progressMonth'), val: progress.month, color: 'bg-violet-400' },
        { label: t('stats.today.progressSemester'), val: progress.semester, color: 'bg-fuchsia-400' }
    ];

    return (
        <div className="bg-slate-900 dark:bg-slate-900/60 rounded-2xl p-5 text-white shadow-lg space-y-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-200">
                    <TrendingUp size={14} className="shrink-0" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Tiến độ</h3>
                </div>
                <span className="text-[9px] font-bold text-slate-500 tracking-tighter">{currentDate}</span>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-around">
                {stats.map((p, i) => {
                    const hasSchedule = p.val.total > 0;
                    return (
                        <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-end">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${hasSchedule ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {p.label}
                                </span>
                                <span className={`text-xs font-black ${hasSchedule ? '' : 'text-slate-600'}`}>
                                    {hasSchedule ? (
                                        <>
                                            {p.val.percent}%
                                            <span className="text-[9px] opacity-40 ml-1.5">({p.val.done}/{p.val.total})</span>
                                        </>
                                    ) : '—'}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                {hasSchedule && (
                                    <div
                                        className={`h-full ${p.color} transition-all duration-1000 shadow-[0_0_8px_rgba(129,140,248,0.3)]`}
                                        style={{ width: `${p.val.percent}%` }}
                                    ></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressCard;
