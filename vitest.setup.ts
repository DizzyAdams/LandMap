// Vitest setup: jsdom environment polyfills.
// gsap/ScrollTrigger (used by apps/web Motion.tsx) accesses window.matchMedia
// at import time; jsdom does not implement it, so we provide a no-op polyfill
// before any test module is imported.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
