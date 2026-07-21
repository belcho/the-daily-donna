-- The Daily Donna: check-ins table and RLS
-- Run once in Supabase SQL Editor

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  checkin_date date not null,
  status text not null check (status in ('draft', 'submitted')),
  mood smallint check (mood is null or (mood >= 1 and mood <= 5)),
  vitamins_taken boolean,
  vitamins_really text check (
    vitamins_really is null
    or vitamins_really in ('not_all', 'yes_silly')
  ),
  appointments jsonb not null default '[]'::jsonb,
  pain_level smallint check (
    pain_level is null
    or (pain_level >= 1 and pain_level <= 10)
  ),
  saw_bunnies boolean,
  creatures text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (household_id, checkin_date)
);

create index if not exists checkins_household_date_idx
  on public.checkins (household_id, checkin_date desc);

alter table public.checkins enable row level security;

-- Replace with your household UUID from VITE_HOUSEHOLD_ID before running,
-- or set via: alter policy ... (recommended: use the UUID you put in GitHub Secrets)

drop policy if exists "checkins_select" on public.checkins;
drop policy if exists "checkins_insert" on public.checkins;
drop policy if exists "checkins_update" on public.checkins;
drop policy if exists "checkins_anon_all" on public.checkins;

-- Family app: anon key lives in the static site. Client always filters by household_id.
create policy "checkins_anon_all" on public.checkins
  for all to anon
  using (true)
  with check (true);
