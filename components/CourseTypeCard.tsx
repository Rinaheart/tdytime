import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListChecks, ChevronUp, ChevronDown, Check, Save } from 'lucide-react';
import { AggregatedCourse, CourseType } from '../types';

interface CourseTypeCardProps {
    allCourses: AggregatedCourse[];
    overrides: Record<string, CourseType>;
    onSave: (o: Record<string, CourseType>) => void;
    onSuccess: (msg: string) => void;
}

type SortField = 'code' | 'name' | 'classes' | 'groups';

const CourseTypeCard: React.FC<CourseTypeCardProps> = ({
    allCourses,
    overrides,
    onSave,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [tempOverrides, setTempOverrides] = useState<Record<string, CourseType>>(overrides);
    const [sortField, setSortField] = useState<SortField>('code');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setTempOverrides(overrides);
    }, [overrides]);

    const sortedCourses = useMemo(() => {
        return [...allCourses].sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (Array.isArray(valA)) valA = valA.join(', ');
            if (Array.isArray(valB)) valB = valB.join(', ');
            const comparison = (valA as string).localeCompare(valB as string);
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [allCourses, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortOrder('asc'); }
    };

    const handleSetAll = (type: CourseType) => {
        const newOverrides = { ...tempOverrides };
        allCourses.forEach(c => { newOverrides[c.code] = type; });
        setTempOverrides(newOverrides);
    };

    const handleSave = () => {
        onSave(tempOverrides);
        onSuccess(t('settings.toast.courseTypeSaved'));
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />;
        return sortOrder === 'asc' ? <ChevronUp size={12} className="text-blue-500" /> : <ChevronDown size={12} className="text-blue-500" />;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <ListChecks size={20} className="text-blue-600" /> {t('settings.courseType.title')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{t('settings.courseType.description')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSetAll(CourseType.LT)}
                        className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors flex items-center gap-2"
                    >
                        <ListChecks size={14} /> {t('settings.courseType.setAllLT')}
                    </button>
                    <button
                        onClick={() => handleSetAll(CourseType.TH)}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-2"
                    >
                        <ListChecks size={14} /> {t('settings.courseType.setAllTH')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar max-h-[400px]">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase w-12 text-center">STT</th>
                            {[
                                { id: 'code', label: t('settings.courseType.code') },
                                { id: 'name', label: t('settings.courseType.course') },
                                { id: 'classes', label: t('settings.courseType.class') },
                                { id: 'groups', label: t('settings.courseType.group') }
                            ].map(col => (
                                <th
                                    key={col.id}
                                    onClick={() => handleSort(col.id as SortField)}
                                    className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex items-center gap-2">{col.label} <SortIcon field={col.id as SortField} /></div>
                                </th>
                            ))}
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase text-center w-20">LT</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase text-center w-20">TH</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sortedCourses.map((c, idx) => {
                            const currentType = tempOverrides[c.code] || (c.code.includes('-LT') ? CourseType.LT : CourseType.TH);
                            const isLT = currentType === CourseType.LT;
                            return (
                                <tr
                                    key={c.code}
                                    className={`transition-colors duration-150 ${isLT ? 'bg-teal-50/40 dark:bg-teal-900/10' : 'bg-emerald-50/40 dark:bg-emerald-900/10'}`}
                                >
                                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{c.code}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{c.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{c.classes.join(', ')}</td>
                                    <td className="px-4 py-3 text-slate-500">{c.groups.join(', ')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setTempOverrides({ ...tempOverrides, [c.code]: CourseType.LT })}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto ${isLT ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {isLT && <Check size={16} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setTempOverrides({ ...tempOverrides, [c.code]: CourseType.TH })}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto ${!isLT ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                        >
                                            {!isLT && <Check size={16} />}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={handleSave}
                    className="px-6 h-11 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} /> {t('common.save')}
                </button>
            </div>
        </div>
    );
};


export default CourseTypeCard;
