# Pronto para novas páginas — gate pós Map Standard

## Padrão a seguir
1. `DESIGN.md` §4.1 Map System Standard (híbrido C)
2. `Claude.md` ULTIMATE DESIGN STANDARD
3. Recipe skill `landmap-feature-dev` / `landmap-page-build`

## Checklist por página nova
- [ ] Rota `apps/web/src/app/[locale]/<route>/page.tsx` (`'use client'` se hooks)
- [ ] Tokens só `var(--*)` / utilities semânticas — zero hex de marca
- [ ] `@landmap/ui` + `lovable/icons` + `LandMapWordmark` se header
- [ ] `useLocale` + links `/${locale}...`
- [ ] i18n em `messages/{pt-BR,en-US,es-ES}.json` se copy de produto
- [ ] Nav: `Navbar` marketLinks se pública; **não** lotar MobileBottomNav
- [ ] Se geo/mapa: reutilizar chrome do `/map`, não inventar paleta
- [ ] Gate: `pnpm typecheck && pnpm lint && pnpm build` (web)

## Superfícies de mapa
| Rota | Papel |
|---|---|
| `/map` | Mapa Free terrenos (produto) |
| `/dashboard` | Painel KPI + CTA “Abrir mapa” |

## Não fazer
- Claim “100% Lovable map” sem portar camadas intelligence
- Reintroduzir World 3D / emerald-cyan-gold de marca
- Controles de UI mortos
