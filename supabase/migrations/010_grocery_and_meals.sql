-- Grocery list (per week) + daily meal preference on check-ins.

alter table public.checkins
  add column if not exists meal_want text;

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  week_key date not null,
  name text not null,
  is_got boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists grocery_items_household_week_idx
  on public.grocery_items (household_id, week_key, is_got);

alter table public.grocery_items enable row level security;

drop policy if exists "grocery_items_anon_all" on public.grocery_items;

create policy "grocery_items_anon_all" on public.grocery_items
  for all
  to anon
  using (true)
  with check (true);
