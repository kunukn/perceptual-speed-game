import type { RouteObject } from 'react-router';
import { paths } from '@/app/paths';

/* Every route is lazy: each screen becomes its own JS chunk so only the
 * routes a user actually visits get downloaded. */
export const gameRoutes: RouteObject[] = [
  {
    path: paths.home,
    lazy: async () => {
      const { Intro } = await import('./screens/Intro');
      return { Component: Intro };
    },
  },
  {
    path: paths.options,
    lazy: async () => {
      const { Options } = await import('./screens/Options');
      return { Component: Options };
    },
  },
  {
    path: paths.records,
    lazy: async () => {
      const { Records } = await import('./screens/Records');
      return { Component: Records };
    },
  },
  {
    path: paths.play,
    lazy: async () => {
      const { Play } = await import('./screens/Play');
      return { Component: Play };
    },
  },
  {
    path: paths.results,
    lazy: async () => {
      const { Results } = await import('./screens/Results');
      return { Component: Results };
    },
  },
  {
    path: paths.review,
    lazy: async () => {
      const { Review } = await import('./screens/Review');
      return { Component: Review };
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFound } = await import('./screens/NotFound');
      return { Component: NotFound };
    },
  },
];
