/**
 * LandMap design tokens — the "fora do comum" dark-premium system.
 *
 * Single source of truth for the brand palette. It mirrors the CSS custom
 * properties defined in `apps/web/src/app/globals.css` (and `@landmap/ui`'s
 * own `styles.css`) so that JS / inline-style usage — e.g. the <Button>
 * component — stays in sync with the Tailwind utility classes used across
 * the app.
 */
export const colors = {
  /** Near-black canvas. */
  bg: '#050505',
  surface: {
    1: '#0a0a0a',
    2: '#0f0f0f',
    3: '#141414',
  },
  border: {
    default: '#1a1a1a',
    strong: '#262626',
  },
  text: {
    default: '#f5f5f5',
    strong: '#ffffff',
    muted: '#a3a3a3',
    faint: '#737373',
  },
  /** Bioluminescent brand accents. */
  brand: {
    emerald: '#34d399',
    emeraldBright: '#6ee7b7',
    cyan: '#22d3ee',
    violet: '#a78bfa',
  },
  /** Semantic status colors. */
  semantic: {
    success: '#34d399',
    danger: '#ff4d4d',
  },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const shadows = {
  glow:
    '0 0 0 1px rgba(52,211,153,0.15), 0 8px 40px -12px rgba(52,211,153,0.25)',
  glowDual:
    '0 0 0 1px rgba(52,211,153,0.22), 0 12px 60px -12px rgba(34,211,238,0.38), 0 10px 48px -12px rgba(52,211,153,0.32)',
} as const;

/** Legacy export name kept stable for `@landmap/ui` consumers. */
export const config = { colors, radii, shadows } as const;

export type LandmapColors = typeof colors;
export type LandmapRadii = typeof radii;
export type LandmapShadows = typeof shadows;
