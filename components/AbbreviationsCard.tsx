import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, RotateCcw, Wand2, Save } from 'lucide-react';

interface AbbreviationsCardProps {
    uniqueSubjects: string[];
    abbreviations: Record<string, string>;
    onSave: (a: Record<string, string>) => void;
    onSuccess: (msg: string) => void;
}

const AbbreviationsCard: React.FC<AbbreviationsCardProps> = ({
    uniqueSubjects,
    abbreviations,
    onSave,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [tempAbbreviations, setTempAbbreviations] = useState<Record<string, string>>(abbreviations);

    useEffect(() => {
        setTempAbbreviations(abbreviations);
    }, [abbreviations]);

    const suggestAbbreviations = () => {
        const newAbbr = { ...tempAbbreviations };
        uniqueSubjects.forEach(name => {
            const abbr = name.split(' ').map(part => {
                if (part === '-' || part === '&') return part;
                if (/^[A-ZĐ0-9]{2,}$/.test(part)) return part;
                if (part.startsWith('(') && part.endsWith(')')) return part;
                return part.charAt(0).toUpperCase();
            }).join('');

            if (!newAbbr[name]) {
                newAbbr[name] = abbr;
            }
        });
        setTempAbbreviations(newAbbr);
        onSuccess(t('settings.toast.abbreviationsSuggested'));
    };

    const resetAbbreviations = () => {
        setTempAbbreviations({});
        onSuccess(t('settings.toast.abbreviationsReset'));
    };

    const handleSave = () => {
        onSave(tempAbbreviations);
        onSuccess(t('settings.toast.abbreviationsSaved'));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Type size={20} className="text-cyan-600" /> {t('settings.abbreviations.title')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{t('settings.abbreviations.description')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetAbbreviations}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={14} /> {t('settings.abbreviations.reset')}
                    </button>
                    <button
                        onClick={suggestAbbreviations}
                        className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-2"
                    >
                        <Wand2 size={14} /> {t('settings.abbreviations.suggest')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar max-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase w-10 text-center">#</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-wider">{t('settings.abbreviations.originalName')}</th>
                            <th className="px-4 py-3 font-bold text-slate-400 uppercase text-[10px] tracking-wider w-1/3 min-w-[120px]">{t('settings.abbreviations.shortName')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {uniqueSubjects.map((name, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{name}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        aria-label={t('settings.abbreviations.shortName') + ' ' + name}
                                        value={tempAbbreviations[name] || ''}
                                        onChange={(e) => setTempAbbreviations({ ...tempAbbreviations, [name]: e.target.value })}
                                        placeholder={t('settings.abbreviations.placeholder')}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-cyan-600 dark:text-cyan-400 font-bold"
                                    />
                                </td>
                            </tr>
                        ))}
                        {uniqueSubjects.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">{t('settings.abbreviations.noData')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={handleSave}
                    className="px-6 h-11 bg-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-cyan-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} /> {t('settings.abbreviations.save')}
                </button>
            </div>
        </div>
    );
};


export default AbbreviationsCard;
