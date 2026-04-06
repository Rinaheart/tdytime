import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * Monitoring Wrapper — Practical Pro Edition
 * Consolidates Vercel Analytics and Speed Insights into a single, stateless component.
 */
interface MonitoringProps {
    children: React.ReactNode;
}

export default function Monitoring({ children }: MonitoringProps) {
    return (
        <>
            {children}
            <Analytics />
            <SpeedInsights />
        </>
    );
}
