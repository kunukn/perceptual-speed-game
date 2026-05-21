import tailwindcss from '@tailwindcss/vite';
import pluginReact from '@vitejs/plugin-react-swc';
import { CodeInspectorPlugin } from 'code-inspector-plugin';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig, loadEnv } from 'vite';
import { autoImportConfig } from './auto-import.config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.debug('*** Code Inspector: ', env.VITE_CODE_INSPECTOR);

  return {
    /*
     * Local dev/preview use base `/`. The GitHub Pages deploy serves under
     * `/perceptual-speed-game/`; the deploy workflow sets VITE_BASE_PATH to
     * opt in so built asset URLs resolve under the subpath.
     */
    base: process.env.VITE_BASE_PATH ?? '/',
    plugins: [
      // Combination keys for Mac are Option + Shift; for Windows, it's Alt + Shift
      ...(['1', 'true'].includes(env.VITE_CODE_INSPECTOR)
        ? [CodeInspectorPlugin({ bundler: 'vite' })]
        : []),
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
