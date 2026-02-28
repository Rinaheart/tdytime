import React from 'react';

type BadgeVariant = 'live' | 'pending' | 'completed' | 'morning' | 'afternoon' | 'evening' | 'theory' | 'practice' | 'warning' | 'info' | 'default';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
    /** Show pulsing dot indicator */
    dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    pending: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    morning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    afternoon: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    evening: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    theory: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    practice: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    warning: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800',
    default: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const DOT_COLORS: Partial<Record<BadgeVariant, string>> = {
    live: 'bg-emerald-500',
    warning: 'bg-red-500',
    pending: 'bg-blue-500',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '', dot }) => (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-lg ${VARIANT_CLASSES[variant]} ${className}`}>
        {dot && (
            <span className="relative flex h-1.5 w-1.5">
                {(variant === 'live') && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${DOT_COLORS[variant] || 'bg-current'}`} />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${DOT_COLORS[variant] || 'bg-current'}`} />
            </span>
        )}
        {children}
    </span>
);

export default Badge;
