import React, { lazy, Suspense, useEffect, useState } from 'react';

const Analytics = lazy(() =>
    import('@vercel/analytics/react').then((m) => ({ default: m.Analytics }))
);
const SpeedInsights = lazy(() =>
    import('@vercel/speed-insights/react').then((m) => ({
        default: m.SpeedInsights,
    }))
);

/**
 * Monitoring Wrapper — Deferred Loading
 * Delays Analytics/SpeedInsights until browser is idle to reduce TBT.
 */
interface MonitoringProps {
    children: React.ReactNode;
}

export default function Monitoring({ children }: MonitoringProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if ('requestIdleCallback' in window) {
            const id = requestIdleCallback(() => setReady(true), {
                timeout: 3000,
            });
            return () => cancelIdleCallback(id);
        } else {
            const id = setTimeout(() => setReady(true), 2000);
            return () => clearTimeout(id);
        }
    }, []);

    return (
        <>
            {children}
            {ready && (
                <Suspense fallback={null}>
                    <Analytics />
                    <SpeedInsights />
                </Suspense>
            )}
        </>
    );
}
