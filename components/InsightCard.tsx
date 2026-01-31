import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    statusColor?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, statusColor }) => {
    // Determine gradient based on statusColor presence
    const isWarning = statusColor?.includes('orange') || statusColor?.includes('rose');

    return (
        <div className={`bg-white dark:bg-slate-950/20 p-2 md:p-4 rounded-2xl border ${isWarning ? 'border-orange-500/50 ring-4 ring-orange-500/5' : 'border-slate-200/60 dark:border-slate-800/60'} shadow-sm relative overflow-hidden group transition-all hover:shadow-md flex flex-col items-center text-center justify-center min-h-[85px] md:min-h-[110px]`}>
            {/* Subtle Gradient Accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 blur-3xl -mr-8 -mt-8 md:-mr-12 md:-mt-12 rounded-full opacity-10 transition-colors group-hover:opacity-20 ${isWarning ? 'bg-orange-500' : 'bg-blue-500'}`}></div>

            <div className="relative z-10 flex flex-col items-center gap-1.5 md:gap-2 w-full">
                <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br ${isWarning ? 'from-orange-400 to-rose-500' : 'from-blue-500 to-indigo-600'} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                </div>

                <div className="w-full">
                    <h4 className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 leading-none truncate w-full">{title}</h4>
                    <p className={`text-[10px] md:text-xs font-black tracking-tight ${isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-100'} truncate w-full`}>
                        {value}
                    </p>
                </div>
            </div>

            {/* Subtle Status Bar at the bottom */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-500 ${isWarning ? 'bg-orange-500 w-1/2' : 'bg-blue-500 w-4 group-hover:w-8'}`}></div>
        </div>
    );
};

export default InsightCard;
