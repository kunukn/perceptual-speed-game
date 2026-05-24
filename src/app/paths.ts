/* Typed path constants — avoid magic-string drift across navigate() call sites. */
export const paths = {
  home: '/',
  options: '/options',
  records: '/records',
  play: '/play',
  results: '/results',
  review: '/review',
  matchingPairs: '/matching-pairs',
} as const;

export type AppPath = (typeof paths)[keyof typeof paths];
