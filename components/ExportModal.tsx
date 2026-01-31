import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CalendarPlus, CheckSquare, Square, Download, Copy, Check } from 'lucide-react';
import { WeekSchedule, CourseType } from '../types';
import { DAYS_OF_WEEK, PERIOD_TIMES } from '../constants';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    week: WeekSchedule;
    weekIdx: number;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    getDayDateString: (dayIndex: number) => string;
}

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    week,
    weekIdx,
    overrides,
    abbreviations,
    getDayDateString
}) => {
    const { t } = useTranslation();
    const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);
    const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Collect teachers for the current week
            const teachers = new Set<string>();
            DAYS_OF_WEEK.forEach((dayName) => {
                const day = week.days[dayName];
                if (day) {
                    [...day.morning, ...day.afternoon, ...day.evening].forEach(s => {
                        teachers.add(s.teacher);
                    });
                }
            });
            const sortedTeachers = Array.from(teachers).sort();
            setAvailableTeachers(sortedTeachers);
            setSelectedTeachers(new Set(sortedTeachers)); // Default select all
            setCopySuccess(false);
        }
    }, [isOpen, week]);

    const toggleTeacherSelection = (teacher: string) => {
        const newSet = new Set(selectedTeachers);
        if (newSet.has(teacher)) newSet.delete(teacher);
        else newSet.add(teacher);
        setSelectedTeachers(newSet);
    };

    const toggleAllTeachers = () => {
        if (selectedTeachers.size === availableTeachers.length) {
            setSelectedTeachers(new Set());
        } else {
            setSelectedTeachers(new Set(availableTeachers));
        }
    };

    const generateICSContent = () => {
        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TdyPhan//Timetable//VN\nCALSCALE:GREGORIAN\n";

        DAYS_OF_WEEK.forEach((dayName, idx) => {
            const day = week.days[dayName];
            if (!day) return;

            const sessions = [...day.morning, ...day.afternoon, ...day.evening];
            const dateStr = getDayDateString(idx); // dd/mm/yyyy
            if (!dateStr) return;

            const [d, m, y] = dateStr.split('/');

            sessions.forEach(s => {
                // Filter by selected teacher
                if (!selectedTeachers.has(s.teacher)) return;

                const [startP, endP] = s.timeSlot.split('-').map(Number);

                // Use PERIOD_TIMES for exact start/end
                const startTimeInfo = PERIOD_TIMES[startP];
                const endTimeInfo = PERIOD_TIMES[endP];

                if (!startTimeInfo || !endTimeInfo) return;

                const [startH, startM] = startTimeInfo.start;
                const [endH, endM] = endTimeInfo.end;

                const startHStr = String(startH).padStart(2, '0');
                const startMStr = String(startM).padStart(2, '0');
                const endHStr = String(endH).padStart(2, '0');
                const endMStr = String(endM).padStart(2, '0');

                const currentType = overrides[s.courseCode] || s.type;

                // Use abbreviation for Export if available
                const displayName = abbreviations[s.courseName] || s.courseName;

                // Formatted Description: Replace newline with " / "
                const description = `GV: ${s.teacher} / Lớp: ${s.className} / Tiết: ${s.timeSlot} (${currentType}) / Nhóm: ${s.group} / Phòng: ${s.room}`;

                // Summary Format: [Name/Abbr] - [Class]
                const summary = `${displayName} - ${s.className}`;

                icsContent += "BEGIN:VEVENT\n";
                icsContent += `SUMMARY:${summary}\n`;
                icsContent += `LOCATION:${s.room}\n`;
                icsContent += `DESCRIPTION:${description}\n`;
                icsContent += `DTSTART:${y}${m}${d}T${startHStr}${startMStr}00\n`;
                icsContent += `DTEND:${y}${m}${d}T${endHStr}${endMStr}00\n`;
                icsContent += "END:VEVENT\n";
            });
        });

        icsContent += "END:VCALENDAR";
        return icsContent;
    };

    const handleDownloadICS = () => {
        const icsContent = generateICSContent();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `LichDay_Tuan${weekIdx + 1}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    const handleCopyICS = async () => {
        const icsContent = generateICSContent();
        try {
            await navigator.clipboard.writeText(icsContent);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 relative z-10 flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:white flex items-center gap-2">
                        <CalendarPlus size={20} className="text-blue-500" /> {t('weekly.exportICS.title')}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4" dangerouslySetInnerHTML={{ __html: t('weekly.exportICS.description', { week: weekIdx + 1 }) }}>
                    </p>

                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase text-slate-400">{t('weekly.exportICS.teacherList', { count: availableTeachers.length })}</span>
                        <button onClick={toggleAllTeachers} className="text-xs font-bold text-blue-600 hover:underline">
                            {selectedTeachers.size === availableTeachers.length ? t('weekly.exportICS.deselectAll') : t('weekly.exportICS.selectAll')}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {availableTeachers.map(teacher => (
                            <div
                                key={teacher}
                                onClick={() => toggleTeacherSelection(teacher)}
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            >
                                <div className={`flex-shrink-0 ${selectedTeachers.has(teacher) ? 'text-blue-500' : 'text-slate-300'}`}>
                                    {selectedTeachers.has(teacher) ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{teacher}</span>
                            </div>
                        ))}
                        {availableTeachers.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm italic">{t('weekly.exportICS.noTeachers')}</div>
                        )}
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex items-center justify-between gap-3">
                    <button
                        onClick={handleCopyICS}
                        disabled={selectedTeachers.size === 0}
                        className={`px-4 py-2.5 font-bold text-xs rounded-xl shadow-sm border transition-all flex items-center gap-2 flex-1 justify-center
               ${copySuccess
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            } disabled:opacity-50`}
                    >
                        {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                        {copySuccess ? t('weekly.exportICS.copied') : t('weekly.exportICS.copy')}
                    </button>

                    <button
                        onClick={handleDownloadICS}
                        disabled={selectedTeachers.size === 0}
                        className="px-6 py-2.5 bg-blue-600 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> {t('weekly.exportICS.download')}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ExportModal;
