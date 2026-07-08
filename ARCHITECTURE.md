# LandMap - Arquitetura Técnica

## Visão Geral
Monorepo pnpm + Next.js + Hono API para inteligência imobiliária com 1.500 markdowns estruturados, API aberta e suporte multilíngue.

## Stack
- Frontend: Next.js 14 + TypeScript + Tailwind v4 + next-intl
- API: Hono + Zod
- Pacotes: @landmap/ui, @landmap/config, @landmap/db, @landmap/api
- Dados: 1.500 markdowns estruturados em `data/markdowns`

## Diretórios
- apps/web: Frontend Next.js
- apps/docs: Documentação/Storybook
- packages/ui: Design system tokens + componentes
- packages/config: Configs compartilhadas + i18n/constants
- packages/db: Schemas e tipos
- packages/api: API REST em Hono
- scripts: Build markdowns
- data/markdowns: 1.500 datasets estruturados (10 categorias)

## Features
- i18n: pt-BR, en-US, es-ES
- API endpoints: /health, /markdowns, /search
- Open: MIT + CONTRIBUTING.md + CI
