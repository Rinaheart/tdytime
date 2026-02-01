/**
 * Shared Schedule Utilities
 * Extracted from WeeklyView, SemesterView to reduce duplication
 */

import { CourseSession, FilterState } from '../types';

// ============================================
// DATE REGEX PATTERNS
// ============================================

/** Regex pattern for DD/MM/YYYY format */
export const DATE_REGEX_SINGLE = /(\d{2})\/(\d{2})\/(\d{4})/;

/** Regex pattern for DD/MM/YYYY global match */
export const DATE_REGEX_GLOBAL = /(\d{2})\/(\d{2})\/(\d{4})/g;

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Get date string for a specific day within a week's date range
 * @param weekDateRange - Date range string e.g. "01/02/2026 - 07/02/2026"
 * @param dayIndex - Index of day (0 = Monday, 6 = Sunday)
 * @returns Formatted date string "DD/MM/YYYY" or empty string on error
 */
export const getDayDateString = (weekDateRange: string, dayIndex: number): string => {
    try {
        const match = weekDateRange.match(DATE_REGEX_SINGLE);
        if (!match) return "";

        const d = parseInt(match[1]);
        const m = parseInt(match[2]);
        const y = parseInt(match[3]);
        const startDate = new Date(y, m - 1, d);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + dayIndex);

        const day = String(targetDate.getDate()).padStart(2, '0');
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const year = targetDate.getFullYear();

        return `${day}/${month}/${year}`;
    } catch {
        return "";
    }
};

/**
 * Parse date from a week's date range
 * @param dateRange - Date range string e.g. "01/02/2026 - 07/02/2026"
 * @param position - 'start' for first date, 'end' for last date
 * @returns Date object or null on error
 */
export const parseDateFromRange = (dateRange: string, position: 'start' | 'end'): Date | null => {
    try {
        const matches = dateRange.match(DATE_REGEX_GLOBAL);
        if (!matches || matches.length < 2) return null;
        const dateStr = position === 'start' ? matches[0] : matches[1];
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    } catch {
        return null;
    }
};

/**
 * Check if a week is the current week
 * @param dateRange - Date range string
 * @param now - Current date reference
 * @returns true if current date falls within the week
 */
export const isCurrentWeek = (dateRange: string, now: Date): boolean => {
    const matches = dateRange.match(DATE_REGEX_GLOBAL);
    if (!matches || matches.length < 2) return false;

    const [ds, ms, ys] = matches[0].split('/').map(Number);
    const [de, me, ye] = matches[1].split('/').map(Number);

    const start = new Date(ys, ms - 1, ds);
    const end = new Date(ye, me - 1, de);
    const check = new Date(now);
    check.setHours(0, 0, 0, 0);

    return check >= start && check <= end;
};

/**
 * Check if a week is in the past
 * @param dateRange - Date range string
 * @param now - Current date reference
 * @returns true if the week has already passed
 */
export const isPastWeek = (dateRange: string, now: Date): boolean => {
    const matches = dateRange.match(DATE_REGEX_GLOBAL);
    if (!matches || matches.length < 2) return false;

    const [de, me, ye] = matches[1].split('/').map(Number);
    const end = new Date(ye, me - 1, de);
    const check = new Date(now);
    check.setHours(23, 59, 59, 999);

    return check > end;
};

// ============================================
// SESSION FILTERS
// ============================================

/**
 * Create a filter function for sessions based on filter state
 * @param filters - Current filter state
 * @returns Filter function that returns true if session matches filters
 */
export const createSessionFilter = (filters: FilterState) => {
    return (session: CourseSession): boolean => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const nameMatch = session.courseName.toLowerCase().includes(searchLower);
            const codeMatch = session.courseCode.toLowerCase().includes(searchLower);
            if (!nameMatch && !codeMatch) return false;
        }
        if (filters.className && session.className !== filters.className) return false;
        if (filters.room && session.room !== filters.room) return false;
        if (filters.teacher && session.teacher !== filters.teacher) return false;
        return true;
    };
};
