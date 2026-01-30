import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    statusColor?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, statusColor }) => {
    return (
        <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl border-2 shadow-sm flex items-center gap-3 transition-colors ${statusColor || 'border-slate-100 dark:border-slate-800'}`}>
            <div className={`p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shrink-0`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{title}</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight mt-0.5">{value}</p>
            </div>
        </div>
    );
};

export default InsightCard;
