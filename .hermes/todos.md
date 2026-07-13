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
### Lote 4 — admin suite
- [ ] admin/page
- [ ] admin/analytics
- [ ] admin/audit
- [ ] admin/exports
- [ ] admin/leads
- [ ] admin/properties
- [ ] admin/settings
- [ ] admin/webhooks
### Lote 5 — resto do app (aplicar design system)
- [ ] search (+ Filters)
- [ ] calculator
- [ ] alerts
- [ ] sales
- [ ] insights
- [ ] pricing
- [ ] studio
- [ ] chat
- [ ] docs (+ embedding)
- [ ] map
- [ ] status
- [ ] offline
- [ ] world
- [ ] terrenos
- [ ] live
- [ ] v2
- [ ] property/[id] (+ sub-componentes)

## Validação por lote
pnpm -F @landmap/web typecheck ; pnpm -F @landmap/web lint ; commit por lote.
