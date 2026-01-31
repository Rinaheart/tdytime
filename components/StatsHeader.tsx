import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Calendar, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Metadata, Metrics } from '../types';

interface StatsHeaderProps {
    metadata: Metadata;
    metrics: Metrics;
}

const StatsHeader: React.FC<StatsHeaderProps> = ({ metadata, metrics }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-4 md:p-6 rounded-2xl shadow-lg border border-blue-500/30 relative overflow-hidden">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all group"
                title={isExpanded ? t('common.close') : t('common.viewDetails')}
            >
                {isExpanded ? <EyeOff size={14} className="opacity-70 group-hover:opacity-100" /> : <Eye size={14} className="opacity-70 group-hover:opacity-100" />}
            </button>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                        <User size={20} md:size={24} className="text-blue-100" />
                    </div>
                    <div className="min-w-0 flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20 shadow-inner">
                        <h2 className="text-lg md:text-xl font-black uppercase tracking-tight truncate mb-1">{metadata.teacher}</h2>
                        <div className="flex gap-3 text-blue-100 text-[10px] md:text-xs font-bold opacity-70">
                            <span className="flex items-center gap-1"><Briefcase size={10} /> {t('nav.semester')} {metadata.semester}</span>
                            <span className="flex items-center gap-1"><Calendar size={10} /> {metadata.academicYear}</span>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="flex flex-row gap-1.5 md:gap-2 w-full md:w-auto justify-between md:justify-end overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="px-2 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[65px] md:min-w-[80px] flex-1 md:flex-none">
                            <div className="text-lg md:text-2xl font-black leading-none">{metrics.totalHours}</div>
                            <div className="text-[8px] md:text-[9px] uppercase font-bold text-blue-200 truncate">{t('common.periods')}</div>
                        </div>
                        <div className="px-2 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[65px] md:min-w-[80px] flex-1 md:flex-none">
                            <div className="text-lg md:text-2xl font-black leading-none">{metrics.totalSessions}</div>
                            <div className="text-[8px] md:text-[9px] uppercase font-bold text-blue-200 truncate">{t('common.sessions')}</div>
                        </div>
                        <div className="px-2 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[65px] md:min-w-[80px] flex-1 md:flex-none">
                            <div className="text-lg md:text-2xl font-black leading-none">{metrics.totalWeeks}</div>
                            <div className="text-[8px] md:text-[9px] uppercase font-bold text-blue-200 truncate">{t('common.weeks')}</div>
                        </div>

                        {metrics.totalConflicts > 0 && (
                            <div className="px-2 py-1.5 md:px-4 md:py-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/50 text-center min-w-[65px] md:min-w-[80px] flex-1 md:flex-none animate-pulse">
                                <div className="text-lg md:text-2xl font-black leading-none text-red-200">{metrics.totalConflicts}</div>
                                <div className="text-[8px] md:text-[9px] uppercase font-bold text-red-300 truncate">{t('common.conflicts', { defaultValue: 'Conflicts' })}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default StatsHeader;
