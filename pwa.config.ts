import type { VitePWAOptions } from 'vite-plugin-pwa';

/*
 * Precache only the app shell + Latin fonts. Heavy non-Latin font families and
 * non-English i18n locale chunks are fetched on demand and cached the first
 * time a user actually requests them (cache-first). First visit downloads
 * ~1–2 MiB instead of ~12 MiB; offline support is automatic once a user has
 * touched a given language or letter system at least once online.
 */
export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: [
    'favicon.svg',
    'apple-touch-icon.png',
    'pwa-192.png',
    'pwa-512.png',
    'pwa-512-maskable.png',
  ],
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
    globIgnores: [
      // Per-locale code-split chunks (English is bundled into index-*.js)
      'assets/{ar,bn,da,de,es,fr,hi,id,ja,pt,ru,ur,zh}-*.js',
      // Heavy non-Latin font families
      'fonts/noto-sans-jp/**',
      'fonts/noto-sans-sc/**',
      'fonts/noto-sans-arabic/**',
      'fonts/noto-sans-bengali/**',
      'fonts/noto-sans-devanagari/**',
      'fonts/noto-nastaliq-urdu/**',
    ],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ url, sameOrigin }) =>
          sameOrigin &&
          /\/assets\/(ar|bn|da|de|es|fr|hi|id|ja|pt|ru|ur|zh)-[A-Za-z0-9_-]+\.js$/.test(
            url.pathname,
          ),
        handler: 'CacheFirst',
        options: {
          cacheName: 'i18n-locales',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 180,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: ({ url, sameOrigin }) =>
          sameOrigin &&
          /\/fonts\/(noto-sans-jp|noto-sans-sc|noto-sans-arabic|noto-sans-bengali|noto-sans-devanagari|noto-nastaliq-urdu)\//.test(
            url.pathname,
          ),
        handler: 'CacheFirst',
        options: {
          cacheName: 'noto-fonts',
          expiration: {
            maxEntries: 400,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
  manifest: {
    name: 'Perceptual Speed Game',
    short_name: 'Perceptual',
    description:
      'Count matching letter pairs across two rows — a perceptual-speed brain trainer.',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'any',
    start_url: '.',
    scope: '.',
    icons: [
      { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: 'pwa-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
};
