import { useState, useMemo } from 'react';
import { useScheduleStore } from '@/core/stores/schedule.store';
import { createSessionFilter } from '@/core/schedule/schedule.utils';
import type { FilterState } from '@/core/schedule/schedule.utils';
import type { WeekSchedule } from '@/core/schedule/schedule.types';

/**
 * useScheduleFilter — Core hook for managing schedule search and filtering.
 * 
 * @deprecated v2.0: Hook now consumes sessionsIndex internally.
 * Remove `weeks` param from callsites in Phase 3.
 * 
 * @param _deprecatedWeeks - (Deprecated) Previously used to derive unique data.
 * @param initialTeacher - Optional default teacher filter.
 */
export function useScheduleFilter(_deprecatedWeeks?: WeekSchedule[], initialTeacher: string = '') {
    const { sessionsIndex } = useScheduleStore();
    
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        className: '',
        room: '',
        teacher: initialTeacher,
        sessionTime: '',
    });
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const toggleFilter = () => setIsFilterOpen((v) => !v);

    const now = useMemo(() => new Date(), []);
    const filterFn = useMemo(() => createSessionFilter(filters), [filters]);

    const hasActiveFilters = useMemo(
        () => filters.search !== '' || filters.className !== '' || filters.room !== '' || (filters.teacher !== '' && filters.teacher !== initialTeacher),
        [filters, initialTeacher]
    );

    const uniqueData = useMemo(() => {
        const rooms = new Set<string>();
        const teachers = new Set<string>();
        const classes = new Set<string>();
        
        sessionsIndex.forEach((s) => {
            if (s.room) rooms.add(s.room);
            if (s.teacher) teachers.add(s.teacher);
            if (s.className) classes.add(s.className);
        });
        
        return {
            rooms: Array.from(rooms).sort(),
            teachers: Array.from(teachers).sort(),
            classes: Array.from(classes).sort()
        };
    }, [sessionsIndex]);

    const semesterBounds = useScheduleStore((s) => s.semesterBounds);
    
    const isAfterSemester = useMemo(() => {
        if (!semesterBounds) return false;
        return now.getTime() >= semesterBounds.end;
    }, [semesterBounds, now]);

    const isBeforeSemester = useMemo(() => {
        if (!semesterBounds) return false;
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        
        // Before first day of semester (day-based)
        const semesterStartDay = new Date(semesterBounds.start);
        semesterStartDay.setHours(0, 0, 0, 0);
        
        return today.getTime() < semesterStartDay.getTime();
    }, [semesterBounds, now]);

    return {
        filters,
        setFilters,
        isFilterOpen,
        toggleFilter,
        filterFn,
        hasActiveFilters,
        uniqueData,
        isAfterSemester,
        isBeforeSemester,
        now
    };
}
