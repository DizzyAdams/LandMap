# Design System Audit — LandMap (CSS & Tokens)

> Auditoria do sistema de design dark-premium "fora do comum" do LandMap.
> Resumo acionável em `CLAUDE.md`. Última revisão: 2026-07-09 (revalidado por 4 sub-agents auditores).

## 1. Inventário de tokens (3 fontes)

### `apps/web/src/app/globals.css` `:root` (fonte da verdade)
Canvas: `--bg:#050505`, `--surface:#0a0a0a` (alias), `--surface-1:#0a0a0a`, `--surface-2:#0f0f0f`, `--surface-3:#141414`.
Lines: `--border:#1a1a1a`, `--border-strong:#262626`.
Text: `--text:#f5f5f5`, `--text-strong:#ffffff`, `--muted:#a3a3a3`, `--muted-2:#737373`.
Brand: `--emerald:#34d399`, `--emerald-bright:#6ee7b7`, `--cyan:#22d3ee`, `--violet:#a78bfa`. Sovereign gold: `--gold:#d4af37`, `--gold-soft:#e8c873`, `--gold-bright:#f4e2a1`, `--gold-deep:#a67c00`.
Semantic: `--accent:#ffffff`, `--accent-dim:#e5e5e5`, `--danger:#ff4d4d`.
Radii: `--radius-sm:8px`, `--radius-md:12px`, `--radius-lg:16px`, `--radius-xl:24px`.
Glows: `--glow-emerald`, `--glow-dual`, `--glow-gold`, `--glow-sovereign` (box-shadow values).

### `packages/ui/src/styles.css` `:root` (mirror)
Espelho completo do globals.css (inclui a camada gold `--gold/--gold-soft/--gold-bright/--gold-deep`
e os glows `--glow-gold/--glow-sovereign`), sincronizado em 2026-07-09. Não usa `@import "tailwindcss"`
nem `@source` — o pacote UI é buildado via tsup e entrega styles.css como CSS cru; o Tailwind é
processado pela app consumidora.

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

### P2 — tokens fora de sincronia entre os 3 arquivos — ✅ RESOLVIDO (camada gold)
`styles.css` agora espelha globals.css por completo (inclui a camada Sovereign gold e os glows gold),
sincronizado em 2026-07-09. `tokens.ts` já tinha gold/`surfaceAlias`/`accent`/`accentDim`.
Regra: globals.css é fonte única — sincronize os mirrors em toda mudança de cor.

### P1 — `@source` do Tailwind v4 apontava para caminho inexistente — ✅ RESOLVIDO
`globals.css:4` tinha `@source '../../../packages/ui/src/**/*.{ts,tsx}'` que, a partir de
`apps/web/src/app/`, resolve para `apps/packages/ui` (inexistente). Corrigido para
`'../../../../packages/ui/src/**/*.{ts,tsx}'` (4 níveis acima = raiz do repo). O auto-detection
do v4 já cobria o pacote, mas o source explícito agora está correto.

### P3 — dois componentes `Button` (duplicados) — ⚠️ WARN (documentado)
O `<Button>` exportado por `@landmap/ui` é `packages/ui/src/button.tsx` (variantes `default|outline|ghost|hero`;
`default` = ação emerald→cyan bioluminescente, com focus ring emerald via `focusBase`). Existe também
`packages/ui/src/components/Button.tsx` (variantes `primary|gold|ghost|outline|hero`) que **não é exportado**
pela `index.ts` (código legado/morto). O sub-agent de componentes auditou o arquivo errado e sinalizou
falsamente `variant="default"` como bug em `Navbar.tsx` — na verdade `default` é válido e correto (renderiza
o gradiente emerald). Ação recomendada: remover/consolidar `components/Button.tsx` para evitar confusão.

### P2 — drift de shade `emerald-500`/`teal-*` fora do conjunto auditado — ⚠️ WARN (documentado)
Sub-agent de componentes encontrou `emerald-500`+`teal-300` em `LiveDashboard.tsx:206` e
`sales/page.tsx:360`, e `emerald-500` em `SpotlightCard.tsx`, `SocialProof.tsx`, `pricing/page.tsx`,
`docs/embedding/page.tsx`, `admin/page.tsx`. O mandato de marca exige `emerald-400` (#34d399) e
`cyan` (não `teal`) nos gradientes de ação; estes usos são acentos secundários. Corrigir progressivamente
(`emerald-500`→`emerald-400`, `teal-*`→`cyan-*`) para consistência total.

### P3 — `tokens.ts` `radii` são números (sem `px`) — ⚠️ WARN
`radii.{sm,md,lg,xl}` = 8/12/16/24 (number). Quem usa em `style` (ex.: `borderRadius: radii.md`)
precisa concatenar `'px'`. Documentado; sem ação imediata.

### P3 — `Button` variante `gold` hardcoded (amber/yellow) — ⚠️ WARN
`Button.tsx` gold usa `from-amber-200 via-yellow-400 to-amber-600` + rgba inline, divergindo de
`--gold #d4af37`. Visualmente champagne (aceitável), mas fora do sistema de tokens. Migrar para
tokens gold futuramente.

## 3. Fontes
- `app/layout.tsx` (root) aplica `GeistSans.variable`+`GeistMono.variable` no `<html>` → `--font-geist-sans`/`--font-geist-mono` definidas.
- `globals.css` usa `var(--font-geist-sans)` no corpo e `var(--font-geist-mono)` na classe `.font-mono`.
- `app/[locale]/layout.tsx` é aninhado (sem `<html>`); o shell html/body é só do root `app/layout.tsx`. ✅ O `<html>` duplicado root vs `[locale]` (causa de React #423 em hidratação) está resolvido.

## 4. Classes utilitárias custom (raw CSS)
Funcionam sem o pipeline Tailwind (seletores puros): `.surface`, `.glass`, `.grid-bg`, `.aurora`,
`.grain`, `.text-gradient`, `.text-aurora`, `.glow-emerald`, `.glow-dual`, `.hairline`, `.orb-float`,
`.ring-spin`, `.marquee-track`. Camada Sovereign gold: `.glow-gold`, `.glow-sovereign`,
`.hairline-gold`, `.text-gradient-gold`, `.gold-aura`, `.mandala-spin`, `.gold-dust`.
Uso confirmado: `[locale]/layout.tsx` usa `.aurora`, `.grain`; home page usa `.mandala-spin`, `.gold-dust`, `.gold-aura`.

## 5. Checklist (Tailwind v4 já ativo)
- [x] `@import "tailwindcss";` em `globals.css:1` (v4 ativo). ✅
- [x] `@source` aponta para `../../../../packages/ui/src/**` (corrigido 2026-07-09). ✅
- [x] Resolver `@apply btn` (item P1) — utilidades inlineadas em `.btn-primary`/`.btn-ghost`. ✅
- [x] Remover `.text-gradient` morto (item P2). ✅
- [x] Sincronizar `styles.css` com globals.css (camada gold + glows gold adicionados 2026-07-09). ✅
- [x] Ajustar shades `emerald-500`→`emerald-400` e `teal`→`cyan` nos componentes `@landmap/ui`. ✅
- [x] `prefers-reduced-motion` cobre `.marquee-track`, `.aurora`, `.orb-float`, `.ring-spin`, `.mandala-spin`, `.gold-dust` — manter. ✅
- [ ] Corrigir progressivamente `emerald-500`→`emerald-400` e `teal-*`→`cyan-*` nas páginas do app (WARN). ⏳
