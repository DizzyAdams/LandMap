# LandMap — MEMORY.md (Memória Mestra do Projeto)

> Arquivo de memória **mestre** do projeto. Lê junto com `CLAUDE.md` (auto-carregado
> no início de cada sessão e focado em armadilhas de build/Tailwind/tokens) e
> `ARCHITECTURE.md` (visão técnica resumida). Aqui guardamos o **estado vivo** do
> projeto: o que está rodando, o que está em andamento (WIP), débitos técnicos e
> próximos passos. Mantenha este arquivo atualizado a cada sessão.

Última atualização: 2026-07-10 (branch `main`, head `f6d5600`).

---

## 1. O que é o LandMap

Plataforma open-source de **inteligência imobiliária** — API REST, busca
inteligente, mapa interativo, RAG local, schema.org (SEO/AEO) e CRM (Twenty).
Stack mono-repo pnpm. Licença MIT.

- Repo: `origin` = https://github.com/DizzyAdams/LandMap.git — branch `main`.
- Commits em **pt-BR** são o padrão do projeto (ok manter).
- Produção (Vercel): https://landmap-dizzys-projects-d5a44b36.vercel.app
  (alias `landmap.us.kg` atribuído; SSL async). Deploy via `vercel deploy --prod`.

---

## 2. Status atual (resumo executivo)

| Item | Estado |
|------|--------|
| App web (19 rotas + APIs) | ✅ build/typecheck/lint/testes verdes |
| Dataset | ✅ 1.500 imóveis reais + 1.500 markdowns (10 cidades) |
| Sales cockpit (6 agentes) | ✅ feature completa + commit `975170d` |
| Redesign "Sovereign Cadastre" | ✅ commit `8f9c073` (removeu AI-slop) |
| 404 de routing/locale | ✅ RESOLVIDO commit `71da3f0` (middleware p/ `src/`) |
| **Feature "Mundo 3D" (WIP)** | 🟡 **não commitada** — código pronto, typecheck OK |
| **DNS dos domínios** | 🔴 **bloqueio externo** no registrador (ver §6) |
| Tailwind v4 | ⚠️ instalado mas **não processa CSS** (ver `CLAUDE.md`) |

---

## 3. Estrutura do mono-repo

Workspace (`pnpm-workspace.yaml`): `packages/*` + `apps/*`.
`packageManager: pnpm@9.6.0`, `node >= 20`.

### apps/
- **`apps/web` (`@landmap/web`)** — Next.js 14 (App Router `src/app`), `next-intl`
  3.20 (pt-BR/en-US/es-ES), React 18, Tailwind v4.0.0 (ver aviso), fontes Geist.
  É o app consumidor. Páginas em `src/app/[locale]/...`; middleware em `src/middleware.ts`.
- **`apps/docs`** — Storybook / Style Guide.

### packages/
- **`@landmap/api`** — API REST em Hono + Zod (`/health`, `/markdowns`, `/search`,
  `/analyze`, `/cities`, `/stats`, `/compare`, `/favorites`, `/properties`,
  `/kpi`, `/geo/autocomplete`, `/sales/*`, `/integrations/opendesign/feed`).
  Data-driven a partir de `packages/api/src/data/properties.json` (seed 1.500).
- **`@landmap/config`** — config/env/i18n/constants compartilhados.
- **`@landmap/db`** — schemas + tipos (`Property`, `PriceHistory`).
- **`@landmap/gamification`** — XP, níveis, LandCoins, badges, quests, streaks, leaderboards (engine puro + UI).
- **`@landmap/geo`** — geocoding / autocomplete.
- **`@landmap/integrations`** — integrações externas (ex.: opendesign feed).
- **`@landmap/invest`** — engine PURA de métricas de investimento (cap rate,
  cash-on-cash, IRR, ROI, price-to-rent, GRM, fluxo de caixa). Sem React/IO.
- **`@landmap/llm`** — pipeline RAG (TF-IDF + LangGraph/pgvector bilingue) +
  `chatCompletion` (OpenRouter), agents, KPIs de mercado.
- **`@landmap/sales`** — agente autônomo de vendas (orquestração de 6 agentes).

---

## 4. Rotas do app web (`apps/web/src/app/[locale]/`)

Marketing/dados: `/` (home surreal aurora+grain), `/search`, `/map`, `/compare`,
`/favorites`, `/alerts`, `/chat` (RAG grátis MiniMax), `/calculator`, `/world` (NOVO — WIP),
`/pricing`, `/docs` (+`/docs/embedding`), `/insights`, `/live`, `/offline`, `/status`,
`/studio`, `/sales` (cockpit), `/property/[id]`, `/admin` (`analytics`/`audit`/`exports`/`leads`/`properties`/`settings`/`webhooks`).

APIs em `apps/web/src/app/api/`: `contact`, `[...route]` (catch-all p/ Hono),
`geo/autocomplete`, `sales/state|cycle|approve|reject`, etc.

---

## 5. WIP ATUAL — Feature "Mundo 3D" (bmap.io-style)

**Estado:** código completo e **typecheck do web passa** (`tsc --noEmit` sem erros).
Ainda **NÃO commitada**. Arquivos envolvidos:

| Arquivo | Papel |
|---------|-------|
| `apps/web/src/lib/bmap.ts` (~518 linhas) | Camada de dados 3D. Dado um bbox, puxa geometria REAL do OpenStreetMap (prédios, ruas, árvores) da **Overpass API** e normaliza para GeoJSON `FeatureCollection` (extrusão no MapLibre). Fallback determinístico procedural se Overpass cair. Exporta: `LngLat`, `BBox`, `WorldFeature`, `WorldData`, `EMPTY_FEATURE_COLLECTION`, `haversine`, `bboxFromCenter`, `areaKm2`, `fetchWorld`, `analyzeWorld`/`WorldAnalysis`, `fetchMarketContext`/`MarketContext`. |
| `apps/web/src/components/BmapViewer.tsx` | Client component. Carrega **MapLibre GL v4.7.1 via CDN** (`<Script>`). Style: tiles CARTO dark/light, AWS Terrain `raster-dem`, fontes geojson (`world`, `thermal`), camada `fill-extrusion` (gradiente altura emerald→cyan→violet), camada `thermal` fill, `sky`. Controles: busca de cidade (`geoAutocomplete` de `lib/api`), slider de tamanho da caixa, toggle dia/noite, girar/parar, abas de camada (3D / Investor / Solar / Thermal), clique no mapa reconstrói o ponto. Contadores animados. |
| `apps/web/src/components/InvestorPanel.tsx` | Oportunidades p/ fundos: KPIs (fundReady, avgCapRate, totalTicketBRL) + top-by-score (kind labels) + export JSON p/ clipboard (usa `btn btn-ghost`). |
| `apps/web/src/components/EnergyPanel.tsx` | Energia renovável (MWp, CO₂, renewableScore) + top telhados solares + zoneamento térmico (avgHeat, greenCooling, hottest) + legenda de calor. |
| `apps/web/src/components/LivePulse.tsx` | Hook `useLiveMarket` (jitter preço/m² e ROI a cada 2.5s) + UI "ao vivo". |
| `apps/web/src/app/[locale]/world/page.tsx` | Rota `'use client'`, usa `Reveal` + `BmapViewer`, `t('world.*')`. |
| `apps/web/messages/{pt-BR,en-US,es-ES}.json` | Namespace `world` **adicionada no ROOT** (válido). |

---

## 6. Débitos técnicos / bloqueios conhecidos

1. **DNS dos domínios (🔴 bloqueio EXTERNO no registrador).** Domínios registrados
   e atribuídos no Vercel, mas o DNS não aponta:
   - `landmap.com.br` → NS ainda `a.auto.dns.br` (Registro.br).
   - `landmap.us.kg` e `getlandmap.app` → NS vazios.
   - Correção no registrador: (a) A `76.76.21.21` (+ CNAME `www`→`cname.vercel-dns.com`),
     ou (b) NS → `ns1.vercel-dns.com` + `ns2.vercel-dns.com`.
   - App 100% funcional via URL de produção do Vercel enquanto isso. **Fora do alcance do deploy.**

2. **Tailwind v4 não processa CSS (⚠️).** `tailwindcss@4.0.0` instalado, mas sem
   pipeline PostCSS/`@import "tailwindcss"`. O app usa **classes utilitárias CSS puras**
   definidas em `globals.css` (`.surface`, `.glass`, `.grid-bg`, `.aurora`, `.grain`,
   `.text-gradient`, `.glow-emerald`, `.glow-dual`, `.hairline`, `.orb-float`,
   `.ring-spin`, `.marquee-track`). Antes de "ligar" o Tailwind v4, resolver os pontos
   do `CLAUDE.md` (item `@apply` custom + `.text-gradient` duplicado) senão o build quebra.

3. **Drift de design tokens.** 3 fontes devem sincronizar: `apps/web/src/app/globals.css`
   `:root` (fonte da verdade), `packages/ui/src/styles.css`, `packages/ui/src/tokens.ts`.
   Paleta de marca bioluminescente: `--emerald:#34d399` (emerald-400, NÃO 500),
   `--cyan:#22d3ee`, `--violet:#a78bfa`; camada Sovereign gold: `--gold:#d4af37`, etc.
   Regra: em v4 **nunca** `@apply <classe-custom>`.

4. **Histórico de fricção já resolvida (para não reverter):** AI-slop removido
   ("Sovereign Cadastre"); contraste `text-neutral-500/600`→`neutral-400` (WCAG AA);
   `<html>` duplicado (root vs `[locale]`) corrigido; 404 de locale resolvido movendo
   `middleware.ts` para `src/`.

---

## 7. Como rodar / verificar

```bash
pnpm install
pnpm -F @landmap/ui build          # build do design system
pnpm dev                           # Next.js (localhost:3000)
pnpm dev:api                       # API Hono (localhost:4000)
pnpm typecheck / lint / test / build   # -r (todos os pacotes)
pnpm test                          # vitest run (suíte atual: ~299 testes)
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
- `useTranslations('world')` espera `world` no **root** do JSON de mensagens.
- MapLibre GL é carregado via CDN (`unpkg`) dentro de `BmapViewer`, não como dependência npm.
- Manter `CLAUDE.md` e este `MEMORY.md` em sincronia a cada mudança estrutural.

| `apps/web/src/components/Navbar.tsx` | Link "Mundo 3D" (href `world`) adicionado. |

**Como funciona (resumo):** usuário busca cidade → `geoAutocomplete` → centro →
`bboxFromCenter` → `fetchWorld` (Overpass ou procedural) → MapLibre extruda prédios
→ `analyzeWorld` gera análise (investimento/energia/térmica) → painéis laterais + LivePulse.

**Fontes de dados:** OpenStreetMap (ODbL) via Overpass; terreno AWS Terrain Tiles; © CARTO.

**Próximo passo recomendado:** commitar esta feature (ex.: `feat(web): mundo 3D bmap.io-style — viewer MapLibre + painéis invest/energia/thermal`) e, se desejado, `vercel deploy --prod`.

- **`@landmap/scraper`** — ingestão Apify/cheerio no pipeline LLM.
- **`@landmap/seo`** — geradores schema.org + coverage CLI + AEO.
- **`@landmap/twenty`** — cliente CRM Twenty (people, leads, opportunities, notes).
- **`@landmap/ui`** — design system: `Button`, `Card`, `Badge`, `Input`,
  `Progress`, `Sparkline`, `MobileBottomNav`, `Stepper`, `NotificationCenter`,
  `AnimatedNumber`, `EmptyState`. Build via `tsup`; exporta `./styles.css` +
  `tokens.ts`.

### Outros
- `scripts/` — geradores/seed (`seed_properties.py`, `build_markdowns.py`, `live_dashboard.py`).
- `data/markdowns/` — 1.500 datasets estruturados (10 categorias).
- `.n8n/` — workflows de automação (ingest, sync).
- `.hermes/todos.md` — **ledger de tarefas** (histórico de sessões, marcos, pendências). Mantenha atualizado.
