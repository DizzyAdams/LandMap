# Auditoria de Design — LandMap (Surreal Intelligence 4.0)

_Auditoria da camada visual/UX do `apps/web`, feita sobre `globals.css`, o design
system (`@landmap/ui`), `Navbar` e as páginas de mercado (`/terrenos`, `/insights`,
`/map`)._

## ✅ Pontos fortes (manter)

- **Design tokens coesos** em `globals.css`: canvas (`--bg`, `--surface-1..3`),
  linhas, texto, marca bioluminescente (emerald/cyan/violet) + acento _sovereign
  gold_, raios e **glows assinatura** (`--glow-emerald`, `--glow-dual`,
  `--glow-sovereign`). Vocabulário reutilizável: `.surface`, `.chip`, `.kicker`,
  `.btn/.btn-primary/.btn-ghost`, `.text-gradient`, `.cta-glow`, `.pulse-live`.
- **Acessibilidade sólida** na navegação: `aria-current`, `focus-visible` ring
  consistente (`focusRing`), menu mobile com `aria-expanded/aria-controls` e
  fechamento por `Escape`. Inputs com `aria-label` (slider do `RealtimeValuator`,
  busca de cidade).
- **Motion responsável**: toda animação ambiente é neutralizada em
  `@media (prefers-reduced-motion: reduce)` (mesh-bg, orbs, bloom, magnetic,
  aurora, text-surreal).
- **Tipografia de dados**: `JetBrains Mono` / `.ledger-num` + `tabular-nums` nas
  superfícies numéricas (KPIs, preços) — legibilidade financeira.

## ⚠️ Achados & recomendações

1. **Fetch inconsistente** — `insights/page.tsx` usa `fetch(API_BASE...)` cru,
   enquanto `terrenos/page.tsx` usa os helpers compartilhados `apiFetch/apiUrl`
   de `lib/api.ts`. Padronizar em `lib/api.ts` (fonte única, resolve SSR/origem).
   _Sev: média · manutenção._
2. **Listas de cidades divergentes** — `CITIES` difere entre `insights`
   (Belo Horizonte…) e `terrenos` (Joinville, Balneário Camboriú…). Extrair para
   `lib/constants.ts` (`FEATURED_CITIES`) e reusar. _Sev: baixa._
3. **Sobreposição conceitual `/insights` × `/terrenos`** — ambos são dashboards
   de mercado. Recomendo cross-link explícito e, futuramente, agrupar navegação.
   _Sev: baixa · IA/UX._
4. **Densidade da navbar** — 11 links no topo. Agrupar mercado (`Terrenos`,
   `Mapa`, `Insights`) sob um item "Mercado" reduz carga cognitiva em telas
   médias. _Sev: baixa._
5. **`ScoreRing` com sobreposição por margem negativa** (`-mt-14`/`mt-6`) —
   funciona, mas é frágil a mudanças de fonte. Preferir centralizar o número com
   posição absoluta dentro do `svg`. _Sev: baixa · robustez._
6. **`RealtimeValuator`** — usa `.surface/.chip/.btn` corretamente e traz selo de
   latência (µs/ms) com `pulse-live`; ótima consistência. Sugestão: expor também
   o tipo "engine" com tooltip explicando `numpy-ts` (prior) vs `torch` (refinado).

## 🎯 Veredito

Sistema visual **maduro e consistente** (dark bioluminescente + gold sovereign),
acessível e reduced-motion aware. Dívidas são pequenas e de manutenção — nenhuma
bloqueia deploy. Prioridade sugerida: (1) padronizar fetch, (2) unificar
`FEATURED_CITIES`.
