# LandMap 2.0 — Token & Layout Contract

Fonte da verdade (3 arquivos espelhados):
- `packages/ui/src/tokens.ts` (JS)
- `packages/ui/src/styles.css` (CSS)
- `apps/web/src/app/globals.css` `:root` (app)

## Cores

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#050505` | canvas |
| `--surface-1/2/3` | `#0a0a0a / #0f0f0f / #141414` | superfícies |
| `--surface-4` | `#1a1a1a` | raised / popover |
| `--surface-inset` | `#070707` | sunken / input well |
| `--border` | `#1a1a1a` | hairline |
| `--border-subtle` | `rgba(255,255,255,0.06)` | divisores suaves |
| `--border-strong` | `#262626` | borda forte |
| `--text` | `#f5f5f5` | texto |
| `--text-strong` | `#ffffff` | display |
| `--text-muted` | `#c9c9c9` | muted AA-safe |
| `--text-faint` | `#8a8a8a` | caption |
| `--emerald` | `#34d399` | marca (emerald-400) |
| `--emerald-bright` | `#6ee7b7` | — |
| `--cyan` | `#22d3ee` | marca |
| `--violet` | `#a78bfa` | marca |
| `--gold` | `#d4af37` | Sovereign gold (investidor) |
| `--gold-soft/-bright/-deep` | `#e8c873 / #f4e2a1 / #a67c00` | gold |
| `--accent` | `#ffffff` | — |
| `--danger` | `#ff4d4d` | erro |
| `--emerald-tint/-cyan-tint/-gold-tint/-violet-tint` | `rgba(...,0.12)` | fills baixa-opacidade |

## Radii
`--radius-sm:8px --radius-md:12px --radius-lg:16px --radius-xl:24px`

## Glows
`--glow-emerald --glow-dual --glow-gold --glow-sovereign`

## Tipografia (rem, classe utilitária)
| Classe | Var | Tamanho |
|---|---|---|
| `.text-display` | `--fs-display` | 3.5rem / 56px |
| `.text-h1` | `--fs-h1` | 2.25rem / 36px |
| `.text-h2` | `--fs-h2` | 1.75rem / 28px |
| `.text-h3` | `--fs-h3` | 1.375rem / 22px |
| `.text-h4` | `--fs-h4` | 1.125rem / 18px |
| `.text-caption` | — | 0.75rem, `--text-faint` |
| `.eyebrow` / `.eyebrow-gold` | — | 11px uppercase tracked |
| `.ledger-num` | — | mono tabular (preços/métricas) |

## Espaçamento (8px base) — `--space-1..12` = 4/8/12/16/24/32/40/48/64/80/96/128px

## Layout
- `.container-x` — max-width 1200px, centralizado, padding-inline 24px.
- `.container-narrow` — max-width 720px.
- `.section` — padding-block 64px (40px mobile).
- `.page-header` — flex col: eyebrow + h1 + descrição + `.page-header__actions`.
- `.divider` — hairline 1px.

## Superfícies
- `.surface` — translúcido hairline (existente).
- `.surface-raised` — surface-2 + borda + `--elevation-2`.
- `.surface-inset` — surface-inset + borda sutil.
- `.glass` — blur translúcido (existente).

## Elevação
`--elevation-1` (sutil) / `--elevation-2` (card) / `--elevation-3` (popover).

## Motion (existente, reduzido)
`.aurora .grain .marquee-track .text-aurora .text-gradient-gold .lift .sheen
.pulse-live .link-underline` — todos com `@media (prefers-reduced-motion: reduce)`
desligando animações não-essenciais. Mantenha esse padrão em novos componentes.

## Foco / A11y
`:focus-visible` usa anel emerald (`color-mix(emerald 70%)`). Mantenha anéis
emergold visíveis em todos os elementos interativos.
