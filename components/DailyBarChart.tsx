import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyBarChartProps {
    data: { name: string; value: number }[];
    color: string;
}

const DailyBarChart: React.FC<DailyBarChartProps> = ({ data, color }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">{t('stats.trend.daily')}</h4>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


export default DailyBarChart;
