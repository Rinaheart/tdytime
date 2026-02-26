/**
 * App Router — TdyTime v2
 * Hash-based routing for PWA compatibility (back button works).
 */

import React, { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { useScheduleStore } from '@/core/stores';
import AppLayout from './layout/AppLayout';

import { SessionCardSkeleton } from '@/ui/primitives';

// Lazy-loaded views
const WelcomeView = lazy(() => import('@/views/welcome/WelcomeView'));
const TodayView = lazy(() => import('@/views/today/TodayView'));
const WeeklyView = lazy(() => import('@/views/weekly/WeeklyView'));
const SemesterView = lazy(() => import('@/views/semester/SemesterView'));
const StatisticsView = lazy(() => import('@/views/statistics/StatisticsView'));
const SettingsView = lazy(() => import('@/views/settings/SettingsView'));

/** Loading fallback with premium Skeleton UI */
const LoadingFallback = () => (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
    </div>
);

/** Redirect to /welcome if no data loaded, otherwise render children */
const RequireData = ({ children }: { children: React.ReactNode }) => {
    const hasData = useScheduleStore((s) => !!s.data);
    if (!hasData) return <Navigate to="/" replace />;
    return <>{children}</>;
};

export const router = createHashRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <WelcomeView />
            </Suspense>
        ),
    },
    {
        element: (
            <RequireData>
                <AppLayout />
            </RequireData>
        ),
        children: [
            {
                path: '/today',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <TodayView />
                    </Suspense>
                ),
            },
            {
                path: '/week',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <WeeklyView />
                    </Suspense>
                ),
            },
            {
                path: '/semester',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SemesterView />
                    </Suspense>
                ),
            },
            {
                path: '/stats',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <StatisticsView />
                    </Suspense>
                ),
            },
            {
                path: '/settings',
                element: (
                    <Suspense fallback={<LoadingFallback />}>
                        <SettingsView />
                    </Suspense>
                ),
            },
        ],
    },
    // Fallback
    { path: '*', element: <Navigate to="/" replace /> },
]);
