# LandMap — Ledger de Port Lovable → LandMap

Link de referência (Lovable): **https://landmap-insight.lovable.app**
Padrão obrigatório: `docs/lovable-port-pattern.md`
Design system: tokens `--primary/--card/--border/--muted/--muted-foreground`,
fundo claro/indigo, ícones de `apps/web/src/components/lovable/icons`.
Regra: só o VISUAL — não alterar lógica de fetch/API.

## Telas JÁ no padrão Lovable (não mexer)
- [x] regions   - [x] favorites   - [x] auth   - [x] intro   - [x] plans

## Pendente (portar, page by page)
### Lote 1 — telas simples
- [x] onboarding
- [x] compare
### Lote 2 — dashboard (conteúdo Lovable já extraído)
- [x] dashboard
### Lote 3 — landing
- [x] page.tsx (index)
### Lote 4 — admin suite (VERIFICADO: ja no padrao Lovable, sem artefatos antigos)
- [x] admin/page
- [x] admin/analytics
- [x] admin/audit
- [x] admin/exports
- [x] admin/leads
- [x] admin/properties
- [x] admin/settings
- [x] admin/webhooks
### Lote 5 — resto do app (aplicar design system) — CONCLUIDO
- [x] insights
- [x] search (+ Filters)
- [x] calculator
- [x] alerts (+ error/loading)
- [x] sales
- [x] pricing
- [x] studio
- [x] chat (+ error/loading)
- [x] docs (+ embedding)
- [x] map (+ error/loading)
- [x] status
- [x] offline
- [x] world
- [x] terrenos
- [x] live
- [x] v2
- [x] property/[id] (+ ai-insights/gallery/price-history/share-button/error/loading)
- [x] error.tsx / not-found.tsx / loading.tsx (raiz do [locale])
- [x] compare/error + compare/loading (telas ja portadas, auxiliares pendentes)
- [x] favorites/error + favorites/loading
- [x] admin/settings + admin/webhooks (detalhes finos)
- [x] layout.tsx (skip-link) / page.tsx (landing ledger-num)

Obs: verde/cyan SEMANTICO preservado (forca de senha, status de pipeline/CRM,
alta/baixa de preco, heatmap do mapa). Script de portagem: scripts_port/port_lote5.py.

## Validação por lote
pnpm -F @landmap/web typecheck ; pnpm -F @landmap/web lint ; commit por lote.
