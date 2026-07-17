# RAG + Webhooks — contrato da plataforma (2026-07)

## RAG

| Endpoint | Descrição |
|---|---|
| `POST /rag/query` | `{ query }` → `{ ok, answer, sources[], usedMock, generatedAt }` |
| `GET /rag/status` | `{ chunks, documents, dirs, mode }` |
| `POST /rag/retrieve` | Só retrieval (sem LLM) |

**Corpus:** docs builtin (Score, heatmap, webhooks, Fortaleza) + até `LANDMAP_RAG_MAX_DOCS` (default 120) de `data/markdowns/` + `data/landmap/` se existir.

**UI:** `/rag`, `/chat` (híbrido mapa + RAG).

**Evento outbound:** após query bem-sucedida emite `rag.query` para webhooks inscritos.

## Webhooks outbound

| Endpoint | Descrição |
|---|---|
| `GET /webhooks/events` | Catálogo + sample |
| `GET/POST /webhooks/endpoints` | Listar / criar |
| `PATCH/DELETE /webhooks/endpoints/:id` | Atualizar / remover |
| `POST /webhooks/endpoints/:id/test` | Ping assinado |
| `GET /webhooks/deliveries` | Log (últimas 100) |
| `POST /webhooks/emit` | Emitir evento (dev/demo) |

### Payload

```json
{
  "id": "evt_…",
  "type": "rag.query",
  "createdAt": "ISO",
  "data": {}
}
```

### Headers

- `X-LandMap-Event`
- `X-LandMap-Delivery`
- `X-LandMap-Signature: sha256=<hmac_hex>` — HMAC-SHA256 do **raw body** com o `secret` do endpoint

### Eventos

`property.created|updated|deleted`, `lead.created|updated`, `alert.fired`, `rag.query`, `score.updated`, `favorite.added`, `ping`

### URL rules

- `https://` sempre
- `http://localhost` / `127.0.0.1` em dev

### UI

- Admin: `/admin/webhooks` (multi-endpoint, secret 1×, test, deliveries)
- Docs: `/developers`
- Hub: `/integrations` (card Outbound Webhooks)

## Design

Mesmo system-design Lovable indigo (`DESIGN.md`).
