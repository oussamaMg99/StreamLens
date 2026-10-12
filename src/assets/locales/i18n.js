import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en/translation.json';
import frTranslations from './fr/translation.json';
import arTranslations from './ar/translation.json';

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
  ar: { translation: arTranslations },
};

// The language is a saved preference, like the theme. localStorage can throw when blocked.
const LANGUAGE_KEY = '_language';
const savedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved && saved in resources ? saved : undefined;
  } catch {
    return undefined;
  }
};
const saveLanguage = lng => {
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // Storage blocked: the choice just isn't remembered.
  }
};

await i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage() ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// dir mirrors logical CSS for Arabic; lang is for screen readers and the browser.
const applyDirection = lng => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
};
i18n.on('languageChanged', lng => {
  applyDirection(lng);
  saveLanguage(lng);
});
applyDirection(i18n.language);

export default i18n;
