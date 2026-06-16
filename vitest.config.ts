import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tooluminati/core': path.resolve(
        repoRoot,
        'packages/core/src/index.ts',
      ),
      '@tooluminati/policies': path.resolve(
        repoRoot,
        'packages/policies/src/index.ts',
      ),
      '@tooluminati/react': path.resolve(
        repoRoot,
        'packages/react/src/index.ts',
      ),
      '@tooluminati/diagnostics': path.resolve(
        repoRoot,
        'packages/diagnostics/src/index.ts',
      ),
      '@tooluminati/testing': path.resolve(
        repoRoot,
        'packages/testing/src/index.ts',
      ),
      '@tooluminati/forms': path.resolve(
        repoRoot,
        'packages/forms/src/index.ts',
      ),
      '@tooluminati/router': path.resolve(
        repoRoot,
        'packages/router/src/index.ts',
      ),
      '@tooluminati/state': path.resolve(
        repoRoot,
        'packages/state/src/index.ts',
      ),
      '@tooluminati/angular': path.resolve(
        repoRoot,
        'packages/angular/src/index.ts',
      ),
      '@tooluminati/angular-forms': path.resolve(
        repoRoot,
        'packages/angular-forms/src/index.ts',
      ),
      '@tooluminati/angular-router': path.resolve(
        repoRoot,
        'packages/angular-router/src/index.ts',
      ),
      '@tooluminati/angular-state': path.resolve(
        repoRoot,
        'packages/angular-state/src/index.ts',
      ),
      '@tooluminati/angular-devtools': path.resolve(
        repoRoot,
        'packages/angular-devtools/src/index.ts',
      ),
      '@tooluminati/devtools': path.resolve(
        repoRoot,
        'packages/devtools/src/index.ts',
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'packages/**/*.test.ts',
      'packages/**/*.test.tsx',
    ],
  },
});
