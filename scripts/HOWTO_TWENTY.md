# Twenty-first local how-to

## Pré-requisito
- Twenty rodando localmente/aberto com REST API ativada.
- Variáveis de ambiente configuradas:
  - `TWENTY_BASE_URL` — exemplo: `http://localhost:3000`
  - `TWENTY_API_KEY` — chave do Twenty

Cenário sem deploy do Twenty executado aqui: este diretório é só a estrutura.

## Seed
```bash
pnpm exec python scripts/seed_twenty.py
```

## Sync para arquivos locais
```bash
pnpm exec python scripts/twenty_sync.py
```

Exporta em `scripts/seed/twenty_opportunities.{csv,json}` por padrão.

## Notas
- Para integração profunda, ajuste `packages/twenty/src/client.ts` quando o schema do Twenty mudar.
- Não suba credenciais para o repositório.
