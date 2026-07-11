import React from 'react';

/**
 * Route-transition wrapper. App Router remounts `template.tsx` on every
 * navigation, so the `.page-enter` keyframe replays — a subtle, tasteful
 * fade-and-rise that reads as "premium" without ever getting in the way.
 * Neutralized under `prefers-reduced-motion` (see globals.css).
 */
export default function LocaleTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
