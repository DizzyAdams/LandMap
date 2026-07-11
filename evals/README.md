# LandMap · Avaliação (LangSmith)

Infraestrutura de avaliação para validar o comportamento de IA/engines da LandMap
antes de cada deploy. **Robusta e sem dependências**: o uploader e o runner usam
apenas `fetch` nativo do Node (18+) e a REST API do LangSmith — basta a API key.

## Estrutura

```
evals/
  datasets/
    valuation.json         # numérico — /value/realtime (a dor que resolvemos)
    rag.json               # retrieval Q&A sobre o corpus data/landmap/*.md
    sales-trajectory.json  # sequência do esquadrão de 6 agentes de vendas
    final-response.json    # Q&A ponta-a-ponta sobre catálogo/mercado
  upload.mjs               # uploader idempotente p/ LangSmith (REST API)
  run-valuation.mjs        # runner local: checa preço dentro da banda (gate)
  README.md
```

Cada dataset é um **manifesto**: `{ name, description, data_type, examples[] }`,
e cada exemplo tem `inputs`, `outputs` e (opcional) `metadata`.

## Pré-requisitos (setar no domingo)

```bash
export LANGSMITH_API_KEY=lsv2_pt_...      # obrigatório p/ upload
export LANGSMITH_PROJECT=landmapprod      # projeto com os traces
# opcional: export LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

## Fluxo de deploy de domingo

```bash
# 1. Gate rápido e sem custo: valida o engine deployado (ou local)
node evals/run-valuation.mjs                       # usa produção (landmap.us.kg)
EVAL_API_BASE=http://localhost:3000 node evals/run-valuation.mjs   # local

# 2. Validar manifestos (dry-run, não sobe nada)
node evals/upload.mjs --dry-run

# 3. Subir/atualizar datasets no LangSmith (idempotente)
node evals/upload.mjs                               # cria os que faltam
node evals/upload.mjs --replace                     # recria do zero
node evals/upload.mjs --only valuation             # apenas um dataset

# 4. Conferir (se a CLI estiver instalada)
langsmith dataset list --api-key $LANGSMITH_API_KEY
```

Ou via scripts npm (raiz):

```bash
pnpm evals:valuation      # gate local do valuation
pnpm evals:upload:dry     # dry-run dos manifestos
pnpm evals:upload         # upload idempotente
```

## Como estender

1. Adicione/edite um arquivo em `datasets/` seguindo o formato de manifesto.
2. Rode `node evals/upload.mjs --dry-run` para validar.
3. Suba com `node evals/upload.mjs`.

### Tipos de dataset (LangSmith `data_type`)

- `kv` (usado aqui) — inputs/outputs chave-valor estruturados.
- `llm` / `chat` — para prompts/conversas puras.

### Ideias de evaluators (LangSmith UI ou SDK)

- **valuation**: numérico — `expectedMin ≤ predictedPrice ≤ expectedMax`.
- **rag**: cobertura de `expected_topics` na resposta + `cited_sources_min`.
- **sales-trajectory**: igualdade ordenada de `expected_trajectory`.
- **final-response**: similaridade semântica / LLM-as-judge vs `response`.

## Notas

- O `run-valuation.mjs` sai com código ≠ 0 se algum preço cair fora da banda —
  ideal como **gate de CI** antes do deploy.
- As bandas do `valuation.json` são derivadas do prior calibrado `numpy-ts`
  (mesma matemática do `landmap-serving`), com tolerância de ~±3%.
- O refinador PyTorch (`python -m landmap_serving.train_refiner`) melhora o
  serviço Python; este dataset valida o engine `numpy-ts` que o Vercel serve.
