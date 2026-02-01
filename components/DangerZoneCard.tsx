import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface DangerZoneCardProps {
    onReset: () => void;
}

const DangerZoneCard: React.FC<DangerZoneCardProps> = ({ onReset }) => {
    const { t } = useTranslation();

    const handleReset = () => {
        if (window.confirm(t('settings.dangerZone.confirmReset'))) {
            onReset();
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col">
            <div className="p-4 md:p-6 border-b border-red-50 dark:border-red-900/30">
                <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} /> {t('settings.dangerZone.title')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t('settings.dangerZone.description')}</p>
            </div>

            <div className="p-4 md:p-6 flex flex-col gap-3 flex-1 justify-center">
                <button
                    onClick={handleReset}
                    className="w-full h-12 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={18} /> {t('settings.dangerZone.resetButton')}
                </button>
            </div>
        </div>
    );
};


export default DangerZoneCard;
