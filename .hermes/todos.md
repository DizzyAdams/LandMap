- [x] llm-config-fix. Corrigir packages/llm/src/config/llm-config.ts: defaults/env parsing para passar nos 6 testes do config.spec.ts (concluído)
- [x] web-test-fix. Corrigir apps/web home.spec.tsx + search.spec.tsx (mock hoisting e render de resultados) (concluído)
- [x] test-green. Rodar pnpm run test completo para confirmar green em todas as suites (concluído: 24 files, 91 tests)
- [x] feature-injection. Injetar features adicionais completas no repo após green (concluído)
  - [x] scraping: integração Apify/cheerio + ingestão no @landmap/llm pipeline (packages/scraper)
  - [x] rag: LangGraph + pgvector com chunking bilingue (pt-BR/en-US/es-ES) (packages/llm vector/pgvector-store + bilingual)
  - [x] dashboard: streamlit live mods conectado a /stats, /cities, /compare (scripts/live_dashboard.py)
  - [x] kpis: skills de mercado financeiro com réguas Claude/JPMorgan/Quantum (packages/api /kpi + packages/llm kpi)
- [x] safety/commit-prep. Corrigir .gitignore (node_modules/build/logs), author streamlit dashboard, atualizar todos (concluído)
- [x] design-audit. Auditoria de design + melhorias "fora do comum" (concluído: cursor, aurora+grain, gradiente dual, spotlight cards, marquee, monograma SVG, focus-visible)

- [x] sales-feature. Implementar agente de vendas autônomo (`packages/sales`), rotas `/sales` na API (`packages/api`), novos componentes de UI (`packages/ui`) e cockpit no web (`apps/web/src/app/[locale]/sales`) + link na Navbar (concluído)
- [x] sales-verify. Sub-agentes validam build/typecheck/lint/testes em paralelo: `@landmap/sales` 6/6 testes verdes, `@landmap/api` e `@landmap/ui` build/typecheck verdes, `apps/web` next build verde para pt-BR/en-US/es-ES (concluído)
- [x] sales-commit. Stage + commit da feature de vendas no main (concluído)

- [x] ux-audit. Auditoria UX/UI (score 5/10): split identidade branco×bioluminescente, sem tokens centralizados, locale routing quebrado, componentes mortos, dark-patterns (concluído)
- [x] ux-elevate. Sub-agentes (A–E) elevam para "fora do comum": Button bioluminescent primário, localeHref + i18n, coesão das páginas (marketing/dados/admin), AdminSidebar montado, paleta on-brand, remoção de dark-patterns. typecheck+lint verdes (concluído)
- [x] color-schema. Design tokens centralizados (globals.css + ui/styles.css + tokens.ts); classes signature (.text-gradient/.glow-dual/.glow-emerald/.glass/.surface/.hairline/:focus-visible) token-driven; Button consome var() (concluído)
- [x] ux-commit. Stage + commit da elevação UX/UI + schema de cores no main (32 arquivos) (concluído)
- [x] deploy. `vercel deploy --prod` disparado: building remoto → https://landmap-6mqhgjrsz-dizzys-projects-d5a44b36.vercel.app (domínio prod: landmap-dizzys-projects-d5a44b36.vercel.app) (concluído disparo)

- [x] custom-domain. Domínio `landmap.com.br` associado ao projeto Vercel (produção); DNS A 76.76.21.21 pendente no registro (ns atuais a.auto.dns.br). Produção já Ready e será servida no domínio após propagação (concluído associação)
- [x] prod-ready. Produção `● Ready` em landmap-6mqhgjrsz-dizzys-projects-d5a44b36.vercel.app; domínio customizado anexado → roteia para produção após DNS (concluído)



- [x] test-fix-2. Corrigir web specs (Nenhum imovel encontrado) + vitest.config (jsx automatico) + vitest.setup.ts (polyfill matchMedia) (concluido)
- [x] verify-parallel. Sub-agentes validam pipeline em paralelo: typecheck VERDE, lint VERDE, build VERDE, testes VERDES (25 arquivos / 97 testes) (concluido)
- [x] optimize-pipeline. Verificacao paralela via sub-agents padronizada (typecheck/lint/build/test + validate live) (concluido)
- [x] deploy-fix. Corrigir POST /api/search (500->200) + busca real + handler erro global (Zod->400) (concluido)
- [x] deploy-prod. vercel deploy --prod -> landmap-ivne1bgo7 Ready; 23 rotas 200 (incl. /api/search); filtro funciona e entrada invalida -> 400 (concluido)


- [x] release-sync. Push main -> origin (sync 7 commits); producao landmap-ivne1bgo7 Ready, 23/23 rotas 200 (concluido)
- [ ] dominio-custom. landmap.com.br: DNS pendente no registrador (ns a.auto.dns.br) -> criar A 76.76.21.21 ou trocar p/ ns1/ns2.vercel-dns.com; bloqueio externo (aguardando registrador)
- [ ] dominio-custom. landmap.com.br: DNS pendente no registrador (ns a.auto.dns.br) -> criar A 76.76.21.21 ou trocar p/ ns1/ns2.vercel-dns.com; bloqueio externo (aguardando registrador)
- [x] ci-cd. GitHub Actions: ci.yml (lint/typecheck/build/test) + deploy.yml (vercel deploy --prod) + secret VERCEL_TOKEN; YAML validado; repo tornado publico p/ Actions gratuitos (concluido)
- [ ] bloqueio-github-billing. GitHub Actions nao executam: conta com pagamento falho / spending limit (erro da run). Requer acao do usuario em GitHub > Settings > Billing & plans (corrigir pagamento / aumentar limite). Apos resolver, os workflows rodam automaticos no push.

- [x] ci-fix. ci.yml: adiciona `pnpm -r --filter './packages/*' run build` antes do lint para o tsc --noEmit resolver imports `@landmap/*` (concluido)
- [x] surreal-home. Elevar home a "completamente surreal": camada animada aurora bioluminescente + film grain no hero; nova seção "Agentes & Skills — todas online" com 8 cards (vendas/6 agentes, chat RAG grátis, mapa, comparador, studio, favoritos/alertas, status/live, calculadora) ligando cada skill. typecheck/lint/build verdes (concluido)
- [x] skills-online. Validação de todas as skills em produção (19 páginas + 8 APIs GET + 2 POSTs): 200 em todas, exceto GET /api/analyze (esperado 404 — rota é POST só). /api/sales/cycle em autopilot gera eventos; /api/search Curitiba real; /api/kpi com réguas; /api/integrations/opendesign/feed mock; /api/sales/state com 6 agentes (concluido)
- [x] deploy-1005. vercel deploy --prod -> LandMap 1005 funcional: https://landmap-dvtu0ooac-dizzys-projects-d5a44b36.vercel.app (alias prod https://landmap-dizzys-projects-d5a44b36.vercel.app + dominio landmap.us.kg; Inspect BiZSRqdRFYAU6QSRRgi3X7jGCRYw). Build remoto OK, todas as rotas 200, todas as skills online (concluido)

- [ ] dominios-dns. Domínios registrados E atribuídos no Vercel, mas DNS ainda não aponta para a Vercel (bloqueio externo no registrador): landmap.com.br -> NS atuais a.auto.dns.br/b.auto.dns.br (☓ vs ns1/ns2.vercel-dns.com); landmap.us.kg e getlandmap.app -> NS vazios (☓). Teste HTTP: nenhum resolve ("name not resolved"). Correção no registrador: (a) A landmap.com.br/us.kg/app 76.76.21.21, ou (b) NS -> ns1.vercel-dns.com + ns2.vercel-dns.com. Produção funcional via https://landmap-dizzys-projects-d5a44b36.vercel.app enquanto isso. (aguarda ação no registrador de DNS)

- [x] data-1500. Tornar a API data-driven com dataset real: scripts/seed_properties.py (count=1500, removeu tipo 'cobertura' p/ compatibilidade de enum); packages/api/src/index.ts importa './data/properties.json' (resolveJsonModule no tsconfig) substituindo os 6 hardcoded; seed também escreve cópia em packages/api/src/data/ p/ bundle no build. /api/stats totalProperties=1500, /api/cities=10, POST /api/search ok (40 aptos Curitiba), /api/compare e /api/favorites por IDs 200. Testes 97/97 verdes. commit e745d4f + deploy landmap-fas3hifhd (alias landmap-dizzys-projects-d5a44b36.vercel.app) (concluido)
- [x] markdowns-1500. scripts/build_markdowns.py reescrito p/ gerar 1.500 markdowns estruturados (frontmatter + corpo) a partir de data/seeds/properties.json; data/markdowns preenchido (antes vazio). (concluido)
- [x] copy-truth. Home/Marquee: '50+ cidades' -> '10 cidades' (reflete o dataset real de 10 cidades); hero '1.500+ imóveis' agora condiz com /api/stats. (concluido)

- [x] web-error-boundaries. error.tsx/not-found.tsx/loading.tsx em [locale] + sub-rotas (alerts/chat/compare/favorites/map/property/[id]/search); refactor search/Filters.tsx (sheet mobile + kbd); Navbar/componentes polish. typecheck/lint/build/testes verdes. (concluido)
- [x] deploy-now. vercel deploy --prod (commit a90a1d1) -> landmap-kxx71uxnv Ready (2m); alias landmap.us.kg atribuído (SSL async); todas as 19 paginas + 8 APIs GET + 2 POSTs 200; 404 esperado em /nao-existe (not-found) e /api/analyze (POST-only). Prod alias landmap-dizzys-projects-d5a44b36.vercel.app 200. (concluido)
- [ ] dominios-dns. Bloqueio EXTERNO (acao no registrador, fora do alcance do deploy): landmap.us.kg -> "name does not exist" (NS vazios no us.kg); landmap.com.br -> NS ainda a.auto.dns.br (Registro.br); getlandmap.app -> NS vazios. Corrigir no registrador: (a) A 76.76.21.21 + CNAME www -> cname.vercel-dns.com, ou (b) NS -> ns1.vercel-dns.com + ns2.vercel-dns.com. App 100% live em https://landmap-dizzys-projects-d5a44b36.vercel.app enquanto isso. (aguarda acao no registrador)