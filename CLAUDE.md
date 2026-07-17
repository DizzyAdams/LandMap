# LandMap — Project Memory (for AI coding agents)

> Esta memória é lida automaticamente no início de cada sessão. Mantenha-a atualizada
> para evitar redescobrir problemas já conhecidos. Detalhes profundos ficam em
> `docs/design-system-audit.md`, `ARCHITECTURE.md` e no **`MEMORY.md`** (memória mestra
> do projeto: estado vivo, WIP, débitos técnicos e próximos passos — leia junto).

> **Design source of truth = `DESIGN.md`** (fonte autoritativa de UI/UX, tokens e fontes — este arquivo e `MEMORY.md` devem estar em sincronia com ele).

## 🔒 ULTIMATE DESIGN STANDARD (BLOQUEADO — 2026-07-15; mapa híbrido 2026-07-17)
> STANDARD DEFINITIVO do LandMap = design system Lovable indigo (`landmap-insight.lovable.app`).
> Shell das 9 rotas Lovable: paridade de chrome/tokens. **Mapa = padrão híbrido C** (não é clone 1:1 das camadas intelligence do dashboard Lovable) — ver `DESIGN.md` §4.1 + `docs/map-parity-audit-2026-07.md`.
> Regras OBRIGATÓRIAS para QUALQUER nova página/feature:
> 1. Tokens: usar **só** `apps/web/src/app/globals.css` `:root`/`.dark` (`--primary`/`--accent`/`--muted`/`--ring`, indigo Lovable oklch hue≈265). NUNCA hardcodar hex fora dos tokens.
> 2. Fontes: DM Sans (`--font-sans`) + Space Grotesk (`--font-display`) via Google Fonts `<link>` no root layout — **as mesmas 2 famílias do Lovable live**. `--font-mono` = system mono stack (sem JetBrains). NÃO usar `next/font`.
> 3. Mono-dark premium (Linear/Vercel/Stripe): hierarquia forte, **zero gradientes baratos**, animações clean + `prefers-reduced-motion` safe.
> 4. Componentes: preferir `@landmap/ui` (`Card`, `Badge`, `Button`/`buttonVariants`, `Sparkline`, `Progress`). Classes custom utilitárias (`packages/ui`): `.surface`/`.glass`/`.aurora`/`.glow-*`.
> 5. Estrutura: rotas em `apps/web/src/app/[locale]` com prefixo locale; i18n `apps/web/messages/{pt-BR,en-US,es-ES}.json`.
> 6. Auth: rotas com `<RequireAuth>` usam free access mock (localStorage) — **não** reintroduzir paywall. Manter o gate.
> 7. UI nova: indistinguível do chrome Lovable/indigo. **Mapa Free** (`/map`) pode ter extras de produto (grade A–F, heat API, dossier) — nunca paleta Sovereign.
> 8. **Map System Standard:** controles devem funcionar; Leaflet sem cor de marca fora dos tokens; sem claim “mapa 100% igual Lovable” sem checklist de camadas.


## Stack & estrutura
- **Monorepo pnpm** (`packageManager: pnpm@9.6.0`, `node >= 20`). Workspace: `apps/*`, `packages/*`.
- **apps/web** (`@landmap/web`): Next.js 14.2 (App Router, `src/app`), `next-intl` 3.20 (i18n pt-BR/en-US/es-ES), React 18, Tailwind **v4.0.0** com pipeline PostCSS/Tailwind **ativo** (ver ✅ abaixo). Fontes: **DM Sans + Space Grotesk + JetBrains Mono** via Google Fonts `<link>` (ver DESIGN.md).
- **packages/ui** (`@landmap/ui`): componentes React + design tokens. Build com `tsup`. Exporta `./styles.css` e tokens JS (`tokens.ts`).
- Outros pacotes: `@landmap/api` (Hono), `@landmap/llm` (LangGraph/RAG/PgVector), `@landmap/db`, `@landmap/config`, `@landmap/sales`.
- **RAG + Webhooks (2026-07-17):** UI `/rag` e `/chat` → `POST /api/rag/query` (proxy Next → `@landmap/api/platform`). Webhooks outbound multi-projeto: `POST /api/webhooks/endpoints`, HMAC `X-LandMap-Signature`, admin `/admin/webhooks`. Docs: `docs/platform-rag-webhooks-2026-07.md`.
- **Admin agentes (2026-07-17):** `/admin/agents` — time de **14** em espera; squad FU (followup + cold_recovery + waba); **auto-loop** com countdown → `POST /api/sales/tick`; autonomia off|copilot|autopilot. Doc: `docs/admin-agents-followup-2026-07.md`. **Não** expor cockpit no app público.
- Diagramas/planos: `docs/`, `landmap-complete-plan.md`, `ARCHITECTURE.md`.

## Comandos principais (raiz)
- `pnpm dev` → sobe `@landmap/web` (next dev).
- `pnpm build` / `pnpm typecheck` / `pnpm lint` → `-r run ...` em todos os pacotes.
- `pnpm test` → vitest run. `pnpm dev:api` → API.
- `pnpm docs` → Storybook (porta 6006). `pnpm db:migrate|seed|generate` → DB.
- `pnpm markdown:build` → scripts/build_markdowns.py.

## ✅ Tailwind v4 ATIVO (pipeline de produção — corrigido em 2026-07-11)
- `tailwindcss@4.0.0` + `@tailwindcss/postcss` em `apps/web/postcss.config.mjs`; `apps/web/src/app/globals.css` usa `@import "tailwindcss";` e `@source '../../../../packages/ui/src/**/*.{ts,tsx}'` para gerar as classes dos componentes do `@landmap/ui`.
- Utilitários Tailwind e tokens CSS **estão sendo compilados**. Regra v4 que permanece: **NUNCA** use `@apply` com uma classe custom (só utilities / `@utility`).
- Ao adicionar classes Tailwind em componentes de `packages/ui`, elas são escaneadas via o `@source` acima — valide com `pnpm build` / `next build`.
- Tokens unificados adicionados nesta sessão: `--ring` (anel de foco **indigo Lovable**, reutilizado por `Button`/`Card`), tints (`--emerald-tint`/`--cyan-tint` etc. — **hoje restritos à feature World 3D/Sovereign**, ver DESIGN.md §8) e `--border-subtle` também espelhados em `globals.css :root`. `buttonVariants()` exportado por `@landmap/ui` p/ estilizar `<Link>` como botão.

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
| `apps/web/src/app/globals.css` `:root` | **fonte da verdade** completa | tem `--surface`, `--accent`, `--accent-dim`, `--danger`, `--primary` + tokens Lovable |
| `packages/ui/src/styles.css` `:root` | mirror | **tem** `--surface`/`--accent`/`--accent-dim`/`--danger`/`--primary` + Lovable (✅ sincronizado) |
| `packages/ui/src/tokens.ts` | mirror JS (flat, 1:1 com CSS) | espelha `:root` 1:1: `surface`/`accent`/`danger`/`primary`/`lovable` + `colors.semantic`/`colors.brand`. **Re-alinhado ao Lovable indigo em 2026-07-13** (corrigido drift `#003594`/`emeraldTint`/`cyanTint` azuis — ver `docs/audit-lovable-color-schema.md`) |

**Paleta de marca (Lovable indigo `oklch`, hue ≈ 265):** `--primary`, `--accent`, `--muted`, `--ring`, gradientes, sombras e tokens de sidebar em `apps/web/src/app/globals.css` `:root`/`.dark` (ver DESIGN.md).
> ⚠️ **RETIRADA em 2026-07-13/14:** a paleta *bioluminescente* (`--emerald:#34d399`, `--cyan:#22d3ee`, `--violet:#a78bfa`, Sovereign `--gold`) foi **substituída** pelo indigo Lovable. A única exceção intencional é a feature de data-viz **"World 3D" / Sovereign** (`SkylineCanvas`, `BmapViewer`, `EnergyPanel`, `LivePulse`, `InvestmentCard`, etc.), que mantém `--emerald/--cyan/--gold` como *feature palette* documentada (não é drift).

### 3. Drift de token nos componentes `@landmap/ui` (✅ RESOLVIDO em Button/Progress — CONTEXTO LEGADO, ver nota)
> ⚠️ **CONTEXTO LEGADO:** os valores `emerald/cyan` abaixo descrevem a paleta *bioluminescente* pré-2026-07-13. Desde a migração Lovable, o **marca** é indigo `oklch` (hue ≈ 265); `emerald/cyan/gold` sobrevivem apenas na feature de data-viz "World 3D"/Sovereign (ver DESIGN.md §8).
- `Button.tsx` (primary): era `from-emerald-500` → **corrigido para `from-emerald-400`** (marca `#34d399`). `text-[#050505]` OK.
- `Progress.tsx`: era `from-emerald-500 to-teal-300` → **corrigido para `from-emerald-400 to-cyan-400`** (teal não está na paleta).
- `Sparkline.tsx`: default `color='#34d399'` → OK (bate com `--emerald`).
- `Card/Badge/Input/etc.`: usam `white/5`, `neutral-*` (padrão Tailwind) em vez de tokens `--surface-1`/`--border`. Aceitável, mas idealmente consumir os tokens.

## Fontes (DM Sans + Space Grotesk — paridade literal Lovable)
- Carregadas via Google Fonts `<link>` no root `app/layout.tsx` (DM Sans 400/500/600/700, Space Grotesk 500/600/700). **Sem JetBrains Mono** (Lovable live só carrega 2 famílias). `next/font` é **intencionalmente NÃO usado** — em Windows + Node 24 quebra o loader ESM (`ERR_UNSUPPORTED_ESM_URL_SCHEME`).
- `globals.css` define `--font-sans` (DM Sans), `--font-display` (Space Grotesk), `--font-mono` (system ui-monospace stack) no `@theme`. ✅ **RESOLVIDO** (histórico): o `<html>` duplicado entre root e `[locale]` (React #423 / `HierarchyRequestError` em hidratação, detectado pelo `.bugprobe`) foi corrigido — o html/body agora é só do root `app/layout.tsx`.
- ⚠️ O *family* anterior **Geist** e o drift **JetBrains Mono** foram retirados — paridade literal Lovable = DM Sans + Space Grotesk (ver DESIGN.md).

## Classes utilitárias custom (raw CSS, funcionam sem Tailwind)
Usadas no app (ex.: `[locale]/layout.tsx` usa `.aurora`, `.grain`): `.surface`, `.glass`, `.grid-bg`, `.aurora`, `.grain`, `.text-gradient`, `.text-aurora`, `.glow-emerald`, `.glow-dual`, `.hairline`, `.orb-float`, `.ring-spin`, `.marquee-track`. Todas são seletores CSS puros — não dependem do pipeline Tailwind.

## Convenções
- Componentes em `packages/ui/src/components` exportam via `packages/ui/src/index.ts`. Usam `cn()` (clsx+tailwind-merge) de `../lib`.
- Commits em pt-BR ok. Repo: `origin` = https://github.com/DizzyAdams/LandMap.git (branch `main`).
## Status atual (resumo — ver `MEMORY.md` para detalhes)
- App web: 19 rotas + APIs, build/typecheck/lint/testes verdes. Dataset 3.000 imóveis + 3.000 markdowns schema v2 (20 cidades, investor-grade).
- **"Mundo 3D" (bmap.io-style):** ✅ completo, commitado (`af050d7`) + design elevado (`70df4c2`) + **deployado** (landmap-p6k76hgks / alias landmap.us.kg). Código em `apps/web/src/{lib/bmap.ts, components/BmapViewer|InvestorPanel|EnergyPanel|LivePulse.tsx, app/[locale]/world/page.tsx}` + i18n `world` + link na `Navbar`.
- **Removido (2026-07-10):** `apps/web/src/messages/` — pasta duplicada com JSON **corrompido** (não era lida pelo `i18n.ts`, que usa `../messages`). As mensagens vivem em `apps/web/messages/*`.
- DNS: lado Vercel 100% (apex+www de `landmap.com.br`/`landmap.us.kg`/`getlandmap.app` atribuídos ao projeto + registros A 76.76.21.21 / www CNAME cname.vercel-dns.com criados via `vercel dns add`). **Falta apenas trocar o NS no registrador** para `ns1/ns2.vercel-dns.com` (ação externa). Produção live em **`landmapprod.vercel.app`** (projeto `landmapprod`, deploy `landmapprod-2mmvzq3no`, READY).
- Antes de "ligar" o Tailwind v4, resolva os itens 1 e 2 acima, senão o build quebra.
