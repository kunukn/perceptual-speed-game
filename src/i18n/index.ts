import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import da from './locales/da.json';
import en from './locales/en.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    da: { translation: da },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
