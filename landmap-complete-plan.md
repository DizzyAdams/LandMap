# LandMap — Plano Surreal / Y Combinator ambition

## Goal
Transformar o LandMap em uma plataforma de inteligência imobiliária e growth operado por agentes: descoberta de imóveis, CRM open source (Twenty), automações, SEO, mapa mundi, RAG local e orquestração multi-agente — tudo com viés de monetização e escala.

## Strategic pillars
1. Produto: web app real com busca avançada, imóvel, mapa, favoritos, comparação.
2. Dados: ingestão automatizada, normalização, schema.org granulado, RAG local.
3. Growth: CRM Twenty-first, pipeline de captação, cold outreach, lead scoring.
4. Automação: n8n + agentes + scripts para operação contínua.
5. Infra: CI, e2e, bundle budgets, cache,的边缘部署 estável.

## Sprint A — Core product shell
- [ ] Home imersiva em `apps/web/app/page.tsx` com hero, filtros, CTA, mapa mini.
- [ ] Search SERP em `apps/web/app/search/page.tsx` com filtros facetados e ordenação.
- [ ] Property page em `apps/web/app/property/[id]/page.tsx` com JSON-LD, galeria, similaridade.
- [ ] Mapa mundi interativo em `apps/web/app/map/page.tsx` com cluster, filtros e geocodificação.
- [ ] UI system: `packages/ui` com Button, Input, Select, Sheet, Modal, Skeleton, EmptyState.
- [ ] Tokens: `packages/config` com design tokens e theming dark premium.

Verify: `pnpm -r build` e `pnpm -r lint` verdes; `/`, `/search`, `/property/1`, `/map` geram no build.

## Sprint B — Dados e SEO arquitetura
- [ ] `packages/seo`: schema.org generator + coverage CLI por rota + sitemap dinâmico.
- [ ] `packages/llm`: pipeline local com chunking, embeddings locais, RAG leve, rerank simples.
- [ ] `packages/api`: rotas `/llm/analyze`, `/leads`, `/campaigns`, `/export`, `/analytics`, rate limit.
- [ ] Scripts: `scripts/build_markdowns.py`, `scripts/seed_properties.py`, `scripts/seed_leads.py`.

Verify: `pnpm --filter @landmap/seo build` e `pnpm test --filter @landmap/seo` passam; API responde `/llm/analyze`.

## Sprint C — CRM Twenty + Growth
- [ ] Integração Twenty-first: `packages/twenty` com client REST, person, lead, note, opportunity.
- [x] Client Twenty-first estrutural implementado em `packages/twenty/src/client.ts` exportando tipos e classes.
- [x] Scripts de seed/sync: `scripts/seed_twenty.py` e `scripts/twenty_sync.py`.
- [x] Growth loops: landing pages parametrizadas, UTM tracking schema, cohort analytics.
- [x] Outreach: modelo de cold email personalizado, follow-up sequences, templates por modalidade.
- [x] CRM webhooks: sincronização bidirecional Twenty ↔ API.

Verify: `pnpm -r build` e `pnpm -r lint` cobrem packages/twenty; seed rodável com TWENTY_API_KEY.

## Sprint C — CRM Twenty verification checklist
- [ ] `pnpm --filter @landmap/twenty build` OK.
- [ ] `pnpm --filter @landmap/twenty lint` OK.
- [ ] `pnpm --filter @landmap/twenty test` OK.
- [ ] `scripts/seed_twenty.py` cria person/lead/opportunity/note no Twenty.
- [ ] `scripts/twenty_sync.py` exporta opportunities para CSV/JSON local.
- [ ] Pipeline stages aceitos: captured, contacted, qualified, scheduled, closed_won, closed_lost.
- [ ] Nenhuma credencial commitada; env vars documentadas em `packages/twenty/README.md` e `scripts/HOWTO_TWENTY.md`.

## Sprint D — Automação e Observabilidade
- [ ] n8n workflows: ingest, enrichment, summarize, notify, sync-Twenty.
- [ ] Testes: unitários em `packages/seo`, `packages/llm`, `packages/api`, e2e em `apps/web`.
- [ ] CI: GitHub Actions com Typecheck, Lint, Build, Test, BundleBudgets, Playwright.
- [ ] Observabilidade: request logging, metrics, alertas para pipeline de dados.
- [ ] Performance: image next/optimized font, caching, CDN hints, prefetch por intenção.

Verify: CI verde completo; n8n importa workflows sem erro.

## Sprint E — Features surreais
- [ ] Comparador de imóveis com diff, favoritos e share.
- [ ] Favoritos persistidos localmente + sync após login.
- [ ] Alertas de imóvel por filtro com e-mail/app onde couber.
- [ ] Mapa mundi com 3D/surreal style: Deck.gl + custom shader minimal.
- [ ] Agentes locais: `LeadScorerAgent`, `PropertyMatcherAgent`, `CopywriterAgent`.
- [ ] RAG com Q&A por chat no app consumindo `packages/llm`.
- [ ] AEO local: marcação Answer Box, FAQPage, HowTo, VideoObject.

Verify: bundle main < 200KB; resposta LLM < 1s local; coverage schema > 90%.

## Done When
- `pnpm -r build` OK
- `pnpm -r lint` OK
- `pnpm -r typecheck` OK
- `pnpm test` OK
- Appsweb com Home/Search/Property/Mapa/Compare/LeadScore funcionando
- Pacotes `seo`, `llm`, `api`, `twenty` existem e conectam entre si
- Twenty sincroniza leads e oportunidades
- n8n workflows importáveis e testáveis
- CI green e métricas de bundle/schema coverage geradas

## Notes
- Manter design mono dark premium.
- Privacidade primeiro; sem credenciais no repo.
- Usar `.mjs` para configs Next/Hono quando necessário.
- Preferir open-source/local-first.
