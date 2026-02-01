import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';
import HeatmapChart from './HeatmapChart';

interface HeatmapCardProps {
    heatmapData: number[][];
}

const HeatmapCard: React.FC<HeatmapCardProps> = ({ heatmapData }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full min-h-[340px]">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <LayoutGrid size={16} className="text-blue-600" /> {t('stats.heatmapTitle')}
            </h3>

            <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                <HeatmapChart data={heatmapData} />
            </div>
        </div>
    );
};

export default HeatmapCard;
