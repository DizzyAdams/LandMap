# LandMap — MEMORY.md (Memória Mestra do Projeto)

> Arquivo de memória **mestre** do projeto. Lê junto com `CLAUDE.md` (auto-carregado
> no início de cada sessão e focado em armadilhas de build/Tailwind/tokens) e
> `ARCHITECTURE.md` (visão técnica resumida). Aqui guardamos o **estado vivo** do
> projeto: o que está rodando, o que está em andamento (WIP), débitos técnicos e
> próximos passos. Mantenha este arquivo atualizado a cada sessão.

Última atualização: 2026-07-11 (branch `main`, head `10c61eb`).

---

## 1. O que é o LandMap

Plataforma open-source de **inteligência imobiliária** — API REST, busca
inteligente, mapa interativo, RAG local, schema.org (SEO/AEO) e CRM (Twenty).
Stack mono-repo pnpm. Licença MIT.

- Repo: `origin` = https://github.com/DizzyAdams/LandMap.git — branch `main`.
- Commits em **pt-BR** são o padrão do projeto (ok manter).
- Produção (Vercel): projeto **`landmapprod`** (projectId `prj_yGGRzfAXO3nfp96QwuvdA1jWARkt`), escopo `dizzys-projects-d5a44b36`.
  **Alias canônico de produção: `https://landmapprod.vercel.app`** (deploy atual `landmapprod-2mmvzq3no`, status `READY`).
  Outros aliases ativos: `landmap.us.kg`, `getlandmap.app`, `landmap.com.br` (+ www). Deploy via `vercel deploy --prod` (build remoto; `NEXT_PUBLIC_SITE_URL` em `vercel.json`).

---

## 2. Status atual (resumo executivo)

| Item | Estado |
|------|--------|
| App web (19 rotas + APIs) | ✅ build/typecheck/lint/testes verdes |
| Dataset | ✅ 1.500 imóveis reais + 1.500 markdowns (10 cidades) |
| Sales cockpit (6 agentes) | ✅ feature completa + commit `975170d` |
| Redesign "Sovereign Cadastre" | ✅ commit `8f9c073` (removeu AI-slop) |
| 404 de routing/locale | ✅ RESOLVIDO commit `71da3f0` (middleware p/ `src/`) |
| **Feature "Mundo 3D" (bmap.io-style)** | ✅ **commitada** (`af050d7`) + design elevado (`70df4c2`) + **deployado** (landmap-p6k76hgks) |
| **DNS dos domínios** | 🟡 **lado Vercel 100%** (apex+www atribuídos ao projeto + registros A/CNAME criados); **falta trocar NS no registrador** p/ `ns1/ns2.vercel-dns.com` (ver §6) |
| Tailwind v4 | ✅ ativo (PostCSS + `@import "tailwindcss"` + `@source` p/ `@landmap/ui`); `--ring`/tints adicionados; `buttonVariants` exportado |

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
  `/kpi`, `/geo/autocomplete`, `/sales/*`, `/integrations/*` (WABA + CRIE + OpenDesign + registry, mock-mode)).
  Data-driven a partir de `packages/api/src/data/properties.json` (seed 1.500).
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

Marketing/dados: `/` (home surreal aurora+grain), `/search`, `/map`, `/compare`,
`/favorites`, `/alerts`, `/chat` (RAG grátis MiniMax), `/calculator`, `/world` (NOVO — WIP),
`/pricing`, `/docs` (+`/docs/embedding`), `/insights`, `/live`, `/offline`, `/status`,
`/studio`, `/sales` (cockpit), `/property/[id]`, `/admin` (`analytics`/`audit`/`exports`/`leads`/`properties`/`settings`/`webhooks`).

APIs em `apps/web/src/app/api/`: `contact`, `[...route]` (catch-all p/ Hono),
`geo/autocomplete`, `sales/state|cycle|approve|reject`, etc.

---

## 5. WIP ATUAL — Feature "Mundo 3D" (bmap.io-style)

**Estado:** ✅ **commitada** (`af050d7`), com design elevado (`70df4c2`: legenda de altura + vinheta
cinematográfica) e **deployada em produção** (deploy `landmap-p6k76hgks`, alias `landmap.us.kg`).
Validação: typecheck mono-repo OK, lint OK (warning pré-existente em `map/page.tsx`), testes 299/299 OK,
build remoto Vercel OK, rotas `/pt-BR/world` e `/en-US/world` retornam 200. Arquivos envolvidos:

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

**Próximo passo recomendado:** nada pendente — feature completa, commitada e em produção.
Para re-deploy: `vercel deploy --prod` (build remoto Linux; o `geist` quebra apenas no build LOCAL Windows).

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
