/**
 * PWAUpdateHandler — Manages PWA Registration & Notifications
 * Handles "Check for updates" and Install Prompt.
 */

import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Download, Check, X } from 'lucide-react';

const INSTALL_PROMPT_DISMISS_KEY = 'tdytime_install_prompt_dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

export const PWAUpdateHandler: React.FC = () => {
    const { t } = useTranslation();
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [checkStatus, setCheckStatus] = useState<'none' | 'up-to-date'>('none');
    const [isDismissed, setIsDismissed] = useState(true);

    // Check dismiss status on mount
    useEffect(() => {
        const lastDismissed = localStorage.getItem(INSTALL_PROMPT_DISMISS_KEY);
        if (lastDismissed) {
            const timePassed = Date.now() - parseInt(lastDismissed, 10);
            if (timePassed < DISMISS_DURATION) {
                setIsDismissed(true);
            } else {
                setIsDismissed(false);
            }
        } else {
            setIsDismissed(false);
        }
    }, []);

    const sw = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered:', r);
            // Periodic check for updates (every hour)
            r && setInterval(() => {
                r.update();
            }, 60 * 60 * 1000);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const [offlineReady, setOfflineReady] = Array.isArray(sw.offlineReady)
        ? sw.offlineReady
        : [sw.offlineReady, () => { }];
    const [needUpdate, setNeedUpdate] = Array.isArray(sw.needRefresh)
        ? sw.needRefresh
        : [sw.needRefresh, () => { }];
    const { updateServiceWorker } = sw;

    useEffect(() => {
        const handleInstallPrompt = (e: Event) => {
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

    const handleDismissInstall = () => {
        localStorage.setItem(INSTALL_PROMPT_DISMISS_KEY, Date.now().toString());
        setIsDismissed(true);
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
            {/* Install Prompt Banner (Bottom Left/Center) */}
            {installPrompt && !isDismissed && (
                <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-sm z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="bg-white dark:bg-slate-900 border-[1.5px] border-accent-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 relative mx-auto max-w-[calc(100vw-2rem)] md:max-w-none">
                        <button
                            onClick={handleDismissInstall}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center justify-center"
                            aria-label="Close"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-start gap-3 w-full pr-6 justify-center md:justify-start">
                            <div className="w-10 h-10 bg-accent-50 dark:bg-accent-900/20 rounded-xl flex items-center justify-center text-accent-600 shrink-0 mt-0.5">
                                <Download size={20} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                    {t('pwa.install_title')}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                    {t('pwa.install_desc')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleInstall}
                            className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-accent-500/20 flex justify-center items-center gap-2"
                        >
                            <Download size={15} strokeWidth={2.5} />
                            {t('pwa.install_button')}
                        </button>
                    </div>
                </div>
            )}

            {/* Update / Offline Notification (Top Right) */}
            {(offlineReady || needUpdate) && (
                <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl min-w-[280px]">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
                                {needUpdate ? t('pwa.updateReady') : t('pwa.offlineReady')}
                            </h4>
                            <button onClick={close} className="p-1 hover:bg-white/10 dark:hover:bg-slate-100 rounded-xl">
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-xs mb-3 font-medium">
                            {needUpdate ? t('pwa.updateReadyDesc') : t('pwa.offlineReadyDesc')}
                        </p>
                        {needUpdate && (
                            <button
                                onClick={handleUpdate}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600 transition-colors shadow-lg shadow-accent-500/20"
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
