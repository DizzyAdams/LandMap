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
    /** Sovereign champagne gold — the capital / investor accent. */
    gold: '#d4af37',
    goldSoft: '#e8c873',
    goldBright: '#f4e2a1',
    goldDeep: '#a67c00',
  },
  /** Semantic status colors. */
  semantic: {
    success: '#34d399',
    danger: '#ff4d4d',
  },
  /** Neutral white accents (mirrors --accent / --accent-dim in globals.css). */
  accent: '#ffffff',
  accentDim: '#e5e5e5',
  /** Back-compat alias of surface-1 (mirrors --surface in globals.css). */
  surfaceAlias: '#0a0a0a',
  surface4: '#1a1a1a',
  surfaceInset: '#070707',
  borderSubtle: 'rgba(255,255,255,0.06)',
  /** AA-compliant text ramp. */
  textMuted: '#c9c9c9',
  textFaint: '#8a8a8a',
  /** Low-alpha accent fills. */
  emeraldTint: 'rgba(52,211,153,0.12)',
  cyanTint: 'rgba(34,211,238,0.12)',
  goldTint: 'rgba(212,175,55,0.12)',
  violetTint: 'rgba(167,139,250,0.12)',
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
  glowGold:
    '0 0 0 1px rgba(212,175,55,0.28), 0 10px 48px -12px rgba(212,175,55,0.38)',
  glowSovereign:
    '0 0 0 1px rgba(212,175,55,0.22), 0 14px 70px -14px rgba(212,175,55,0.40), 0 10px 50px -12px rgba(52,211,153,0.28)',
  elevation1: '0 1px 2px rgba(0,0,0,0.4), 0 1px 1px rgba(0,0,0,0.3)',
  elevation2:
    '0 4px 12px -2px rgba(0,0,0,0.5), 0 2px 6px -2px rgba(0,0,0,0.4)',
  elevation3:
    '0 12px 32px -8px rgba(0,0,0,0.6), 0 4px 12px -4px rgba(0,0,0,0.5)',
} as const;

/** Typography scale (rem). */
export const typography = {
  display: '3.5rem',
  h1: '2.25rem',
  h2: '1.75rem',
  h3: '1.375rem',
  h4: '1.125rem',
  body: '1rem',
  sm: '0.875rem',
  xs: '0.75rem',
} as const;

/** Spacing scale (px, 8px base). */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 40,
  8: 48,
  9: 64,
  10: 80,
  11: 96,
  12: 128,
} as const;

/** Layout container max-widths. */
export const layout = {
  container: '1200px',
  containerNarrow: '720px',
} as const;

/** Legacy export name kept stable for `@landmap/ui` consumers. */
export const config = { colors, radii, shadows, typography, spacing, layout } as const;

export type LandmapTypography = typeof typography;
export type LandmapSpacing = typeof spacing;
export type LandmapLayout = typeof layout;

export type LandmapColors = typeof colors;
export type LandmapRadii = typeof radii;
export type LandmapShadows = typeof shadows;
