import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface DangerZoneCardProps {
    onReset: () => void;
}

const DangerZoneCard: React.FC<DangerZoneCardProps> = ({ onReset }) => {
    const { t } = useTranslation();
    const [isConfirming, setIsConfirming] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleClick = () => {
        if (isConfirming) {
            onReset();
            setIsConfirming(false);
        } else {
            setIsConfirming(true);
            timeoutRef.current = setTimeout(() => setIsConfirming(false), 3000);
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
                    onClick={handleClick}
                    className={`w-full h-12 border rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 ${isConfirming
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 scale-105'
                        : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20'
                        }`}
                >
                    {isConfirming ? (
                        <>
                            <AlertTriangle size={18} className="animate-pulse" />
                            {t('settings.dangerZone.confirmButton')}
                        </>
                    ) : (
                        <>
                            <RotateCcw size={18} />
                            {t('settings.dangerZone.resetButton')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};


export default DangerZoneCard;
