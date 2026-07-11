# LandMap 2.0 — "Sovereign Intelligence" Redesign

> Plano de redesign visual completo do LandMap. Mantém 100% das features, rotas e
> dados; muda apenas a apresentação (layout, componentes, ritmo, motion, a11y).

## Status (2026-07-10)

O mecanismo de **time paralelo de sub-agentes falhou por autenticação**
(`Unauthorized: re-authenticate your Cline account`) — o runtime de sub-agentes
está bloqueado neste ambiente. Apenas o agente de marketing chegou a gravar algo
(`SkylineCanvas.tsx` + uso na home) antes do erro. O agente principal executou a
**foundation** diretamente.

| Agente | Dono de | Estado | O que foi feito |
|---|---|---|---|
| 1 · Foundation/Tokens | `tokens.ts`, `styles.css`, `globals.css` | ✅ feito | Nova scale de tokens + utilitários de layout (`.container-x`, `.section`, `.page-header`, type scale, elevation, tints) |
| 2 · Core Components | `packages/ui/src/components/*` | 🟡 parcial | Polido `InvestmentCard` (hover-lift/glow/AA) + `Stat` (AA + elevação); demais já on-brand |
| 3 · Shell/Nav | `Navbar`, `Footer`, `Logo`, `layout`s + primitivos | ✅ feito | `Container`/`Section`/`PageHeader` criados; `Navbar`/`Footer` alinhados a 1200px |
| 4 · Home/Marketing | home, pricing, insights, studio, docs, status, offline | ✅ feito | Home com `SkylineCanvas` + alinhada; todas as telas alinhadas em largura (1200px) |
| 5 · Discovery | search, map, property, compare, favorites, alerts | 🟡 parcial | `search`/`compare` com `PageHeader`+`container-x`; `property/[id]`/`alerts`(conteúdo)/`favorites` alinhados; `map` alinhado em largura |
| 6 · Dashboards | calculator, live, world, sales, chat, admin/* | ✅ feito | `calculator`/`docs/embedding` alinhados a 1200px; `chat` intencionalmente mais estreito (UX); `admin/*` no sidebar layout (coluna restrita) |
| 7 · Motion/A11y | web motion components, Storybook, audit | ✅ feito | Audit doc (`MOTION-A11Y.md`); gaps A3/A4/T1 resolvidos; `SpotlightCard` com `focus-within`; Storybook entregue (`apps/web/stories/**` + `.storybook`) |

## Como reexecutar o time (após reautenticar a conta Cline)

As 7 briefs completas estão em [`AGENTS.md`](./AGENTS.md). Para rodar:

```powershell
# 1. Reautenticar a conta Cline (necessário p/ sub-agentes).
# 2. Spawn dos 7 teammates + run async (ver AGENTS.md para os prompts exatos).
```

Cada agente tem uma **fatia de arquivos dona e disjunta** → sem conflito de merge
quando rodarem em paralelo.

## Contrato de tokens (resumo — ver [`TOKENS.md`](./TOKENS.md))

- Cores de marca: emerald `#34d399` (emerald-400, **não** 500), cyan `#22d3ee`,
  violet `#a78bfa`, gold `#d4af37`. Perigo `#ff4d4d`; sucesso = emerald.
- Texto AA: `--text-muted:#c9c9c9`, `--text-faint:#8a8a8a` (nunca abaixo de
  `#a3a3a3` para texto com significado).
- Containers: `--container:1200px`, `--container-narrow:720px` (classe `.container-x`).
- Elevação: `--elevation-1..3` (classe `.surface-raised`).
- Tints: `--emerald-tint`, `--cyan-tint`, `--gold-tint`, `--violet-tint`.
- Tipografia: `.text-display/.text-h1..text-h4/.text-caption` + vars `--fs-*`.

## Restrições do build (não quebrar)

- Tailwind v4 ativo: `@import "tailwindcss"` em `globals.css`. **Nunca** `@apply`
  de classe custom; só utilities / `@utility`.
- `emerald` = `#34d399`; não usar `emerald-500` / `teal-*` em gradientes de ação.
- Não mudar rotas, data fetching, API nem lógica de negócio.
- i18n: strings em `apps/web/messages/*.json` via `useTranslations`; não criar
  `apps/web/src/messages/`.
- Validar: `cd packages/ui && npx tsc --noEmit` e
  `cd apps/web && npx tsc --noEmit -p tsconfig.json`.
