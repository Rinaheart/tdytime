import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudUpload, FileText, History, Trash2, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../services/historyService';

interface WelcomeViewProps {
    onFileUpload: (content: string) => void;
    historyList: HistoryItem[];
    onLoadHistory: (item: HistoryItem) => void;
    onDeleteHistory: (id: string) => void;
    version: string;
    isProcessing: boolean;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({
    onFileUpload,
    historyList,
    onLoadHistory,
    onDeleteHistory,
    version,
    isProcessing
}) => {
    const { t } = useTranslation();
    const [pasteMode, setPasteMode] = useState(false);
    const [pastedContent, setPastedContent] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            onFileUpload(content);
        };
        reader.readAsText(file);
    };

    const handlePasteSubmit = () => {
        if (pastedContent.trim()) {
            onFileUpload(pastedContent);
        }
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            onFileUpload(content);
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-700">
            {/* 1. Brand Identity */}
            <div className="flex flex-col items-center mb-12">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                    <img
                        src="/pwa-192x192.png"
                        alt="TdyTime Logo"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] shadow-2xl relative z-10 border-4 border-white dark:border-slate-800"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                        TdyTime
                    </h1>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full border border-blue-200 dark:border-blue-800">
                        v{version}
                    </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-center max-w-xs">
                    {t('app.tagline', { defaultValue: 'Quản lý lịch giảng dạy thông minh & hiệu quả' })}
                </p>
            </div>

            {/* 2. Dual Input Zone */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Upload Zone */}
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border-3 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-1
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02] shadow-2xl shadow-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 hover:shadow-2xl hover:shadow-blue-500/10'}
                    `}
                >
                    <input type="file" className="hidden" accept=".html,.json" onChange={handleFileChange} />
                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform
                        ${isDragging ? 'scale-110 bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:scale-110'}
                    `}>
                        <CloudUpload size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">{isDragging ? t('app.dropToUpload', { defaultValue: 'Thả để tải lên' }) : t('app.uploadTitle', { defaultValue: 'Tải tệp lịch' })}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('app.uploadDesc', { defaultValue: 'Hỗ trợ .html hoặc .json' })}</p>
                </label>

                {/* Paste Zone */}
                <div className={`
                    bg-white dark:bg-slate-900 rounded-[2.5rem] border-3 border-solid p-8 flex flex-col transition-all lg:min-h-[220px]
                    ${pasteMode ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1'}
                `}>
                    {!pasteMode ? (
                        <button
                            onClick={() => setPasteMode(true)}
                            className="flex-1 flex flex-col items-center justify-center group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">{t('app.pasteTitle', { defaultValue: 'Dán mã HTML' })}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('app.pasteDesc', { defaultValue: 'Dán trực tiếp từ trang web' })}</p>
                        </button>
                    ) : (
                        <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                            <textarea
                                autoFocus
                                value={pastedContent}
                                onChange={(e) => setPastedContent(e.target.value)}
                                placeholder={t('app.pastePlaceholder', { defaultValue: 'Dán nội dung HTML tại đây...' })}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-mono border-0 focus:ring-0 resize-none mb-4 custom-scrollbar"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPasteMode(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handlePasteSubmit}
                                    disabled={!pastedContent.trim() || isProcessing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isProcessing ? t('common.processing') : (
                                        <>
                                            {t('common.save')} <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Recent History */}
            {historyList.length > 0 && (
                <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="flex items-center gap-2 mb-6 ml-4">
                        <History size={18} className="text-slate-400" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('app.recentHistory', { defaultValue: 'Dữ liệu gần đây' })}</h4>
                    </div>
                    <div className="space-y-3">
                        {historyList.slice(0, 5).map((item) => {
                            const teacherName = item.data.metadata.teacher.trim();
                            const names = teacherName.split(' ');
                            const avatarChar = names[names.length - 1].charAt(0).toUpperCase();

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => onLoadHistory(item)}
                                    className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/10">
                                            {avatarChar}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase">
                                                {teacherName}
                                            </h5>
                                            <p className="text-[10px] text-slate-400 font-bold">
                                                HK{item.data.metadata.semester} • {item.data.metadata.academicYear}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                                            {(() => {
                                                const d = new Date(item.savedAt);
                                                const day = String(d.getDate()).padStart(2, '0');
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const year = d.getFullYear();
                                                return `${day}/${month}/${year}`;
                                            })()}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteHistory(item.id);
                                            }}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. Footer */}
            <div className="mt-auto pt-16 pb-8 text-center opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    © 2026 TdyTime | Designed by Antigravity AI
                </p>
            </div>
        </div>
    );
};

export default WelcomeView;
