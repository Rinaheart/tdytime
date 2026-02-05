import React from 'react';
import { CalendarDays, Coffee, Sparkles } from 'lucide-react';
import { DisplayState } from '../hooks/useTodayData';

interface EmptyStateCardProps {
    type: DisplayState;
    onAction: (tab: 'WEEK' | 'OVERVIEW') => void;
    daysUntilStart?: number | null;
    t: any;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ type, onAction, daysUntilStart, t }) => {
    const configs: Record<DisplayState, {
        icon: React.ReactNode;
        title: string;
        desc: string | React.ReactNode;
        action?: { label: string; tab: 'WEEK' | 'OVERVIEW' };
        gradient: string;
    }> = {
        'BEFORE_SEMESTER': {
            icon: null,
            title: (daysUntilStart !== undefined && daysUntilStart !== null && daysUntilStart <= 10)
                ? t('stats.today.beforeSemester.titleSoon', { defaultValue: 'Học kỳ mới sắp bắt đầu!' })
                : t('stats.today.beforeSemester.titleLate', { defaultValue: 'Học kỳ mới chưa bắt đầu!' }),
            desc: (
                <div className="flex flex-col items-center">
                    <span className="text-base text-slate-500 dark:text-slate-400 font-medium">
                        {t('stats.today.beforeSemester.preDesc', { defaultValue: 'Bạn có lịch dạy sau' })}
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl font-black text-blue-600 dark:text-blue-500">
                            {daysUntilStart !== undefined && daysUntilStart !== null ? String(daysUntilStart).padStart(2, '0') : '--'}
                        </span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {t('common.days', { defaultValue: 'ngày' })}
                        </span>
                    </div>
                </div>
            ),
            gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
        },
        'AFTER_SEMESTER': {
            icon: <CalendarDays size={32} className="text-slate-400" />,
            title: t('stats.today.afterSemester.title', { defaultValue: 'Kết thúc học kỳ' }),
            desc: t('stats.today.afterSemester.desc', { defaultValue: 'Học kỳ đã kết thúc. Xem lại tổng quan!' }),
            action: { label: t('stats.today.afterSemester.action', { defaultValue: 'Xem tổng quan' }), tab: 'OVERVIEW' },
            gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20'
        },
        'NO_DATA': {
            icon: <CalendarDays size={32} className="text-slate-300" />,
            title: t('stats.today.noData.title', { defaultValue: 'Chưa có dữ liệu' }),
            desc: t('stats.today.noData.desc', { defaultValue: 'Tải file lịch giảng để bắt đầu.' }),
            gradient: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20'
        },
        'NO_SESSIONS': {
            icon: <Coffee size={48} className="text-orange-400/80" />,
            title: (
                <>
                    Hôm nay là ngày nghỉ <span className="whitespace-nowrap">của bạn!</span>
                </>
            ),
            desc: '',
            gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10'
        },
        'HAS_SESSIONS': {
            icon: null,
            title: '',
            desc: '',
            gradient: ''
        }
    };

    const config = configs[type];
    if (!config || type === 'HAS_SESSIONS') return null;

    return (
        <div className="px-5">
            <div className={`
                bg-gradient-to-br ${config.gradient}
                rounded-3xl p-8 text-center
                border border-slate-100 dark:border-slate-800
                flex flex-col items-center justify-center
                min-h-[220px] transition-all
            `}>
                {config.icon && (
                    type === 'NO_SESSIONS' ? (
                        <div className="mb-4 animate-bounce duration-[3000ms]">
                            {config.icon}
                        </div>
                    ) : (
                        <div className="w-10 h-10 mb-3 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                            {React.cloneElement(config.icon as React.ReactElement, { size: 20 })}
                        </div>
                    )
                )}

                <h3 className={`text-base font-bold mb-0.5 ${type === 'BEFORE_SEMESTER' && daysUntilStart !== null && daysUntilStart !== undefined && daysUntilStart <= 10
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-800 dark:text-slate-200'
                    }`}>
                    {config.title}
                </h3>

                <div className="mb-3">
                    {config.desc}
                </div>

                {config.action && (
                    <button
                        onClick={() => onAction(config.action!.tab)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
                    >
                        {config.action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(EmptyStateCard);
