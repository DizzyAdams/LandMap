# LandMap — Novas Features & Tech Radar (War Room #03)

> **Autor:** Tech Lead / Staff Engineer — LandMap War Room
> **Data:** 2026 · **Status:** Acionável
> **Princípio:** Fit real com a stack (Next.js 14 App Router + Hono/Vercel + Tailwind v4 + pnpm monorepo). Não editamos arquivos centrais — só indicamos **onde criar** cada pedaço.
> **Requisito atendido:** entrega em `docs/war-room/03-features-libs.md` (pt-BR), com feature backlog ranqueado + tech radar + matriz ThoughtWorks.

## 0. TL;DR Executivo

- O LandMap **já tem o esqueleto** das rotas citadas no briefing: `compare`, `alerts`, `calculator`, `insights`, `favorites`, `sales`, `studio`, `chat`, `live`. O trabalho não é "criar do zero" e sim **elevar scaffolds a produto** + adicionar os gaps reais (3D, 360, PDF, leilões, PWA, contas, vetores semânticos).
- O maior gargalo hoje **não é UI**: é **dados/estado**. Tudo roda em memória (`allProperties` em `packages/api/src/index.ts`, carregado de `data/properties.json`), os embeddings são **TF-IDF fake** (`packages/llm/src/embeddings.ts`), e favoritos/alertas vivem em `localStorage` (`lib/favorites.ts` / `lib/alerts.ts`). Sem estado server-side e sem vetores reais, recomendação / alerta preditivo / IA ficam limitados.
- **Adoção imediata (Adopt):** `zustand` (estado + persist), `react-hook-form` + `zod`, `Drizzle` + `pgvector` (dados/embeddings), `MapLibre GL` + `deck.gl` (mapa 3D), `visx` (charts), `better-auth` (contas), `Mercado Pago` + `Stripe` (cashback), `velite` (SEO/conteúdo), `Serwist` (PWA/offline), `Playwright` (já instalado).
- **Ranqueamento:** priorize os *quick wins* que alimentam o moat do `00-competitive-strategy.md` (comparador c/ IA, recomendação por embeddings, modo investidor, dashboards de bairro) **antes** dos *wow features* (3D, 360, leilões).

## 1. Estado atual (o que já existe — mapeado no repo)

Para não propor duplicata, levantamos a maturidade real de cada superfície citada no briefing:

| Superfície | Onde está | Maturidade | Gap para "feature completa" |
|---|---|---|---|
| Mapa / heatmap | `apps/web/src/app/[locale]/map/page.tsx` | Leaflet via **CDN** (`<script>`/`<link>`, não é dep npm), pins, filtros, heatmap de preço (`/market/heatmap`) | Sem 3D/terreno; sem tiles vetoriais de cidade; Leaflet não versionado no monorepo |
| Comparador | `apps/web/src/app/[locale]/compare/page.tsx` | Tabela diff de N imóveis via `/compare?ids=` | Sem narrativa de IA; sem scoring; rota `/compare` não encontrada no API (cai em fallback JSON) |
| Alertas | `apps/web/src/app/[locale]/alerts/page.tsx` + `lib/alerts.ts` | Filtros salvos em `localStorage` | Sem predição; sem notificação; sem nuvem; sem histórico de preço |
| Calculadora | `apps/web/src/app/[locale]/calculator/page.tsx` | Simulador de parcela (juros compostos) | Sem ROI / cap rate / cashflow; não liga no imóvel real |
| Insights | `apps/web/src/app/[locale]/insights/page.tsx` | Bairros + tendência de preço (`/market/neighborhoods`, `/market/trend`) | Sem dashboard de bairro dedicado; sem lib de chart (Sparkline manual) |
| Favoritos | `lib/favorites.ts` | `localStorage` | Sem nuvem; sem sync; acoplado a `localStorage` |
| Sales / 6 agentes | `packages/sales` + `useSalesEngine.ts` | Store + autonomy + roster | Já robusto; falta expor "modo investidor" |
| Recomendação | `GET /properties/recommendations/:id` (`packages/api/src/index.ts`) | Regra de faixa de preço (price band) | Não semântica; ignora embeddings |
| Embeddings | `packages/api/src/routes/embeddings.ts` + `packages/llm/src/embeddings.ts` | **TF-IDF fake** (não é vetor semântico) | Sem modelo real; sem `pgvector`; in-memory |
| Dados | `packages/api/src/index.ts` | `allProperties` em memória (1.500) de `data/properties.json` | Sem DB; sem persistência; sem índice vetorial |
| Estado global | `useState`/`context` + `localStorage` | — | Sem lib de estado; sem store central |
| Offline | `apps/web/src/app/[locale]/offline/page.tsx` | Apenas tela "sem conexão" | Não é PWA; sem SW; sem cache |
| Studio / Chat / Live | `studio`, `chat` (Puter/MiniMax), `live` (LiveDashboard) | Funcionais | — |
| e2e | `node_modules` tem `@playwright/test` + `@browserbasehq/stagehand` | Instalado, **não formalizado** | Sem `playwright.config.ts` / specs em CI |

**Conclusão:** ~60% das "features novas" do briefing já têm o osso; faltam músculo (IA / estado / dados) e alguns órgãos novos (3D, 360, PDF, leilões, PWA, auth).

<!-- end-section-1 -->

## 2. Feature Backlog ranqueado (Impacto × Esforço)

Critério: **Impacto** (1–5, alinhado ao moat do doc 00), **Esforço** (`S` ≤1sem / `M` ~2–3sem / `L` ~1–2mes / `XL` >2mes) e se é *elevação de scaffold* ou *greenfield*. Prioridade = alto impacto + baixo esforço primeiro.

| # | Feature | Tipo | Impacto | Esforço | Por que alto impacto |
|---|---|---|---|---|---|
| **F1** | Comparador com IA | Elevar scaffold | 4 | M | Usa rota/UI existente; adiciona narrativa LLM (Puter/MiniMax, custo 0) que portais não têm |
| **F2** | Recomendação por embeddings | Elevar scaffold | 4 | M | Substitui regra por similaridade semântica; ancora "descoberta" (moat 1/3) |
| **F3** | Modo investidor (ROI/cashflow) | Greenfield (sobre `/kpi`) | 5 | M | Persona de maior LTV; conecta ao cashback (doc 00); diferencia de Zap/Quinto |
| **F4** | Dashboards de bairro | Elevar scaffold | 4 | M | `/neighborhoods` já existe; só falta view dedicada + `visx`; SEO local forte |
| **F5** | Alertas preditivos de queda de preço | Elevar scaffold | 4 | L | `priceHistory` existe em `Property`; falta scoring + notificação; retenção |
| **F6** | App mobile (PWA) + instalação | Greenfield (infra) | 5 | L | Alcance; open-source ganha mobile sem app store; habilita offline |
| **F7** | Modo offline (local-first) | Greenfield (sobre F6) | 4 | L | Depende de F6 + `zustand/persist`; diferencial em baixa conexão (interior BR) |
| **F8** | Mapa 3D / terreno | Greenfield | 4 | L | Wow factor; `deck.gl` sobre `MapLibre GL`; vira mídia/SEO |
| **F9** | Relatórios PDF | Greenfield | 3 | M | Export de imóvel/bairro/portfólio; gera lead (e-mail capture) |
| **F10** | Tour virtual 360 | Greenfield | 3 | M/L | Requer imagens equiretangulares (dados); `@react-three/fiber` |
| **F11** | Marketplace de leilões | Greenfield | 4 | XL | Diferencial fortíssimo (leilões = nicho ignorado); depende de fontes de dados |
| **F12** | Integração com financiamento | Greenfield (parceria) | 3 | L | Calculadora já existe; falta conectar bancos/fintechs (Key/Atta) via embed/API |

**Enablers** (infra, pré-requisito de várias F*):

- **E1** Auth/contas (`better-auth`) — habilita alertas na nuvem, cashback, Pro, sync PWA. (L)
- **E2** Dados: `Drizzle` + `pgvector` — habilita embeddings reais, recomendação, alertas, leilões. (L/XL)
- **E3** Estado: `zustand` + `persist` — habilita offline, favoritos/alertas centralizados, compare, portfólio. (M)
- **E4** Forms: `react-hook-form` + `zod` — qualidade de alerts/calculator/contact/lead. (S, incremental)
- **E5** Charts: `visx` — dashboards de bairro, modo investidor, insights. (M)

### 2.1 Detalhamento — arquivos/rotas a criar

#### F1 — Comparador com IA (elevar `compare`)
- **Atual:** `apps/web/src/app/[locale]/compare/page.tsx` já busca `/compare?ids=` e monta tabela diff.
- **Criar:**
  - `apps/web/src/app/[locale]/compare/CompareAI.tsx` (`'use client'`) → chama `POST /llm/analysis` (já existe em `packages/api/src/routes/llm/analysis.ts`) passando os N imóveis e pedindo um *veredito* (melhor custo-benefício, riscos, fit por persona).
  - Estender `packages/api/src/routes/llm/analysis.ts` (`MarketAnalyzerAgent`) com modo `compare` que recebe `Property[]` + `Neighborhood[]`.
  - Toggle "Modo IA" na página existente (não reescrever a tabela).
  - Usar `useCompareStore` (zustand, ver E3) para os IDs selecionados no lugar da query string pura.

#### F2 — Recomendação por embeddings (elevar `/recommendations`)
- **Atual:** `GET /properties/recommendations/:id` (`packages/api/src/index.ts`) é faixa de preço (não semântica); `packages/llm/src/embeddings.ts` é TF-IDF fake.
- **Fase 1 (sem DB):**
  - Implementar `OpenAIEmbeddingProvider` / `MiniMaxEmbeddingProvider` em `packages/llm/src/embeddings.ts` (a interface `EmbeddingProvider` já existe).
  - Criar `packages/api/src/routes/recommend.ts` usando `cosineSimilarity` real sobre embeddings de `title+type+city+tags+neighborhood`.
  - Fallback p/ TF-IDF se `EMBEDDING_API_KEY` ausente.
- **Fase 2 (pós E2):** persistir vetor em `pgvector` (`properties.embedding`) e usar operador `<->`; rota vira `SELECT ... ORDER BY embedding <-> $1 LIMIT 6`.

<!-- end-section-2 -->

#### F3 — Modo investidor (ROI / cashflow) — `M`
- **Atual:** `GET /kpi` (`packages/api/src/index.ts`) + `applyRulers` (`packages/llm`) calculam KPIs de mercado; `calculator/page.tsx` é só financiamento.
- **Criar:**
  - `apps/web/src/app/[locale]/investor/page.tsx` + `useInvestorStore` (zustand) para o portfólio do usuário.
  - Componentes em `apps/web/src/components/investor/`: `RoiCard.tsx` (cap rate, cash-on-cash, ROI 5/10/20 anos), `CashflowSimulator.tsx` (entrada + financiamento + aluguel estimado por bairro + vacância + condomínio + IPTU), `PortfolioSummary.tsx` (soma de imóveis).
  - `POST /investor/analyze` em `packages/api/src/routes/investor.ts` que recebe `Property[]` + premissas e devolve métricas (reaproveita `computeMarketKpis`).
  - Usa `Neighborhood.avgPriceM2` + `avgRentM2` (adicionar `avgRentM2` ao `Neighborhood`/seed) para projeção de aluguel.
  - **Conecta ao moat:** usuário investidor vira Pro (doc 00) e rota p/ cashback no fechamento.

#### F4 — Dashboards de bairro — `M`
- **Atual:** `insights/page.tsx` já consome `/market/neighborhoods` e `/market/trend`; `Neighborhood` tem `crimeIndex`, `schools`, `hospitals`, `transit`, `avgPriceM2`.
- **Criar:**
  - `apps/web/src/app/[locale]/neighborhood/[city]/[name]/page.tsx` (route dinâmica) — view dedicada do bairro.
  - `apps/web/src/components/charts/` com `visx`: `PriceTrendChart.tsx`, `RadarScore.tsx` (crime/edu/saúde/transporte/preço), `HeatBars.tsx` (preço por m² por tipo).
  - Reaproveitar `Sparkline`/`Stat` do `@landmap/ui` onde fizer sentido.

#### F5 — Alertas preditivos de queda de preço — `L`
- **Atual:** `alerts/page.tsx` + `lib/alerts.ts` (filtros em `localStorage`); `Property.priceHistory[]` existe.
- **Criar:**
  - `packages/llm/src/price-signal.ts` → `predictPriceDrop(property, neighborhood)` que olha `priceHistory` (tendência, aceleração, desvio vs `avgPriceM2` do bairro) e devolve `score 0–1` + motivo.
  - `POST /alerts/check` (Hono) que varre imóveis contra os filtros do usuário e retorna *matches* com sinal de queda.
  - `useAlertsStore` (zustand + persist, E3) substituindo `lib/alerts.ts`; `NotificationCenter` (citado no doc 02, F7) consome os matches.
  - **Pós E1:** persistir alertas na nuvem e disparar e-mail/push quando `score` cruzar limiar.

#### F6 — App mobile (PWA) + instalação — `L`
- **Atual:** `offline/page.tsx` é só tela de erro; sem manifest, sem SW.
- **Criar (via Serwist, ver §3):**
  - `apps/web/app/sw.ts` (service worker Serwist) com estratégias: `StaleWhileRevalidate` p/ `/api/search`, `/api/market/*`, `/api/geo/*`; `CacheFirst` p/ estáticos; fallback p/ `offline/page.tsx`.
  - `public/manifest.webmanifest` + ícones (`/icons/icon-192.svg` já referenciado no layout) e meta `apple-touch-icon`.
  - Registrar SW no `apps/web/src/app/[locale]/layout.tsx` (`navigator.serviceWorker.register('/sw.js')`) — só client, sem mexer em arquivos centrais de rota.
  - Lighthouse PWA ≥ 90 como aceite.

#### F7 — Modo offline (local-first) — `L`
- **Atual:** nenhum cache de dados no cliente.
- **Criar:**
  - `useFavoritesStore` / `useAlertsStore` / `useRecentlyViewedStore` com `persist` (IndexedDB via `idb-keyval`) — mantém `lib/favorites.ts`/`lib/alerts.ts` como fallback legível.
  - `apps/web/src/lib/offline-cache.ts`: cache de respostas de busca/mapa (tiles via SW) para revisitar sem rede.
  - Banner "Você está offline — vendo dados salvos" usando `navigator.onLine` + eventos `online/offline`.

<!-- end-f7 -->

#### F8 — Mapa 3D / terreno — `L`
- **Atual:** mapa é Leaflet (CDN), 2D.
- **Criar (MapLibre GL + deck.gl, ver §3):**
  - `apps/web/src/components/map/City3DMap.tsx` (`'use client'`, `dynamic(..., { ssr:false })`) — base `maplibre-gl` + camada `deck.gl`.
  - `apps/web/src/components/map/layers/`: `PriceColumnLayer.tsx` (ColumnLayer 3D por preço/m²), `HexHeatLayer.tsx` (HexagonLayer), `TerrainLayer.tsx` (terreno via DEM gratuito, ex. AWS Terrain Tiles).
  - Nova rota `apps/web/src/app/[locale]/map/3d/page.tsx` (toggle "Ver em 3D" a partir do mapa atual) — **não** substituir o Leaflet (keep para visão mundial leve).
  - `GET /geo/elevation` ou `POST /market/terrain` (Hono, opcional) para dados de elevação por bbox.

#### F9 — Relatórios PDF — `M`
- **Atual:** nada.
- **Criar:**
  - `packages/api/src/routes/report.tsx` (Hono + `@react-pdf/renderer`) → `GET /report/property/:id` e `GET /report/neighborhood/:city/:name` geram PDF server-side (sem Puppeteer, ideal p/ Vercel serverless).
  - `apps/web/src/components/report/ReportButton.tsx` que abre o PDF (nova aba) e dispara captura de e-mail opcional → nutre funil.
  - Reusa `Property` + `Neighborhood` + `priceHistory` + insights.

#### F10 — Tour virtual 360 — `M/L`
- **Atual:** `property/[id]/gallery.tsx` (galeria simples).
- **Criar:**
  - `apps/web/src/app/[locale]/property/[id]/tour/page.tsx` + `components/tour/SphereTour.tsx` (`@react-three/fiber` + `drei`) renderizando imagem equiretangular numa esfera com controle de órbita.
  - Campo `panoramaUrl` em `Property` (seed) + ingestão em `packages/scraper`.
  - Fallback p/ galeria se não houver panorama.

#### F11 — Marketplace de leilões — `XL`
- **Atual:** nada (oportunidade branca).
- **Criar:**
  - `packages/auctions` (novo) com scraper/normalizador de portais de leilão (SFN, leilões da justiça, bancos) — reaproveita padrão de `packages/scraper`.
  - `packages/api/src/routes/auctions.ts` (`GET /auctions`, `GET /auctions/:id`) com filtros (tipo, cidade, avaliação, desconto).
  - `apps/web/src/app/[locale]/auctions/page.tsx` + `property/[id]` reutilizável (leilão é só mais um `modality`).
  - Diferencial: cruzar leilão com `priceHistory`/avaliação do bairro → "desconto real" (F5/F3).

#### F12 — Integração com financiamento — `L`
- **Atual:** `calculator/page.tsx` (simulação local).
- **Criar:**
  - `packages/integrations/src/financing.ts` (client p/ Key/Atta/bancos via embed ou API de simulação).
  - `apps/web/src/app/[locale]/financing/page.tsx` (marketplace de crédito) + `CalculatorFinanceBridge.tsx` que pré-preenche a calculadora com o imóvel.
  - `POST /payments/*` (E1/E2) para comissão/cashback quando o crédito fecha pelo LandMap.

### 2.2 Enablers — onde encaixar

- **E1 Auth (`better-auth`):** `packages/api/auth.ts` (config) + `apps/web/src/app/api/auth/[...all]/route.ts` (handler Hono montado). Store de sessão via cookie. Habilita `useUserStore` (zustand) e rotas protegidas (`/investor`, `/alerts` nuvem, `/admin` já existe).
- **E2 Dados (`Drizzle` + `pgvector`):** `packages/db/src/schema.ts` (tabelas `properties`, `users`, `alerts`, `cashback`, `referrals` — tipos já em `docs/war-room/00-billing-types.ts`), `drizzle.config.ts` na raiz, migração que lê `data/properties.json` como seed. Refatorar `packages/api/src/index.ts` para usar `db.query` no lugar de `allProperties`.
- **E3 Estado (`zustand`):** `apps/web/src/lib/store/` com `useFavoritesStore`, `useAlertsStore`, `useCompareStore`, `usePortfolioStore`, `useUserStore` (todos com `persist` onde fizer sentido). Substituir gradativamente `lib/favorites.ts`/`lib/alerts.ts`.
- **E4 Forms (`react-hook-form` + `zod`):** aplicar em `alerts/page.tsx`, `calculator`, `ContactForm.tsx`, lead capture, wizard de financiamento. Resolver zod já está no monorepo.
- **E5 Charts (`visx`):** `apps/web/src/components/charts/` (primitivos) consumidos por F3/F4/insights.

<!-- end-section-2b -->

## 3. Tech Radar — bibliotecas para ADOTAR (fit Next 14 + Hono + Tailwind v4)

Cada item traz: **Por que adotar**, **Risco**, **Esforço** e **Onde encaixar** (package/rota/arquivo). O radar completo em quadrantes está na §4.

### 3.1 Mapas — `MapLibre GL` (ADOPT) vs `Leaflet` (KEEP)
- **`maplibre-gl` ✅ ADOPT**
  - *Por que:* open-source, **sem token/API key**, render vetorial WebGL, é a base natural p/ `deck.gl` (3D/terreno) e aceita estilos gratuitos (OSM raster ou demos). Habilita F8.
  - *Risco:* bundle (~200 kB); visão **mundial** sem chave é limitada (precisa de tile source) → por isso **mantemos o Leaflet (CDN) para o mapa mundial atual** e usamos MapLibre só na visão de cidade 3D.
  - *Esforço:* M. *Onde:* `apps/web` (dep) + `components/map/City3DMap.tsx` + rota `map/3d`.
- **`leaflet` — KEEP (não migrar):** já funciona via CDN em `map/page.tsx`; migrar o mapa todo para MapLibre não tem ROI. **HOLD** como dependência npm (continua CDN).

### 3.2 3D — `deck.gl` (ADOPT)
- *Por que:* camadas GPU prontas (`ColumnLayer` p/ barras de preço 3D, `HexagonLayer` p/ heatmap volumétrico, `TerrainLayer`, `ScatterplotLayer`); integra tanto com MapLibre quanto com dados do Hono (`/market/*`, `/geo/*`). Canvas da marca "wow".
- *Risco:* curva de aprendizado; versionar junto do `maplibre-gl`. *Esforço:* M. *Onde:* `apps/web/src/components/map/layers/*` + rota opcional `/market/terrain`.

### 3.3 Charts — `visx` (ADOPT) · `recharts` (TRIAL) · `Observable Plot` (HOLD)
- **`visx` ✅ ADOPT** — *Por que:* primitivos D3 componsíveis; combina com o design system bioluminescente (controle total de tokens `emerald`/`cyan`, `framer-motion` p/ entrada). *Risco:* baixo nível (mais código p/ gráfico simples). *Esforço:* M. *Onde:* `apps/web/src/components/charts/` (F3/F4/insights).
- **`recharts` (TRIAL)** — *Por que:* rápido p/ gráficos simples quando não há tempo p/ visx. *Risco:* estilização limitada vs marca (drift de token). *Onde:* protótipos de dashboard.
- **`Observable Plot` (HOLD)** — imperativo, menos controle de marca; não prioritário.

### 3.4 Forms — `react-hook-form` + `@hookform/resolvers` + `zod` (ADOPT)
- *Por que:* `zod` já está no monorepo (resolver nativo); menos re-render que `useState` puro; acessível (labels/erros/aria). Eleva qualidade de F5/F12 e de `ContactForm`.
- *Risco:* baixo (adota incrementalmente por form). *Esforço:* S. *Onde:* `alerts/page.tsx`, `calculator`, `ContactForm.tsx`, lead capture, wizard de financiamento.

### 3.5 Estado — `zustand` (+ `persist`) (ADOPT)
- *Por que:* ~1 kB, sem boilerplate, `persist` middleware (IndexedDB) é o código de F6/F7 (offline/PWA); substitui o espalhamento de `useState`/`context` + `localStorage` (`lib/favorites.ts`, `lib/alerts.ts`).
- *Risco:* baixo; migração gradual (manter fallback localStorage). *Esforço:* M. *Onde:* `apps/web/src/lib/store/` (`useFavoritesStore`, `useAlertsStore`, `useCompareStore`, `usePortfolioStore`, `useUserStore`).

<!-- end-radar-a -->

### 3.6 Dados — `Drizzle ORM` + `pgvector` (ADOPT) vs `Prisma` (ASSESS)
- **`drizzle-orm` + `drizzle-kit` ✅ ADOPT**
  - *Por que:* TS-first, leve, gerador de SQL explícito, ótimo p/ serverless (Hono/Vercel) e para `pgvector` (`vector` type + operador `<->`). Substitui o `allProperties` em memória (E2) e habilita F2/F5/F11.
  - *Risco:* exige Postgres real (Supabase/Neon) — hoje o deploy Vercel roda só em memória; migração é a maior do projeto. *Esforço:* L/XL. *Onde:* `packages/db/src/schema.ts`, `drizzle.config.ts` (raiz), refactor de `packages/api/src/index.ts`.
- **`prisma` (ASSESS):** pesado p/ serverless (binary/engine), gerador opaco; só se a equipe já dominar. **HOLD** por enquanto.

### 3.7 Vetores / Embeddings — modelo real + `pgvector` (ADOPT)
- *Por que:* os embeddings atuais são **TF-IDF fake** (`packages/llm/src/embeddings.ts`). Adicionar `OpenAIEmbeddingProvider`/`MiniMaxEmbeddingProvider` (interface `EmbeddingProvider` já existe) + coluna `vector` no `properties` (Drizzle/pgvector) torna F2 (recomendação) e busca semântica reais.
- *Provedor:* `text-embedding-3-small` (OpenAI, barato, 1536-d) ou MiniMax (custo 0 via Puter no client p/ inferência leve). *Risco:* custo de re-embedding de 1.500 itens (~centavos) + rate limit. *Esforço:* M (Fase 1 in-memory) → L (pgvector). *Onde:* `packages/llm/src/embeddings.ts`, `packages/api/src/routes/recommend.ts`, `/properties/recommendations/:id`.

### 3.8 Animação — `GSAP` + `framer-motion` (KEEP) · `@react-three/fiber` + `drei` (ADOPT p/ 3D)
- **KEEP:** GSAP e framer-motion já são ótimos p/ UI (herança do briefing). Não trocar.
- **`@react-three/fiber` + `@react-three/drei` ✅ ADOPT (F10):** render de esfera equiretangular p/ tour 360; reaproveitável p/ showcase 3D de imóvel. *Risco:* bundle 3D; isolar em `dynamic(ssr:false)`. *Esforço:* M. *Onde:* `components/tour/SphereTour.tsx`.

### 3.9 Auth — `better-auth` (ADOPT) vs `Lucia` (ASSESS)
- **`better-auth` ✅ ADOPT (E1)**
  - *Por que:* framework-agnóstico, roda em Hono e em Next; sessão por cookie/JWT; plugins (e-mail, oauth, admin) prontos p/ contas, cashback e Pro (doc 00). Habilita alertas na nuvem (F5) e sync PWA (F7).
  - *Risco:* acoplar ao Hono `handle` do Vercel (`app/api/[...route]`); precisa de DB (E2). *Esforço:* L. *Onde:* `packages/api/auth.ts` + `apps/web/src/app/api/auth/[...all]/route.ts` + `useUserStore`.
- **`lucia` (ASSESS):** ótimo, mas melhor-auth evoluiu mais rápido p/ serverless; **HOLD**.

### 3.10 Pagamentos — `Mercado Pago` (ADOPT BR) + `Stripe` (ADOPT intl)
- *Por que:* cashback no fechamento (doc 00) exige gateway. Mercado Pago é o fit BR (Pix, split, webhook); Stripe p/ comprador internacional (en/es). Tipos já em `docs/war-room/00-billing-types.ts`.
- *Risco:* compliance/KYC; webhook idempotente. *Esforço:* L. *Onde:* `packages/payments` (novo) ou `packages/integrations/src/payments.ts` + `POST /payments/checkout`, `POST /payments/webhook`.

### 3.11 CMS / SEO — `velite` (ADOPT) vs `Payload` (ASSESS)
- **`velite` ✅ ADOPT**
  - *Por que:* Markdown/MDX → dados tipados em build time, **zero runtime/DB**; encaixa no modelo "1.500 markdowns" do LandMap (blog/SEO/landing gerados de conteúdo). Gera `src/content` consumido por `apps/web/src/app/[locale]/blog`.
  - *Risco:* só estático (sem admin WYSIWYG). *Esforço:* S/M. *Onde:* `velite.config.ts` (raiz) + `content/` + `apps/web/src/app/[locale]/blog`.
- **`payload` (ASSESS):** headless CMS com admin real; só se houver necessidade de edição non-dev. **HOLD**.

### 3.12 e2e — `Playwright` (ADOPT — já instalado)
- *Por que:* `@playwright/test` + `@browserbasehq/stagehand` **já estão em `node_modules`**; só falta formalizar. Cobre regressão das rotas críticas (`search`, `map`, `compare`, `property/[id]`, `investor`).
- *Risco:* baixo. *Esforço:* S. *Onde:* `playwright.config.ts` + `apps/web/e2e/*` + step em CI (`.github/workflows`).

### 3.13 PWA / Offline — `Serwist` (ADOPT)
- *Por que:* substitui `next-pwa` (sem suporte App Router); gera SW a partir de `app/sw.ts`, integra com manifest, estratégias de cache p/ `/api/*` e tiles. Habilita F6/F7.
- *Risco:* cache de API pode servir dado obsoleto (mitigar com `StaleWhileRevalidate` + versão). *Esforço:* M. *Onde:* `apps/web/app/sw.ts` + `public/manifest.webmanifest` + registro no `layout.tsx`.

### 3.14 PDF — `@react-pdf/renderer` (ADOPT)
- *Por que:* gera PDF server-side em Hono **sem Puppeteer** (adequado a Vercel serverless, sem Chromium). Habilita F9.
- *Risco:* layout declarativo próprio (não é HTML/CSS). *Esforço:* M. *Onde:* `packages/api/src/routes/report.tsx` + `components/report/ReportButton.tsx`.

<!-- end-radar-b -->

## 4. Matriz de Adoção (estilo ThoughtWorks)

| ADOPT (use agora) | TRIAL (experimente em 1 feature) | ASSESS (avalie depois) | HOLD (não agora) |
|---|---|---|---|
| `zustand` (+persist) | `recharts` (dashboards rápidos) | `prisma` (pesado p/ serverless) | `leaflet` como **dep npm** (manter CDN) |
| `react-hook-form` + `zod` | `@react-three/fiber` + `drei` (F10) | `lucia` (better-auth ganhou) | `redux` / `mobx` (zustand já cobre) |
| `maplibre-gl` | `MiniMax` embeddings client-side (Puter) | `payload` (CMS com admin) | `puppeteer` (usar `@react-pdf/renderer`) |
| `deck.gl` | `Neon` / `Supabase` (host do `pgvector`) | `Observable Plot` | `mapbox-gl` (exige token; MapLibre é livre) |
| `visx` | | | `next-pwa` (usar `Serwist`) |
| `drizzle-orm` + `pgvector` | | | migrar todo o mapa p/ MapLibre (manter Leaflet p/ mundo) |
| `better-auth` | | | |
| `Mercado Pago` + `Stripe` | | | |
| `velite` | | | |
| `Serwist` | | | |
| `@react-pdf/renderer` | | | |
| `Playwright` (já instalado) | | | |

**Movimento em relação ao estado atual:** saímos de "zero libs de estado/dados/auth/charts" para uma base enxuta e coerente com a stack (Hono + Next 14 + Tailwind v4). `Playwright` já está no `node_modules` → só formalizar (ADIÇÃO barata). `leaflet` **não** vira dependência npm (continua CDN); `mapbox-gl` fica em HOLD por custo de token.

## 5. Plano de Execução (90 dias — alinhado ao doc 00)

> Princípio do doc 00: tração > PowerPoint; moat > features. Cada fase entrega valor de usuário, não só infra.

- **Fase 0 — Fundação de qualidade (Sem 1–2):** E3 (`zustand` + `persist` p/ `useFavoritesStore`/`useAlertsStore`), E4 (`react-hook-form` em `alerts`), E5 setup de `visx`, e **Playwright** (`playwright.config.ts` + 5 specs das rotas críticas). Sem risco de quebra de deploy.
- **Fase 1 — IA & dados leves (Sem 3–6):** **F1** Comparador com IA (sobre `POST /llm/analysis`), **F2** recomendação por embeddings (Fase 1 in-memory), **F4** Dashboards de bairro (visx), **F3** Modo investidor (sobre `/kpi`). Tudo client/API, sem DB.
- **Fase 2 — Estado server & nuvem (Sem 7–10):** **E2** `Drizzle` + `pgvector` (migrar `allProperties` → Postgres, com *feature-flag*: usa DB se `DATABASE_URL` existir, senão in-memory), **F2** Fase 2 (vetor no `properties`), **E1** `better-auth`, **F5** Alertas preditivos (precisa de nuvem + auth).
- **Fase 3 — Alcance (Sem 11–14):** **F6** PWA (`Serwist` + manifest), **F7** Modo offline (stores persistidos + cache de API), **F9** Relatórios PDF (`@react-pdf/renderer`).
- **Fase 4 — Diferenciação (Sem 15–16+):** **F8** Mapa 3D/terreno (`MapLibre`+`deck.gl`), **F10** Tour 360 (`@react-three/fiber`), **F11** Marketplace de leilões (`packages/auctions`, XL), **F12** Financiamento + **Pagamentos** (`Mercado Pago`/`Stripe`) para cashback no fechamento.

## 6. Riscos & Mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Migrar `allProperties` (memória) → Postgres quebra o deploy Vercel | Alto | *Feature-flag*: `db.query` se `DATABASE_URL` presente, senão `in-memory` (o código já tem guard `Bindings.DATABASE_URL?`). Seed via `data/properties.json`. |
| Custo de IA / re-embedding de 1.500 itens | Médio | Inferência leve via MiniMax/Puter (custo 0, client-side); embeddings em batch só em `text-embedding-3-small` (~centavos). Fallback TF-IDF mantido. |
| Bundle size (maplibre/deck.gl/three) | Médio | `dynamic(() => import(...), { ssr:false })` por rota; code-split; pré-carregar só em `map/3d` e `property/[id]/tour`. |
| Cache offline servindo dado obsoleto | Médio | `StaleWhileRevalidate` + chave de versão; invalidar em `online` event. |
| Leilões dependem de fonte de dados externa | Alto (F11) | Começar com 1 fonte normalizada (ex. SFN) + `packages/scraper`; tratar como `modality` extra, não novo domínio. |
| Acoplar `better-auth` ao Hono/Vercel | Médio | Usar adapter Hono + montar em `app/api/auth/[...all]/route.ts`; sessão por cookie assinado. |
| Drift de tokens de marca nos novos componentes | Baixo | Reusar `cn()` + tokens do `@landmap/ui`; `visx` com cores `emerald`/`cyan` (ver doc 02, T1/T3). |

---

**Resumo para decisão:** não começar por 3D/leilões. O ROI está em (1) dar **estado** (zustand) e (2) tornar a **IA real** (embeddings + comparador + alerta preditivo + modo investidor) — tudo sobre o que já existe. Depois, **alcance** (PWA/offline/PDF) e, por fim, o **show** (3D/360/leilões). Auth + Drizzle + Pagamentos são os enablers que destravam o moat de cashback/contas do doc 00.






