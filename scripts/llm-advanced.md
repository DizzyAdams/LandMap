# LandMap — Advanced LLM Features (LangChain + LangGraph + Vector Store)

## Prerequisites

Set the OpenRouter API key:

```bash
export LANDMAP_LLM_KEY="sk-or-v1-..."
# Windows (PowerShell)
$env:LANDMAP_LLM_KEY = "sk-or-v1-..."
```

---

## 1. LangChain — RetrievalQAChain

The `retrievalQaChain` function answers questions based on provided context chunks using LangChain's `ChatOpenAI` model routed through OpenRouter.

### Usage

```typescript
import { retrievalQaChain } from '@landmap/llm';

const answer = await retrievalQaChain(
  'What apartments are available in São Paulo?',
  [
    'Apartamento 2 quartos, 70m², R$ 350.000, Moema, SP',
    'Casa 3 quartos, 120m², R$ 580.000, Vila Mariana, SP',
  ],
);

console.log(answer);
```

There's also a `documentQaChain` that accepts LangChain `Document[]`:

```typescript
import { documentQaChain } from '@landmap/llm';
import { Document } from '@langchain/core/documents';

const docs = [
  new Document({ pageContent: '...', metadata: { city: 'São Paulo' } }),
];

const answer = await documentQaChain('Find houses in SP', docs);
```

---

## 2. LangGraph — Property Matching Workflow

The `propertyMatchingGraph` is a 4-step state machine:

1. **analyzeIntent** — Classifies the user query as "search", "filter", or "general"
2. **retrieveProperties** — TF-IDF retrieval of top 10 relevant properties
3. **scoreCandidates** — Composite scoring (60% semantic + 40% price heuristics)
4. **generateResponse** — LLM generates a friendly recommendation

### Usage

```typescript
import { runPropertyMatchingGraph } from '@landmap/llm';

const result = await runPropertyMatchingGraph({
  query: 'apartamento 2 quartos em são paulo até 400 mil',
  properties: [
    { id: '1', title: 'Apartamento Vila Mariana', city: 'São Paulo', state: 'SP', price: 380000, type: 'apartamento' },
    { id: '2', title: 'Casa com piscina', city: 'São Paulo', state: 'SP', price: 750000, type: 'casa' },
    // ...
  ],
});

console.log(result.answer);
console.log(result.matches);
```

You can also access the compiled graph directly:

```typescript
import { propertyMatchingGraph } from '@landmap/llm';

const state = await propertyMatchingGraph.invoke({
  query: '...',
  properties: [...],
});
```

---

## 3. SimpleVectorStore — TF-IDF Vector Store

A lightweight vector store using TF-IDF (cosine similarity) with LangChain's `Document` interface.

### Usage

```typescript
import { SimpleVectorStore } from '@landmap/llm';
import { Document } from '@langchain/core/documents';

const store = new SimpleVectorStore();

store.addDocuments([
  new Document({
    id: 'apt-1',
    pageContent: 'Apartamento 2 quartos, 70m², R$ 350.000 em Moema, SP',
    metadata: { city: 'São Paulo', type: 'apartamento' },
  }),
  new Document({
    id: 'house-1',
    pageContent: 'Casa 3 quartos, 120m², R$ 580.000 em Campinas, SP',
    metadata: { city: 'Campinas', type: 'casa' },
  }),
]);

const results = store.similaritySearch('apartamento em SP', 3);
console.log(results[0].document.pageContent); // Most relevant document
console.log(results[0].score);                // Cosine similarity score
```

---

## Architecture Notes

All LangChain/LangGraph calls use **OpenRouter** (`https://openrouter.ai/api/v1`) as the base URL with the model `openai/gpt-4o-mini`. The API key is read from the `LANDMAP_LLM_KEY` environment variable (the same one used elsewhere in the project).

### File Structure

```
packages/llm/src/
├── langchain/
│   └── chain.ts              # RetrievalQAChain, DocumentQaChain
├── langgraph/
│   └── workflow.ts           # Property matching StateGraph
├── vector-store.ts           # SimpleVectorStore (TF-IDF)
├── rag.ts                    # Existing TF-IDF RAG (unchanged)
├── completion.ts             # Existing OpenRouter client (unchanged)
├── agents/                   # Existing agents (unchanged)
├── types.ts                  # Shared types
└── index.ts                  # Main exports
```
