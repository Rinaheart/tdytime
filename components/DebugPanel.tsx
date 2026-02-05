import React, { useState } from 'react';
import { Settings, X, RotateCcw, Clock, Calendar } from 'lucide-react';

export type MockDisplayState = 'HAS_SESSIONS' | 'NO_SESSIONS' | 'BEFORE_SEMESTER' | 'AFTER_SEMESTER' | 'NO_DATA' | 'REAL';

interface DebugPanelProps {
    mockState: MockDisplayState;
    onStateChange: (state: MockDisplayState) => void;
    mockDate: string; // YYYY-MM-DD
    onDateChange: (date: string) => void;
    mockTime: string; // HH:mm
    onTimeChange: (time: string) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
    mockState,
    onStateChange,
    mockDate,
    onDateChange,
    mockTime,
    onTimeChange
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Render only in development
    if (import.meta.env.PROD) return null;

    // Helper for date display
    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '--/--/----';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="fixed bottom-20 right-4 z-[9999]">
            {isOpen ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Settings size={16} className="text-blue-500" />
                            <span className="text-sm font-bold text-slate-900 dark:text-white">UI Debugger</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X size={16} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Control State Selector */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">1. Display State</label>
                            <select
                                value={mockState}
                                onChange={(e) => onStateChange(e.target.value as MockDisplayState)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="REAL">Real Data</option>
                                <option value="HAS_SESSIONS">Has Sessions</option>
                                <option value="NO_SESSIONS">No Sessions</option>
                                <option value="BEFORE_SEMESTER">Before Semester</option>
                                <option value="AFTER_SEMESTER">After Semester</option>
                                <option value="NO_DATA">Empty Data</option>
                            </select>
                        </div>

                        {/* 2. Mock Date */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">2. Mock Date (dd/mm/yyyy)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    {/* Visual Mask: dd/mm/yyyy - Left Aligned */}
                                    <div className="absolute inset-0 flex items-center pl-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pointer-events-none">
                                        <Calendar size={12} className="text-slate-400 mr-2" />
                                        <span className="text-xs text-slate-700 dark:text-slate-200">
                                            {formatDateDisplay(mockDate)}
                                        </span>
                                    </div>
                                    {/* Transparent Input for Picker */}
                                    <input
                                        type="date"
                                        value={mockDate}
                                        onChange={(e) => onDateChange(e.target.value)}
                                        onClick={(e) => (e.target as any).showPicker?.()}
                                        className="relative z-10 w-full bg-transparent opacity-0 cursor-pointer min-h-[32px]"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
                                        onDateChange(today);
                                    }}
                                    title="Reset to today"
                                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors flex items-center justify-center shrink-0 w-10 border border-slate-200 dark:border-slate-700"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        </div>

                        {/* 3. Mock Time */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">3. Mock Time (24h - HH:mm)</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Clock size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="HH:mm"
                                        value={mockTime}
                                        maxLength={5}
                                        onChange={(e) => {
                                            const input = e.target.value;
                                            let val = input.replace(/[^0-9:]/g, '');
                                            // Auto-colon
                                            if (val.length === 2 && !val.includes(':') && (e.nativeEvent as any).inputType !== 'deleteContentBackward') {
                                                val = val + ':';
                                            }
                                            onTimeChange(val);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={() => onTimeChange('')}
                                    title="Reset to real time"
                                    className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors flex items-center justify-center shrink-0 w-10 border border-slate-200 dark:border-slate-700"
                                >
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 italic">Nhập dạng 24h để test trạng thái tiết</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-center text-slate-400 font-mono">Environment: DEV</p>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                    <Settings size={20} />
                </button>
            )}
        </div>
    );
};

export default DebugPanel;
