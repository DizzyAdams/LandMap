# Map Intelligence — paridade Lovable (fonte de verdade)

Implementação: `apps/web/src/app/[locale]/map/page.tsx` + `lib/mapIntelligence.ts`  
Referência: `lovable_chunk_dashboard.js`

## Motor de mapa
| Lovable | LandMap |
|---|---|
| Google Maps JS + estilo light | Leaflet + Carto light tiles (mesmo look, sem key Google) |

## Camadas (8 — exatas)
1. Valorização m²  
2. Velocidade de crescimento  
3. Índice de desenvolvimento  
4. Infraestrutura  
5. Segurança  
6. Mobilidade  
7. Qualidade urbana  
8. Densidade populacional  

## Score bands (função J)
Excepcional ≥80 · Alto potencial ≥65 · Médio ≥50 · Baixo ≥35 · Crítico  

## Cores pin (função q)
`#003594` ≥80 · `#3b82f6` ≥65 · `#eab308` ≥50 · `#f97316` ≥35 · `#dc2626`  

## Heat scale
Gradiente `#dc2626` → `#eab308` → `#003594` · labels Crítico / Médio / Excepcional  

## UI flutuante
- Busca: “Buscar bairro, cidade, CEP ou zoneamento.”  
- Painel Camadas de inteligência + switch Heatmap  
- Bottom: Top valorização (12m) · Top oportunidades · Fluxo do índice  
- Sheet de região: Score, composição, destaques, timeline, histórico m²  

## Rota
`/map` = mapa principal · metadata **Mapa — LandMap**  
`/dashboard` = overview + CTA abrir mapa  
