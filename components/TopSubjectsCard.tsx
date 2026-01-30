import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';

interface TopSubjectsCardProps {
    subjects: { name: string; value: number }[];
}

const TopSubjectsCard: React.FC<TopSubjectsCardProps> = ({ subjects }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={16} className="text-slate-600" /> {t('stats.topSubjects')}
            </h3>
            <div className="space-y-3">
                {subjects.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold w-4 text-slate-300">#{i + 1}</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={s.name}>{s.name}</span>
                        </div>
                        <div className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{s.value}{t('common.periods').toLowerCase().charAt(0)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default TopSubjectsCard;
