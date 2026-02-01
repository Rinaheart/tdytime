import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize i18n



const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove App Shell after mount 
const shell = document.getElementById('app-shell');
if (shell) {
  shell.style.opacity = '0';
  setTimeout(() => shell.remove(), 300);
}
