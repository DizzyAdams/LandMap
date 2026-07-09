# Design System Audit — LandMap (CSS & Tokens)

> Auditoria do sistema de design dark-premium "fora do comum" do LandMap.
> Resumo acionável em `CLAUDE.md`. Última revisão: 2026-07-09.

## 1. Inventário de tokens (3 fontes)

### `apps/web/src/app/globals.css` `:root` (fonte da verdade)
Canvas: `--bg:#050505`, `--surface:#0a0a0a` (alias), `--surface-1:#0a0a0a`, `--surface-2:#0f0f0f`, `--surface-3:#141414`.
Lines: `--border:#1a1a1a`, `--border-strong:#262626`.
Text: `--text:#f5f5f5`, `--text-strong:#ffffff`, `--muted:#a3a3a3`, `--muted-2:#737373`.
Brand: `--emerald:#34d399`, `--emerald-bright:#6ee7b7`, `--cyan:#22d3ee`, `--violet:#a78bfa`.
Semantic: `--accent:#ffffff`, `--accent-dim:#e5e5e5`, `--danger:#ff4d4d`.
Radii: `--radius-sm:8px`, `--radius-md:12px`, `--radius-lg:16px`, `--radius-xl:24px`.
Glows: `--glow-emerald`, `--glow-dual` (box-shadow values).

### `packages/ui/src/styles.css` `:root` (mirror)
Idêntico ao globals.css **exceto** que **não define** `--surface`, `--accent`, `--accent-dim`, `--danger`.
Inconsistência menor: o alias `--surface` e as cores semânticas acima existem só no globals.css.

### `packages/ui/src/tokens.ts` (mirror JS)
Estrutura aninhada (diverge do CSS flat):
```ts
colors.bg, colors.surface.{1,2,3}, colors.border.{default,strong},
colors.text.{default,strong,muted,faint}, colors.brand.{emerald,emeraldBright,cyan,violet},
colors.semantic.{success,danger}
radii.{sm,md,lg,xl}   // number, não px
shadows.{glow,glowDual}
```
Divergências:
- `colors.semantic.success` duplica `brand.emerald` (#34d399).
- Sem equivalente a `--surface` (alias), `--accent`, `--accent-dim` no TS.
- `radii` é `number` (8) enquanto CSS é `8px` — quem usa em `style` precisa concatenar `px`.

## 2. Problemas encontrados (priorizados)

### P1 — `@apply` com classe custom quebra no Tailwind v4 — ✅ RESOLVIDO
`globals.css` (linhas ~61-71): `.btn-primary`/`.btn-ghost` usavam `@apply btn` (classe custom) → erro em v4.
Tailwind v4 só permite `@apply` de utilities (ou classes `@utility`). `.btn` é classe CSS comum →
`Cannot apply unknown utility class: btn`.
**Resolvido:** utilidades de `.btn` inlineadas em `.btn-primary`/`.btn-ghost`; `.btn` segue só com utilities.
Agora compila em v3 e v4. `.input` e `.badge` usam só utilities padrão → OK.
> Regra: em v4 NUNCA `@apply <classe-custom>`; inliner ou usar `@utility`.

### P1/P2 — Drift de shade nos componentes `@landmap/ui` — ✅ RESOLVIDO (Button/Progress)
- `Button.tsx` primary: era `from-emerald-500` (#10b981) → **agora `from-emerald-400`** (marca `#34d399`).
- `Progress.tsx`: era `from-emerald-500 to-teal-300` → **agora `from-emerald-400 to-cyan-400`**.
- `Sparkline.tsx`: default `#34d399` → OK.
- `Card/Badge/Input/...`: usam `white/5`, `neutral-*` em vez de `--surface-1`/`--border`. Aceitável; ideal consumir tokens.

### P2 — `.text-gradient` duplicado (código morto) — ✅ RESOLVIDO
- Primeiro bloco (`linear-gradient(180deg,#ffffff,#a3a3a3)`, hardcoded) era morto → **removido**.
- Bloco ativo: `linear-gradient(180deg,var(--text-strong),#c9c9c9)` (calm default for section headings).

### P2 — tokens fora de sincronia entre os 3 arquivos
`styles.css` e `tokens.ts` ficam sem `--surface`/`--accent`/`--accent-dim`/`--danger`.
Mantenha o globals.css como fonte única e sincronize os mirrors em toda mudança de cor.

## 3. Fontes
- `[locale]/layout.tsx` aplica `GeistSans.variable`+`GeistMono.variable` no `<html>` → `--font-geist-sans`/`--font-geist-mono` definidas.
- `globals.css` usa `var(--font-geist-sans)` no corpo e `var(--font-geist-mono)` na classe `.font-mono`.
- `apps/web/src/app/layout.tsx` (root) usa `Inter` e não define as vars Geist; porém o `<html>` efetivo vem de `[locale]/layout`, então Geist prevalece. Atenção ao `<html>` duplicado root vs `[locale]`.

## 4. Classes utilitárias custom (raw CSS)
Funcionam sem o pipeline Tailwind (seletores puros): `.surface`, `.glass`, `.grid-bg`, `.aurora`,
`.grain`, `.text-gradient`, `.text-aurora`, `.glow-emerald`, `.glow-dual`, `.hairline`, `.orb-float`,
`.ring-spin`, `.marquee-track`. Uso confirmado: `[locale]/layout.tsx` usa `.aurora`, `.grain`.

## 5. Checklist antes de ligar o Tailwind v4
- [ ] Trocar `@tailwind base/components/utilities` por `@import "tailwindcss";` (ou config PostCSS v4).
- [x] Resolver `@apply btn` (item P1) — utilidades inlineadas em `.btn-primary`/`.btn-ghost`. ✅
- [x] Remover `.text-gradient` morto (item P2). ✅
- [ ] Sincronizar `styles.css` e `tokens.ts` com globals.css (itens ausentes: `--surface`, `--accent`, `--accent-dim`, `--danger`).
- [x] Ajustar shades `emerald-500`→`emerald-400` e `teal`→`cyan` nos componentes. ✅
- [ ] `prefers-reduced-motion` já tratado para `.marquee-track`, `.aurora`, `.orb-float`, `.ring-spin` — manter.
