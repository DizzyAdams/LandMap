# LandMap — MEMORY.md (Memória Mestra do Projeto)

> Arquivo de memória **mestre** do projeto. Lê junto com `CLAUDE.md` (auto-carregado
> no início de cada sessão e focado em armadilhas de build/Tailwind/tokens) e
> `ARCHITECTURE.md` (visão técnica resumida). Aqui guardamos o **estado vivo** do
> projeto: o que está rodando, o que está em andamento (WIP), débitos técnicos e
> próximos passos. Mantenha este arquivo atualizado a cada sessão.

> **Design source of truth = `DESIGN.md`** (fonte autoritativa de UI/UX, tokens e fontes — mantenha este arquivo e `CLAUDE.md` em sincronia com ele).


Última atualização: 2026-07-18 (branch `main` — parity Lovable 100%, audit prod 146/146 + parity 0 missing; deploy live `landmapprod-28cmfdy2a`).

> **2026-07-18 (SESSÃO 2) — Deploy 100% green + hardening escalabilidade.** `validate_real.py`=146/146, `compare_live.py`=TOTAL MISSING 0. Deploy `landmapprod-ghn0aobna-dizzys-projects-d5a44b36.vercel.app` (alias `landmapprod.vercel.app`, `landmap.us.kg`). **Build/deploy = pnpm (estável, commitado):** `vercel.json` → `installCommand: "pnpm install --frozen-lockfile"`, `buildCommand: "pnpm --filter @landmap/web run build"`, `outputDirectory: "apps/web/.next"`, `framework: "nextjs"`. Workspaces via `pnpm-workspace.yaml` (não o campo `workspaces` do package.json). **Deploy da RAIZ:** `vercel deploy --prod --yes` (sem `--cwd apps/web`) para o `vercel.json` raiz ser lido. Projeto Vercel em Node `20.x`. Live: `/pt-BR` e `/en-US` retornam HTTP 200. **Hardening aplicado e commitado:** `apps/web/next.config.mjs` ganhou CSP (self + Google Fonts), `Permissions-Policy`, cache longo p/ assets estáticos (immutable) e `s-maxage=60/stale-while-revalidate=300` p/ rotas; `apps/web/src/middleware.ts` ganhou rate-limit sliding-window (120 req/IP/min) + `Cache-Control` em GET `/api`. Lint 0, build local + remoto verdes. NOTA: tentativa anterior de trocar o install para `bun` foi **revertida** (commit `bf1d155`) — manter `pnpm` no `vercel.json`.

> **2026-07-18 — Audit de produção + correção i18n.** `validate_real.py` rodado contra `landmapprod.vercel.app`: 146/146 (100%) — HTTP/títulos/MetaDesc/OG/fontes(DM Sans+Space Grotesk)/CSS/sem-erro/statics. `compare_live.py` (frase-a-frase vs Lovable live): **0 missing**. Bug real encontrado e corrigido: `apps/web/src/app/[locale]/page.tsx` (home) tinha `generateMetadata` com título fixo pt-BR, sobrescrevendo o locale → `/en-US` e `/es-ES` serviam título pt-BR. Agora localiza (pt-BR/en-US/es-ES). Scripts de audit limpos (`/world` e `/terrenos` removidos das listas — rotas inexistentes no app ativo; `/terrenos` nunca existiu pós-migração Lovable). Deploy `landmapprod-4y4bov6ql-dizzys-projects-d5a44b36.vercel.app` (alias `landmapprod.vercel.app` + `landmap.us.kg`).
> - `tokens.ts` re-alinhado ao indigo Lovable (corrigido drift `#003594`/`emeraldTint`/`cyanTint` azuis)
> - Root `layout.tsx`: `metadata` export com favicon.svg, OG image, twitter card
> - `[locale]/layout.tsx`: OG image atualizado de `.png` → `.svg`
> - Manifest PWA: background/theme → Lovable (white/indigo)
> - Icons: dark `#050505` → indigo Lovable; apple-touch-icon adicionado
> - Assets: `favicon.svg`, `og-image.svg` (SVG brand indigo)
> - Tmp files de extração removidos; docs de referência CTO adicionados
> - Typecheck/lint/build verde; deploy `landmapprod-ds2bm7n00` (alias `landmapprod.vercel.app`) READY
> - Todas as 19 rotas × 3 locales servindo 200 com tokens Lovable

> **2026-07-14 — Auditoria de Design Lovable (100% igual).** Varredura estática (`Select-String` em `apps/web/src`) + comparação ao vivo (`compare_live.py` / `validate_real.py`):
> - **Paridade shell Lovable** + **Mapa Opção A** em `/map`. **Plataforma expandida:** RAG + webhooks + **admin agentes** (`/admin/agents`: **14** em espera, squad FU = followup+cold_recovery+waba, **auto-loop** `POST /sales/tick`, copilot/autopilot). Docs: `docs/admin-agents-followup-2026-07.md`. Design indigo Lovable. |
> - **Tokens de design: `globals.css` já 100% Lovable** (light/indigo `oklch`). `validate_real.py` = **160/160 (100%)** em produção (22 rotas × HTTP/título/meta/OG/fontes/CSS/sem-erro + 6 estáticos).
> - **Migração de cores hardcoded → tokens Lovable:** 89 ocorrências de cores fora do padrão (`emerald/cyan/gold/amber/red/blue/violet`, `#050505`, `bg-white`, `neutral-*`, `black/5`) em ~50 arquivos migradas para `var(--primary)/--success/--destructive/--warning/--muted/--card/--background/--ring`. typecheck + lint verdes. Regra `DESIGN.md` §4 seguida (status = tokens semânticos; nunca emerald/cyan/violet como marca).
> - **Exceção World 3D/Sovereign REMOVIDA (2026-07-15):** a paleta "World 3D"/Sovereign data-viz (`BmapViewer`, `EnergyPanel`, `LivePulse`, etc.) e a rota `/world` foram **deletadas**. Os tokens `--emerald/--cyan/--violet/--gold` (e o bloco dark legado `--bg/--surface-*`) em `packages/ui/src/styles.css`/`tokens.ts` foram **removidos** como lixo órfão. Hoje **NENHUMA** cor fora do indigo semântico é permitida (§9). |

> **2026-07-12 — Spec LandMap aplicado + deployado.** Commit `d8521c5` aplica o
> spec `landmap-design.zip` (azul institutional `#003594`, fundo claro, verde só
> success) em TODAS as 19 rotas de produto + novo `AppShell` autenticado
> (sidebar 68px + header + `MobileBottomNav`) com `ShellSwitch` que alterna
> público↔autenticado, mais telas `/onboarding` e `/regions`. Build local 101
> páginas OK, lint 0, typecheck OK. Deploy `landmapprod-3iwouhmy0` (alias
> `landmapprod.vercel.app`) READY — `pnpm install` agora usado no Vercel (o
> deploy anterior falhou por ter rodado `npm install` de subdiretório, não lendo
> o `vercel.json`).

> **2026-07-13 — Port Lote 5 + telas auxiliares para o design system Lovable + deploy.** Commit
> `3669c7b` (e `8626aa0` no .gitignore) removem todos os artefatos do design antigo (Sovereign/dark)
> de 37 telas/arquivos restantes (`apps/web/src/app/[locale]`): grid-bg, text-gradient, kicker,
> glow-*, cta-glow, surface, aurora, bg-[#050505], shadow-glow, font-display, chip, ledger-num,
> btn btn-*, bg-white/fundos transparentes do dark → tokens `var(--*)`. Verde/cyan semântico
> preservado (força de senha, status de CRM, alta/baixa). Typecheck ✅, lint ✅, build remoto
> Vercel ✅. Deploy `landmapprod-3vepf2emb` (alias `landmapprod.vercel.app`) READY; rotas
> `/pt-BR`, `/pt-BR/insights`, `/pt-BR/terrenos` retornam 200. `landmap.us.kg` segue sem
> resolução DNS (pendência de troca de NS no registrador, fora do repo).

---

## 1. O que é o LandMap

Plataforma open-source de **inteligência imobiliária** — API REST, busca
inteligente, mapa interativo, RAG local, schema.org (SEO/AEO) e CRM (Twenty).
Stack mono-repo pnpm. Licença MIT.

- Repo: `origin` = https://github.com/DizzyAdams/LandMap.git — branch `main`.
- Commits em **pt-BR** são o padrão do projeto (ok manter).
- Produção (Vercel): projeto **`landmapprod`** (projectId `prj_yGGRzfAXO3nfp96QwuvdA1jWARkt`), escopo `dizzys-projects-d5a44b36`.
  **Alias canônico de produção: https://landmapprod.vercel.app** (deploy atual `landmapprod-28cmfdy2a-dizzys-projects-d5a44b36.vercel.app`, status `READY` — 2026-07-18, audit 146/146 + parity 0 missing; re-deploy do mesmo commit `bf1d155`, alias avançou de `ghn0aobna`). Outros aliases ativos: `landmap.us.kg`, `getlandmap.app`, `landmap.com.br` (+ www). Deploy via `vercel deploy --prod` (build remoto; `NEXT_PUBLIC_SITE_URL` em `vercel.json`).

---

## 2. Status atual (resumo executivo)

| Item | Estado |
|------|--------|
| App web (19 rotas + APIs) | ✅ build/typecheck/lint/testes verdes |
| **Spec LandMap (azul #003594, claro) — ⚠️ RETIRADO em 2026-07-13/14 (substituído pelo indigo Lovable, ver DESIGN.md)** | ✅ **commit `d8521c5` + deploy `landmapprod-3iwouhmy0` (alias `landmapprod.vercel.app`) READY** (histórico) |
| AppShell autenticado + /onboarding + /regions | ✅ commit `d8521c5` |
| Dataset | ✅ 3.000 imóveis sintéticos calibrados + 3.000 markdowns schema v2 (20 cidades, ≥54% terrenos, grades A–F) |
| Sales cockpit (6 agentes) | ✅ feature completa + commit `975170d` |
| Redesign "Sovereign Cadastre" | ✅ commit `8f9c073` (removeu AI-slop) |
| 404 de routing/locale | ✅ RESOLVIDO commit `71da3f0` (middleware p/ `src/`) |
| **Feature "Mundo 3D" (bmap.io-style)** | ⚠️ **REMOVIDA em 2026-07-15** (código + rota `/world` deletados; tokens Sovereign/emerald/cyan/violet aposentados — ver DESIGN.md §8). Paleta atual = só indigo Lovable. |
| **DNS dos domínios** | 🟡 **lado Vercel 100%** (apex+www atribuídos ao projeto + registros A/CNAME criados); **falta trocar NS no registrador** p/ `ns1/ns2.vercel-dns.com` (ver §6) |
| Tailwind v4 | ✅ ativo (PostCSS + `@import "tailwindcss"` + `@source` p/ `@landmap/ui`); `--ring`/tints adicionados; `buttonVariants` exportado |

---

## 3. Estrutura do mono-repo

Workspace (`pnpm-workspace.yaml`): `packages/*` + `apps/*`.
`packageManager: pnpm@9.6.0`, `node >= 20`.

### apps/
- **`apps/web` (`@landmap/web`)** — Next.js 14 (App Router `src/app`), `next-intl`
  3.20 (pt-BR/en-US/es-ES), React 18, Tailwind v4.0.0 (ver aviso), fontes **DM Sans + Space Grotesk + JetBrains Mono** via Google Fonts `<link>` (ver DESIGN.md).
  É o app consumidor. Páginas em `src/app/[locale]/...`; middleware em `src/middleware.ts`.
- **`apps/docs`** — Storybook / Style Guide.

### packages/
- **`@landmap/api`** — API REST em Hono + Zod (`/health`, `/markdowns`, `/search`,
  `/analyze`, `/cities`, `/stats`, `/compare`, `/favorites`, `/properties`,
  `/kpi`, `/geo/autocomplete`, `/sales/*`, `/integrations/*` (WABA + CRIE + OpenDesign + registry, mock-mode)).
  Data-driven a partir de `packages/api/src/data/properties.json` (seed 3.000 + bloco invest).
- **`@landmap/config`** — config/env/i18n/constants compartilhados.
- **`@landmap/db`** — schemas + tipos (`Property`, `PriceHistory`).
- **`@landmap/gamification`** — XP, níveis, LandCoins, badges, quests, streaks, leaderboards (engine puro + UI).
- **`@landmap/geo`** — geocoding / autocomplete.
- **`@landmap/integrations`** — hub de integrações externas (registry central `listIntegrations()` exposto em `/integrations/*` no `@landmap/api`): **OpenDesign** (feed, mock), **WhatsApp Business API (WABA)** (envio + webhook, mock), **CRIE** (Registro de Imóveis Eletrônico, mock), **ViaCEP** (CEP→endereço, **live**), **IBGE** (UF/municípios, **live**), **Leilão** (imóveis em leilão judiciário+Caixa, **tempo real**, mock sem adaptador), **Câmbio** (BCB via AwesomeAPI, **live**), **CNPJ** (Receita Federal via BrasilAPI, **live**), **Bacen** (Selic/CDI/IPCA via SGS, **live**), **Geo** (geocodificação via Nominatim/OSM, **live**) e **Twenty CRM** (status).
- **`@landmap/invest`** — engine PURA de métricas de investimento (cap rate,
  cash-on-cash, IRR, ROI, price-to-rent, GRM, fluxo de caixa). Sem React/IO.
- **`@landmap/llm`** — pipeline RAG (TF-IDF + LangGraph/pgvector bilingue) +
  `chatCompletion` (OpenRouter), agents, KPIs de mercado.
- **`@landmap/sales`** — agente autônomo de vendas (orquestração de 6 agentes).

---

## 4. Rotas do app web (`apps/web/src/app/[locale]/`)

| Marketing/dados: `/` (home surreal aurora+grain), `/search`, `/map`, `/compare`,
`/favorites` (RAG grátis MiniMax), `/calculator`, `/pricing`, `/docs` (+`/docs/embedding`),
`/insights`, `/live`, `/offline`, `/status`, |
`/studio`, `/sales` (cockpit), `/property/[id]`, `/admin` (`analytics`/`audit`/`exports`/`leads`/`properties`/`settings`/`webhooks`).

APIs em `apps/web/src/app/api/`: `contact`, `[...route]` (catch-all p/ Hono),
`geo/autocomplete`, `sales/state|cycle|approve|reject`, etc.

---

## 5. FEATURE "Mundo 3D" — REMOVIDA (2026-07-15)

**Estado:** ✅ **REMOVIDA E LIMPA**. O código (`lib/bmap.ts`, `BmapViewer.tsx`, `InvestorPanel.tsx`, `EnergyPanel.tsx`, `LivePulse.tsx`, rota `world/page.tsx`), a namespace `world` nos i18n, a rota API órfã `apps/web/src/app/api/overpass/route.ts` (único consumidor de `fetchWorld`/`overpass-api`) e os tokens Sovereign/bioluminescente (`--emerald/--cyan/--violet/--gold` + dark legacy + `shadows.glow/glowDual/glowGold/glowSovereign`) foram **deletados**. Motivo: DESIGN.md §9 aposentou a paleta Sovereign; a feature não existe no Lovable (referência máxima) e não fazia parte do clone fiel. Não há WIP pendente aqui.

Paleta de marca atual = **só indigo Lovable semântico** (`--primary`/`--accent`/`--muted`/`--ring`/`--success`/`--warning`/`--destructive`). Os componentes `StatPill`/`MetricStat` aceitam `tone`: `emerald|cyan|violet|gold|warning|neutral|danger` — todos mapeados para tokens semânticos (`warning`/`gold` → `var(--warning)`, `emerald`/`cyan` → `var(--primary)`, `violet` → `var(--accent)`).

---



## 6. Débitos técnicos / bloqueios conhecidos

1. **DNS dos domínios (🟡 falta apontar no registrador — bloqueio EXTERNO).**
   Lado Vercel 100% feito (2026-07-10): os 3 apex + 3 `www` estão **atribuídos ao projeto
   `landmap`** (`vercel domains add <dominio> landmap`). A Vercel devolve esta config
   obrigatória (verificada via `vercel domains inspect`):
   - **A (apex):** `landmap.com.br` → `76.76.21.21`
   - **A (apex):** `getlandmap.app` → `76.76.21.21`
   - **A (apex):** `landmap.us.kg` → `76.76.21.21`
   - **CNAME (www):** `www.landmap.com.br` → `cname.vercel-dns.com`
   - **CNAME (www):** `www.landmap.us.kg` → `cname.vercel-dns.com`
   - **CNAME (www):** `www.getlandmap.app` → `cname.vercel-dns.com`
   - *Ou* (alternativa): trocar os NS de cada domínio para `ns1.vercel-dns.com` +
     `ns2.vercel-dns.com` (delega tudo à Vercel, que auto-configura).
   - **Estado atual dos NS (pré-DNS):** `landmap.com.br` → `a.auto.dns.br`/`b.auto.dns.br`
     (Registro.br); `landmap.us.kg` e `getlandmap.app` → NS vazios.
   - **Registros DNS (A/CNAME) JÁ criados na Vercel** via `vercel dns add` (2026-07-10) para
     os 3 apex + 3 www (visíveis em `vercel dns ls`). Eles entram em vigor quando o NS do
     domínio apontar para a Vercel.
   - **ÚNICA ação pendente (registrador, EXTERNA):** trocar o NS de CADA domínio para
     `ns1.vercel-dns.com` / `ns2.vercel-dns.com`. Só assim os registros acima são servidos e
     o domínio resolve para o site. Após propagação (~minutos), a Vercel valida e emite SSL.
   - **Automação do NS (verificada 2026-07-10):** NÃO há credenciais de registrador
     neste ambiente (repo/env/perfil) — só as do Vercel. Alterar NS (ou registros DNS) em
     qualquer registrador **exige autenticação naquele registrador**; não existe API gratuita
     de terceiro que contorne essa barra de segurança. Portanto o NS só é virado por:
     (a) ação manual (~1 min) no painel de cada registrador; ou (b) API do próprio registrador
     com o token/certificado do usuário (ex.: certificado de acesso GRATUITO do Registro.br
     para a API de DNS de .br). Pronto para rodar assim que o usuário fornecer o token.
   - App já 100% funcional via URL de produção do Vercel enquanto isso.

2. ~~**Tailwind v4 não processa CSS (⚠️).**~~ **RESOLVIDO (2026-07-11, ver CLAUDE.md):** pipeline PostCSS + `@import "tailwindcss"` + `@source` ativo; utilitários e tokens compilados. O app ainda usa classes utilitárias CSS puras em `globals.css` (`.surface`, `.glass`, etc.) como base, e o spec LandMap (azul #003594) foi aplicado via tokens CSS `var(--foreground)`/`var(--primary)` em 2026-07-12.

3. **Drift de design tokens.** 3 fontes devem sincronizar: `apps/web/src/app/globals.css`
   `:root` (fonte da verdade), `packages/ui/src/styles.css`, `packages/ui/src/tokens.ts`.
   **Paleta de marca (Lovable indigo `oklch`, hue ≈ 265):** `--primary`/`--accent`/`--muted`/`--ring`/gradientes em `globals.css` `:root`/`.dark` (ver DESIGN.md).
   ⚠️ **RETIRADA em 2026-07-13/14:** a paleta *bioluminescente* (`--emerald:#34d399`, `--cyan:#22d3ee`, `--violet:#a78bfa`, Sovereign `--gold`) foi substituída pelo indigo Lovable; `emerald/cyan/gold` sobrevivem apenas na feature "World 3D"/Sovereign data-viz (feature palette documentada, não drift).
   Regra: em v4 **nunca** `@apply <classe-custom>`.

4. **Histórico de fricção já resolvida (para não reverter):** AI-slop removido
   ("Sovereign Cadastre"); contraste `text-neutral-500/600`→`neutral-400` (WCAG AA);
   `<html>` duplicado (root vs `[locale]`) corrigido; 404 de locale resolvido movendo
   `middleware.ts` para `src/`.

5. **Armadilha 404 de rota (já corrigida em `/live`):** o `[locale]/layout.tsx` e o
   root `layout.tsx` usam `export const dynamic = 'force-dynamic'`. **Uma página filha
   NÃO pode usar `force-static`** — o Next não registra a rota e ela retorna 404 silencioso.
   Se uma página sob `[locale]` der 404 misterioso, remova o `force-static` (commit `62be925`).
   Páginas sob `[locale]` podem usar `force-dynamic` (consistente) ou herdar do pai.

---

## 7. Como rodar / verificar

```bash
pnpm install
pnpm -F @landmap/ui build          # build do design system
pnpm dev                           # Next.js (localhost:3000)
pnpm dev:api                       # API Hono (localhost:4000)
pnpm typecheck / lint / test / build   # -r (todos os pacotes)
pnpm test                          # vitest run (suíte atual: 357 testes, 45 files)
```
Verificação rápida só do web:
```powershell
cd apps/web; npx tsc --noEmit -p tsconfig.json
```
Deploy (separado, requer rede/Vercel): `vercel deploy --prod`.
Ledger de tarefas: `.hermes/todos.md`.

---

## 8. Convenções e pontos de atenção

- Componentes UI em `packages/ui/src/components`, exportados via `index.ts`, usam `cn()` (clsx+tailwind-merge).
- i18n: `apps/web/src/i18n.ts` carrega `../messages/${locale}.json` (ou seja, `apps/web/messages/`). **NÃO** crie mensagens em `apps/web/src/messages/` — o app não as lê (já houve pasta duplicada corrompida lá que foi removida).
- Manter `CLAUDE.md` e este `MEMORY.md` em sincronia a cada mudança estrutural.

| `apps/web/src/components/Navbar.tsx` | Link "Mundo 3D" (href `world`) **REMOVIDO** em 2026-07-15 junto com a feature. |

`next/font`/Geist foram **retirados em 2026-07-13/14**; as fontes agora vêm de um Google Fonts `<link>` (DM Sans/Space Grotesk/JetBrains Mono), sem o crash ESM de Windows+Node 24 — ver DESIGN.md §8.

- **`@landmap/scraper`** — ingestão Apify/cheerio no pipeline LLM.
- **`@landmap/seo`** — geradores schema.org + coverage CLI + AEO.
- **`@landmap/twenty`** — cliente CRM Twenty (people, leads, opportunities, notes).
- **`@landmap/ui`** — design system: `Button`, `Card`, `Badge`, `Input`,
  `Progress`, `Sparkline`, `MobileBottomNav`, `Stepper`, `NotificationCenter`,
  `AnimatedNumber`, `EmptyState`. Build via `tsup`; exporta `./styles.css` +
  `tokens.ts`.

### Outros
- `scripts/` — geradores/seed (`seed_properties.py`, `build_markdowns.py`, `live_dashboard.py`).
- `data/markdowns/` — 3.000 dossiês investor-grade (schema v2: tese, cap rate, grade, comps).
- `.n8n/` — workflows de automação (ingest, sync).
- `.hermes/todos.md` — **ledger de tarefas** (histórico de sessões, marcos, pendências). Mantenha atualizado.
