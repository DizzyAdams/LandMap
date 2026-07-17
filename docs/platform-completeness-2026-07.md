# Plataforma LandMap — completude (2026-07)

## Design standard
- Tokens indigo Lovable (`globals.css`)
- `ProductPageShell` para páginas de produto
- Mapa intelligence em `/map` (paridade camadas Lovable)

## Superfícies

### Mapa & mercado
map · dashboard · regions · cities · neighborhoods · market · valorization · alerts · portfolio · favorites · compare · kpis · sales · live · studio · calculator · insights

### Planos & auth
plans · pricing · auth · onboarding · home(=onboarding)

### IA
assistant · chat · writer · rag · agents · automations · workflows · pipeline · recommendations · knowledge

### Dev & ops
developers · integrations · status · glossary · resources · leads  
**RAG API-backed** · **Webhooks outbound HMAC** (ver `docs/platform-rag-webhooks-2026-07.md`)

### Admin
admin · analytics · audit · exports · leads · properties · settings · webhooks (server multi-endpoint)

## Shell compartilhado
`apps/web/src/components/ProductPageShell.tsx`

## Dados canônicos de mapa
`apps/web/src/lib/mapIntelligence.ts`
