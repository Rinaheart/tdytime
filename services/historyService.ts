
import { ScheduleData } from '../types';

const STORAGE_KEY = 'timetable_history_v1';
const MAX_ITEMS = 10;

export interface HistoryMetadata {
    id: string;
    teacher: string;
    semester: string;
    academicYear: string;
    savedAt: number;
    preview: string; // e.g. "HK1 2024-2025"
}

export interface HistoryItem extends HistoryMetadata {
    data: ScheduleData;
}

export const historyService = {
    // Save schedule to history
    save: (data: ScheduleData): void => {
        try {
            const existingJson = localStorage.getItem(STORAGE_KEY);
            let history: HistoryItem[] = existingJson ? JSON.parse(existingJson) : [];

            // Create new item
            const newItem: HistoryItem = {
                id: Date.now().toString(),
                teacher: data.metadata.teacher,
                semester: data.metadata.semester,
                academicYear: data.metadata.academicYear,
                savedAt: Date.now(),
                preview: `${data.metadata.semester} - ${data.metadata.academicYear}`,
                data: data
            };

            // Check for duplicates (same teacher + semester + year) -> Update existing
            const duplicateIndex = history.findIndex(
                item =>
                    item.teacher === newItem.teacher &&
                    item.semester === newItem.semester &&
                    item.academicYear === newItem.academicYear
            );

            if (duplicateIndex !== -1) {
                // Move to top and update
                history.splice(duplicateIndex, 1);
            }

            // Add to beginning
            history.unshift(newItem);

            // Limit size
            if (history.length > MAX_ITEMS) {
                history = history.slice(0, MAX_ITEMS);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save history:', error);
            // Handle quota exceeded?
        }
    },

    // Get list of history (metadata only ideally, but we store full for now)
    getAll: (): HistoryItem[] => {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            return [];
        }
    },

    // Delete specific item
    delete: (id: string): HistoryItem[] => {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return [];

            let history: HistoryItem[] = JSON.parse(json);
            history = history.filter(item => item.id !== id);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
            return history;
        } catch (error) {
            return [];
        }
    },

    // Clear all
    clear: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
