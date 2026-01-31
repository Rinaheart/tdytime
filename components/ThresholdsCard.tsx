import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, Shield, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { Thresholds } from '../types';
import { DEFAULT_THRESHOLDS } from '../constants';

interface ThresholdsCardProps {
    thresholds: Thresholds;
    onSave: (t: Thresholds) => void;
    onSuccess: (msg: string) => void;
}

const ThresholdsCard: React.FC<ThresholdsCardProps> = ({
    thresholds,
    onSave,
    onSuccess
}) => {
    const { t } = useTranslation();
    const [tempThresholds, setTempThresholds] = useState<Thresholds>(thresholds);

    useEffect(() => {
        setTempThresholds(thresholds);
    }, [thresholds]);

    const handleReset = () => {
        setTempThresholds(DEFAULT_THRESHOLDS);
        onSuccess(t('settings.toast.thresholdsReset'));
    };

    const handleSave = () => {
        onSave(tempThresholds);
        onSuccess(t('settings.toast.thresholdsSaved'));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BellRing size={20} className="text-amber-500" /> {t('settings.thresholds.title')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t('settings.thresholds.description')}</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                {/* Daily */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Shield size={16} className="text-blue-500" /> {t('settings.thresholds.daily')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">{t('settings.thresholds.warning')}</label>
                            <input type="number" value={tempThresholds.daily.warning} onChange={e => setTempThresholds({ ...tempThresholds, daily: { ...tempThresholds.daily, warning: Number(e.target.value) } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                        </div>
                        <div>
                            <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">{t('settings.thresholds.danger')}</label>
                            <input type="number" value={tempThresholds.daily.danger} onChange={e => setTempThresholds({ ...tempThresholds, daily: { ...tempThresholds.daily, danger: Number(e.target.value) } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                        </div>
                    </div>
                </div>
                {/* Weekly */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <AlertTriangle size={16} className="text-orange-500" /> {t('settings.thresholds.weekly')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">{t('settings.thresholds.warning')}</label>
                            <input type="number" value={tempThresholds.weekly.warning} onChange={e => setTempThresholds({ ...tempThresholds, weekly: { ...tempThresholds.weekly, warning: Number(e.target.value) } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                        </div>
                        <div>
                            <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">{t('settings.thresholds.danger')}</label>
                            <input type="number" value={tempThresholds.weekly.danger} onChange={e => setTempThresholds({ ...tempThresholds, weekly: { ...tempThresholds.weekly, danger: Number(e.target.value) } })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Reset
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-xl shadow hover:shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={14} /> {t('settings.thresholds.save')}
                </button>
            </div>
        </div>
    );
};


export default ThresholdsCard;
