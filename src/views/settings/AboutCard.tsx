/**
 * AboutCard — Settings sub-component
 * Period standards and changelog timeline. App identity moved to SettingsView header.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Clock } from 'lucide-react';

const AboutCard: React.FC = () => {
    const { t } = useTranslation();
    const changeLog = t('about.history', { returnObjects: true }) as Array<{ version: string; date: string; changes: string[] }>;

    return (
        <div className="space-y-6">
            {/* Period Standards */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Clock size={16} className="text-accent-500" /> {t('about.periodStandards')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {([
                        { key: 'morning', color: 'blue', periods: [[1, '07:00 - 07:45'], [2, '07:55 - 08:40'], [3, '08:50 - 09:35'], [4, '09:45 - 10:30']] },
                        { key: 'afternoon', color: 'sky', periods: [[6, '13:30 - 14:15'], [7, '14:25 - 15:10'], [8, '15:20 - 16:05'], [9, '16:15 - 17:00']] },
                        { key: 'evening', color: 'indigo', periods: [[11, '17:10 - 17:55'], [12, '18:00 - 18:45'], [13, '18:50 - 19:35']] },
                    ] as const).map(({ key, color, periods }) => (
                        <div key={key} className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <h4 className={`text-[10px] font-black text-${color}-700 uppercase tracking-widest border-l-2 border-${color}-600 pl-2`}>{t(`about.${key}`)}</h4>
                            <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                                {periods.map(([num, time]) => (
                                    <li key={num} className="flex justify-between">
                                        <span>{t('weekly.period', { number: num })}:</span> <span>{time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] italic text-slate-500 dark:text-slate-400">
                    {t('about.note')}
                </div>
            </div>

            {/* Changelog */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ClipboardList size={16} className="text-accent-500" /> {t('about.changelog')}
                </h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                    {Array.isArray(changeLog) && changeLog.map((log) => (
                        <div key={log.version} className="relative pl-6 border-l border-slate-200 dark:border-slate-800">
                            <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-accent-500 shadow-sm" />
                            <div className="mb-2 flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-white">{log.version}</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase">{log.date}</span>
                            </div>
                            <ul className="space-y-1">
                                {Array.isArray(log.changes) && log.changes.map((change, i) => (
                                    <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-accent-500/30 mt-1.5 shrink-0" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutCard;
