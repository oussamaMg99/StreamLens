import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en/translation.json';
import frTranslations from './fr/translation.json';
import arTranslations from './ar/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    fr: { translation: frTranslations },
    ar: { translation: arTranslations },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
