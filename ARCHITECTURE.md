# LandMap - Arquitetura Técnica

> Design/UI source of truth: see **`DESIGN.md`** (LandMap = fiel clone do Lovable
> `landmap-insight.lovable.app`; tokens indigo Lovable, fontes DM Sans + Space Grotesk +
> JetBrains Mono). Este arquivo é a visão técnica resumida e deve estar em sincronia com `DESIGN.md`.

## Visão Geral
Monorepo pnpm + Next.js 14 (App Router) + Hono API para inteligência imobiliária, com
dataset de markdowns estruturados, API aberta e suporte multilíngue (pt-BR/en-US/es-ES).
O frontend é uma porta fiel do app Lovable (design system indigo, mesmas rotas/worfklow).

## Stack
- Frontend: Next.js 14 + TypeScript + Tailwind v4 (pipeline ativo via `@tailwindcss/postcss`) + next-intl
- API: Hono + Zod
- Pacotes: @landmap/ui, @landmap/config, @landmap/db, @landmap/api, @landmap/llm, @landmap/sales, @landmap/scraper, @landmap/seo, @landmap/twenty, @landmap/geo, @landmap/integrations, @landmap/invest, @landmap/gamification
- Dados: markdowns estruturados em `data/markdowns`

## Diretórios
- apps/web: Frontend Next.js (`src/app/[locale]`)
- apps/docs: Documentação/Storybook
- packages/ui: Design system tokens + componentes (build `tsup`, exporta `./styles.css` + `tokens.ts`)
- packages/config: Configs compartilhadas + i18n/constants
- packages/db: Schemas e tipos
- packages/api: API REST em Hono
- scripts: Build markdowns / extração de referência Lovable (`reference/`)
- data/markdowns: datasets estruturados

## Rotas (port Lovable → Next.js)
Cobertura 1:1 do Lovable (`/`, `/regions`, `/favorites`, `/compare`, `/dashboard`,
`/admin`+sub, `/plans`, `/auth`, `/map`, `/onboarding`) + telas LandMap-únicas
(`world`, `live`, `studio`, `calculator`, `chat`, `status`, `terrenos`, `property`,
`insights`, `sales`, `search-results`). **Gap conhecido:** `/search` (existe no Lovable,
falta no local) — ver `DESIGN.md` §4.

## Features
- i18n: pt-BR, en-US, es-ES (next-intl; mensagens em `apps/web/messages/`)
- API endpoints: /health, /markdowns, /search, /integrations (OpenDesign + WABA + CRIE + ViaCEP + IBGE + Leilão + Câmbio + CNPJ + Bacen + Geo + Twenty + registry)
- Design tokens centralizados em `apps/web/src/app/globals.css` (`:root`/`.dark` + `@theme`)
- Open: MIT + CONTRIBUTING.md + CI

## Comandos (raiz)
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` (vitest) ·
`pnpm dev:api` · `pnpm docs` (Storybook) · `pnpm db:migrate|seed|generate` ·
`pnpm markdown:build`. Verificação de paridade Lovable: `python compare_lovable.py`,
`python validate_real.py` (em `apps/web/public` estão os snapshots de referência).
