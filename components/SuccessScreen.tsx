
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessScreenProps {
    message: string | null;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ message }) => {
    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={48} strokeWidth={3} />
                </div>
                <div className="max-w-md px-6">
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                        {message?.split('! ')[0]}!
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {message?.split('! ')[1]}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessScreen;
