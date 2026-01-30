
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, RefreshCw } from 'lucide-react';

const ReloadPrompt: React.FC = () => {
    const { t } = useTranslation();
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                        {offlineReady ? t('pwa.offlineReady') : t('pwa.updateReady')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {offlineReady
                            ? t('pwa.offlineReadyDesc')
                            : t('pwa.updateReadyDesc')
                        }
                    </p>
                </div>
                <button onClick={close} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                </button>
            </div>

            {needRefresh && (
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                    <RefreshCw size={16} /> {t('pwa.reloadButton')}
                </button>
            )}
        </div>
    );
};


export default ReloadPrompt;
