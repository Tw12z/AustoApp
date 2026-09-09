import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import tr from './locales/tr.json'
import en from './locales/en.json'

export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
    },
    fallbackLng: 'tr',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'austo-language',
    },
  })

// Keep <html lang> in sync so browser/CSS behavior (e.g. Turkish dotted-I
// uppercasing) matches the active language instead of staying hardcoded.
const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng
}
syncHtmlLang(i18n.resolvedLanguage ?? i18n.language)
i18n.on('languageChanged', syncHtmlLang)

export default i18n
