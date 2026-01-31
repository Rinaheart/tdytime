import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

interface CoTeacher {
    name: string;
    periods: number;
    subjects: string[];
}

interface CoTeachersTableProps {
    coTeachers: CoTeacher[];
}

const CoTeachersTable: React.FC<CoTeachersTableProps> = ({ coTeachers }) => {
    const { t } = useTranslation();
    if (coTeachers.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={16} className="text-indigo-500" /> {t('stats.coTeachers.title')}
            </h3>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
                {coTeachers.map((ct, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-start">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{ct.name}</span>
                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">{ct.periods} <span className="text-[10px] uppercase font-bold text-slate-400">{t('common.periods')}</span></span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic leading-snug">
                            {ct.subjects.join(', ')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 font-bold rounded-tl-lg">{t('stats.coTeachers.teacher')}</th>
                            <th className="px-4 py-3 font-bold text-center">{t('stats.coTeachers.periods')}</th>
                            <th className="px-4 py-3 font-bold rounded-tr-lg">{t('stats.coTeachers.subjects')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {coTeachers.map((t, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{t.name}</td>
                                <td className="px-4 py-3 text-center font-black text-blue-600 dark:text-blue-400">{t.periods}</td>
                                <td className="px-4 py-3 text-slate-500 text-xs italic">{t.subjects.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};


export default CoTeachersTable;
