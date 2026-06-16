import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@react-webmcp-diagnostics/core':
        '/home/cory/repos/ReactWebMCP/packages/core/src/index.ts',
      '@react-webmcp-diagnostics/policies':
        '/home/cory/repos/ReactWebMCP/packages/policies/src/index.ts',
      '@react-webmcp-diagnostics/react':
        '/home/cory/repos/ReactWebMCP/packages/react/src/index.ts',
      '@react-webmcp-diagnostics/diagnostics':
        '/home/cory/repos/ReactWebMCP/packages/diagnostics/src/index.ts',
      '@react-webmcp-diagnostics/testing':
        '/home/cory/repos/ReactWebMCP/packages/testing/src/index.ts',
      '@react-webmcp-diagnostics/forms':
        '/home/cory/repos/ReactWebMCP/packages/forms/src/index.ts',
      '@react-webmcp-diagnostics/router':
        '/home/cory/repos/ReactWebMCP/packages/router/src/index.ts',
      '@react-webmcp-diagnostics/state':
        '/home/cory/repos/ReactWebMCP/packages/state/src/index.ts',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
  },
});
