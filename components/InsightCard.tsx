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
        <div className={`bg-white dark:bg-slate-950/20 p-4 rounded-2xl border ${isWarning ? 'border-orange-500/50 ring-4 ring-orange-500/5' : 'border-slate-200/60 dark:border-slate-800/60'} shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}>
            {/* Subtle Gradient Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 rounded-full opacity-10 transition-colors group-hover:opacity-20 ${isWarning ? 'bg-orange-500' : 'bg-blue-500'}`}></div>

            <div className="relative z-10 flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isWarning ? 'from-orange-400 to-rose-500 shadow-orange-500/20' : 'from-blue-500 to-indigo-600 shadow-blue-500/20'} flex items-center justify-center text-white shadow-lg`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>

                <div>
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 leading-none">{title}</h4>
                    <p className={`text-sm md:text-base font-black tracking-tight ${isWarning ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {value}
                    </p>
                </div>
            </div>

            {/* Status Indicator Bar */}
            <div className={`absolute bottom-0 left-0 h-1 rounded-full transition-all duration-500 ${isWarning ? 'bg-orange-500 w-full' : 'bg-blue-500 w-1/3 group-hover:w-1/2'}`}></div>
        </div>
    );
};

export default InsightCard;
