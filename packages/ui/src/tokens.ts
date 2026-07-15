/**
 * LandMap design tokens — 1:1 mirror of `apps/web/src/app/globals.css` `:root`.
 *
 * `globals.css` is the single source of truth (LandMap clear/blue spec, with the
 * Lovable light/indigo reference tokens). This file keeps the same public
 * exports (`colors`, `radii`, `shadows`, `typography`, `spacing`, `layout`,
 * `fonts`, `config`) so existing imports stay intact, while mirroring the CSS
 * custom properties 1:1 (flat keys) and adding the previously-missing
 * `surface` / `accent` / `danger` / `primary` / `lovable` tokens.
 */
export const colors = {
  /* ── Core surface / text (flat mirror of --surface / --text / …) ── */
  bg: 'oklch(100% 0 0)',            // --background
  text: 'oklch(18% 0.06 265)',      // --foreground
  textStrong: '#ffffff',
  surface: 'oklch(100% 0 0)',       // --surface (= --card)
  surface1: 'oklch(100% 0 0)',      // --surface-1
  surface2: 'oklch(96% 0.01 250)',  // --surface-2 (= --muted)
  surface3: 'oklch(96% 0.01 250)',  // --surface-3
  border: 'oklch(92% 0.015 250)',   // --border (= --border)
  borderStrong: 'oklch(30% 0.09 265)', // --border-strong (= --sidebar-border)
  muted: 'oklch(48% 0.04 265)',     // --muted (= --muted-foreground)
  muted2: 'oklch(48% 0.04 265)',
  accent: 'oklch(88% 0.06 250)',    // --accent (= --accent)
  accentDim: 'oklch(28% 0.14 265)', // --accent-dim (= --accent-foreground)
  danger: 'oklch(58% 0.22 27)',     // --danger (= --destructive)

  /* ── Primary brand ramp (LandMap azul #003594) ── */
  // Aligned to Lovable primary (indigo) — was legacy #003594 blue spec (drift).
  primary: 'oklch(34% .18 265)',
  primaryBright: 'oklch(50% .18 265)',
  primarySoft: 'oklch(55% .15 265)',
  primaryForeground: 'oklch(99% 0.005 250)',
  primaryGlow: 'oklch(55% .2 265)',
  secondary: 'oklch(24% 0.1 265)',
  secondaryForeground: 'oklch(99% 0.005 250)',
  destructive: 'oklch(58% 0.22 27)',
  destructiveForeground: 'oklch(98% 0.01 27)',
  success: 'oklch(60% 0.15 155)',
  successForeground: 'oklch(99% 0.005 155)',
  warning: 'oklch(78% 0.15 78)',
  warningForeground: 'oklch(22% 0.05 78)',
  background: 'oklch(100% 0 0)',
  foreground: 'oklch(18% 0.06 265)',
  card: 'oklch(100% 0 0)',
  cardForeground: 'oklch(18% 0.06 265)',
  // Aligned to Lovable --ring (indigo color, used by focus-visible:ring-[var(--ring)]).
  ring: 'oklch(50% .18 265)',

  /* ── Lovable reference design tokens (light / indigo) ── */
  lovable: {
    accent: 'oklch(88% 0.06 250)',
    accentForeground: 'oklch(28% 0.14 265)',
    muted: 'oklch(96% 0.01 250)',
    mutedForeground: 'oklch(48% 0.04 265)',
    border: 'oklch(92% 0.015 250)',
    input: 'oklch(94% 0.012 250)',
    ring: 'oklch(50% .18 265)',
    radius: '0.625rem',
  },

  /* ── Semantic status (back-compat nested API) ── */
  semantic: {
    success: 'oklch(60% 0.15 155)',
    danger: 'oklch(58% 0.22 27)',
  },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  lovable: '0.625rem',
} as const;

export const shadows = {
  elegant: '0 20px 40px -20px rgba(24, 24, 40, 0.4)',
  card: '0 1px 3px rgba(24, 24, 40, 0.12), 0 8px 24px -12px rgba(24, 24, 40, 0.15)',
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

/** Font families (mirror of --font-* in globals.css). */
export const fonts = {
  sans: "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  geistSans: "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
  geistMono:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

/** Legacy export name kept stable for `@landmap/ui` consumers. */
export const config = {
  colors,
  radii,
  shadows,
  typography,
  spacing,
  layout,
  fonts,
} as const;

export type LandmapTypography = typeof typography;
export type LandmapSpacing = typeof spacing;
export type LandmapLayout = typeof layout;

export type LandmapColors = typeof colors;
export type LandmapRadii = typeof radii;
export type LandmapShadows = typeof shadows;
export type LandmapFonts = typeof fonts;
