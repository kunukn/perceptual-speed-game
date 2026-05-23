import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

/*
 * English is bundled eagerly so first paint never blocks on a network round-trip.
 * Every other language is fetched on demand via Vite's dynamic import — each JSON
 * becomes its own code-split chunk, browser-cached after the first load.
 *
 * Rollup will warn `INEFFECTIVE_DYNAMIC_IMPORT` for en.json — that's expected: the
 * dynamic form matches en.json too but is never called for it, since `resources`
 * below already provides en synchronously.
 */
void i18n
  .use(
    resourcesToBackend(async (language: string) => {
      const mod = await import(`./locales/${language}.json`);

      return mod.default ?? mod;
    }),
  )
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'da'],
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
