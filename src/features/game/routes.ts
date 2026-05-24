import type { RouteObject } from 'react-router';
import { paths } from '@/app/paths';

/* Every route is lazy: each page becomes its own JS chunk so only the
 * routes a user actually visits get downloaded. */
export const gameRoutes: RouteObject[] = [
  {
    path: paths.home,
    lazy: async () => {
      const { Intro } = await import('./pages/Intro');
      return { Component: Intro };
    },
  },
  {
    path: paths.options,
    lazy: async () => {
      const { Options } = await import('./pages/Options');
      return { Component: Options };
    },
  },
  {
    path: paths.records,
    lazy: async () => {
      const { Records } = await import('./pages/Records');
      return { Component: Records };
    },
  },
  {
    path: paths.play,
    lazy: async () => {
      const { Play } = await import('./pages/Play');
      return { Component: Play };
    },
  },
  {
    path: paths.results,
    lazy: async () => {
      const { Results } = await import('./pages/Results');
      return { Component: Results };
    },
  },
  {
    path: paths.review,
    lazy: async () => {
      const { Review } = await import('./pages/Review');
      return { Component: Review };
    },
  },
  {
    path: paths.matchingPairs,
    lazy: async () => {
      const { MatchingPairs } = await import('./pages/MatchingPairs');
      return { Component: MatchingPairs };
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFound } = await import('./pages/NotFound');
      return { Component: NotFound };
    },
  },
];
