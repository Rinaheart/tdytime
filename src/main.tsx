/**
 * Entry Point — TdyTime v2
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Initialize i18n before rendering
import './i18n/config';

// Global styles
import './styles/global.css';

import App from './app/App';

/**
 * Deferred SpeedInsights to avoid blocking initial render
 */
const DeferredSpeedInsights = () => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 2000);
        return () => clearTimeout(timer);
    }, []);
    return mounted ? <SpeedInsights /> : null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        <DeferredSpeedInsights />
    </React.StrictMode>,
);
