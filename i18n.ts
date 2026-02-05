import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { APP_VERSION } from './constants';

import vi from './locales/vi.json';
import en from './locales/en.json';

// Default language detection
let defaultLanguage = 'vi';
try {
    defaultLanguage = localStorage.getItem('language') || 'vi';
} catch (e) {
    console.warn('LocalStorage not accessible, falling back to "vi"');
}

// Initialize directly with resources
i18n
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: vi },
            en: { translation: en }
        },
        lng: defaultLanguage,
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false,
            defaultVariables: {
                version: APP_VERSION
            }
        },
        react: {
            useSuspense: false // We have resources loaded immediately
        }
    });

// Handle meta lang update
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

// Initial set
document.documentElement.lang = i18n.language || defaultLanguage;

export default i18n;
