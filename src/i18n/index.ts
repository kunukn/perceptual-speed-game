import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

const SUPPORTED = [
  'en',
  'da',
  'de',
  'es',
  'fr',
  'pt',
  'id',
  'ru',
  'zh',
  'ja',
  'hi',
  'bn',
  'ar',
  'ur',
] as const;

const RTL = new Set<string>(['ar', 'ur']);

export function isRtl(lng: string): boolean {
  return RTL.has(lng.toLowerCase().split('-')[0]);
}

/*
 * Pick the first browser-preferred language we support. `navigator.languages`
 * is ordered by user preference; we match on the primary subtag so `da-DK`
 * resolves to `da`. Falls back to English when nothing matches or in SSR/test.
 */
function detectInitialLanguage(): string {
  const candidates =
    typeof navigator !== 'undefined'
      ? [...(navigator.languages ?? []), navigator.language].filter(Boolean)
      : [];

  debugLog('[i18n] navigator candidates', candidates);

  for (const tag of candidates) {
    const primary = tag.toLowerCase().split('-')[0];
    if ((SUPPORTED as readonly string[]).includes(primary)) {
      debugLog('[i18n] detected initial language', primary);
      return primary;
    }
  }

  debugLog('[i18n] no supported candidate, falling back to en');

  return 'en';
}

/*
 * English is bundled eagerly so first paint never blocks on a network round-trip.
 * Every other language is fetched on demand — each JSON becomes its own code-split
 * chunk, browser-cached after the first load. Plain `*` glob (extglob negation
 * resolved to an empty object in the production build) — en.json is filtered out
 * below.
 */
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>(
  './locales/*.json',
);
delete localeLoaders['./locales/en.json'];

debugLog(
  '[i18n] available lazy locales',
  Object.keys(localeLoaders).map((p) => p.match(/([a-z]+)\.json$/)?.[1]),
);

void i18n
  .use(
    resourcesToBackend(async (language: string) => {
      const key = `./locales/${language}.json`;
      const loader = localeLoaders[key];
      debugLog('[i18n] load requested', { language, hasLoader: !!loader });
      if (!loader) return {};

      try {
        const mod = await loader();
        debugLog('[i18n] loaded', language);

        return mod.default ?? mod;
      } catch (err) {
        debugLog('[i18n] load failed', language, err);
        throw err;
      }
    }),
  )
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    lng: detectInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED],
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
    returnNull: false,
  });

i18n.on('languageChanged', (lng) => {
  debugLog('[i18n] languageChanged', lng);
});
i18n.on('failedLoading', (lng, ns, msg) => {
  debugLog('[i18n] failedLoading', { lng, ns, msg });
});

export default i18n;
