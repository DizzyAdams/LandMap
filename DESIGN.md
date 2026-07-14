# LandMap — UI/UX & Frontend Design Structure

> **Reference:** Lovable App Design (`https://landmap-insight.lovable.app`)
> **Status:** React/Next.js frontend ported to the Lovable design system (light/indigo tokens).
> Validated by build + design tokens in `apps/web/src/app/globals.css`.

This document is the source of truth for the LandMap frontend architecture, aligned with
`docs/design-cto-lovable.md` and `docs/lovable-port-pattern.md`. The goal is a React/Next.js
UI that is visually identical to the Lovable reference, built on a single shared design system.

## 1. Core Architecture (React / Next.js + Lovable tokens)

- The frontend is rendered by **React/Next.js** (App Router, locale-prefixed) under
  `apps/web/src/app/[locale]/...`. There are NO static Lovable HTML pages in production —
  the live UI is the React app.
- The **design system entry** is `apps/web/src/app/globals.css` (Tailwind v4):
  - `@import "tailwindcss";` + `@source` scanning `@landmap/ui` components.
  - `@theme` defines the three brand typefaces: `--font-sans` (DM Sans), `--font-display`
    (Space Grotesk), `--font-mono` (JetBrains Mono).
  - `:root` (light) and `.dark` define the Lovable okLCH tokens (`--primary`, `--card`,
    `--border`, `--muted`, `--ring`, gradients, shadows, etc.).
  - Utility classes ported from the Lovable reference: `.cadastre-grid`, `.glass`,
    `.eyebrow`, `.link-underline`, `.ledger-num`, `.btn-primary`, `.btn-ghost`,
    animation utilities (`animate-in`, `fade-in`, `slide-in-*`, `zoom-in-*`).
- `apps/web/src/app/[locale]/layout.tsx` imports both `@landmap/ui/styles.css` (component
  tokens) **and** `../../app/globals.css` (Tailwind entry). The **root** `app/layout.tsx`
  owns `<html>/<body>` and loads the brand fonts via a Google Fonts `<link>` (see §2).

## 2. Typography & Assets

- **Fonts** are loaded with a Google Fonts `<link>` in the root layout (DM Sans, Space
  Grotesk, JetBrains Mono). `next/font` is intentionally NOT used — on Windows + Node 24 it
  crashes the ESM loader (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). Fonts are defined as CSS
  variables in `globals.css` so `.font-sans` / `.font-display` / `.font-mono` work unchanged.
- **Icons** come from `apps/web/src/components/lovable/icons.tsx` (not `lucide-react`):
  `MapPinned`, `Sparkles`, `ArrowLeft`, `Check`, `Mail`, `Lock`, `User`, `Eye`, `EyeOff`,
  `ArrowRight`, `TrendingUp`, `BellRing`, `ShieldCheck`, `Star`, `Building2`, `MapPin`, `X`,
  `Search`, `GitCompare`, `Plus`, `Filter`, `ChevronDown`, `ChevronRight`, `SlidersHorizontal`,
  `LineChart`, `BarChart`, `ArrowUpDown`, `Layers`, `Activity`, `Trash2`, `LandMapWordmark`.
- **Logo / wordmark:** `LandMapWordmark` icon + `components/Logo.tsx`. Brand mark asset:
  `public/lovable_landmap-logo-transparent.png`.

## 3. Design System Components (`@landmap/ui`)

Reuse the shared DS components for every screen — never hardcode colors:
`Button`, `Card`, `Badge`, `Input`, `Stat`, `StatPill`, `MetricStat`, `Progress`, `Tabs`,
`Segmented`, `Accordion`, `Avatar`, `Sparkline`, `Skeleton`, `Tooltip`, `Toast`,
`CommandPalette`, `Drawer`, `EmptyState`, `MobileBottomNav`, `Stepper`, `NotificationCenter`,
`AnimatedNumber`, `OnboardingTour`.

All consume `var(--*)` tokens. The Lovable primary button is indigo
(`bg-[var(--primary)] text-[var(--primary-foreground)]`); `outline`/`ghost` are light
(`var(--border)` / `var(--muted-foreground)`). The `gold` variant is the sovereign/investor
accent only.

## 4. Porting Rules (CTO — `docs/lovable-port-pattern.md`)

1. Remove `<GlowPanel>` → `<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">`.
2. Remove `neutral-*` / `emerald-*` / hardcoded `#050505` → tokens `var(--*)`.
   - Secondary text: `text-[var(--muted-foreground)]`; strong: `text-[var(--foreground)]`.
   - Primary CTA: `bg-[var(--primary)] text-[var(--primary-foreground)]`.
   - Hover card/row: `hover:bg-[var(--muted)]`.
3. Icons from `components/lovable/icons` (not `lucide-react`).
4. Keep `useLocale` + `Link` with `/${locale}`; keep fetch/API logic untouched.
5. Server Components: keep `force-dynamic` + fetch; `'use client'` only if hooks are used.
6. Status colors use semantic tokens (`--success` / `--destructive` / `--muted-foreground`),
   never `emerald`/`cyan`/`violet` as brand accents.

## 5. Strict Rules for Future Development

1. **Single source of truth:** the React app in `apps/web/src/app/[locale]`. Do not recreate
   the Lovable UI as static HTML.
2. **Backend retention:** API logic (`apps/web/src/app/api/`, `packages/api`) is isolated;
   inject data into the React DOM via fetch/TanStack Query — never alter the design tokens.
3. **Token changes** go in `globals.css` (`:root`/`.dark` + `@theme`); after editing, rebuild
   `@landmap/ui` (`pnpm --filter @landmap/ui build`) and the web app to regenerate CSS.
4. **Never** introduce hardcoded colors (`#050505`, `emerald-500`, `teal-*`) outside the
   semantic tokens.

---

*Revised 2026-07-14: the frontend is React/Next.js ported to the Lovable design system. The
prior "static substitution" approach (serving raw `lovable_*.html`) was retired; the React app
is the live UI and is kept 1:1 with the Lovable reference via the shared token system.*

## 6. Design Audit (2026-07-14) — status: 100% Lovable

- **Content/structure parity vs Lovable: 0 missing phrases** (`compare_live.py`) on all shared
  screens. LandMap-unique screens (search, insights, sales, world, …) have no Lovable reference.
- **Production validation: 160/160 (100%)** (`validate_real.py`) — routes, titles, meta, OG,
  fonts (DM Sans / Space Grotesk / JetBrains Mono), linked CSS, no error boundary.
- **Hardcoded off-brand colors eliminated:** 89 occurrences across ~50 files migrated to Lovable
  tokens (`--primary`, `--success`, `--destructive`, `--warning`, `--muted`, `--card`,
  `--background`, `--ring`). typecheck + lint green.
- **Intentional exception:** the "World 3D" / Sovereign data-viz feature keeps its own
  `--emerald`/`--cyan`/`--gold` + SVG palette (LandMap-unique; not in Lovable). Documented, not
  treated as drift.
