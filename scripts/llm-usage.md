# Dependências Python / Scripts

## @landmap/llm (workspace)

O pacote `packages/llm` (`@landmap/llm`) contém os agentes de inteligência
artificial do LandMap: `LeadScorerAgent` e `PropertyMatcherAgent`.

### Como usar no código

```typescript
import { LeadScorerAgent, PropertyMatcherAgent } from '@landmap/llm';
```

O web app (`apps/web`) acessa `@landmap/llm` via os paths do tsconfig
(monorepo workspaces pnpm). Não é necessário instalar nada extra.

### Dependências

- O pacote LLM é 100% TypeScript — sem dependências Python.
- Apenas `typescript` como devDependency.

### Scripts disponíveis

```bash
pnpm --filter @landmap/llm build    # Compilar TS → dist/
pnpm --filter @landmap/llm typecheck # Type-check sem emitir
```
