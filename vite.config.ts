/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ghPages } from 'vite-plugin-gh-pages';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ghPages()],
  base: '/StreamLens/',
  // Resolves `import X from 'src/...'` from tsconfig.json's `paths`.
  resolve: { tsconfigPaths: true },
  // Current tests cover pure functions only; switch to 'jsdom' (and add a setup file for
  // @testing-library/jest-dom) when the first component test lands.
  test: {
    environment: 'node',
  },
});
