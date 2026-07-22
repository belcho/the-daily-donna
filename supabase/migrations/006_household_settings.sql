-- Donna private code (hash only — plain code never stored server-side)

create table if not exists public.household_settings (
  household_id uuid primary key,
  donna_pin_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.household_settings enable row level security;

drop policy if exists "household_settings_anon_all" on public.household_settings;

create policy "household_settings_anon_all" on public.household_settings
  for all
  to anon
  using (true)
  with check (true);
