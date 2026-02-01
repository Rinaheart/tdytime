
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { ScheduleData, Metrics, CourseType, Thresholds } from '../types';
import { DEFAULT_THRESHOLDS } from '../constants';
import { parseScheduleHTML } from '../services/parser';
import { calculateMetrics } from '../services/analyzer';
import { historyService, HistoryItem } from '../services/historyService';

const parseDateFromRange = (dateRange: string, position: 'start' | 'end'): Date | null => {
    try {
        const matches = dateRange.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
        if (!matches || matches.length < 2) return null;
        const dateStr = position === 'start' ? matches[0] : matches[1];
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    } catch {
        return null;
    }
};

export const useSchedule = () => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<ScheduleData | null>(null);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
    const [overrides, setOverrides] = useState<Record<string, CourseType>>({});
    const [abbreviations, setAbbreviations] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, id: number } | null>(null);
    const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

    const jumpToCurrentWeek = useCallback((scheduleData: ScheduleData) => {
        if (!scheduleData.weeks.length) return;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const weekIdx = scheduleData.weeks.findIndex(w => {
            const start = parseDateFromRange(w.dateRange, 'start');
            const end = parseDateFromRange(w.dateRange, 'end');
            return start && end && now >= start && now <= end;
        });

        if (weekIdx !== -1) setCurrentWeekIndex(weekIdx);
        else {
            const firstWeekStart = parseDateFromRange(scheduleData.weeks[0].dateRange, 'start');
            if (firstWeekStart && now < firstWeekStart) setCurrentWeekIndex(0);
            else setCurrentWeekIndex(scheduleData.weeks.length - 1);
        }
    }, []);

    useEffect(() => {
        // Load history list
        setHistoryList(historyService.getAll());

        // Load last session
        const saved = localStorage.getItem('last_schedule_data');
        if (saved) {
            try {
                const parsed: ScheduleData = JSON.parse(saved);
                setData(parsed);
                setOverrides(parsed.overrides || {});
                setAbbreviations(parsed.abbreviations || {});

                // DEFER: Calculate metrics after initial render to avoid blocking
                setTimeout(() => {
                    setMetrics(calculateMetrics(parsed));
                    jumpToCurrentWeek(parsed);
                }, 0);
            } catch (e) {
                console.error("Failed to load saved data");
            }
        }
    }, [jumpToCurrentWeek]);

    useEffect(() => {
        if (data) {
            const updatedData = { ...data, overrides, abbreviations };
            setMetrics(calculateMetrics(updatedData));
        }
    }, [overrides, abbreviations, data]);

    const processLoadedData = useCallback((parsedData: ScheduleData) => {
        setIsProcessing(true);

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let message = "";
        let targetWeekIdx = 0;

        const firstWeekStart = parseDateFromRange(parsedData.weeks[0].dateRange, 'start');
        const lastWeekEnd = parseDateFromRange(parsedData.weeks[parsedData.weeks.length - 1].dateRange, 'end');

        if (firstWeekStart && lastWeekEnd) {
            if (now > lastWeekEnd) {
                message = t('success.loadedPast', { date: lastWeekEnd.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') });
                targetWeekIdx = parsedData.weeks.length - 1;
            } else if (now < firstWeekStart) {
                message = t('success.loadedFuture', { date: firstWeekStart.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US') });
                targetWeekIdx = 0;
            } else {
                const currentWIdx = parsedData.weeks.findIndex(w => {
                    const s = parseDateFromRange(w.dateRange, 'start');
                    const e = parseDateFromRange(w.dateRange, 'end');
                    return s && e && now >= s && now <= e;
                });
                targetWeekIdx = currentWIdx !== -1 ? currentWIdx : 0;
                message = t('success.loadedCurrent');
            }
        } else message = t('success.loaded');

        setData(parsedData);
        setOverrides(parsedData.overrides || {});
        setAbbreviations(parsedData.abbreviations || {});
        setMetrics(calculateMetrics(parsedData));
        setError(null);

        // Save to LocalStorage (last session)
        localStorage.setItem('last_schedule_data', JSON.stringify(parsedData));

        // Save to History Service
        historyService.save(parsedData);
        setHistoryList(historyService.getAll());

        setCurrentWeekIndex(targetWeekIdx);
        setToastMessage({ text: message, id: Date.now() });
        setIsProcessing(false);
    }, [t, i18n.language]);

    const handleFileUpload = useCallback((content: string) => {
        try {
            if (!content || content.trim().length === 0) throw new Error(t('error.noData'));
            if (content.trim().startsWith('{')) {
                const parsedJson = JSON.parse(content) as ScheduleData;
                if (parsedJson.weeks && parsedJson.metadata) {
                    processLoadedData(parsedJson);
                    return;
                } else throw new Error(t('error.invalidStructure'));
            }
            const parsedData = parseScheduleHTML(content);
            if (parsedData && parsedData.weeks.length > 0) processLoadedData(parsedData);
            else throw new Error(t('error.noData'));
        } catch (err: any) {
            setError(err.message);
        }
    }, [processLoadedData, t]);

    const loadHistoryItem = useCallback((item: HistoryItem) => {
        processLoadedData(item.data);
    }, [processLoadedData]);

    const deleteHistoryItem = useCallback((id: string) => {
        const updated = historyService.delete(id);
        setHistoryList(updated);
    }, []);

    return {
        data, metrics, currentWeekIndex, setCurrentWeekIndex,
        thresholds, setThresholds, overrides, setOverrides,
        abbreviations, setAbbreviations, error, setError,
        isProcessing, toastMessage, handleFileUpload, processLoadedData,
        jumpToCurrentWeek,
        historyList, loadHistoryItem, deleteHistoryItem
    };
};

