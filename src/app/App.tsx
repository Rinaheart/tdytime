/**
 * App Root — TdyTime v2
 * Mounts router and initializes stores.
 */

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useScheduleStore } from '@/core/stores';

import { PWAUpdateHandler } from './PWAUpdateHandler';

import { SpeedInsights } from '@vercel/speed-insights/react';

const App: React.FC = () => {
    const initFromStorage = useScheduleStore((s) => s.initFromStorage);

    // Initialize data from localStorage on mount
    useEffect(() => {
        initFromStorage();
    }, [initFromStorage]);

    return (
        <>
            <PWAUpdateHandler />
            <RouterProvider router={router} />
            <SpeedInsights />
        </>
    );
};

export default App;
