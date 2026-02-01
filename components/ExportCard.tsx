import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileJson } from 'lucide-react';
import { ScheduleData, CourseType } from '../types';

interface ExportCardProps {
    data: ScheduleData;
    abbreviations: Record<string, string>;
    onSuccess: (msg: string) => void;
}

const ExportCard: React.FC<ExportCardProps> = ({
    data,
    abbreviations,
    onSuccess
}) => {
    const { t } = useTranslation();

    const exportCSV = () => {
        const headers = [
            t('settings.export.csv.code'),
            t('settings.export.csv.name'),
            t('settings.export.csv.class'),
            t('settings.export.csv.group'),
            t('settings.export.csv.type'),
            t('settings.export.csv.totalPeriods'),
            t('settings.export.csv.totalSessions')
        ].join(',');

        let csv = headers + "\n";
        data.allCourses.forEach(c => {
            const type = c.types[0] || (c.code.includes('-TH') ? CourseType.TH : CourseType.LT);
            csv += `"${c.code}","${c.name}","${c.classes.join(', ')}","${c.groups.join(', ')}","${type}",${c.totalPeriods},${c.totalSessions}\n`;
        });
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ThongKe_LichDay_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        onSuccess(t('settings.toast.csvExported'));
    };

    const exportBackup = () => {
        const backup = { ...data, abbreviations };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Timetable_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        onSuccess(t('settings.toast.jsonExported'));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Download size={20} className="text-emerald-500" /> {t('settings.export.title')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t('settings.export.description')}</p>
            </div>

            <div className="p-4 md:p-6 flex flex-col gap-3 flex-1 justify-center">
                <button
                    onClick={exportCSV}
                    className="w-full h-11 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <FileSpreadsheet size={18} /> {t('settings.export.csvButton')}
                </button>
                <button
                    onClick={exportBackup}
                    className="w-full h-11 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <FileJson size={18} /> {t('settings.export.jsonButton')}
                </button>
            </div>
        </div>
    );
};


export default ExportCard;
