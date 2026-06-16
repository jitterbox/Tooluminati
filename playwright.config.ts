import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  projects: [
    {
      name: 'vite-basic',
      testMatch: '**/vite-basic.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'agent-troubleshooting-demo',
      testMatch: '**/comparative-proof.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4174',
      },
    },
    {
      name: 'angular-basic',
      testMatch: '**/angular-basic.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4175',
      },
    },
    {
      name: 'angular-troubleshooting-demo',
      testMatch: '**/angular-comparative-proof.spec.ts',
      use: {
        baseURL: 'http://127.0.0.1:4176',
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter vite-basic dev --host 127.0.0.1 --port 4173',
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter agent-troubleshooting-demo dev --host 127.0.0.1 --port 4174',
      port: 4174,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter angular-basic dev',
      port: 4175,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command:
        'pnpm --filter angular-troubleshooting-demo dev',
      port: 4176,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
