-- User-facing blurbs for Top detail screens (edit in Supabase or seed SQL).
alter table public.brands add column if not exists short_description text;
alter table public.materials add column if not exists short_description text;
alter table public.countries add column if not exists short_description text;
