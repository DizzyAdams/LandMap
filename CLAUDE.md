# LandMap — Project Memory (for AI coding agents)

> Esta memória é lida automaticamente no início de cada sessão. Mantenha-a atualizada
> para evitar redescobrir problemas já conhecidos. Detalhes profundos ficam em
> `docs/design-system-audit.md`, `ARCHITECTURE.md` e no **`MEMORY.md`** (memória mestra
> do projeto: estado vivo, WIP, débitos técnicos e próximos passos — leia junto).

## Stack & estrutura
- **Monorepo pnpm** (`packageManager: pnpm@9.6.0`, `node >= 20`). Workspace: `apps/*`, `packages/*`.
- **apps/web** (`@landmap/web`): Next.js 14.2 (App Router, `src/app`), `next-intl` 3.20 (i18n pt-BR/en-US/es-ES), React 18, Tailwind **v4.0.0** instalado mas **ainda sem pipeline PostCSS/Tailwind config** (ver aviso abaixo). Fontes: `geist` (`GeistSans`/`GeistMono`).
- **packages/ui** (`@landmap/ui`): componentes React + design tokens. Build com `tsup`. Exporta `./styles.css` e tokens JS (`tokens.ts`).
- Outros pacotes: `@landmap/api` (Hono), `@landmap/llm` (LangGraph/RAG/PgVector), `@landmap/db`, `@landmap/config`, `@landmap/sales`.
- Diagramas/planos: `docs/`, `landmap-complete-plan.md`, `ARCHITECTURE.md`.

## Comandos principais (raiz)
- `pnpm dev` → sobe `@landmap/web` (next dev).
- `pnpm build` / `pnpm typecheck` / `pnpm lint` → `-r run ...` em todos os pacotes.
- `pnpm test` → vitest run. `pnpm dev:api` → API.
- `pnpm docs` → Storybook (porta 6006). `pnpm db:migrate|seed|generate` → DB.
- `pnpm markdown:build` → scripts/build_markdowns.py.

## ⚠️ AVISO IMPORTANTE — Tailwind v4 ainda NÃO está processando CSS
- `tailwindcss@4.0.0` está em `devDependencies`, mas **não há** `tailwind.config`, `postcss.config` nem `@import "tailwindcss"` no `globals.css`.
- `apps/web/src/app/globals.css` ainda usa a sintaxe **v3** (`@tailwind base/components/utilities`). Em v4 isso é `@import "tailwindcss";`.
- Consequência: utilitários Tailwind e `@apply` **não estão sendo compilados** ainda. Ao ligar o pipeline (PostCSS + `@tailwindcss/postcss` / `@import`), os seguintes pontos QUEBRAM o build — corrija-os ANTES:

### 1. `@apply` com classe custom não-registrada (ERA BLOQUEADOR no v4 — ✅ RESOLVIDO)
`globals.css` (linhas ~61-71): `.btn-primary`/`.btn-ghost` usavam `@apply btn` (classe custom) → erro em v4.
**Resolvido:** as utilidades de `.btn` foram inlineadas em `.btn-primary`/`.btn-ghost`; `.btn` continua só com utilities. Agora compila em v3 e v4.
```css
.btn { @apply inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm transition; }
.btn-primary { @apply inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm transition bg-white text-neutral-900 hover:bg-neutral-200; }
.btn-ghost   { @apply inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm transition border border-neutral-800 text-neutral-200 hover:border-neutral-500 hover:text-white; }
```
> Regra geral: em v4 NUNCA use `@apply <classe-custom>`. Inline ou use `@utility`.

### 2. `.text-gradient` duplicado / código morto (✅ RESOLVIDO)
Havia DOIS blocos `.text-gradient`. O primeiro (hardcoded `#ffffff→#a3a3a3`) era morto e foi removido.
O usado de fato (linhas atuais ~160): `linear-gradient(180deg,var(--text-strong),#c9c9c9)`.

## Design tokens — 3 fontes que DEVEM ficar em sincronia
| Arquivo | Papel | O que tem de diferente |
|---|---|---|
| `apps/web/src/app/globals.css` `:root` | **fonte da verdade** completa | tem `--surface` (alias de surface-1), `--accent`, `--accent-dim`, `--danger` que FALTAM nos outros |
| `packages/ui/src/styles.css` `:root` | mirror | **não tem** `--surface`, `--accent`, `--accent-dim`, `--danger` |
| `packages/ui/src/tokens.ts` | mirror JS (objetos aninhados) | `colors.semantic.success` duplica emerald; **sem** `--surface`/`--accent`/`--danger`; estrutura aninhada (`surface.1`, `text.muted`, `brand.emerald`) diverge do CSS flat |

Paleta de marca (bioluminescente): `--emerald:#34d399`, `--emerald-bright:#6ee7b7`, `--cyan:#22d3ee`, `--violet:#a78bfa`. Camada Sovereign gold (capital/investidor): `--gold:#d4af37`, `--gold-soft:#e8c873`, `--gold-bright:#f4e2a1`, `--gold-deep:#a67c00` (glows `--glow-gold`/`--glow-sovereign`).
> Nota de cor: `#34d399` = **emerald-400** do Tailwind, NÃO emerald-500 (`#10b981`).

### 3. Drift de token nos componentes `@landmap/ui` (✅ RESOLVIDO em Button/Progress)
- `Button.tsx` (primary): era `from-emerald-500` → **corrigido para `from-emerald-400`** (marca `#34d399`). `text-[#050505]` OK.
- `Progress.tsx`: era `from-emerald-500 to-teal-300` → **corrigido para `from-emerald-400 to-cyan-400`** (teal não está na paleta).
- `Sparkline.tsx`: default `color='#34d399'` → OK (bate com `--emerald`).
- `Card/Badge/Input/etc.`: usam `white/5`, `neutral-*` (padrão Tailwind) em vez de tokens `--surface-1`/`--border`. Aceitável, mas idealmente consumir os tokens.

## Fontes (Geist)
- `[locale]/layout.tsx` seta `className={`${GeistSans.variable} ${GeistMono.variable}`}` no `<html>` → define `--font-geist-sans`/`--font-geist-mono`. `globals.css` consome essas vars (corpo + `.font-mono`).
- `apps/web/src/app/layout.tsx` (root) usa `Inter` (`next/font/google`) e **não** define as vars Geist. Como o `<html>` renderizado vem do `[locale]/layout`, as vars Geist ficam ativas. ✅ **RESOLVIDO**: o `<html>` duplicado entre root e `[locale]` (causa do React #423 / `HierarchyRequestError` em hidratação, detectado pelo `.bugprobe`) foi corrigido — o html/body agora é só do root `app/layout.tsx`.

## Classes utilitárias custom (raw CSS, funcionam sem Tailwind)
Usadas no app (ex.: `[locale]/layout.tsx` usa `.aurora`, `.grain`): `.surface`, `.glass`, `.grid-bg`, `.aurora`, `.grain`, `.text-gradient`, `.text-aurora`, `.glow-emerald`, `.glow-dual`, `.hairline`, `.orb-float`, `.ring-spin`, `.marquee-track`. Todas são seletores CSS puros — não dependem do pipeline Tailwind.

## Convenções
- Componentes em `packages/ui/src/components` exportam via `packages/ui/src/index.ts`. Usam `cn()` (clsx+tailwind-merge) de `../lib`.
- Commits em pt-BR ok. Repo: `origin` = https://github.com/DizzyAdams/LandMap.git (branch `main`).
## Status atual (resumo — ver `MEMORY.md` para detalhes)
- App web: 19 rotas + APIs, build/typecheck/lint/testes verdes. Dataset 1.500 imóveis + 1.500 markdowns (10 cidades).
- **"Mundo 3D" (bmap.io-style):** ✅ completo, commitado (`af050d7`) + design elevado (`70df4c2`) + **deployado** (landmap-p6k76hgks / alias landmap.us.kg). Código em `apps/web/src/{lib/bmap.ts, components/BmapViewer|InvestorPanel|EnergyPanel|LivePulse.tsx, app/[locale]/world/page.tsx}` + i18n `world` + link na `Navbar`.
- **Removido (2026-07-10):** `apps/web/src/messages/` — pasta duplicada com JSON **corrompido** (não era lida pelo `i18n.ts`, que usa `../messages`). As mensagens vivem em `apps/web/messages/*`.
- DNS de `landmap.com.br` / `landmap.us.kg` / `getlandmap.app` ainda pendente no registrador (bloqueio externo). Produção live em `landmap-dizzys-projects-d5a44b36.vercel.app`.
- Antes de "ligar" o Tailwind v4, resolva os itens 1 e 2 acima, senão o build quebra.
