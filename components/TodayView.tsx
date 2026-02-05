import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScheduleData, CourseType } from '../types';
import { useTodayData } from '../hooks/useTodayData';
import TodayHeader from './TodayHeader';
import SessionList from './SessionList';
import EmptyStateCard from './EmptyStateCard';
import NextTeachingSection from './NextTeachingSection';
import DebugPanel, { MockDisplayState } from './DebugPanel';

interface TodayViewProps {
    data: ScheduleData;
    overrides: Record<string, CourseType>;
    abbreviations: Record<string, string>;
    onSwitchTab: (tab: any) => void;
    setCurrentWeekIndex: (idx: number) => void;
}

const TodayView: React.FC<TodayViewProps> = ({
    data,
    overrides,
    abbreviations,
    onSwitchTab,
    setCurrentWeekIndex
}) => {
    const { t } = useTranslation();

    // Debug State (Dev Mode Only)
    const [mockState, setMockState] = useState<MockDisplayState>('REAL');
    const [mockDate, setMockDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [mockTime, setMockTime] = useState<string>('');

    // Data Hook
    const todayData = useTodayData({ data, mockState, mockDate, mockTime });
    const {
        dateInfo,
        dayOfWeekIdx,
        displayState,
        todaySessions,
        nextTeaching,
        greeting,
        daysUntilSemester
    } = todayData;

    const isFinished = todaySessions.length > 0 && todaySessions.every(s => s.status === 'COMPLETED');
    const isToday = displayState === 'HAS_SESSIONS';

    return (
        <div className="pb-7">
            {/* Header */}
            <TodayHeader
                dayOfWeekIdx={dayOfWeekIdx}
                dateInfo={dateInfo}
                greeting={greeting}
            />

            {/* Main Content */}
            <main className="mt-0">
                {isToday ? (
                    <SessionList
                        sessions={todaySessions}
                        overrides={overrides}
                        abbreviations={abbreviations}
                    />
                ) : (
                    <EmptyStateCard
                        type={displayState}
                        onAction={onSwitchTab}
                        daysUntilStart={daysUntilSemester}
                        t={t}
                    />
                )}

                {/* Next Teaching (when applicable) */}
                {nextTeaching && displayState !== 'AFTER_SEMESTER' && (
                    <NextTeachingSection
                        nextTeaching={nextTeaching}
                        abbreviations={abbreviations}
                        overrides={overrides}
                        onSwitchTab={onSwitchTab}
                        setCurrentWeekIndex={setCurrentWeekIndex}
                        isBeforeSemester={displayState === 'BEFORE_SEMESTER'}
                        isTodayFinished={isFinished}
                        isNoSessionsToday={displayState === 'NO_SESSIONS'}
                        t={t}
                    />
                )}
            </main>

            {/* Dev Tools */}
            {import.meta.env.DEV && (
                <DebugPanel
                    mockState={mockState}
                    onStateChange={setMockState}
                    mockDate={mockDate}
                    onDateChange={setMockDate}
                    mockTime={mockTime}
                    onTimeChange={setMockTime}
                />
            )}
        </div>
    );
};

export default React.memo(TodayView);
