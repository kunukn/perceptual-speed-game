import tailwindcss from '@tailwindcss/vite';
import pluginReact from '@vitejs/plugin-react-swc';
import { CodeInspectorPlugin } from 'code-inspector-plugin';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig, loadEnv } from 'vite';
import { autoImportConfig } from './auto-import.config';

dayjs.extend(utc);

/*
 * Stamp the build with a single UTC timestamp shared between the HTML
 * `data-build` attribute and the runtime `VITE_APP_VERSION` constant, so
 * both always agree for a given build.
 */
function injectBuildTime(buildTime: string) {
  return {
    name: 'inject-build-time',
    transformIndexHtml(html: string) {
      return html.replace(
        '<html lang="en"',
        `<html lang="en" data-build="${buildTime}"`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.debug('*** Code Inspector: ', env.VITE_CODE_INSPECTOR);

  const buildTime = `utc_${dayjs.utc().format('YYYY-MM-DD_HHmmss')}`;

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(buildTime),
    },
    /*
     * Local dev/preview use base `/`. The GitHub Pages deploy serves under
     * `/perceptual-speed-game/`; the deploy workflow sets VITE_BASE_PATH to
     * opt in so built asset URLs resolve under the subpath.
     */
    base: process.env.VITE_BASE_PATH ?? '/',
    // Keep Vite's pre-bundle cache under node_modules instead of the project root.
    cacheDir: 'node_modules/.vite',
    plugins: [
      // Combination keys for Mac are Option + Shift; for Windows, it's Alt + Shift
      ...(['1', 'true'].includes(env.VITE_CODE_INSPECTOR)
        ? [CodeInspectorPlugin({ bundler: 'vite' })]
        : []),
      injectBuildTime(buildTime),
      tailwindcss(),
      pluginReact({
        devTarget: 'es2024',
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-emotion', {}]],
      }),
      AutoImport({
        imports: autoImportConfig as any,
        dts: true, // generates TypeScript definitions
      }),
    ].filter(Boolean), // Remove any falsey values
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
