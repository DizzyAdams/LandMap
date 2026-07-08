# LandMap

Plataforma de inteligência imobiliária open-source — API REST, busca inteligente, mapa interativo, RAG local, schema.org e integração com CRM Twenty.

## Stack

- **Front**: Next.js 14 + TypeScript + Tailwind v4 + next-intl (pt-BR, en-US, es-ES)
- **API**: Hono + Zod (REST)
- **Packages**: `@landmap/ui`, `@landmap/config`, `@landmap/db`, `@landmap/llm`, `@landmap/seo`, `@landmap/twenty`
- **LLM**: RAG local (TF-IDF) + OpenRouter API + **MiniMax grátis via Puter.js** (client-side, sem API key)
- **CRM**: Twenty REST client
- **SEO**: Schema.org generators + coverage CLI

## Estrutura

```
LandMap/
  apps/
    web          -> Next.js consumer app (rotas: /, /search, /property/[id], /map, /compare, /favorites, /alerts, /chat)
    docs         -> Storybook / Style Guide
  packages/
    ui           -> Design system (Button, Card, Badge, Input)
    db           -> Schemas + tipos (Property, PriceHistory)
    llm          -> Pipeline RAG + chatCompletion via OpenRouter + agents
    config       -> Config compartilhada, env vars, i18n
    api          -> API REST Hono (cidades, stats, CRUD imóveis, compare, analyze)
    seo          -> Schema.org generators + coverage CLI + AEO
    twenty       -> Twenty CRM client (people, leads, opportunities, notes)
  scripts/       -> Geradores, seeds, build markdowns
  .n8n/          -> Workflows de automação (ingest, sync)
```

## Features

- **Busca inteligente**: filtros por tipo, modalidade, cidade, estado
- **Mapa interativo**: Leaflet com pins, filtro por cidade
- **Comparador de imóveis**: diff de preço, área, quartos
- **Favoritos**: persistência local com localStorage
- **Alertas**: filtros salvos com notificação
- **Chat RAG**: Q&A com LLM sobre imóveis — **100% grátis** via MiniMax (Puter.js, modelo User-Pays, sem chave de API)
- **Free AI**: seletor de 11 modelos MiniMax (M3, M2.7, M2.5, M2.1, M2-her, M2, M1, 01) com streaming client-side
- **UI premium**: animações GSAP (reveal/stagger/scroll-progress), design system dark com glow emerald e glass navbar
- **API REST**: CRUD properties, /cities, /stats, /compare, /analyze
- **SEO**: schema.org (PropertyListing, FAQ, HowTo, Video, Organization, WebSite, BreadcrumbList, ItemList)
- **CRM**: Twenty integration com lead scoring e bulk import

## Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| GET | `/markdowns` | Lista imóveis com filtros |
| POST | `/search` | Busca avançada |
| POST | `/analyze` | Análise com LLM |
| GET | `/favorites?ids=1,2` | Imóveis por IDs |
| GET | `/compare?ids=1,2` | Comparação de imóveis |
| GET | `/cities` | Agregação por cidade |
| GET | `/stats` | Estatísticas gerais |
| POST | `/properties` | Criar imóvel |
| PUT | `/properties/:id` | Atualizar imóvel |
| DELETE | `/properties/:id` | Soft delete |

## Dev quickstart

```bash
pnpm install
pnpm -F @landmap/ui build
pnpm dev          # Next.js em localhost:3000
pnpm dev:api      # API Hono em localhost:4000
pnpm test         # 20+ testes
pnpm -r build     # Build completo
```

## Licença

MIT — aberto para contribuições.
