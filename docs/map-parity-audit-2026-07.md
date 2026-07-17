# Auditoria do Mapa — LandMap vs Lovable (2026-07-17)

> **Decisão de produto:** **Híbrido (C)** — design system / chrome 100% Lovable indigo; canvas e produto **Free Terrenos + grade investidor** são extras LandMap documentados.  
> **Escopo:** `/map` (produto) + `/dashboard` (painel; Lovable intitula “Mapa — LandMap”).  
> **Fontes:** `map/page.tsx`, `dashboard/page.tsx`, `scripts/_lovable_pull/reference_public/lovable_chunk_dashboard.js`, `scripts/parity_data.json`, prod `landmapprod.vercel.app/pt-BR/map`, shell Lovable `lovable_map.html`.

---

## 1. Veredito executivo

| Critério | Resultado |
|---|---|
| **“Mapa 100% igual ao Lovable (UI de camadas / intelligence)”** | **FAIL** |
| **“Chrome / tokens / tipografia Lovable no mapa Free”** | **PASS** (com ressalvas P1) |
| **Metodologia antiga de parity (`parity_data` sem auth)** | **INVÁLIDA** para UI do mapa |
| **Padrão híbrido (C) viável como system design** | **PASS** — documentado em `DESIGN.md` § Map System Standard |

**Resumo em uma frase:** o LandMap **não clona** o mapa de camadas do Lovable; implementa um **mapa Free de terrenos** com o **mesmo design system** (indigo, DM Sans, Space Grotesk, `@landmap/ui`). Claims de “`/map` · 100% equal” no DESIGN.md eram **enganosos**.

---

## 2. Metodologia (o que foi comparado)

1. **Shell HTML Lovable** `lovable_map.html` — só metadata + Leaflet CSS; body SPA vazio; `/map` anônimo → auth no parity histórico.
2. **Bundle Lovable** `lovable_chunk_dashboard.js` — superfície real “Mapa / inteligência territorial” (camadas, heatmap scale, tops, score).
3. **Source LandMap** `apps/web/src/app/[locale]/map/page.tsx` + `dashboard/page.tsx`.
4. **Snapshot antigo prod** em `parity_data.json` (`/map` = “Mapa mundial” multi-tipo) vs **prod atual** (“Mapa de terrenos”).
5. **Tokens:** grep hex / emerald-cyan-gold no mapa e dashboard.

Artefatos: `scripts/_shots/map_audit/lovable_dashboard_ui.json`, `lovable_layers.txt`.

---

## 3. Duas superfícies (não confundir)

### A) Lovable — Map Intelligence (dashboard chunk)

| Elemento | Presente no Lovable |
|---|---|
| Busca | “Buscar bairro, cidade, CEP ou zoneamento.” |
| Camadas | Valorização m², Velocidade de crescimento, Infraestrutura, Segurança, Densidade, IDH, PIB, População, Renda média, Mobilidade, Liquidez, Zoneamento, Risco ambiental/enchente, Score LandMap… |
| Heatmap | Toggle + “Escala do heatmap” |
| Rankings | “Top valorização (12m)”, “Top oportunidades” |
| Painéis | “Camadas de inteligência”, “Composição por camada”, destaques, timeline de obras |
| Score | “Score LandMap”, `layerScores` por região |
| Erro | “Falha ao carregar o mapa” |

### B) LandMap — Free Terrains Map (`/map`)

| Elemento | Presente no LandMap |
|---|---|
| Header | Wordmark + “Free · terrenos” (mobile) |
| H1 | **Mapa de terrenos** |
| KPIs | Preço médio/m², Terrenos, Valorização YoY, Confiança 94% + sparkline |
| Busca | “Buscar cidade…” + autocomplete geo |
| Filtros | Raio (agora com centro), preço min/max, chip Terrenos Free, grade A–F, score min, heatmap por cidade |
| Mapa | Leaflet 1.9.4 OSM, circleMarkers por grade, popup, fitBounds |
| Lista | Sidebar + SpotlightCard + grade badge |
| Detail | `AssetDossierDrawer` |
| Auth | `RequireAuth` → free access (sem paywall) |

### C) LandMap — Dashboard

| Elemento | Status vs Lovable “Mapa” |
|---|---|
| Title metadata | “Mapa — LandMap” (layout) vs H1 “Visão geral do mercado” |
| UI | KPIs + charts + lista — **sem** camadas Lovable |
| CTA | “Abrir mapa” → `/map` |
| MapView.tsx | **Código morto** (não importado) — removido nesta auditoria |

---

## 4. Checklist híbrido (must-match vs extras)

### Must-match Lovable design system — mapa `/map`

| Item | Status | Nota |
|---|---|---|
| Tokens `--primary/--muted/--border/--card/--ring` | **PASS** | Classes `bg-background`, `text-[var(--*)]` |
| Fontes DM Sans + Space Grotesk | **PASS** | Wordmark / display |
| Leaflet 1.9.4 | **PASS** | CDN unpkg (mesmo major do shell Lovable) |
| Ícones `lovable/icons` | **PASS** | Search, Filter, Layers, MapPin… |
| `@landmap/ui` Card/Stat/Badge/Progress/Sparkline | **PASS** | |
| Zero hex de marca no UI | **PASS** | Só `#fff` stroke de marker Leaflet (documentado) |
| Grade colors via tokens | **PASS** | `gradeToken` → success/primary/accent/warning/danger |
| Focus / accent slider | **PASS** | `accent-[var(--primary)]` |
| Empty state tokenizado | **PASS** | `EmptyState` |
| Mobile mapa-first | **PASS** | Filtros colapsáveis, altura `dvh` |

### Product extras LandMap (OK no híbrido — não são drift)

| Extra | Status |
|---|---|
| Free-only terrenos | Intencional |
| Radar grade A–F + score min | Intencional |
| Heatmap API `/api/market/heatmap` | Intencional |
| Asset dossier drawer | Intencional |
| Cap markers 180/80 | Intencional (perf) |
| Chip “LandMap Free” | Intencional |

### FAIL / gap vs Lovable intelligence (não bloqueia híbrido)

| Gap | Severidade | Ação |
|---|---|---|
| Sem “Camadas de inteligência” Lovable | P2 produto | Roadmap futuro se quiser clone A |
| Sem busca CEP/zoneamento | P2 | Extensão Free |
| Dashboard ≠ “Mapa” Lovable | P1 docs | Metadata/title alinhados à realidade |
| Parity scripts sem auth | P0 docs | Não usar para claim 100% mapa |
| Raio não filtrava | **P0 código** | **Corrigido** (centro + haversine) |
| `dashboard/MapView` morto | **P0 código** | **Removido** |
| Claims DESIGN “map 100% equal” | **P0 docs** | **Corrigido** (§ Map Standard) |

---

## 5. Diff de copy (resumo)

| Lovable (intelligence) | LandMap `/map` | Match? |
|---|---|---|
| (auth gate se anônimo) | Free open | N/A híbrido |
| Buscar bairro, cidade, CEP ou zoneamento | Buscar cidade… | **No** (extra scope Lovable) |
| Camadas de inteligência | Radar investidor (grade) | **No** — produto diferente |
| Heatmap + escala | Heatmap + cidade input | **Parcial** |
| Top valorização / oportunidades | Lista de terrenos | **No** |
| Score LandMap (camadas) | score por asset | **Parcial** |
| — | Mapa de terrenos / Free | Extra LandMap |

Snapshot **antigo** prod (`parity_data`): “Mapa mundial” + tipos imóveis → **obsoleto**; prod atual é terrenos Free.

---

## 6. Tokens / drift

- `map/page.tsx`: único hex `#fff` (borda branca do circleMarker) — **exceção canvas permitida**.
- `dashboard/page.tsx`: `tone="emerald"|"cyan"` em MetricStat/StatPill — **mapeados a tokens semânticos** no `@landmap/ui` (não reintroduzem paleta Sovereign). Aceitável no híbrido; preferir `primary` em refactor P2.

---

## 7. Fixes aplicados nesta sessão (P0 + P1)

### P0
1. **Raio funcional:** `searchCenter` (busca ou clique) + filtro `haversineKm <= radiusKm`; helper copy no UI; range disabled sem centro.
2. **Removido** `dashboard/MapView.tsx` (Leaflet demo órfão, não importado).
3. **Documentação:** este arquivo + `DESIGN.md` § **Map System Standard** + `Claude.md` hybrid note.

### P1 (paralelo)
4. **Dashboard metadata:** title `Painel — LandMap` (não mais “Mapa — LandMap”, que confundia com o intelligence Lovable).
5. **Empty state do mapa** contextual (com/sem raio ativo).
6. Comentário de tones MetricStat no dashboard (mapeamento semântico, sem Sovereign).

---

## 8. Critério PASS híbrido (congelado)

Uma mudança no mapa ou página geo está **dentro do padrão** se:

1. Usa **somente** tokens de `globals.css` / utilities semânticas.  
2. Tipografia e chrome iguais ao resto Lovable (Card, border, muted, primary).  
3. Leaflet (ou engine futura) **não** introduz paleta emerald/cyan/gold de marca.  
4. Extras de produto (grade, Free, dossier) ficam **documentados** como LandMap-only.  
5. Controles da UI **fazem o que prometem** (sem sliders mortos).  
6. Não se declara “100% igual Lovable” sem captura **autenticada** + checklist de camadas.

---

## 9. Próximos passos (pós-padrão)

- Novas páginas: recipe `landmap-feature-dev` + este Map Standard se tocarem geo.
- Opcional P1: renomear metadata do dashboard para “Painel” (não “Mapa — LandMap”) se quiser zero confusão.
- Opcional P2: portar subset de “Camadas de inteligência” **como camada** sobre o Free map (não como segunda paleta).

---

*Auditoria 2026-07-17 · padrão híbrido C · gaps P0 de código e docs fechados nesta sessão.*
