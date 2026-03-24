import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScheduleStore } from '@/core/stores';
import { Bug, FastForward, Power, Calendar } from 'lucide-react';

interface Scenario {
    id: string;
    title: string;
    description: string;
    file: string | null;
    mockTime: string | null;
    multiplier: number;
}

const DemoView: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleFileUpload = useScheduleStore(s => s.handleFileUpload);
    const setMockState = useScheduleStore(s => s.setMockState);

    useEffect(() => {
        fetch('/mocks/manifest.json')
            .then(res => res.json())
            .then(data => {
                if (data.scenarios) setScenarios(data.scenarios);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load mock manifest', err);
                setIsLoading(false);
            });
    }, []);

    const runScenario = async (scenario: Scenario) => {
        if (!scenario.file) {
            setMockState(null);
            navigate('/today');
            return;
        }

        try {
            const res = await fetch(`/mocks/${scenario.file}`);
            if (!res.ok) throw new Error('File not found');
            const htmlScore = await res.text();
            
            // 1. Process data first
            handleFileUpload(htmlScore, t, i18n.language);
            
            // 2. Override system time globally
            setMockState({
                startTimeLocal: Date.now(),
                startTimeMock: new Date(scenario.mockTime!).getTime(),
                multiplier: scenario.multiplier
            });

            // 3. Jump to view
            navigate('/today');

        } catch (error) {
            alert(`Failed to load mock: ${error}`);
        }
    };

    return (
        <div className="max-w-md mx-auto py-8 px-4 font-sans animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-8 text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <div className="p-2 bg-amber-500/20 rounded-full animate-pulse">
                    <Bug className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-black text-lg">Developer Scenarios</h1>
                    <p className="text-xs font-medium opacity-80">Cỗ máy thời gian giả lập</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center p-8 text-slate-500 font-medium animate-pulse">Đang tải kịch bản...</div>
            ) : (
                <div className="space-y-4">
                    {scenarios.map(s => {
                        const isRealtime = !s.file;
                        return (
                            <button
                                key={s.id}
                                onClick={() => runScenario(s)}
                                className={`w-full text-left p-5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                    isRealtime 
                                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500' 
                                    : 'bg-white dark:bg-slate-900 border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <h3 className={`font-bold mb-1 ${isRealtime ? 'text-slate-700 dark:text-slate-300' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                            {s.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {s.description}
                                        </p>
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        {isRealtime ? (
                                            <Power className="w-5 h-5 text-slate-400" />
                                        ) : s.multiplier > 1 ? (
                                            <FastForward className="w-5 h-5 text-amber-500" />
                                        ) : (
                                            <Calendar className="w-5 h-5 text-indigo-400" />
                                        )}
                                    </div>
                                </div>
                                {!isRealtime && s.mockTime && (
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <span>Time: {new Date(s.mockTime).toLocaleTimeString('vi-VN')}</span>
                                        {s.multiplier > 1 && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">{s.multiplier}x speed</span>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DemoView;
