import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Calendar } from 'lucide-react';
import { Metadata, Metrics } from '../types';

interface StatsHeaderProps {
    metadata: Metadata;
    metrics: Metrics;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ metadata, metrics }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 rounded-2xl shadow-lg border border-blue-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User size={24} className="text-blue-100" />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">{metadata.teacher}</h2>
                    <div className="flex gap-3 text-blue-100 text-xs font-medium opacity-80">
                        <span className="flex items-center gap-1"><Briefcase size={10} /> {metadata.semester}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {metadata.academicYear}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[80px]">
                    <div className="text-2xl font-black leading-none">{metrics.totalHours}</div>
                    <div className="text-[9px] uppercase font-bold text-blue-200">{t('common.periods')}</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[80px]">
                    <div className="text-2xl font-black leading-none">{metrics.totalSessions}</div>
                    <div className="text-[9px] uppercase font-bold text-blue-200">{t('common.sessions')}</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[80px]">
                    <div className="text-2xl font-black leading-none">{metrics.totalWeeks}</div>
                    <div className="text-[9px] uppercase font-bold text-blue-200">{t('common.weeks')}</div>
                </div>

                {metrics.totalConflicts > 0 && (
                    <div className="px-4 py-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/50 text-center min-w-[80px] animate-pulse">
                        <div className="text-2xl font-black leading-none text-red-200">{metrics.totalConflicts}</div>
                        <div className="text-[9px] uppercase font-bold text-red-300">{t('common.conflicts', { defaultValue: 'Conflicts' })}</div>
                    </div>
                )}
            </div>

        </div>
    );
};


export default StatsHeader;
