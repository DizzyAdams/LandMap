-- ============================================================================
-- LandMap — Backend schema (ported from the Lovable design: landmap-insight.lovable.app)
-- Tables discovered in the Lovable route chunks:
--   regions, region_favorites, property_favorites,
--   properties, profiles, user_roles, data_sources
-- Column names taken from the actual queries in the chunks
-- (e.g. regions.select('*').order('avg_observed_price_sqm', {ascending:false})).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── regions: core market data per neighborhood ───────────────────────────────
create table if not exists public.regions (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  city                   text not null default 'Fortaleza',
  state                  text not null default 'CE',
  avg_observed_price_sqm numeric not null default 0,
  avg_announced_price_sqm numeric,
  min_price              numeric,
  max_price              numeric,
  confidence             integer not null default 1 check (confidence between 1 and 5),
  data_points            integer not null default 0,
  trend                  text check (trend in ('up','stable','down')),
  created_at             timestamptz not null default now()
);

-- ── region_favorites (regions screen star toggle) ────────────────────────────
create table if not exists public.region_favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  region_id  uuid not null references public.regions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, region_id)
);

-- ── properties + property_favorites (favorites / map screens) ────────────────
create table if not exists public.properties (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  city       text,
  region_id  uuid references public.regions(id) on delete set null,
  price      numeric,
  area_sqm   numeric,
  lat        double precision,
  lng        double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.property_favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id  uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ── profiles (auth signup: full_name, phone, user_type, email) ───────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  email      text,
  user_type  text check (user_type in ('broker','developer','investor','business')),
  created_at timestamptz not null default now()
);

-- ── user_roles (admin suite + auth gating) ───────────────────────────────────
create table if not exists public.user_roles (
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('broker','developer','investor','business','admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ── data_sources (admin provenance / sync status) ───────────────────────────
create table if not exists public.data_sources (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  url        text,
  status     text default 'pending',
  last_sync  timestamptz,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.regions            enable row level security;
alter table public.region_favorites   enable row level security;
alter table public.property_favorites enable row level security;
alter table public.properties         enable row level security;
alter table public.profiles           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.data_sources       enable row level security;

-- regions: public read (market data is public)
create policy "regions_read" on public.regions for select using (true);

-- favorites: owner-only
create policy "rf_owner_select" on public.region_favorites for select using (auth.uid() = user_id);
create policy "rf_owner_all"   on public.region_favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pf_owner_select" on public.property_favorites for select using (auth.uid() = user_id);
create policy "pf_owner_all"   on public.property_favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- properties: public read
create policy "properties_read" on public.properties for select using (true);

-- profiles: owner-only
create policy "profiles_owner_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_owner_all"    on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- user_roles: owner read
create policy "user_roles_owner" on public.user_roles for select using (auth.uid() = user_id);

-- data_sources: admin only
create policy "ds_admin_all" on public.data_sources for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'));

-- ── Seed: Fortaleza bairros (matches the UI mock in regions/page.tsx) ────────
insert into public.regions
  (name, avg_observed_price_sqm, min_price, max_price, confidence, data_points)
values
  ('Meireles',          9500, 7800, 11200, 5, 1840),
  ('Aldeota',           8200, 6800,  9600, 5, 1520),
  ('Dionísio Torres',   7800, 6400,  9100, 4, 1310),
  ('Cocó',              7500, 6100,  8800, 4, 1120),
  ('Guararapes',        7000, 5600,  8400, 4,  980),
  ('Praia do Futuro',   6500, 5200,  7900, 3,  870),
  ('Fátima',            5600, 4400,  6800, 3,  760),
  ('Benfica',           5000, 3900,  6200, 3,  640)
on conflict do nothing;

