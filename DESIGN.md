# LandMap — UI/UX & Frontend Design Structure (Source of Truth)

> **Reference:** LandMap on Lovable → `https://landmap-insight.lovable.app`
> (TanStack Router SPA; the captured snapshots live in `apps/web/public/lovable_html_*.html`
> and `apps/web/public/lovable_chunk_*.js.txt`; the live route tree is in
> `apps/web/public/lovable_routes_summary.txt`).
> **Local port:** React/Next.js 14 (App Router, locale-prefixed) under
> `apps/web/src/app/[locale]`. There are NO static Lovable HTML pages in production —
> the live UI is the React app, kept 1:1 with the Lovable reference via shared tokens.
> **Status:** 100% Lovable design system (light/indigo `oklch` tokens, DM Sans + Space
> Grotesk — mesmas 2 famílias do Lovable live; mono = system stack). Last audit: 2026-07-16.

This document is the **single source of truth** for the LandMap frontend architecture
and our **UX/UI standard**. It supersedes any older notes that mention *Geist* fonts or
a *bioluminescent emerald/cyan/gold* palette — those were superseded on **2026-07-13/14**
by the Lovable indigo system (see §8 "Retired / Legacy"). Keep `CLAUDE.md` and `MEMORY.md`
in sync with this file.

> **⚠️ REGRA DE OURO (paridade Lovable):** Toda página que **existe no Lovable** deve ser
> **LITERALMENTE IGUAL** à referência — mesma estrutura, copy, tokens, espaçamentos, ícones
> e comportamento. **Páginas LandMap-only** (que não existem no Lovable: `world`, `live`,
> `studio`, `calculator`, `chat`, `status`, `terrenos`, `property`, `insights`, `sales`,
> `search-results`) **NÃO** precisam igualar o Lovable e são tratadas como *features de
> produto*, não como desvio (drift). Elas seguem o mesmo *design system* (tokens indigo,
> `var(--*)`, `@landmap/ui`, i18n) mas têm layout próprio. Ao copiar da versão Lovable,
> **esqueça as páginas novas** — foque em deixar as telas compartilhadas idênticas.

---

## 1. Core Architecture (React / Next.js + Lovable tokens)

- Frontend rendered by **React/Next.js 14** (App Router, locale-prefixed) under
  `apps/web/src/app/[locale]/...`. The React app is the live, production UI.
- **Design-system entry** is `apps/web/src/app/globals.css` (Tailwind v4):
  - `@import "tailwindcss";` + `@source` scanning `@landmap/ui` components.
  - `@theme` defines typefaces: `--font-sans` (**DM Sans**),
    `--font-display` (**Space Grotesk**), `--font-mono` (**system mono stack** — Lovable
    não carrega JetBrains; paridade literal 2026-07-16).
  - `@theme inline` maps semantic color utilities (`bg-background`, `text-foreground`,
    `border-border`, `bg-primary`, …) to the `:root`/`.dark` vars below, so `.dark`
    overrides apply at runtime.
  - `:root` (light) and `.dark` define the **Lovable indigo `oklch`** tokens
    (`--primary` hue ≈ 265, `--accent`, `--muted`, `--ring`, gradients, shadows, sidebar…).
  - Utility classes ported from the Lovable reference: `.cadastre-grid`, `.glass`,
    `.eyebrow`, `.link-underline`, `.ledger-num`, `.btn-primary`, `.btn-ghost`,
    animation utilities (`animate-in`, `fade-in`, `slide-in-*`, `zoom-in-*`, `marquee-*`).
- Root `app/layout.tsx` owns `<html>/<body>` and loads the brand fonts via a Google
  Fonts `<link>` (DM Sans + Space Grotesk only — Lovable parity). `[locale]/layout.tsx`
  wraps children in the locale shell (`ShellSwitch` → public vs authenticated),
  i18n providers, `ToastProvider`, `ErrorBoundary`, and the static cadastral-grid backdrop.

## 2. Typography & Assets

### 2.1 Brand color (canonical Lovable indigo)
- **`#575ECF`** is the canonical Lovable brand indigo. It appears in the Lovable reference
  as the logo radial-gradient endpoint (`#FE7B02 → #FE3F21 → #F858BC → #575ECF`) and as
  the focus ring (`--focus-color: #575ECF`). In `globals.css` it maps to the indigo
  `oklch` tokens (`--primary` hue ≈ 265, `--ring` hue ≈ 265). **Use `var(--primary)` /
  `var(--ring)` — never hardcode `#575ECF`** except where a raw hex is unavoidable.
- **Lovable platform badge:** the `#lovable-badge` widget (bottom-right, "Made with Lovable")
  is a *platform* element, **NOT** LandMap brand. It must **NOT** be reproduced in the
  local app. Only the indigo color + font system are ported.

### 2.2 Fonts
- **Fonts** are loaded with a Google Fonts `<link>` in the root layout
  (DM Sans 400/500/600/700, Space Grotesk 500/600/700 only — **literal Lovable parity**).
  `next/font` is **intentionally NOT used** — on Windows + Node 24 it crashes the ESM
  loader (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). Fonts are defined as CSS variables in
  `globals.css` so `.font-sans` / `.font-display` / `.font-mono` work unchanged.
  Lovable live loads only DM Sans + Space Grotesk (`family=DM+Sans…&family=Space+Grotesk…`).
  - `--font-sans` → **DM Sans** (body / UI text)
  - `--font-display` → **Space Grotesk** (headings / numbers / wordmark)
  - `--font-mono` → **system mono stack** (ui-monospace / SF Mono / Menlo…; no 3rd webfont)
- **Type scale (Lovable):** display headings use Space Grotesk 600/700; body DM Sans
  400/500; small/muted text DM Sans 400 in `var(--muted-foreground)`.

### 2.3 Icons
- **Icons** come from `apps/web/src/components/lovable/icons.tsx` (not `lucide-react`):
  `MapPinned`, `Sparkles`, `ArrowLeft`, `Check`, `Mail`, `Lock`, `User`, `Eye`, `EyeOff`,
  `ArrowRight`, `TrendingUp`, `BellRing`, `ShieldCheck`, `Star`, `Building2`, `MapPin`, `X`,
  `Search`, `GitCompare`, `Plus`, `Filter`, `ChevronDown`, `ChevronRight`, `SlidersHorizontal`,
  `LineChart`, `BarChart`, `ArrowUpDown`, `Layers`, `Activity`, `Trash2`, `LandMapWordmark`.
- **Logo / wordmark:** `LandMapWordmark` icon + `components/Logo.tsx`. Brand mark asset:
  `public/landmap-lovabale-logo.png` (also `public/lovable_landmap-logo-transparent.png`).
  Favicon / OG are SVG brand-indigo (`favicon.svg`, `og-image.svg`).

## 3. Design System Components (`@landmap/ui`)

Reuse the shared DS components for every screen — never hardcode colors:
`Button`, `Card`, `Badge`, `Input`, `Stat`, `StatPill`, `MetricStat`, `Progress`, `Tabs`,
`Segmented`, `Accordion`, `Avatar`, `Sparkline`, `Skeleton`, `Tooltip`, `Toast`,
`CommandPalette`, `Drawer`, `EmptyState`, `MobileBottomNav`, `Stepper`, `NotificationCenter`,
`AnimatedNumber`, `OnboardingTour`.

All consume `var(--*)` tokens. The Lovable primary button is indigo
(`bg-[var(--primary)] text-[var(--primary-foreground)]`); `outline`/`ghost` are light
(`var(--border)` / `var(--muted-foreground)`).

## 3.1 Exact Design Token Values (1:1 with Lovable `globals.css`)

These are the **authoritative** values. `apps/web/src/app/globals.css` `:root` (light)
and `.dark` define them; `@theme inline` exposes them as Tailwind utilities
(`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`,
`bg-muted`, `text-muted-foreground`, `ring-ring`, …). **Never hardcode hex/rgb** — consume
`var(--*)` / the utility. Brand indigo ≈ `#575ECF` (see §2.1).

### Light (`:root`)
| Token | Value | Use |
|---|---|---|
| `--radius` | `0.625rem` | base radius (sm/md/lg/xl derived) |
| `--background` | `oklch(100% 0 0)` | page bg (white) |
| `--foreground` | `oklch(18% .06 265)` | body text (near-black indigo) |
| `--card` | `oklch(100% 0 0)` | card surface |
| `--card-foreground` | `oklch(18% .06 265)` | |
| `--popover` | `oklch(100% 0 0)` | |
| `--primary` | `oklch(34% .18 265)` | **brand indigo** (buttons/active) |
| `--primary-foreground` | `oklch(99% .005 250)` | text on primary (white) |
| `--primary-glow` | `oklch(55% .2 265)` | glow accent |
| `--secondary` | `oklch(24% .1 265)` | |
| `--secondary-foreground` | `oklch(99% .005 250)` | |
| `--accent` | `oklch(88% .06 250)` | hover/active tint |
| `--accent-foreground` | `oklch(28% .14 265)` | |
| `--muted` | `oklch(96% .01 250)` | row/card hover bg |
| `--muted-foreground` | `oklch(48% .04 265)` | secondary text |
| `--destructive` | `oklch(58% .22 27)` | errors/danger |
| `--destructive-foreground` | `oklch(98% .01 27)` | |
| `--success` | `oklch(60% .15 155)` | positive (green) |
| `--success-foreground` | `oklch(99% .005 155)` | |
| `--warning` | `oklch(78% .15 78)` | amber |
| `--warning-foreground` | `oklch(22% .05 78)` | |
| `--border` | `oklch(92% .015 250)` | hairlines |
| `--input` | `oklch(94% .012 250)` | input borders |
| `--ring` | `oklch(50% .18 265)` | focus ring (indigo) |
| `--chart-1..5` | `oklch(34% .18 265)` … `oklch(78% .15 78)` | data-viz palette |
| `--sidebar` | `oklch(22% .1 265)` | authenticated sidebar bg |
| `--sidebar-foreground` | `oklch(96% .01 250)` | |
| `--sidebar-primary` | `oklch(55% .2 265)` | |
| `--sidebar-primary-foreground` | `oklch(99% .005 250)` | |
| `--sidebar-accent` | `oklch(28% .11 265)` | |
| `--sidebar-accent-foreground` | `oklch(99% .005 250)` | |
| `--sidebar-border` | `oklch(30% .09 265)` | |
| `--sidebar-ring` | `oklch(55% .2 265)` | |
| `--gradient-brand` | `linear-gradient(135deg, oklch(24% .1 265), oklch(34% .18 265))` | |
| `--gradient-hero` | `linear-gradient(140deg, oklch(20% .08 265) 0%, oklch(30% .15 265) 55%, oklch(50% .2 265) 100%)` | |
| `--gradient-accent` | `linear-gradient(135deg, oklch(34% .18 265), oklch(62% .18 250))` | |
| `--shadow-elegant` | `0 20px 40px -20px oklab(24% -.00871557 -.0996195/.4)` | |
| `--shadow-glow` | `0 0 40px oklab(55% -.0174311 -.199239/.35)` | |
| `--shadow-card` | `0 1px 3px oklab(24% -.00871557 -.0996195/.12), 0 8px 24px -12px oklab(24% -.00871557 -.0996195/.15)` | |

### Dark (`.dark`) — overrides only
`--background: oklch(14% .05 265)` · `--foreground: oklch(96% .01 250)` ·
`--card/popover: oklch(19% .07 265)` · `--primary: oklch(62% .2 265)` ·
`--primary-glow: oklch(75% .17 250)` · `--secondary: oklch(26% .08 265)` ·
`--accent: oklch(55% .18 265)` · `--muted: oklch(22% .06 265)` ·
`--muted-foreground: oklch(72% .03 250)` · `--destructive: oklch(65% .22 27)` ·
`--success: oklch(72% .15 148)` · `--warning: oklch(82% .15 78)` ·
`--border: oklch(100% 0 0/.1)` · `--input: oklch(100% 0 0/.12)` ·
`--ring: oklch(62% .2 265)`.

### Utility classes (ported from Lovable)
`.cadastre-grid`, `.glass`, `.eyebrow`, `.link-underline`, `.ledger-num`, `.btn-primary`
(`bg-white text-neutral-900` on light — Lovable's light CTA), `.btn-ghost`
(`border-neutral-800 text-neutral-200` on dark), plus animation utilities
(`animate-in`, `fade-in`, `slide-in-*`, `zoom-in-*`, `duration-*`, `marquee-*`). See
`globals.css` for the canonical definitions — **edit tokens there only** (never inline).

## 4. Route Map (Lovable reference → local Next.js port)

**The local app is now a literal 1:1 clone of the Lovable reference.** It contains
**only** the screens that exist in Lovable. All LandMap-unique screens (that had no
Lovable equivalent) were removed on **2026-07-14** per the parity directive ("deixe só
100% igual") and archived under `archive_landmap_only_2026-07-14/` (reversible, out of
the build). This keeps the product faithful to the Lovable UX/UI standard and eliminates
any drift surface.

The Lovable reference exposes these routes (from `lovable_routes_summary.txt` +
`lovable_html_*.html` captures). **Every one is ported and must stay LITERALLY EQUAL:**

| Lovable route | Local route (`/[locale]`) | Status |
|---|---|---|
| `/` (home) | `page.tsx` | ported · 100% equal |
| `/regions` | `regions/page.tsx` | ported · 100% equal |
| `/favorites` | `favorites/page.tsx` | ported · 100% equal |
| `/compare` | `compare/page.tsx` | ported · 100% equal |
| `/dashboard` | `dashboard/page.tsx` | ported · 100% equal |
| `/admin` | `admin/page.tsx` + `analytics` `audit` `exports` `leads` `properties` `settings` `webhooks` | ported (superset) · 100% equal |
| `/plans` | `plans/page.tsx` | ported · 100% equal |
| `/auth` | `auth/page.tsx` | ported (mocked Google auth) · 100% equal |
| `/map` | `map/page.tsx` | ported (Leaflet) · 100% equal |
| `/search` | `search/page.tsx` | ported (Server Component, `searchProperties` API, i18n pt-BR/en-US/es-ES, Navbar link) · 100% equal |
| `/onboarding` | `onboarding/page.tsx` | ported · 100% equal |

**Removed (no Lovable equivalent — archived, not drift):** `world` (3D "World"/Sovereign
data-viz + `BmapViewer`/`SkylineCanvas`/`AtlasLanding`/`InvestmentCard`/`InvestorPanel`/
`EnergyPanel`/`LivePulse`/`HeroTerritory`/`PropertyThumb`/`InvestmentLegend` + `lib/bmap.ts`),
`live`, `studio`, `calculator`, `chat`, `status`, `terrenos`, `property`, `insights`,
`sales`, and the shared `FeaturePage.tsx`. These were moved to
`archive_landmap_only_2026-07-14/` on 2026-07-14 so the app stays a pure Lovable clone.
If a feature needs to return, port it back as an *on-brand* screen (indigo tokens,
`var(--*)`, `@landmap/ui`, i18n) — never as Lovable drift.

## 5. User Workflow (mirrored from Lovable: Describe → Watch → Refine → Ship)

Lovable's own loop — *"Start with an idea → Describe / drop screenshots+docs → Watch it
build in real-time → Refine with feedback → Ship with one click"* — is mirrored in
LandMap's real-estate-intelligence flow:

1. **Describe** — user states the intent (city/region to analyze, criteria, budget).
2. **Watch** — LandMap renders results live: valuation map, region ranking, price-`m²`
   history, opportunity radar (no full reload; client-side fetch + TanStack Query).
3. **Refine** — iterate via filters, compare regions, save favorites, adjust alerts.
4. **Ship** — export/share (admin exports, webhooks), subscribe to a plan (Access/Plus/Pro/
   Business), deploy to production (Vercel). One-click feel via clear CTAs.

## 6. Navigation & Page Structure

- **Public shell** (`ShellSwitch` → public): top `Navbar` (logo/wordmark, links to
  Regiões, Mapa, Comparar, Favoritos, Planos, Entrar) + `Footer` + `MobileBottomNav`.
- **Authenticated shell** (`ShellSwitch` → authed): `Sidebar` (68px) + header +
  `MobileBottomNav`; reaches `dashboard`, `admin/*`, `onboarding`.
- **Plans** (`/plans`): "Escolha seu plano · Comece a analisar o mercado agora ·
  Cancele quando quiser. Sem fidelidade." Cards:
  - **LandMap Access** — R$ 69,90/mês
  - **LandMap Plus** — R$ 119,90/mês *(Mais popular)* — Tudo do Access + Radar de
    oportunidades + Alertas inteligentes de valorização + Alertas de queda de preço +
    Ranking de oportunidades por cidade + Comparação entre regiões + Notas automáticas
    sobre potencial da área + Salvar até 25 áreas favoritas
  - **LandMap Pro** — R$ 249,90/mês
  - **LandMap Business** — R$ 699,90/mês
  - Footer CTA: "Já tem conta? Entrar" / "Assinar LandMap Plus — R$ 119,90/mês" /
    "Pagamento não ativado — fluxo de demonstração."

## 7. Porting Rules (CTO)

1. Remove `<GlowPanel>` → `<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">`.
2. Remove `neutral-*` / hardcoded `#050505` → tokens `var(--*)`.
   - Secondary text: `text-[var(--muted-foreground)]`; strong: `text-[var(--foreground)]`.
   - Primary CTA: `bg-[var(--primary)] text-[var(--primary-foreground)]`.
   - Hover card/row: `hover:bg-[var(--muted)]`.
3. Icons from `components/lovable/icons` (not `lucide-react`).
4. Keep `useLocale` + `Link` with `/${locale}`; keep fetch/API logic untouched.
5. Server Components: keep `force-dynamic` + fetch; `'use client'` only if hooks are used.
   **Never** put `force-static` on a child of `[locale]` (silent 404 — see MEMORY.md).
6. Status colors use semantic tokens (`--success` / `--destructive` / `--muted-foreground`),
   never `emerald`/`cyan`/`violet` as brand accents.

## 8. Retired / Legacy (do NOT reintroduce)

The following were used in earlier LandMap designs and were **superseded on 2026-07-13/14**
by the Lovable indigo system. If you see them referenced in old docs/commits, treat as stale:

- **Geist fonts** (`geist` package / `--font-geist-sans`) → replaced by **DM Sans +
  Space Grotesk + JetBrains Mono** (Google Fonts `<link>`). `next/font` is still avoided
  for the Windows/Node 24 ESM reason, but the *family* is now Lovable's, not Geist.
- **Bioluminescent palette** (`--emerald:#34d399`, `--cyan:#22d3ee`, `--violet:#a78bfa`,
  Sovereign `--gold`) → replaced by **Lovable indigo `oklch`** tokens in `globals.css`
  `:root`/`.dark`. The only intentional exception is the "World 3D" / Sovereign data-viz
  feature, which keeps its own `--emerald/--cyan/--gold` + SVG palette as a *feature*
  palette (documented, not drift).
- **Static `lovable_*.html` substitution** → retired; the React app is the only live UI.

## 9. Strict Rules for Future Development

1. **Single source of truth:** the React app in `apps/web/src/app/[locale]`. Do not recreate
   the Lovable UI as static HTML.
2. **Backend retention:** API logic (`apps/web/src/app/api/`, `packages/api`) is isolated;
   inject data into the React DOM via fetch/TanStack Query — never alter the design tokens.
3. **Token changes** go in `globals.css` (`:root`/`.dark` + `@theme`); after editing, rebuild
   `@landmap/ui` (`pnpm --filter @landmap/ui build`) and the web app to regenerate CSS.
4. **Never** introduce hardcoded colors (`#050505`, `emerald-500`, `teal-*`) outside the
   semantic tokens.

---

*Authoritative since 2026-07-14. Any discrepancy between this file and `CLAUDE.md` /
`MEMORY.md` is resolved in favor of this file. Re-run `compare_lovable.py` /
`validate_real.py` to verify parity against the Lovable reference.*

