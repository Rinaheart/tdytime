import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, StickyNote } from 'lucide-react';
import { useNotesStore } from '../../core/stores/notes.store';
import { useUIStore } from '../../core/stores/ui.store';

interface NoteModalProps {
    isOpen: boolean;
    sessionId: string;
    sessionTitle: string;
    onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({
    isOpen,
    sessionId,
    sessionTitle,
    onClose
}) => {
    const { t } = useTranslation();
    const { getNote, setNote } = useNotesStore();
    const { setToast } = useUIStore();
    const [content, setContent] = useState('');

    // Load existing note when modal opens
    useEffect(() => {
        if (isOpen) {
            setContent(getNote(sessionId));
        }
    }, [isOpen, sessionId, getNote]);

    // Handle Esc key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleSave = () => {
        setNote(sessionId, content);
        setToast(t('notes.saved') || 'Đã lưu ghi chú!');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 flex items-center justify-center">
                            <StickyNote size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                                {t('notes.title') || 'Ghi chú buổi giảng'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {sessionTitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('notes.placeholder') || 'Nhập ghi chú tại đây...'}
                        className="w-full min-h-[200px] bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl p-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-accent-500/20 outline-none resize-none text-sm leading-relaxed"
                        autoFocus
                    />
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl font-semibold text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-[2] bg-accent-600 hover:bg-accent-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Save size={18} />
                        {t('notes.save') || 'Lưu ghi chú'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
