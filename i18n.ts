import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

import { APP_VERSION } from './constants';

const resources = {
    vi: { translation: viTranslation },
    en: { translation: enTranslation }
};

let defaultLanguage = 'vi';
try {
    defaultLanguage = localStorage.getItem('language') || 'vi';
} catch (e) {
    console.warn('LocalStorage not accessible, falling back to "vi"');
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false, // React already escapes
            defaultVariables: {
                version: APP_VERSION
            }
        }
    });

// Update document lang attribute on change
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

// Initial set
document.documentElement.lang = i18n.language || defaultLanguage;

export default i18n;
