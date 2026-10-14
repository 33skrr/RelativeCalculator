import { existsSync } from 'node:fs';
import { chromium, defineConfig } from '@playwright/test';

const localChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
  (!existsSync(chromium.executablePath()) && process.platform === 'win32' && existsSync(localChrome)
    ? localChrome : undefined);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    launchOptions: { executablePath },
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});
