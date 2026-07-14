# Supabase (Coolify) — setup rápido

## 1. Deploy Supabase no Coolify
- Coolify dashboard → New Resource → **Supabase** (one-click template)
- Aguardar deploy completo (~5 min)

## 2. Rodar migration
- Coolify → Supabase → **SQL Editor**
- Copiar `supabase/migrations/0001_init.sql` e executar
- Cria: `regions`, `region_favorites`, `properties`, `property_favorites`, `profiles`, `user_roles`, `data_sources`
- + seed 8 bairros de Fortaleza

## 3. Pegar credenciais
- Coolify → Supabase resource → **Environment**
  - `SERVICE_PG_CONNECTION_URI` → URL de conexão
  - `KONG_HTTP_PORT` (ex: 8080) → URL pública
  - `ANON_KEY` → chave anônima
  - `SERVICE_ROLE_KEY` → service role (server-only)

## 4. Configurar envs
No recurso **LandMap Web** no Coolify, adicionar:

```
NEXT_PUBLIC_SUPABASE_URL=https://db.seu-dominio.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=https://app.seu-dominio.com
```

## 5. Rede interna (Coolify)
Se Coolify gerencia ambos (Supabase + Web App) no mesmo servidor:
- Colocar ambos no mesmo **network** no Coolify
- Usar hostname interno: `http://supabase:8000` no lugar de `https://db.seu-dominio.com`

## Referência
- `apps/web/src/lib/supabase.ts` — client browser
- `apps/web/src/types/database.ts` — types TS
- `apps/web/Dockerfile` — Docker multi-stage
- `coolify.json` — config do recurso Coolify