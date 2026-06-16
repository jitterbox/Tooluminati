import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const exampleRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(exampleRoot, '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tooluminati/core': path.resolve(
        repoRoot,
        'packages/core/src/index.ts',
      ),
      '@tooluminati/diagnostics': path.resolve(
        repoRoot,
        'packages/diagnostics/src/index.ts',
      ),
      '@tooluminati/react': path.resolve(
        repoRoot,
        'packages/react/src/index.ts',
      ),
      '@tooluminati/testing': path.resolve(
        repoRoot,
        'packages/testing/src/index.ts',
      ),
    },
  },
});
