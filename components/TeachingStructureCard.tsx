import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Metrics, CourseType } from '../types';

interface TeachingStructureCardProps {
    metrics: Metrics;
    pieColors: string[];
}

const TeachingStructureCard: React.FC<TeachingStructureCardProps> = ({ metrics, pieColors }) => {
    const { t } = useTranslation();
    const shiftData = [
        { name: t('common.morning'), value: metrics.shiftStats.morning.sessions },
        { name: t('common.afternoon'), value: metrics.shiftStats.afternoon.sessions },
        { name: t('common.evening'), value: metrics.shiftStats.evening.sessions }
    ];

    const ltPercent = Math.round((metrics.typeDistribution[CourseType.LT] / metrics.totalHours) * 100);
    const thPercent = Math.round((metrics.typeDistribution[CourseType.TH] / metrics.totalHours) * 100);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <PieChartIcon size={16} className="text-indigo-600" /> {t('stats.structure.title')}
            </h3>

            {/* Type Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-2">
                    <span>{t('stats.structure.typeLabel')}</span>
                    <span>{ltPercent}% / {thPercent}%</span>
                </div>
                <div className="h-2 w-full flex rounded-full overflow-hidden">
                    <div className="bg-blue-600" style={{ width: `${ltPercent}%` }}></div>
                    <div className="bg-sky-400" style={{ width: `${thPercent}%` }}></div>
                </div>
            </div>

            {/* Shift Pie */}
            <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">{t('stats.structure.shiftLabel')}</p>
                <div className="h-32 mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={shiftData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                {shiftData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-3 text-[10px] font-medium text-slate-500">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span> {t('common.morning')}</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500"></span> {t('common.afternoon')}</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> {t('common.evening')}</div>
                </div>
            </div>
        </div>
    );
};


export default TeachingStructureCard;
