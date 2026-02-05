import React from 'react';
import { useTranslation } from 'react-i18next';

interface TodayHeaderProps {
    dayOfWeekIdx: number;
    dateInfo: {
        day: string;
        month: string;
        year: number;
    };
    greeting: string;
}

const TodayHeader: React.FC<TodayHeaderProps> = ({
    dayOfWeekIdx,
    dateInfo,
    greeting
}) => {
    const { t } = useTranslation();

    return (
        <header className="px-6 pt-0 pb-4">
            {/* Day of Week - Small CAPS */}
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0">
                {t(`days.${dayOfWeekIdx}`)}
            </p>

            {/* Date Group - Precision Alignment */}
            <div className="flex items-end gap-2.5 select-none">
                <div className="relative">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8]">
                        {dateInfo.day}
                    </h1>
                </div>

                {/* Right Column: Adjusted to 38px to increase gap between Month and Year */}
                <div className="flex flex-col justify-between h-[32px] items-end">
                    {/* Month - Bold 18px */}
                    <div className="flex items-center text-[20px] font-bold leading-none text-slate-400 dark:text-slate-500 tracking-tight">
                        <span className="font-light opacity-50 mr-0.5 text-[0.9em]">/</span>
                        <span>{dateInfo.month}</span>
                    </div>

                    {/* Year - Bold & Pale (Secondary) */}
                    <div className="text-[14px] font-bold leading-none text-slate-300 dark:text-slate-600 tracking-wide">
                        {dateInfo.year}
                    </div>
                </div>
            </div>

            {/* Greeting */}
            <p className="mt-6 text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                {greeting}
            </p>
        </header>
    );
};

export default React.memo(TodayHeader);
