/**
 * i18n Configuration — TdyTime v2
 * Loads Vietnamese and English translations with localStorage persistence.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { APP_VERSION } from '@/core/constants';

import vi from './vi.json';
import en from './en.json';

// Detect saved language preference
let defaultLanguage = 'vi';
try {
    defaultLanguage = localStorage.getItem('language') || 'vi';
} catch {
    console.warn('LocalStorage not accessible, falling back to "vi"');
}

i18n.use(initReactI18next).init({
    resources: {
        vi: { translation: vi },
        en: { translation: en },
    },
    lng: defaultLanguage,
    fallbackLng: 'vi',
    interpolation: {
        escapeValue: false,
        defaultVariables: { version: APP_VERSION },
    },
    react: {
        useSuspense: false,
    },
});

// Sync document lang attribute
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language || defaultLanguage;

export default i18n;
