import React from 'react';

/**
 * Route-transition wrapper. App Router remounts `template.tsx` on every
 * navigation, so the `animate-in` utility replays — a subtle, tasteful
 * fade-and-rise that reads as "premium" without ever getting in the way.
 * Neutralized under `prefers-reduced-motion` (see globals.css).
 */
export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>;
}
