# LandMap Deploy — Coolify + Cloudflare Tunnel + Vercel

## Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel    │────▶│ Cloudflare Tunnel│────▶│  Coolify (VPS)  │
│  Frontend   │     │  (gratuito)       │     │  ├─ API (Hono)  │
│ landmap.verc│     │ api.seudominio.com│     │  └─ PostgreSQL  │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

## 1. Deploy no Coolify

### 1.1 PostgreSQL
- Coolify → New Resource → **PostgreSQL**
- Anotar string de conexão (`postgresql://user:pass@host:5432/db`)

### 1.2 API
- Coolify → New Resource → **Docker Compose / Single Service**
- Usar `coolify.json` já no repo
- Git Source: `https://github.com/forrydev/LandMap`
- Build pack: **Dockerfile** → `Dockerfile.api`
- Port: `4000`
- Env vars:
  ```
  PORT=4000
  DATABASE_URL=postgresql://user:pass@host:5432/landmap
  ```
- Healthcheck: `GET /health` → 200

### 1.3 Migration
- No SQL Editor do PostgreSQL, rodar:
  - `supabase/migrations/0002_api_properties.sql`

## 2. Cloudflare Tunnel (gratuito)

```bash
# Instalar cloudflared no servidor Coolify
ssh user@vps
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Autenticar
cloudflared tunnel login

# Criar túnel
cloudflared tunnel create landmap-api

# Copiar o `cloudflared.yml` do repo pro servidor
# Editar: trocar api.seudominio.com pelo seu domínio
cloudflared tunnel --config cloudflared.yml run
```

Ou via **Zero Trust Dashboard** (mais fácil):
1. Cloudflare Dashboard → Zero Trust → Networks → Tunnels
2. Create a tunnel → `landmap-api`
3. Public hostname: `api.seudominio.com` → service: `http://localhost:4000`
4. Copiar o comando `cloudflared tunnel run` e rodar no servidor

## 3. Configurar na Vercel

No **Vercel Dashboard → LandMap → Settings → Environment Variables**:

```
NEXT_PUBLIC_LANDMAP_API_BASE=https://api.seudominio.com
```

> O `lib/api.ts` já usa essa env. Se não estiver setada, cai pra `/api` (Vercel serverless).

## 4. Arquivos criados

| Arquivo | Função |
|---------|--------|
| `packages/api/src/serve.ts` | Ponto de entrada standalone (Node server) |
| `Dockerfile.api` | Docker multi-stage para Coolify |
| `cloudflared.yml` | Config Cloudflare Tunnel |
| `supabase/migrations/0002_api_properties.sql` | Migration PostgreSQL |
| `coolify.json` | Config recurso Coolify |

## Opcional: Docker Compose local

Se quiser rodar tudo localmente (API + PG):

```yaml
# docker-compose.yml na raiz
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: landmap
      POSTGRES_PASSWORD: landmap
    ports: [5432:5432]
    volumes: [pgdata:/var/lib/postgresql/data]

  api:
    build:
      dockerfile: Dockerfile.api
    ports: [4000:4000]
    environment:
      DATABASE_URL: postgresql://postgres:landmap@postgres:5432/landmap
    depends_on: [postgres]

volumes:
  pgdata:
```