import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm'],
  dts: true,
  clean: true,
  // Mark the whole bundle as a client module so Next.js server components
  // can safely import interactive primitives (Tabs, Segmented, etc.).
  banner: { js: '"use client";' },
  // Everything that must be provided by the consuming app (Next.js) at runtime
  // MUST be external. If not, esbuild inlines a CJS copy (e.g. `next/link`,
  // `react/jsx-runtime`) and wraps it with a `Dynamic require(...)` shim that
  // throws in the browser — crashing hydration for every page that renders a
  // component from this package. Note: esbuild's `external: ['react']` does NOT
  // cover subpaths like `react/jsx-runtime`, so we list them explicitly and use
  // a regex to catch all `next/*` entry points.
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'framer-motion',
    'next',
    /^next\//,
  ],
});
