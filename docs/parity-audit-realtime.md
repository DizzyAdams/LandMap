# LandMap — Auditoria de Paridade (Lovable ref vs Produção)

> Gerado por auditoria comparando os snapshots prerenderizados autoritativos do Lovable
> (`apps/web/public/lovable_*.html`, HTML servido real 15–24KB) contra o source de produção
> (`apps/web/src/app/[locale]/**`). Live fetch indisponível neste host (web_extract/Firecrawl DOWN),
> mas os snapshots SÃO a captura literal do que o Lovable serve — fonte fiel para paridade.

## Fontes carregadas (P0 — DISCREPÂNCIA REAL)
- **Lovable ref (autoritativo):** `DM Sans` + `Space Grotesk` — **SÓ 2 famílias. NÃO carrega JetBrains Mono.**
- **Produção atual:** `DM Sans` + `Space Grotesk` + **`JetBrains Mono`** (`apps/web/src/app/layout.tsx:53`).
- CLAUDE.md/DESIGN.md fixam 3 fontes (inclui JetBrains Mono) — mas o Lovable servido tem apenas 2.
- Uso de `.font-mono` no source: 16 componentes + `--font-mono` em globals.css.
- **DECISÃO NECESSÁRIA:** para paridade 100% literal, remover JetBrains Mono do `<link>` e
  apontar `--font-mono` para o fallback do sistema — OU manter (viola a paridade de fontes).

## Snapshots Lovable (title + description autoritativos por rota)
- **admin**: title=`Administração — LandMap` | desc=`LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² par`
- **auth**: title=`Entrar — LandMap` | desc=`Acesse a plataforma LandMap ou solicite acesso.`
- **compare**: title=`Comparação de regiões — LandMap` | desc=`LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² par`
- **dashboard**: title=`Mapa — LandMap` | desc=`Inteligência territorial premium: heatmap de valorização, score LandMap por regi`
- **favorites**: title=`Favoritos — LandMap` | desc=`LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² par`
- **map**: title=`LandMap — Inteligência de terrenos` | desc=`LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² par`
- **onboarding**: title=`Conheça o LandMap` | desc=`Como o LandMap ajuda você a decidir sobre terrenos com dados.`
- **plans**: title=`Planos — LandMap` | desc=`Escolha o plano LandMap ideal: Access, Plus, Pro ou Business.`
- **regions**: title=`Regiões — LandMap` | desc=`LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² par`

## Metadata em produção
- Root `layout.tsx` define OG global title `LandMap — Inteligência de terrenos`.
- Rotas em `[locale]/**/page.tsx` **não exportam `metadata.title` próprio** (nenhum `title:` encontrado).
  → Lovable tem títulos por rota (`Planos — LandMap`, `Regiões — LandMap`, `Mapa — LandMap`).
  **P1:** adicionar `export const metadata = { title: '...' }` por rota para bater com Lovable.

## Priorização
### P0 (bloqueia paridade)
1. Fontes: Lovable serve 2 famílias, prod serve 3 → `apps/web/src/app/layout.tsx:53`. Decisão do dono.
### P1 (visível, fácil)
2. Titles por rota ausentes em prod → adicionar `metadata.title` em cada `[locale]/<rota>/page.tsx`
   usando exatamente os strings da tabela acima.
3. og:image: Lovable usa asset R2 (`pub-bb2e...r2.dev/...png`); prod usa `/og-image.svg`.
   Se paridade de preview social importa, alinhar (baixar o PNG ou manter SVG próprio).
### P2 (cosmético)
4. `#lovable-badge` presente nos snapshots — NÃO replicar (é marca do Lovable, indesejado em prod).

## Nota de método
- Snapshots `lovable_html_*.html` são duplicatas idênticas de `lovable_*.html` (mesmo bytes) — ignoradas.
- Chunks JS (`lovable_chunk_*.js`) e shells SPA vazios: corretamente ignorados (inúteis/timeout).
