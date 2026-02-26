/**
 * Schedule Store — TdyTime v2
 * Global state for schedule data, metrics, overrides, history.
 * Replaces old useSchedule hook with Zustand for selective re-renders.
 */

import { create } from 'zustand';
import {
    ScheduleData,
    Metrics,
    CourseType,
    Thresholds,
    calculateMetrics,
    parseDateFromRange,
    isCurrentWeek,
} from '../schedule';
import { historyService, type HistoryItem } from '../schedule/history.service';
import { parseScheduleHTML, sanitizeScheduleData } from '../schedule/parser';
import { DEFAULT_THRESHOLDS } from '../constants';
import { useUIStore } from './ui.store';

interface ScheduleState {
    // Data
    data: ScheduleData | null;
    metrics: Metrics | null;
    currentWeekIndex: number;
    thresholds: Thresholds;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;

    // UI state
    error: string | null;
    isProcessing: boolean;
    toastMessage: { text: string; id: number } | null;
    historyList: HistoryItem[];

    // Actions
    processLoadedData: (data: ScheduleData, t: (key: string, opts?: Record<string, unknown>) => string, lang: string) => void;
    handleFileUpload: (content: string, t: (key: string, opts?: Record<string, unknown>) => string, lang: string) => void;
    jumpToCurrentWeek: (data: ScheduleData) => void;
    setCurrentWeekIndex: (idx: number | ((prev: number) => number)) => void;
    setThresholds: (thresholds: Thresholds) => void;
    setOverrides: (overrides: Record<string, CourseType>) => void;
    setAbbreviations: (abbreviations: Record<string, string>) => void;
    setError: (error: string | null) => void;
    loadHistoryItem: (item: HistoryItem, t: (key: string, opts?: Record<string, unknown>) => string) => void;
    deleteHistoryItem: (id: string) => void;
    goToUpload: () => void;
    resetAll: () => void;
    initFromStorage: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
    data: null,
    metrics: null,
    currentWeekIndex: 0,
    thresholds: DEFAULT_THRESHOLDS,
    overrides: {},
    abbreviations: {},
    error: null,
    isProcessing: false,
    toastMessage: null,
    historyList: [],

    initFromStorage: () => {
        const historyList = historyService.getAll();
        set({ historyList });

        const saved = localStorage.getItem('last_schedule_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as ScheduleData;
                const sanitized = sanitizeScheduleData(parsed);
                set({
                    data: sanitized,
                    metrics: calculateMetrics(sanitized),
                    currentWeekIndex: findCurrentWeekIndex(sanitized),
                    overrides: sanitized.overrides || {},
                    abbreviations: sanitized.abbreviations || {},
                });
            } catch (e) {
                console.error('Failed to load saved data:', e);
            }
        }
    },

    processLoadedData: (parsedData, t, lang) => {
        set({ isProcessing: true });

        const sanitizedData = sanitizeScheduleData(parsedData);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let message = '';
        let targetWeekIdx = 0;

        const firstWeekStart = parseDateFromRange(sanitizedData.weeks[0].dateRange, 'start');
        const lastWeekEnd = parseDateFromRange(sanitizedData.weeks[sanitizedData.weeks.length - 1].dateRange, 'end');

        if (firstWeekStart && lastWeekEnd) {
            const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
            if (now > lastWeekEnd) {
                message = t('success.loadedPast', { date: lastWeekEnd.toLocaleDateString(locale) });
                targetWeekIdx = parsedData.weeks.length - 1;
            } else if (now < firstWeekStart) {
                message = t('success.loadedFuture', { date: firstWeekStart.toLocaleDateString(locale) });
                targetWeekIdx = 0;
            } else {
                targetWeekIdx = findCurrentWeekIndex(parsedData);
                message = t('success.loadedCurrent');
            }
        } else {
            message = t('success.loaded');
        }

        const metrics = calculateMetrics(sanitizedData);

        // Persist the newly sanitized data
        localStorage.setItem('last_schedule_data', JSON.stringify(sanitizedData));
        historyService.save(sanitizedData);

        set({
            data: sanitizedData,
            metrics,
            overrides: sanitizedData.overrides || {},
            abbreviations: sanitizedData.abbreviations || {},
            error: null,
            currentWeekIndex: targetWeekIdx,
            toastMessage: { text: message, id: Date.now() },
            isProcessing: false,
            historyList: historyService.getAll(),
        });
    },

    handleFileUpload: (content, t, lang) => {
        try {
            if (!content || content.trim().length === 0) throw new Error(t('error.noData'));

            if (content.trim().startsWith('{')) {
                const parsedJson = JSON.parse(content) as ScheduleData;
                if (parsedJson.weeks && parsedJson.metadata) {
                    get().processLoadedData(parsedJson, t, lang);
                    return;
                }
                throw new Error(t('error.invalidStructure'));
            }

            const parsedData = parseScheduleHTML(content);
            if (parsedData && parsedData.weeks.length > 0) {
                get().processLoadedData(parsedData, t, lang);
            } else {
                throw new Error(t('error.noData'));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? t(err.message) : t('error.noData');
            set({ error: message });
        }
    },

    jumpToCurrentWeek: (scheduleData) => {
        set({ currentWeekIndex: findCurrentWeekIndex(scheduleData) });
    },

    setCurrentWeekIndex: (idxOrFn) => {
        if (typeof idxOrFn === 'function') {
            set((state) => ({ currentWeekIndex: idxOrFn(state.currentWeekIndex) }));
        } else {
            set({ currentWeekIndex: idxOrFn });
        }
    },

    setThresholds: (thresholds) => set({ thresholds }),

    setOverrides: (overrides) => {
        const { data, abbreviations } = get();
        set({ overrides });
        if (data) {
            const updatedData = { ...data, overrides, abbreviations };
            localStorage.setItem('last_schedule_data', JSON.stringify(updatedData));
            setTimeout(() => set({ metrics: calculateMetrics(updatedData) }), 50);
        }
    },

    setAbbreviations: (abbreviations) => {
        const { data, overrides } = get();
        set({ abbreviations });
        if (data) {
            const updatedData = { ...data, overrides, abbreviations };
            localStorage.setItem('last_schedule_data', JSON.stringify(updatedData));
            setTimeout(() => set({ metrics: calculateMetrics(updatedData) }), 50);
        }
    },

    setError: (error) => set({ error }),

    loadHistoryItem: (item, t) => {
        // Re-use processLoadedData but we need t and lang — handled at component level
        const sanitizedData = sanitizeScheduleData(item.data);
        const metrics = calculateMetrics(sanitizedData);
        const weekIdx = findCurrentWeekIndex(sanitizedData);

        localStorage.setItem('last_schedule_data', JSON.stringify(sanitizedData));

        set({
            data: sanitizedData,
            metrics,
            currentWeekIndex: weekIdx,
            overrides: sanitizedData.overrides || {},
            abbreviations: sanitizedData.abbreviations || {},
            error: null,
            toastMessage: { text: t('success.loadedHistory'), id: Date.now() },
        });
    },

    deleteHistoryItem: (id) => {
        const updated = historyService.delete(id);
        set({ historyList: updated });
    },

    goToUpload: () => {
        localStorage.removeItem('last_schedule_data');
        set({
            data: null,
            metrics: null,
            currentWeekIndex: 0,
            overrides: {},
            abbreviations: {},
            error: null,
            isProcessing: false,
            toastMessage: null,
        });
    },

    resetAll: () => {
        localStorage.removeItem('last_schedule_data');
        localStorage.removeItem('language');
        historyService.clear();
        useUIStore.getState().resetAll();

        set({
            data: null,
            metrics: null,
            currentWeekIndex: 0,
            thresholds: DEFAULT_THRESHOLDS,
            overrides: {},
            abbreviations: {},
            error: null,
            isProcessing: false,
            toastMessage: null,
            historyList: [],
        });
    },
}));

/** Find the index of the current week in the schedule */
function findCurrentWeekIndex(data: ScheduleData): number {
    if (!data.weeks.length) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const firstWeekStart = parseDateFromRange(data.weeks[0].dateRange, 'start');
    const lastWeekEnd = parseDateFromRange(data.weeks[data.weeks.length - 1].dateRange, 'end');

    const weekIdx = data.weeks.findIndex((w) => isCurrentWeek(w.dateRange, now));
    if (weekIdx !== -1) return weekIdx;

    if (firstWeekStart && now < firstWeekStart) return 0;
    if (lastWeekEnd && now > lastWeekEnd) return data.weeks.length - 1;

    return -1; // Within semester bounds but week not explicitly in data (empty week gap)
}
