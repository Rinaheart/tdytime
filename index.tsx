
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize i18n
import { SpeedInsights } from '@vercel/speed-insights/react';



const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    {import.meta.env.PROD && <SpeedInsights />}
  </React.StrictMode>
);
