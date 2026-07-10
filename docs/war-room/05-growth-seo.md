# LandMap — Growth, SEO & AEO (War Room #05)

> **Autor:** Growth Engineer / SEO & AEO Lead — LandMap War Room
> **Data:** 2026 · **Status:** Acionável (documento isolado — nenhum arquivo central editado)
> **Princípio YC:** Tração > PowerPoint · Moat > Features · Velocidade > Perfeição

## 0. TL;DR Executivo

O LandMap já tem a fundação técnica de SEO mais rara em imobiliárias BR: um pacote `@landmap/seo` com **geradores schema.org reais** (`PropertyListingPage`, `Offer`, `Place`, `FAQPage`, `HowTo`, `VideoObject`, `QAPage/AnswerBox`, `Property`, `ItemList`, `BreadcrumbList`, `Organization`, `WebSite`) e uma **coverage CLI**. Isso nos coloca à frente de Zap/VivaReal/QuintoAndar no quesito dados estruturados abertos.

Este documento fecha 3 frentes em 90 dias:

1. **Loops de Growth** — referral/convite amarrado a `cashback` (`packages/billing`) + `gamificação` (`packages/gamification`), com UTM/cohort e landing pages parametrizadas por `/c/[cidade]/[bairro]/[tipo]`.
2. **SEO técnico & AEO** — preencher os gaps de schema (AggregateRating, LocalBusiness, TouristAttraction, Residence/Apartment com rating), sitemap dinâmico multi-locale, robots corrigido, Core Web Vitals e marcação de Answer Box.
3. **SEO de conteúdo programático** — pipeline de templates alimentado por `packages/api/src/routes/market.ts` (`/neighborhoods`, `/price-trend`, `/heatmap`) gerando páginas cidade×bairro×tipo×locale que respondem perguntas como *"preço médio de imóveis em Curitiba 2026"*.

**Alvos 90d:** schema coverage CLI > 90% · +40% sessões orgânicas · top-3 para 50 queries "preço médio [cidade]" · K viral ≥ 0,4 · backlinks de comunidade open-source (GitHub/Product Hunt).

---

## 1. Estado Atual do Repo (audit grounded in real files)

### 1.1 Schema.org já implementado (`packages/seo`)
Fonte: `packages/seo/src/generators.ts` e `packages/seo/src/schema.ts`.

| Gerador | `@type` | Arquivo | No coverage CLI? |
|---|---|---|---|
| `buildPropertyListingPageSchema` | `PropertyListingPage` | generators.ts | ✅ rastreado |
| `buildOfferSchema` | `Offer` | generators.ts | ✅ rastreado |
| `buildPlaceSchema` | `Place` | generators.ts | ✅ rastreado |
| `buildFaqPageSchema` | `FAQPage` | generators.ts | ✅ rastreado |
| `buildHowToSchema` | `HowTo` | generators.ts | ✅ rastreado |
| `buildVideoObjectSchema` | `VideoObject` | generators.ts | ✅ rastreado |
| `buildAnswerBoxSchema` | `QAPage`/`WebPage` | generators.ts | ⚠️ **não** rastreado |
| `buildPropertySchema` | `Apartment`/`SingleFamilyResidence`/`Commercial`/`Land` | schema.ts | ⚠️ **não** rastreado |
| `buildItemListSchema` | `ItemList` | schema.ts | ⚠️ **não** rastreado |
| `buildBreadcrumbSchema` | `BreadcrumbList` | schema.ts | ⚠️ **não** rastreado |
| `buildOrganizationSchema` | `Organization` | schema.ts | ⚠️ **não** rastreado |
| `buildWebSiteSchema` | `WebSite` | schema.ts | ⚠️ **não** rastreado |

> ⚠️ **Gap de medição:** `SCHEMA_TYPES` (generators.ts L396-403) lista só 6 tipos. A coverage CLI (`cli/coverage.ts`) só computa cobertura sobre esses 6. Ou seja, `Organization/WebSite/Breadcrumb/ItemList/Property/AnswerBox` **já existem no código mas não entram no `% de cobertura`**. Isso distorce o KPI de "schema coverage > 90%" do `landmap-complete-plan.md`.

### 1.2 Rotas de mercado disponíveis (`packages/api/src/routes/market.ts`)
Feed direto para páginas programáticas:

| Rota | Params | Retorna | Uso no SEO |
|---|---|---|---|
| `GET /market/neighborhoods` | `city`, `type?` | `NeighborhoodStat[]` (name, city, state, count, avgPriceM2, avgPrice) | Página de bairro + ItemList + AggregateRating |
| `GET /market/price-trend` | `city`, `type?` | `currentAvg` + `monthly[]` (PriceTrendPoint) | Conteúdo "preço médio 2026" + gráfico + HowTo/FAQ |
| `GET /market/heatmap` | `city` | `HeatmapPoint[]` (lat, lng, weight, neighborhood, avgPrice) | `Place`/`GeoCoordinates` + TouristAttraction do bairro |

`Property` (`packages/db/src/index.ts`): `id, title, city, state, price, areaM2, bedrooms?, type(4), modality(3), available, latitude?, longitude?, neighborhood?, zone?, street?, status, images[], tags[]`.

### 1.3 Infra web & indexação (encontrado no repo)
- `apps/web/src/app/[locale]/{,search,map,property/[id],compare,favorites,alerts,chat,calculator,docs,sales,admin}` — roteamento por locale `pt-BR/en-US/es-ES`.
- `apps/web/public/robots.txt` → `Allow: /` mas **`Sitemap: https://landmap.app/sitemap.xml`** (domínio **divergente** do sitemap).
- `apps/web/public/sitemap.xml` → **estático e com bug de XML** (`<<urlset`, `<//url>` — do script de indentação), só 50 imóveis, **sem prefixo de locale**, sem páginas de cidade/bairro.
- `scripts/generate-sitemap.py` existe mas gera sitemap estático (hardcoded, sem `/c/*`, sem locale) — base para reescrever como **dinâmico**.

### 1.4 Conexões com agentes irmãos (loops de growth)
- **`docs/war-room/00-competitive-strategy.md`** → `packages/billing`: rotas `/referrals/*` (`GET /referrals/code`, `/referrals/stats`, `POST /referrals/track`), `Referral{code,referrerId,referredId,status,rewardCents}`, cashback via take-rate no `closed_won` (`POST /cashback/confirm`), planos Free/Premium/Pro/Enterprise.
- **`docs/war-room/01-gamification.md`** → `packages/gamification`: evento `referral_signup` → +20 LandCoins + badge `referrer`; `closed_won` → XP; `redeemCashback` (port p/ billing); tiers `bronze→silver→gold→sovereign`; KPI **K viral = convites × taxa de signup**.
- **`packages/llm`** → `rag.ts`, `chatCompletion`, `MarketAnalyzerAgent`, `CopywriterAgent` — geração de conteúdo + resposta a perguntas (base do AEO + chat RAG).

---

## 2. Alvos de Cobertura schema.org (o que falta vs. o que existe)

A missão lista `Apartment, Residence, AggregateRating, LocalBusiness, TouristAttraction, FAQ, HowTo, VideoObject, BreadcrumbList, ItemList, WebSite, Organization`. **Auditoria honesta:** FAQ/HowTo/VideoObject/BreadcrumbList/ItemList/WebSite/Organization **já existem**; `Apartment`/`Residence` existem de forma parcial (via `buildPropertySchema`). Os **gaps reais** são `AggregateRating`, `LocalBusiness`, `TouristAttraction` e um schema próprio de `Residence`/`Apartment` **com rating**.

### 2.1 Tabela de cobertura alvo

| schema.org `@type` | Situação hoje | Ação 90d |
|---|---|---|
| `PropertyListingPage` | ✅ `generators.ts` | manter + estender p/ `/c/*` |
| `Offer` | ✅ | manter |
| `Place` | ✅ | reusar p/ cidade/bairro (com `geo`) |
| `FAQPage` | ✅ | wire em todas `/c/[cidade]` + `/faq` |
| `HowTo` | ✅ | "como comprar/avaliar imóvel em X" |
| `VideoObject` | ✅ | tour em vídeo do bairro |
| `QAPage`/`AnswerBox` | ⚠️ existe, não rastreado | **rastrear** + wire em respostas AEO |
| `Property` (`Apartment`/`SingleFamilyResidence`/`Commercial`/`Land`) | ⚠️ parcial | adicionar `aggregateRating` + `amenityFeature` |
| `ItemList` | ⚠️ não rastreado | **rastrear**; listar bairros/imóveis |
| `BreadcrumbList` | ⚠️ não rastreado | **rastrear**; em toda `/c/*` |
| `Organization` | ⚠️ não rastreado | **rastrear**; no layout root |
| `WebSite` | ⚠️ não rastreado | **rastrear**; `SearchAction` no root |
| `AggregateRating` ❌ **NOVO** | inexistente | média de preço/avaliação do bairro/cidade |
| `LocalBusiness` ❌ **NOVO** | inexistente | imobiliárias/agentes + POIs do bairro |
| `TouristAttraction` ❌ **NOVO** | inexistente | "o que fazer / por que morar em X" |
| `Residence` (base) ❌ **NOVO** | só subtipos | tipo base p/ apartamento/casa c/ rating |

### 2.2 Novos geradores a construir (em `packages/seo`, pacote isolado)
```ts
// generators.ts — adições (não editar arquivos centrais de outros pacotes)
buildAggregateRating(input: { ratingValue:number; reviewCount:number; best?:number; worst?:number })
buildLocalBusiness(input: { name; city; state; telephone?; url?; geo?; priceRange?; aggregateRating? })
buildTouristAttraction(input: { name; description; city; state; geo; touristType?:string[] })
// schema.ts — tipo base
buildResidenceSchema(input: { ...Property; aggregateRating? })  // @type Residence + Apartment/SingleFamilyResidence
```
Regra de ouro: **não editar** `index.ts`/`routes` de outros pacotes; só **estender** `packages/seo` (que já é isolado) e criar rotas/páginas novas em `apps/web` e `packages/api/src/routes/`.

### 2.3 Corrigir o KPI de cobertura
Estender `SCHEMA_TYPES` (e o `pickSchemaType` em `cli/coverage.ts`) para incluir `AggregateRating, LocalBusiness, TouristAttraction, Residence, QAPage, Organization, WebSite, BreadcrumbList, ItemList, Property` — assim o `coverage %` reflete a realidade e bate a meta ">90%" do plano.

---

## 3. Loops de Growth

### 3.1 Loop de convite / referral (ligado a cashback + gamificação)
Cadeia de eventos (sem tocar arquivos centrais — consome rotas já planejadas em `00-competitive-strategy.md` e eventos de `01-gamification.md`):

```
[1] Usuário A compartilha  /[locale]/c/[cidade]?ref=A_CODE&utm_source=referral&utm_medium=share&utm_campaign=indique_ganhe
        │
[2] Usuário B assina via ?ref=A_CODE  →  POST /referrals/track  (billing: Referral{code,referrerId=A,referredId=B,status=pending})
        │     + evento referral_signup → POST /events (gamificação: +20 LC p/ A, badge "referrer", +B welcome bonus)
        │
[3] B navega, favorita, compara, roda agente → eventos search/save_favorite/compare/agent_cycle (gamificação: XP + LC)
        │
[4] B fecha pelo LandMap (closed_won no Sales Cockpit) → POST /cashback/confirm (billing: take-rate → CashbackBalance.cents de A e B)
        │     + evento closed_won → POST /events (gamificação: XP + badge Sovereign)
        │
[5] A e B resgatam: gamificação redeemCashback (port) → billing /cashback/redeem
```

**Métrica de sucesso:** **K viral = convites enviados × taxa de signup ≥ 0,4** (limiar de crescimento orgânico sem spend, definido em `01-gamification.md`). Gatilho de status (badge Sovereign/Gold) gera prova social → mais indicações (flywheel).

### 3.2 UTM / cohort tracking
Modelo de cohort (implementar em novo pacote/rota isolada, ex.: `packages/api/src/routes/analytics.ts` somente-leitura, ou evento no `packages/gamification`):

| Dimensão de cohort | Fonte | Exemplo |
|---|---|---|
| Semana de signup | `createdAt` | 2026-W12 |
| Canal de aquisição | `utm_source`/`?ref=` | referral / organic / paid |
| Landing param | `/c/[cidade]/[bairro]/[tipo]` | Curitiba / Batel / apartamento |
| Campanha | `utm_campaign` | indique_ganhe / blackfriday_imoveis |
| Locale | `[locale]` | pt-BR / en-US / es-ES |

Cohorts acompanhados por **D1 / D7 / D30** (retenção, meta de `01-gamification.md`: +15pp/+10pp/+8pp), conversão a `closed_won` e cashback gerado. UTMs devem ser **persistidos no primeiro touch** (cookie/`localStorage`) e carregados no `POST /referrals/track` + eventos de gamificação.

### 3.3 Landing pages parametrizadas (cidade/bairro/tipo) + ref/utm
Novas rotas em `apps/web/src/app/[locale]/c/` (isoladas — não editam rotas existentes):
- `/c/[cidade]` — visão da cidade (neighborhoods + price-trend + heatmap)
- `/c/[cidade]/[bairro]` — página de bairro (TouristAttraction + AggregateRating + LocalBusiness POIs)
- `/c/[cidade]/[tipo]` — tipo na cidade (apartamento/casa/terreno/comercial)
- `/c/[cidade]/[bairro]/[tipo]` — combinação long-tail

Cada página aceita `?ref=CODE&utm_*` no servidor (Server Component) → injeta `Referral`/`utm` no `<head>` (canonical + JSON-LD) e no primeiro evento de sessão. Isso une **programático SEO** (tráfego orgânico) com **referral pagável** (tráfego de indicação) na mesma URL.


---

## 4. SEO Técnico

### 4.1 Expansão de schema (wire, não só criar)
- Estender `packages/seo` com os geradores de §2.2 e **registrá-los no `SCHEMA_TYPES`** + `pickSchemaType` (`cli/coverage.ts`) para que o `% de cobertura` bata 90%+.
- `Organization` + `WebSite`(com `SearchAction`) no **layout root**; `BreadcrumbList` + `ItemList` em toda `/c/*`; `QAPage` nas páginas de resposta (§5); `AggregateRating`/`LocalBusiness`/`TouristAttraction` nas páginas de cidade/bairro.
- Rodar `pnpm --filter @landmap/seo coverage --format md --output coverage.json` no CI e expor o número como artefato.

### 4.2 Sitemap dinâmico (corrigir bug + multi-locale + programático)
Substituir `scripts/generate-sitemap.py` (estático, com XML quebrado `<<urlset`/`<//url>`) por **`apps/web/src/app/sitemap.ts`** (Next.js MetadataRoute) que gera:
```
static:  /[locale]  /search  /map  /compare  /favorites  /chat  /calculator  /docs  /faq  /how-to
programático:  /[locale]/c/[cidade]  /[locale]/c/[cidade]/[bairro]  /[locale]/c/[cidade]/[tipo]  /[locale]/property/[id]
locale: pt-BR, en-US, es-ES  (hreflang alternates em <url><xhtml:link>)
```
- **Domínio único:** usar `landmap.com.br` (atual no sitemap) em tudo; corrigir `robots.txt` que aponta p/ `landmap.app`.
- **Paginação/limite:** respeitar 50k URLs / 50MB — se crescer, gerar `sitemap-index.xml` (um por locale ou por tipo).
- Reexecutar no build e quando `properties.json`/cidades mudarem (webhook n8n ou script no CI).

### 4.3 robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*?ref=   # evita duplicar indexação de URLs de referral (canonical limpo nas páginas)
Allow: /c/
Sitemap: https://landmap.com.br/sitemap.xml
```
Manter `index/follow` no `[locale]/layout.tsx` (já existe) e `noindex` em `/admin`, `/compare`, `/favorites` (conteúdo autenticado).

### 4.4 Core Web Vitals
| Métrica | Risco no LandMap | Ação |
|---|---|---|
| **LCP** | mapa Leaflet + fontes | `next/font` (Geist/Inter já usados), `next/image` nos cards, lazy do mapa abaixo da dobra, `priority` no hero |
| **CLS** | gráficos de preço + mapa | reservar `aspect-ratio`/min-height em containers de chart/map; skeleton (`loading.tsx` já existe) |
| **INP** | chat RAG client-side (MiniMax) | debounce, streaming já existe; mover cálculo pesado p/ worker; preconnect em Puter.js |
| **TBT** | bundle de gráficos | code-split do heatmap/charts; manter `bundle main < 200KB` (meta do plano) |

### 4.5 Hreflang (pt-BR / en-US / es-ES)
- `alternates.languages` no `metadata` de cada rota + `<link rel="alternate" hreflang>` no sitemap.
- `x-default` aponta p/ `pt-BR`. Evita canibalização entre locales.

### 4.6 Arquitetura de URL & internal linking
- Padrão canônico: `/[locale]/c/[cidade]` é hub; bairros e tipos são filhos (BreadcrumbList de 3 níveis).
- Link interno automático: cada cidade lista seus bairros (ItemList) e tipos; cada imóvel linka p/ bairro+cidade. Isso distribui PageRank e ajuda o Google a descobrir `/c/*`.

---

## 5. AEO — Answer Engine Optimization

### 5.1 Answer Box / featured snippets
`buildAnswerBoxSchema` (QAPage) **já existe** em `generators.ts`. Usá-lo em páginas que respondem pergunta fechada, ex.:
- "Qual o preço médio de imóveis em Curitiba em 2026?" → resposta direta + `acceptedAnswer.text` curto (40–55 palavras) + `url` p/ a página `/c/curitiba`.
- Marcar a resposta também com `<p>` curto e `<h2>` "Resposta rápida" para snippet destacado.

### 5.2 FAQPage & HowTo
- `FAQPage` em toda `/c/[cidade]` (ex.: "Vale a pena investir em [bairro]?", "Quanto custa o m² em [cidade]?").
- `HowTo` para "Como avaliar um imóvel em [cidade]" e "Como usar o cashback do LandMap" — passos com `HowToStep`.

### 5.3 Conteúdo que responde perguntas (programático)
Gerar a partir de `/market/price-trend` e `/market/neighborhoods`:
- **Pergunta-alvo:** *"preço médio de imóveis em [Cidade] [Ano]"* → bloco com `currentAvg` + variação 12m (do `monthly[]`) + gráfico + `AggregateRating` (confiança = `count`).
- **People Also Ask:** "melhor bairro para investir em [Cidade]", "alugar ou comprar em [Cidade]", "bairro mais barato de [Cidade]" → alimenta FAQPage + blog.
- Usar anos futuros/atuais ("2026") porque o `price-trend` ancora no mês atual (`now`) — conteúdo sempre "fresco" p/ indexação.

### 5.4 Integração com o chat RAG (`packages/llm`)
- O chat (`/[locale]/chat`) responde via RAG local (TF-IDF) + MiniMax. **AEO loop:** quando o RAG encontra resposta canônica numa página `/c/*`, ele deve (a) citar a fonte (`url`) e (b) a página expor `QAPage` com `acceptedAnswer.url` = fonte — fechando o ciclo confiança.
- Adicionar `SpeakableSpecification` (schema.org `speakable`) nas páginas de resposta para elegibilidade em busca por voz/assistentes.
- `CopywriterAgent` gera o texto das landings; `MarketAnalyzerAgent`/`computeMarketKpis` embutem dados reais (preço/m²) — conteúdo único e defensável contra thin-content.


---

## 6. SEO de Conteúdo Programático

### 6.1 Pipeline de templates (fonte: `market.ts`)
```
seed/properties.json  →  [scripts/build_market_pages.ts]  →  gera rotas estáticas / ISR
        │                                   │
        └─ GET /market/neighborhoods ───────┤→ /c/[cidade]           (Place + ItemList + AggregateRating)
           GET /market/price-trend  ─────────┤→ /c/[cidade] + /c/[cidade]/[bairro]  (QAPage + HowTo + gráfico)
           GET /market/heatmap      ─────────┘→ /c/[cidade]/[bairro]  (Place + GeoCoordinates + TouristAttraction)
                                                    │
                              CopywriterAgent (llm) injeta texto único  →  fallback p/ 404 se sem dados
```
Reusar `data/markdowns/*` (já gerados por `build_markdowns.py`) como corpo de texto das páginas de imóvel.

### 6.2 Matriz de páginas (escala)
`cidades (N) × bairros por cidade (M) × tipos (4) × locales (3)`.
- **Fase 1 (top cities):** SP, Rio, BH, Curitiba, Floripa, Salvador, Recife, Porto Alegre, Brasília, Fortaleza → ~10 cidades × ~12 bairros × 4 tipos × 3 locales ≈ **1.440 páginas**.
- **Fase 2:** todas as cidades de `properties.json` (~70 cidades do QuintoAndar-like) → escala para **10k+ páginas**.
- Regra anti-thin-content: só publicar `/c/[cidade]/[bairro]/[tipo]` se `count ≥ 3` em `/market/neighborhoods`; senão `noindex` + link p/ cidade.

### 6.3 Template de página de cidade/bairro (JSON-LD embutido)
```jsonc
{
  "@context":"https://schema.org", "@type":"Place", "name":"Batel, Curitiba/PR",
  "geo":{"@type":"GeoCoordinates","latitude":-25.44,"longitude":-49.29},
  "aggregateRating":{"@type":"AggregateRating","ratingValue":<avgPrice>, "reviewCount":<count>, "best":<max>,"worst":<min>},
  "containsPlace":[ /* bairros / POIs como TouristAttraction + LocalBusiness */ ]
}
// + BreadcrumbList (Cidade › Bairro › Tipo) + ItemList (imóveis) + QAPage (preço médio 2026) + FAQPage
```

---

## 7. Plano de 90 Dias

### Semanas 1–4 — Fundação (schema + técnico + instrumentação)
- [ ] Criar geradores `AggregateRating`, `LocalBusiness`, `TouristAttraction`, `Residence` em `packages/seo` (isolado).
- [ ] Estender `SCHEMA_TYPES` + `pickSchemaType` p/ cobrir todos os tipos → coverage CLI real.
- [ ] `sitemap.ts` dinâmico (locales + `/c/*`) + corrigir `robots.txt` (domínio `landmap.com.br`).
- [ ] Rotas `/c/*` MVP (cidade + bairro) p/ 10 cidades; wire `Organization`/`WebSite` no root.
- [ ] Instrumentar UTM/cohort (persistência first-touch) + `?ref=` → `POST /referrals/track`.
- **Marco:** coverage CLI sobe de ~46% (6/13) para >80%; sitemap sem bug e com locale.

### Semanas 5–8 — Escala programática + AEO + loop referral live
- [ ] Gerar todas as páginas cidade×bairro×tipo×locale (Fase 1 ≈ 1.440).
- [ ] `FAQPage`/`HowTo`/`QAPage` em toda `/c/*`; Chat RAG citando fontes `/c/*`.
- [ ] Loop referral ao vivo: `referral_signup` → gamificação (+20 LC, badge) → cashback no `closed_won`.
- [ ] Campanha "Indique e Ganhe" (UTM `indique_ganhe`) + badges Sovereign.
- **Marco:** +25% sessões orgânicas; K viral ≥ 0,3; 50 páginas em top-10.

### Semanas 9–12 — Otimizar, backlinks & comunidade
- [ ] Core Web Vitals tuning (LCP/CLS/INP); hreflang validado (Search Console).
- [ ] Link building open-source (GitHub README/Stars, Product Hunt, dev.to/Medium).
- [ ] Análise de cohort D1/D7/D30 por canal; dobrar campanhas de melhor cohort.
- [ ] Fase 2 (todas as cidades) + internal linking automática.
- **Marco:** coverage > 90%; +40% orgânico; K viral ≥ 0,4; top-3 p/ 50 queries "preço médio [cidade]".


---

## 8. Calendário de Conteúdo (12 semanas)

| Sem | Tema | Conteúdo / Ação | Foco SEO/AEO |
|---|---|---|---|
| 1 | Fundação schema | Novos geradores `AggregateRating`/`LocalBusiness`/`TouristAttraction`/`Residence` | expandir `packages/seo` |
| 2 | Técnico | Coverage CLI real + `sitemap.ts` dinâmico + `robots.txt` corrigido | indexação multi-locale |
| 3 | Páginas cidade | Rotas `/c/*` MVP (10 cidades) + `Organization`/`WebSite` no root | `Place`+`BreadcrumbList` |
| 4 | Instrumentação | UTM/cohort first-touch + `?ref=` → `/referrals/track` | atribuição |
| 5 | Programático Fase 1 | Gerar cidade×bairro×tipo (1.440) + `ItemList` | escala de URLs |
| 6 | FAQ/HowTo | Blog "melhor bairro p/ investir em X" + `FAQPage`/`HowTo` | long-tail |
| 7 | Answer Box | `QAPage` "preço médio 2026" + Chat RAG citando `/c/*` | featured snippets |
| 8 | Loop referral | Campanha "Indique e Ganhe" + badge Sovereign ao vivo | K viral |
| 9 | Core Web Vitals | LCP/CLS/INP + hreflang no Search Console | UX/ranking |
| 10 | Backlinks OSS | Launch Product Hunt + README/GitHub Stars push | autoridade |
| 11 | Guest posts | dev.to/Medium "como o LandMap faz SEO programático" | links + tráfego |
| 12 | Escala + revisão | Fase 2 (todas cidades) + internal linking + pulso de métricas | consolidação |

---

## 9. Backlinks & Comunidade Open-Source

- **GitHub:** README com "Por que open-source" + badges de schema coverage (gerado pela coverage CLI) → atrai devs/SEO nerds; pedir Stars em fóruns (Hacker News, r/SEO, r/SideProject).
- **Product Hunt:** launch "LandMap — inteligência imobiliária open-source com IA grátis + cashback" (âncora de autoridade + backlink doph).
- **Guest posts:** dev.to / Medium / iMasters — "SEO programático imobiliário com schema.org + RAG" (link p/ `/c/*` e repo).
- **Parcerias:** 10 imobiliárias (take-rate 2–3% do `00-competitive-strategy.md`) → links de footprint local por cidade (cite o bairro na LP).
- **Reciprocidade:** o `CopywriterAgent` gera MDX reutilizável pela comunidade (template de "guia de bairro") → UGC + links.

---

## 10. Métricas & KPIs

| KPI | Baseline | Alvo 90d | Fonte |
|---|---|---|---|
| Sessões orgânicas | hoje | **+40%** | GA4 / Search Console |
| Schema coverage % (CLI) | ~46% (6/13) | **> 90%** | `pnpm --filter @landmap/seo coverage` no CI |
| Páginas `/c/*` indexadas | 0 | 1.440 (Fase1) → 10k (Fase2) | Search Console Coverage |
| Top-3 "preço médio [cidade]" | 0 | **50 queries** | Search Console Performance |
| K viral (referral) | 0 | **≥ 0,4** | `/referrals/stats` + gamificação |
| Retenção D1/D7/D30 | baseline | **+15pp/+10pp/+8pp** | gamificação cohorts |
| Cashback redemption % | — | **≥ 25%** | `packages/billing` |
| Backlinks / DA | 0 | 50+ links / DA 20+ | Ahrefs/Semrush (ou free: Google Search Console links) |

**Cadência:** pulso semanal no `admin/analytics`; relatório de coverage no PR (CI).

---

## 11. Guardrails / Princípios

- **Nunca editar arquivos centrais.** Estender `packages/seo` (já isolado) e criar rotas/páginas novas (`/c/*`, `analytics.ts`). Billing/gamificação já têm contratos definidos em `00`/`01` — só consumir.
- **Schema válido:** todo JSON-LD deve passar no Rich Results Test antes de subir.
- **Sem cloaking nem thin-content:** só publicar `/c/*` com `count ≥ 3`; texto único via `CopywriterAgent`.
- **Canonical limpo:** `?ref=`/`utm_*` usam `rel=canonical` para a URL base (robots `Disallow: /*?ref=`).
- **Domínio único:** consolidar `landmap.com.br` (corrigir `landmap.app` no robots).
- **Privacidade:** UTMs/cohort sem PII; env vars fora do repo (padrão do projeto).

---

## 12. Próximo Passo Imediato

> Mande *"Implementar `packages/seo`: geradores `AggregateRating`/`LocalBusiness`/`TouristAttraction`/`Residence` + estender `SCHEMA_TYPES`/`coverage CLI`"* que geramos o código isolado no próximo turno. Em seguida: `sitemap.ts` dinâmico + rotas `/c/*`.

<!--WARROOM_APPEND-->

