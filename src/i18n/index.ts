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

  for (const tag of candidates) {
    const primary = tag.toLowerCase().split('-')[0];
    if ((SUPPORTED as readonly string[]).includes(primary)) return primary;
  }

  return 'en';
}

/*
 * English is bundled eagerly so first paint never blocks on a network round-trip.
 * Every other language is fetched on demand — each JSON becomes its own code-split
 * chunk, browser-cached after the first load. `import.meta.glob` with a negation
 * pattern excludes en.json from the dynamic set so Rollup doesn't emit
 * INEFFECTIVE_DYNAMIC_IMPORT for the eagerly bundled locale.
 */
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>(
  './locales/!(en).json',
);

void i18n
  .use(
    resourcesToBackend(async (language: string) => {
      const loader = localeLoaders[`./locales/${language}.json`];
      if (!loader) return {};

      const mod = await loader();

      return mod.default ?? mod;
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

export default i18n;
