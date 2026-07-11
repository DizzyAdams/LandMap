import { defineConfig } from 'tsup';

// Everything that must be provided by the consuming app (Next.js) at runtime
// MUST be external. If not, esbuild inlines a CJS copy (e.g. `next/link`,
// `react/jsx-runtime`) and wraps it with a `Dynamic require(...)` shim that
// throws in the browser — crashing hydration for every page that renders a
// component from this package. Note: esbuild's `external: ['react']` does NOT
// cover subpaths like `react/jsx-runtime`, so we list them explicitly and use
// a regex to catch all `next/*` entry points.
const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'framer-motion',
  'next',
  /^next\//,
];

export default [
  // Main entry: interactive components. Marked "use client" so server
  // components can safely import primitives (Tabs, Segmented, Toast, ...).
  defineConfig({
    entry: ['src/index.ts', 'src/styles.css'],
    format: ['esm'],
    dts: true,
    clean: true,
    banner: { js: '"use client";' },
    external,
  }),
  // Server-safe utilities (cn, config). Deliberately has NO "use client"
  // banner so React Server Components can import them as real functions
  // instead of client-reference proxies. See `src/server.ts` and GlowPanel.
  defineConfig({
    entry: { server: 'src/server.ts' },
    format: ['esm'],
    dts: true,
    clean: false,
    external,
  }),
];
