/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ghPages } from 'vite-plugin-gh-pages';

// Added tsconfigPaths() to resolve pathing issues where Vite cannot identify paths like
// import X from 'src/...';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), ghPages()],
  base: '/StreamLens/',
  // Current tests cover pure functions only; switch to 'jsdom' (and add a setup file for
  // @testing-library/jest-dom) when the first component test lands.
  test: {
    environment: 'node',
  },
});
