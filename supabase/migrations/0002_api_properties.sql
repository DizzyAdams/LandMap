-- LandMap API — properties table (postgres, compatível com @landmap/db)
create table if not exists public.properties (
  id            text primary key,
  title         text not null default '',
  city          text not null default '',
  state         text not null default '',
  price         numeric not null default 0,
  area_m2       numeric not null default 0,
  bedrooms      integer,
  type          text not null default 'apartamento',
  modality      text not null default 'venda',
  available     boolean not null default true,
  latitude      double precision,
  longitude     double precision,
  neighborhood  text,
  zone          text,
  street        text,
  status        text not null default 'active',
  images        text[] not null default '{}',
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_modality on public.properties(modality);