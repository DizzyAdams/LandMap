# Design System LandMap — Fonte: CTO de UX-UI (Lovable)

> **Link de verdade (onde o CTO publica o design):**
> `https://landmap-insight.lovable.app`
> _(Documentado como referência obrigatória em `docs/lovable-port-pattern.md:3`)_
>
> Este arquivo é a **fonte única de verdade do design**. Tudo que o CTO de UX-UI
> publicar no link acima **prevalece** sobre qualquer outra convenção do repo.
> O back-end LandMap (API Hono `@landmap/api`, LLM `@landmap/llm`, DB `@landmap/db`)
> deve ser integrado **respeitando estes tokens e telas** — nunca o contrário.
>
> Os tokens abaixo foram extraídos **literalmente** do CSS compilado do projeto
> Lovable (`lovable_styles.css`, export do trabalho do CTO no link). O
> `apps/web/src/app/globals.css` já é um clone 1:1 desses valores (ver
> `docs/audit-lovable-color-schema.md`).

---

## 1. Cores — Light (padrão)

| Token | Valor (Lovable / CTO) | Uso |
|---|---|---|
| `--background` | `oklch(100% 0 0)` | canvas |
| `--foreground` | `oklch(18% .06 265)` | texto |
| `--card` | `oklch(100% 0 0)` | superfície |
| `--card-foreground` | `oklch(18% .06 265)` | texto em card |
| `--popover` | `oklch(100% 0 0)` | popover |
| `--primary` | `oklch(34% .18 265)` | **marca (indigo)** — ação primária |
| `--primary-foreground` | `oklch(99% .005 250)` | texto em primário |
| `--secondary` | `oklch(24% .1 265)` | superfície secundária |
| `--secondary-foreground` | `oklch(99% .005 250)` | |
| `--accent` | `oklch(88% .06 250)` | hover/subtle |
| `--accent-foreground` | `oklch(28% .14 265)` | |
| `--muted` | `oklch(96% .01 250)` | superfície muted |
| `--muted-foreground` | `oklch(48% .04 265)` | texto secundário (AA) |
| `--border` | `oklch(92% .015 250)` | hairline |
| `--input` | `oklch(94% .012 250)` | input/borda de campo |
| `--ring` | `oklch(50% .18 265)` | **anel de foco** |
| `--destructive` | `oklch(58% .22 27)` | erro/perigo |
| `--success` | `oklch(60% .15 155)` | sucesso/valorização |
| `--warning` | `oklch(78% .15 78)` | aviso |

---

## 2. Cores — Dark (`.dark`)

| Token | Valor |
|---|---|
| `--background` | `oklch(14% .05 265)` |
| `--foreground` | `oklch(96% .01 250)` |
| `--card` / `--popover` | `oklch(19% .07 265)` |
| `--primary` | `oklch(62% .2 265)` |
| `--primary-foreground` | `oklch(99% .005 250)` |
| `--secondary` | `oklch(26% .08 265)` |
| `--accent` | `oklch(55% .18 265)` |
| `--muted` | `oklch(22% .06 265)` |
| `--muted-foreground` | `oklch(72% .03 250)` |
| `--border` | `oklch(100% 0 0 / .1)` |
| `--input` | `oklch(100% 0 0 / .12)` |
| `--ring` | `oklch(62% .2 265)` |


---

## 3. Tipografia

| Papel | Fonte | Definido em |
|---|---|---|
| Sans (corpo) | `DM Sans` | `globals.css` `@theme --font-sans` |
| Display (títulos) | `Space Grotesk` | `--font-display` |
| Mono (números/dados) | `JetBrains Mono` | `--font-mono` |

> Nota: o repo também cita `Geist` (`GeistSans`/`GeistMono`) vindo do `geist`;
> manter `DM Sans`/`Space Grotesk`/`JetBrains Mono` como padrão do CTO.

## 4. Raios / Sombras / Gradientes

- `--radius: 0.625rem` (padrão de borda arredondada)
- `--shadow-card`: `0 1px 3px rgba(24,24,40,.12), 0 8px 24px -12px rgba(24,24,40,.15)`
- `--shadow-elegant`: `0 20px 40px -20px rgba(24,24,40,.4)`
- `--gradient-brand`: `linear-gradient(135deg, oklch(24% .1 265), oklch(34% .18 265))`
- `--gradient-hero`: `linear-gradient(140deg, oklch(20% .08 265) 0%, oklch(30% .15 265) 55%, oklch(50% .2 265) 100%)`
- `--gradient-accent`: `linear-gradient(135deg, oklch(34% .18 265), oklch(62% .18 250))`

## 5. Anel de foco (acessibilidade)

Todos os elementos interativos usam `focus-visible:ring-[var(--ring)]` (indigo
`oklch(50% .18 265)` no light, `oklch(62% .2 265)` no dark). **Não** usar
`ring-emerald-*` — manter um único acento de foco (regra do CTO / audit T3).

---

## 6. Regras de port (CTO — `docs/lovable-port-pattern.md`)

1. Remova `<GlowPanel>` → `<div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4">`.


---

## 7. Integração do back-end "por ali" (via o design do CTO)

O link do CTO (`landmap-insight.lovable.app`) define o **frontend/UX**. O back-end
LandMap se pluga nessas mesmas telas/tokens — o visual never dita a lógica, mas a
lógica nunca quebra o visual:

- **API:** `@landmap/api` (Hono). Telas consomem via `fetch` + TanStack Query
  (`@tanstack/react-query`, router `useQuery`/`useMutation`).
- **Dados de produto:** busca (`geoAutocomplete` → `bboxFromCenter` →
  `fetchWorld`) e terrenos/imóveis vêm do dataset (1.500 imóveis + 1.500
  markdowns). Exibidos com `StatPill` (tons `emerald`=alta, `red`/`--danger`=baixa,
  `cyan`/`violet`/`gold` semânticos) e mono (`JetBrains Mono`) para números.
- **CRM:** leads/oportunidades via `@landmap/twenty` — status usa
  `--success`/`--destructive`/`--muted-foreground` (never `emerald` como marca).
- **LLM/RAG:** `@landmap/llm` (LangGraph/PgVector) alimenta `insights`/`chat` —
  mantém `force-dynamic` + fetch; só o visual segue os tokens.
- **Regra de ouro:** ao integrar nova feature do back-end, reaproveite os
  componentes DS (`Button`/`Card`/`Badge`/`Input`/`StatPill`) e tokens
  `var(--…)`. Nunca introduza cor hardcoded (`#050505`, `emerald-500`, `teal-*`,
  `gold` fora de semântica).

## 8. Como manter este markdown sincronizado com o link

O CTO pode atualizar o design a qualquer momento no
`https://landmap-insight.lovable.app`. Quando houver "novas informações":

1. Re-exportar o CSS do projeto Lovable → atualizar `lovable_styles.css` (na raiz).
2. Re-extrair os tokens semânticos e conferir contra `globals.css`
   (script em `docs/audit-lovable-color-schema.md` §7).
3. Atualizar as tabelas deste arquivo (§1–§5) e re-portar as telas pendentes (§6).
4. Rodar `pnpm -F @landmap/ui build` + typecheck para validar.

> Este markdown é a **tradução literal** do trabalho do CTO no link. Em caso de
> conflito entre este arquivo e qualquer outro doc do repo, **o link do CTO vence**.

---
*Criado em 2026-07-13 a partir de `lovable_styles.css` (export do projeto Lovable do CTO) + `docs/lovable-port-pattern.md`.*

2. Remova `neutral-*` e `emerald-*` hardcoded → tokens `var(--…)`:
   - secundário: `text-[var(--muted-foreground-lovable)]`
   - forte: `text-[var(--foreground)]`
   - CTA primário: `bg-[var(--primary)] text-[var(--primary-foreground)]`
   - hover card/linha: `hover:bg-[var(--muted-lovable)]`
3. Ícones: `../../../components/lovable/icons` (não `lucide-react`).
4. Mantenha `useLocale` + `Link` com `/${locale}`.
5. **Não altere fetch/API/lógica** — só o visual.
6. Server Components: mantenha `force-dynamic` + fetch; só `use client` se usar hooks.

### Telas já portadas (não mexer)
`regions`, `favorites`, `auth`, `intro`, `plans`

### Telas pendentes (portar ao padrão do CTO)
`admin/*`, `terrenos`, `sales`, `insights`, `property/[id]`, `search`,
`calculator`, `alerts`, `pricing`, `studio`, `map`, `chat`, `docs`, `compare`,
`status`, `offline`, `world`

| `--destructive` | `oklch(65% .22 27)` |
| `--success` | `oklch(72% .15 148)` |
| `--warning` | `oklch(82% .15 78)` |
