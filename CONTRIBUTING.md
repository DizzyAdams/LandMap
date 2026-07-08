# Contributing to LandMap

## Código de Conduta
Seja respeitoso. Sem assédio, sem discriminação.

## Como Contribuir
1. Fork e clone o repositório.
2. Crie uma branch: `git checkout -b feature/nome-da-feature`.
3. Instale dependências: `pnpm install`.
4. Rode os checks: `pnpm lint && pnpm typecheck`.
5. Commit: `pnpm commit` (Conventional Commits).
6. Push e abra um PR.

## Estrutura
- `apps/web` - Next.js + design system
- `packages/ui` - Tokens, componentes, libs
- `packages/db` - Schemas e tipos
- `packages/api` - API REST
- `packages/config` - Configs compartilhadas
- `data/markdowns` - 1.500 datasets estruturados

## Convenções
- TypeScript strict mode
- Tailwind CSS v4 + CSS variables
- useKSD `cn()` para classes condicionais
- Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`

## Issues
Abra issues para bugs, features ou questões de design.
