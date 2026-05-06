import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message?: string;
    description?: string; // Alias for message
    confirmLabel?: string;
    confirmText?: string;  // Alias for confirmLabel
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    description,
    confirmLabel,
    confirmText,
    cancelLabel,
    onConfirm,
    onCancel,
    isDanger = false
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 fade-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                        isDanger 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                        : 'bg-accent-50 dark:bg-accent-900/20 text-accent-600'
                    }`}>
                        <AlertCircle size={24} strokeWidth={2.5} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        {message || description}
                    </p>
                    
                    <div className="flex flex-col w-full gap-2">
                        <button
                            onClick={onConfirm}
                            className={`w-full h-12 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
                                isDanger
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                : 'bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-500/20'
                            }`}
                        >
                            {confirmLabel || confirmText || t('common.confirm') || 'Xác nhận'}
                        </button>
                        
                        <button
                            onClick={onCancel}
                            className="w-full h-12 rounded-2xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {cancelLabel || t('common.cancel') || 'Hủy'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
