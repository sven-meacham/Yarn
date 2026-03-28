-- YARN MVP — reference tables + scan_results

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  ethics_score smallint not null check (ethics_score between 0 and 100),
  sustainability_score smallint not null check (sustainability_score between 0 and 100),
  transparency_score smallint not null check (transparency_score between 0 and 100),
  overall_brand_score smallint not null check (overall_brand_score between 0 and 100),
  notes text
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sustainability_score smallint not null check (sustainability_score between 0 and 100),
  quality_score smallint not null check (quality_score between 0 and 100),
  health_note text,
  sustainability_note text,
  score_adjustment numeric default 0
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  manufacturing_risk_score smallint not null check (manufacturing_risk_score between 0 and 100),
  note text
);

create table if not exists public.scan_results (
  id uuid primary key default gen_random_uuid(),
  brand_name text,
  parsed_materials jsonb,
  country_name text,
  overall_score smallint,
  explanation text,
  created_at timestamptz default now()
);

alter table public.brands enable row level security;
alter table public.materials enable row level security;
alter table public.countries enable row level security;
alter table public.scan_results enable row level security;

create policy "allow_public_read_brands" on public.brands for select using (true);
create policy "allow_public_read_materials" on public.materials for select using (true);
create policy "allow_public_read_countries" on public.countries for select using (true);

-- scan_results: no client policies (insert via Edge Function + service role only)
