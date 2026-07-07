# LandMap

Plataforma de inteligência de dados para_real estate. Gera 1700+ arquivos markdown estruturados para modelo funcionar com precisão.

## Stack
- **Front**: Next.js + TypeScript + Tailwind v4
- **Design System**: packages/ui
- **DB**: packages/db (ORM schema)
- **LLM/pipeline**: packages/llm
- **Config**: packages/config
- **Docs**: apps/docs
- **Web App**: apps/web

## Estrutura
```
LandMap/
  apps/
    web          -> Next.js consumer app
    docs         -> Storybook / Style Guide
  packages/
    ui           -> Design system
    db           -> Schema + migrations
    llm          -> Pipeline markdown + LLM
    config       -> Shared config, env schemas
  scripts/       -> Geradores, migrations, seeds
  docs/          -> ADRs, arquitetura, runbooks
```

## Dev quickstart
```bash
pnpm install
pnpm -F ui build
pnpm dev
```
