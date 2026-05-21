/**
 * Used by build.yml to validate the production build before publishing.
 *
 * Validates the production build by starting the preview server
 * and checking that the game page renders with data-testid="game-root".
 *
 * Usage: node scripts/validate-build.js
 * Or via pnpm run build:validate  (builds first, then validates)
 */

import { spawn } from 'child_process';
import { createServer } from 'net';

// Allow self-signed certificates (used by vite preview's basicSsl plugin)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PAGE_PATH = '/';
const TEST_ID = 'game-root';
const TIMEOUT_MS = 30_000;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function main() {
  let previewProcess;

  try {
    const port = await getFreePort();
    const previewUrl = `https://localhost:${port}`;

    // Start the preview server
    console.log('Starting preview server...');
    previewProcess = spawn('npx', ['vite', 'preview', '--port', String(port)], {
      stdio: 'pipe',
      detached: false,
    });

    previewProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.trim()) console.error('[preview]', msg.trim());
    });

    // Wait for the server to be ready
    await waitForServer(previewUrl, TIMEOUT_MS);
    console.log('Preview server is ready.');

    // Use Playwright to check the game page
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--ignore-certificate-errors'],
    });
    const page = await browser.newPage();

    const url = `${previewUrl}${PAGE_PATH}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT_MS });

    const element = await page.$(`[data-testid="${TEST_ID}"]`);

    await browser.close();

    if (element) {
      console.log(`✅ SUCCESS: Found data-testid="${TEST_ID}" on ${url}`);
      process.exit(0);
    } else {
      console.error(`❌ FAILURE: data-testid="${TEST_ID}" not found on ${url}`);
      console.error(
        `Ensure that the React can compile and run. Test by pnpm run build && pnpm run preview and visiting ${url} in a browser. 
        Either the build failed or the page is not rendering correctly.`,
      );
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
    process.exit(1);
  } finally {
    if (previewProcess) {
      previewProcess.kill();
    }
  }
}

main();
