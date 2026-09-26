import { defineConfig } from '@playwright/test';

// Isolated from the mock suite: no mock init scripts or application servers.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/real-chrome-webmcp.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  use: {
    ...(process.env.WEBMCP_CHROME_EXECUTABLE ? {} : { channel: 'chrome' }),
    launchOptions: {
      ...(process.env.WEBMCP_CHROME_EXECUTABLE
        ? { executablePath: process.env.WEBMCP_CHROME_EXECUTABLE }
        : {}),
      args: ['--enable-features=WebMCPTesting,DevToolsWebMCPSupport'],
    },
  },
});
