# Lovable parity recheck — 2026-07-17

Referência: `landmap-insight.lovable.app` · Standard: `DESIGN.md` §4 (indigo, DM Sans + Space Grotesk).

## Checklist rotas canônicas

| Rota | Shell / tokens | Notas | Status |
|---|---|---|---|
| `/` | home/onboarding chrome | free access mock | **PASS** |
| `/regions` | lista + tokens | RequireAuth free | **PASS** |
| `/favorites` | favoritos | localStorage | **PASS** |
| `/compare` | comparador | | **PASS** |
| `/plans` | planos | | **PASS** |
| `/auth` | mock Google | | **PASS** |
| `/onboarding` | steps | | **PASS** |
| `/admin` + sub | superset admin | webhooks agora server-side | **PASS** |
| `/map` | Map Intelligence Opção A | Leaflet ≠ Google Maps (engine only) | **PASS** (UX) |
| `/dashboard` | KPI + CTA mapa | | **PASS** |
| `/search` | search ported | | **PASS** |

## Superset LandMap (fora do Lovable — mesmo design system)

RAG, chat, developers, integrations, webhooks outbound, market pages, etc.  
**Não são FAIL de paridade** — Lovable = standard de UI, não teto de features.

## Regras bloqueadas

1. Tokens só `globals.css`
2. Fontes DM Sans + Space Grotesk
3. `@landmap/ui` + ProductPageShell em produto
4. Zero hex de marca fora de tokens
5. Auth free via RequireAuth
