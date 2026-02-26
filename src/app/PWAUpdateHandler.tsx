/**
 * PWAUpdateHandler — Manages PWA Registration & Notifications
 * Handles "Check for updates" and Install Prompt.
 */

import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Download, Check, X } from 'lucide-react';

export const PWAUpdateHandler: React.FC = () => {
    const { t } = useTranslation();
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkStatus, setCheckStatus] = useState<'none' | 'up-to-date'>('none');

    const sw = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
            // Periodic check for updates (every hour)
            r && setInterval(() => {
                r.update();
            }, 60 * 60 * 1000);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const [offlineReady, setOfflineReady] = Array.isArray(sw.offlineReady)
        ? sw.offlineReady
        : [sw.offlineReady, () => { }];
    const [needUpdate, setNeedUpdate] = Array.isArray(sw.needUpdate)
        ? sw.needUpdate
        : [sw.needUpdate, () => { }];
    const { updateServiceWorker } = sw;

    useEffect(() => {
        const handleInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    const close = () => {
        setOfflineReady(false);
        setNeedUpdate(false);
    };

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    // Expose check function to window for SettingsView to trigger
    useEffect(() => {
        (window as any).checkPWAUpdate = async () => {
            setIsChecking(true);
            setCheckStatus('none');

            // Register SW instance might be available via navigator
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    // If no update found after a delay, show "up to date"
                    setTimeout(() => {
                        setIsChecking(false);
                        if (!needUpdate) {
                            setCheckStatus('up-to-date');
                            setTimeout(() => setCheckStatus('none'), 3000);
                        }
                    }, 1500);
                } else {
                    setIsChecking(false);
                }
            } else {
                setIsChecking(false);
            }
        };
    }, [needUpdate]);

    return (
        <>
            {/* Install Prompt Banner (Bottom Left) */}
            {installPrompt && (
                <div className="fixed bottom-24 left-4 right-4 md:right-auto md:max-w-sm z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Download size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                                {t('pwa.install_title')}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {t('pwa.install_desc')}
                            </p>
                        </div>
                        <button
                            onClick={handleInstall}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                        >
                            {t('pwa.install_button')}
                        </button>
                    </div>
                </div>
            )}

            {/* Update / Offline Notification (Top Right) */}
            {(offlineReady || needUpdate) && (
                <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 p-4 rounded-xl shadow-2xl min-w-[280px]">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
                                {needUpdate ? t('pwa.updateReady') : t('pwa.offlineReady')}
                            </h4>
                            <button onClick={close} className="p-1 hover:bg-white/10 dark:hover:bg-slate-100 rounded-lg">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-xs mb-3 font-medium">
                            {needUpdate ? t('pwa.updateReadyDesc') : t('pwa.offlineReadyDesc')}
                        </p>
                        {needUpdate && (
                            <button
                                onClick={handleUpdate}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <RefreshCw size={14} />
                                {t('pwa.reloadButton')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Global Check for Update Toast */}
            {(isChecking || checkStatus === 'up-to-date') && (
                <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className={`${isChecking ? 'animate-spin' : 'bg-green-500 rounded-full p-0.5 text-white'}`}>
                            {isChecking ? <RefreshCw size={14} /> : <Check size={12} strokeWidth={4} />}
                        </div>
                        <span className="text-xs font-bold">
                            {isChecking ? t('pwa.checking') : t('pwa.up_to_date')}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};
