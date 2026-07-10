import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm'],
  dts: true,
  clean: true,
  // Mark the whole bundle as a client module so Next.js server components
  // can safely import interactive primitives (Tabs, Segmented, etc.).
  banner: { js: '"use client";' },
  external: ['react', 'react-dom', 'framer-motion'],
});
