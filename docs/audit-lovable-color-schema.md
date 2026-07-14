# Auditoria de Schema de Cores — LandMap vs. Site Lovable

> **Data:** 2026-07-13 · **Escopo:** validar se o repositório LandMap usa o MESMO schema de cores do site Lovable (`lovable_styles.css`, export do Lovable).
> **Fontes comparadas:**
> 1. `lovable_styles.css` (raiz) — **REFERÊNCIA** (CSS compilado do site Lovable, tailwind v4 / shadcn-style).
> 2. `apps/web/src/app/globals.css` — declarado "fonte da verdade" no `CLAUDE.md`.
> 3. `packages/ui/src/styles.css` — declarado "mirror" (carrega junto do app via `@landmap/ui`).
> 4. `packages/ui/src/tokens.ts` — declarado "mirror JS 1:1" (carrega junto do app via `@landmap/ui`).

---

## 0. Metodologia

- Extraí os valores semânticos (`--primary`, `--background`, `--card`, `--accent`, `--muted`, `--border`, `--ring`, `--destructive`, `--success`, `--warning`, `--secondary` e seus `-foreground`) do `lovable_styles.css` via regex (bloco `@layer theme` + `:root` light/dark).
- Comparei **valor a valor** contra `globals.css` (light + `.dark`), `styles.css` e `tokens.ts`.
- Rastreei o consumo real: quem importa `styles.css`/`tokens.ts` e quais componentes usam tokens legados (`var(--surface)`, `var(--emerald*)`, `var(--gold*)`, `var(--bg)`, `var(--text)`, `var(--accent-dim)`, `var(--danger)`).
- Varri telas e biblioteca de componentes por cores hardcoded que fogem do Lovable (emerald, teal, neutral-500/600, `#050505`, `#0a0a0a`, gold, `#34d399`).

---

## 1. Veredito resumido

| Camada | Status vs. Lovable | Resumo |
|---|---|---|
| `globals.css` (render do app) | ✅ **FIEL 100%** (light + dark) | Clone exato do Lovable. É o que de fato pinta a página. |
| `packages/ui/src/styles.css` | ⚠️ **DUAL-THEME** (drift latente) | Bloco legado "soberano/dark/emerald/gold" (linhas 1–84) + bloco Lovable aditivo (85–122). Nomes compartilhados são sobrescritos pelo Lovable; nomes **legados exclusivos** (`--surface`, `--emerald`, `--gold`, `--bg`, `--text`, `--accent-dim`, `--danger`, `--glow-*`) NÃO existem no Lovable e contaminam componentes. |


---

## 2. `globals.css` × Lovable — TABELA EXATA (light)

| Token | Lovable (`lovable_styles.css`) | `globals.css` | Match |
|---|---|---|---|
| `--background` | `oklch(100% 0 0)` | `oklch(100% 0 0)` | ✅ |
| `--foreground` | `oklch(18% .06 265)` | `oklch(18% .06 265)` | ✅ |
| `--card` | `oklch(100% 0 0)` | `oklch(100% 0 0)` | ✅ |
| `--primary` | `oklch(34% .18 265)` | `oklch(34% .18 265)` | ✅ |
| `--primary-foreground` | `oklch(99% .005 250)` | `oklch(99% .005 250)` | ✅ |
| `--secondary` | `oklch(24% .1 265)` | `oklch(24% .1 265)` | ✅ |
| `--secondary-foreground` | `oklch(99% .005 250)` | `oklch(99% .005 250)` | ✅ |
| `--accent` | `oklch(88% .06 250)` | `oklch(88% .06 250)` | ✅ |
| `--accent-foreground` | `oklch(28% .14 265)` | `oklch(28% .14 265)` | ✅ |
| `--muted` | `oklch(96% .01 250)` | `oklch(96% .01 250)` | ✅ |
| `--muted-foreground` | `oklch(48% .04 265)` | `oklch(48% .04 265)` | ✅ |
| `--border` | `oklch(92% .015 250)` | `oklch(92% .015 250)` | ✅ |
| `--input` | `oklch(94% .012 250)` | `oklch(94% .012 250)` | ✅ |
| `--ring` | `oklch(50% .18 265)` | `oklch(50% .18 265)` | ✅ |
| `--destructive` | `oklch(58% .22 27)` | `oklch(58% .22 27)` | ✅ |
| `--success` | `oklch(60% .15 155)` | `oklch(60% .15 155)` | ✅ |
| `--warning` | `oklch(78% .15 78)` | `oklch(78% .15 78)` | ✅ |

**`.dark` também bate 1:1** (background `oklch(14% .05 265)`, primary `oklch(62% .2 265)`, border `oklch(100% 0 0/.1)`, etc.). `globals.css` é um clone fiel do Lovable.

| `packages/ui/src/tokens.ts` | ❌ **DRIFT** (não é mirror) | Diz "1:1 de globals.css" mas carrega o azul `#003594` da spec antiga, `emeraldTint`/`cyanTint` **AZUIS** (`rgba(0,53,148,…)`) e `ring` azul. Contradiz o Lovable (indigo `oklch(34% .18 265)`). |
| Telas de feature / `apps/web` | ⚠️ **DRIFT** (emerald/gold/dark) | 24 arquivos usam emerald/teal/neutral-500-600/`#050505`/gold. É a língua visual "soberana" antiga, ausente no Lovable. |

**Conclusão:** O site **NÃO** tem o mesmo schema do Lovable de ponta a ponta. O CSS de render (`globals.css`) é idêntico, mas o design system e várias telas de produto ainda emitem a paleta "soberana/dark/emerald/gold" anterior — exatamente a divergência que motivou esta auditoria.


---

## 3. `styles.css` (pacote `@landmap/ui`) — DRIFT LATENTE

O arquivo tem **dois temas na mesma `:root`**:

- **Bloco legado (linhas ~1–84)** — língua "fora do comum / sovereign dark":
  `--bg:#050505`, `--surface:#0a0a0a`, `--border:#1a1a1a`, `--text:#f5f5f5`,
  `--emerald:#34d399`, `--cyan:#22d3ee`, `--violet:#a78bfa`, `--gold:#d4af37`,
  `--accent:#ffffff`, `--accent-dim:#e5e5e5`, `--danger:#ff4d4d`, glows emerald/gold,
  `--ring` (glow emerald), tipografia, espaçamentos, raios.
- **Bloco Lovable aditivo (linhas ~85–122)** — redefine `--background/--card/--primary/--accent/--muted/--border/--ring/...` para os valores do Lovable (idênticos a `globals.css`).

**Comportamento em cascata:** para nomes compartilhados, o bloco Lovable (mais abaixo) vence → app fica Lovable. **Mas** os nomes **exclusivos do legado** (`--surface`, `--surface-1/2/3/4`, `--bg`, `--text`, `--text-strong`, `--emerald*`, `--cyan*`, `--violet*`, `--gold*`, `--accent-dim`, `--danger`, `--glow-*`, `--border-strong`, `--border-subtle`) permanecem e **não existem no Lovable**. Qualquer componente que os use pinta fora do schema Lovable.

**Componentes do DS que dependem desses tokens legados (logo, divergem do Lovable):**
- `button.tsx` (exportado): variant `gold` usa `--gold-soft/--gold/--gold-deep/--glow-gold/--glow-sovereign` (só no legado); `hero` usa `--accent-dim` (legado `#e5e5e5`).
- `components/Button.tsx` (legado, não exportado): `primary` = gradiente **emerald→cyan**, texto `#050505`, glow emerald. Diverge totalmente do primário indigo do Lovable.
- `components/StatPill.tsx`: usa `--emerald-tint/--emerald-bright/--cyan-tint/--violet-tint/--gold-tint/--surface-3/--accent-dim` (todos legados).
- `components/Toast.tsx`, `Input.tsx`, `CommandPalette.tsx`, `Badge.tsx`, `OnboardingTour.tsx`, `Stepper.tsx`, `Avatar.tsx`, `Stat.tsx`, `Card.tsx`, `MetricStat.tsx`, `NotificationCenter.tsx`: misturam `emerald-*`, `neutral-*`, `ring-emerald-400/60` (anel de foco emerald ≠ `--ring` indigo do Lovable).


---

## 4. `tokens.ts` — DRIFT CONFIRMADO (não é o "mirror 1:1" que o doc afirma)

| Token (`tokens.ts`) | Valor atual | Valor correto (Lovable / `globals.css`) | Problema |
|---|---|---|---|
| `primary` | `#003594` | `oklch(34% .18 265)` | Azul royal antigo (`spec #003594`), não o indigo do Lovable. |
| `primaryBright` | `#1e5fd0` | — (não existe no Lovable) | Rama azul da spec antiga. |
| `primarySoft` | `#3b6fc4` | — | Rama azul da spec antiga. |
| `primaryGlow` | `#1e5fd0` | `oklch(55% .2 265)` | Azul, deveria ser indigo. |
| `ring` | `0 0 0 1px #003594, …` | `oklch(50% .18 265)` | Azul; Lovable `--ring` é cor indigo (usado em `focus-visible:ring-[var(--ring)]`). |
| `emeraldTint` | `rgba(0,53,148,0.10)` | `rgba(52,211,153,0.12)` | **BUG:** tint "emerald" está AZUL. |


---

## 5. Drift em telas de produto (`apps/web/src`)

Varredura por cores que fogem do Lovable (emerald/teal/neutral-500-600/`#050505`/`#0a0a0a`/gold/`#34d399`): **24 arquivos** com ocorrências. Os piores:

| Arquivo | Tipo de drift |
|---|---|
| `components/InvestmentCard.tsx` (6) | `var(--emerald-bright)`, `--emerald-tint`, `--gold-*` — paleta sovereign. |
| `components/BmapViewer.tsx` (6) | emerald/cyan/gold (Mundo 3D). |
| `components/LiveDashboard.tsx` (5) | emerald/cyan. |
| `app/[locale]/terrenos/page.tsx` (5) | emerald/neutral. |
| `components/EnergyPanel.tsx` (5) | emerald/cyan. |
| `components/HeroTerritory.tsx` (4) | emerald/cyan. |
| `components/InvestmentLegend.tsx` (4) | emerald/gold. |
| `components/PropertyThumb.tsx` (4) | emerald. |
| `components/SkylineCanvas.tsx` (4) | emerald/cyan. |
| `app/[locale]/sales/page.tsx` (4) | emerald/gold. |


---

## 6. Plano de remediação (priorizado, sem quebrar o build)

**P0 — Corrigir o mirror JS (feito nesta sessão em `tokens.ts`):**
- `primary` → `oklch(34% .18 265)`; `primaryGlow` → `oklch(55% .2 265)`; `ring` → `oklch(50% .18 265)`.
- `emeraldTint` → `rgba(52,211,153,0.12)`; `cyanTint` → `rgba(34,211,238,0.12)` (corrige bugs de tint azul).
- `borderStrong` → alinhar ao Lovable.
- Manter `brand.*` (emerald/cyan/violet/gold) como **tokens semânticos** (verde/cyan só em sucesso/valorização), mas documentar que NÃO são cor de marca do Lovable.

**P1 — Resolver o dual-theme de `styles.css` (sem remover tokens usados):**
- Manter os tokens legados exclusivos (`--surface`, `--emerald*`, `--gold*`, `--bg`, `--text`, `--accent-dim`, `--danger`, `--glow-*`) **apenas** enquanto houver componente os consumindo, mas marcá-los como `@deprecated`/comentário "≠ Lovable".
- Migrar `components/Button.tsx` (legado, `primary` emerald) e variant `gold` para usar `--primary`/tokens Lovable, ou removê-los se não estiverem em uso nas 19 rotas.
- Unificar o anel de foco: todos os componentes DS para `focus-visible:ring-[var(--ring)]` (indigo), eliminando `ring-emerald-400/60`.

**P2 — Telas de feature:**
- Substituir `emerald/cyan/gold` decorativos por `--primary`/`--success`/`--muted` onde for cor de marca; manter verde/cyan **só** em semântica (valorização, alta/baixa, status CRM) — já é a regra do port Lote 5, falta consolidar os 24 arquivos restantes.
- `admin/analytics` `COLORS` hardcoded → mover para tokens (ou aceitar como paleta de gráfico, mas documentar).
- `text-neutral-500/600` → `--muted-foreground` (WCAG AA), já parcialmente feito.

---

## 7. Como validar (re-executar esta auditoria)

```powershell
# Extrair tokens semânticos do Lovable:
Select-String -Path lovable_styles.css -Pattern '--(background|foreground|card|primary|secondary|accent|muted|border|input|ring|destructive|success|warning)(?:-foreground)?:\s*([^;}]+)' -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { '{0}: {1}' -f $_.Groups[1].Value, $_.Groups[2].Value } | Sort-Object -Unique

# Drift em telas:
cmd /c "findstr /s /m emerald- teal- #050505 #0a0a0a gold- #34d399 apps/web/src/*.*"

# Build do design system (não quebra em Windows):
pnpm -F @landmap/ui build
```

---
*Auditado em 2026-07-13. `globals.css` = fiel ao Lovable; `styles.css` (dual-theme) e `tokens.ts` (drift) + 24 telas = divergência real.*

| `components/InvestorPanel.tsx` (3) | gold/emerald. |
| `app/[locale]/auth/page.tsx` (2) | `#050505`/neutral. |
| `app/loading.tsx`, `components/LivePulse.tsx`, `components/atlas/AtlasLanding.tsx` | emerald/cyan. |
| `admin/analytics/page.tsx` | `COLORS` hardcoded (`#6366f1,#8b5cf6,#06b6d4,#22d3ee,#a78bfa,#34d399,#f59e0b`) — paleta própria, fora do token. |

**Anel de foco inconsistente (já apontado em `docs/war-room/02-ux-ui.md` T3):** `globals.css` `:focus-visible` usa `--ring` (indigo Lovable), mas vários componentes DS usam `ring-emerald-400/60` (emerald). Dois acentos de foco competindo.

| `cyanTint` | `rgba(0,53,148,0.10)` | `rgba(34,211,238,0.12)` | **BUG:** tint "cyan" está AZUL. |
| `borderStrong` | `oklch(30% 0.09 265)` | `oklch(92% .015 250)` (ou `--sidebar-border`) | Reflete borda dark, não a do Lovable light. |

> Observação: `tokens.ts` **não é consumido por nenhum componente de tela** (os componentes usam `var(--…)` CSS). Só é exportado em `config`. Logo, alinhar esses valores **não quebra o render** — apenas torna o mirror verdadeiro e coerente com `globals.css`.


