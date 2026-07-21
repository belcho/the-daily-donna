-- Bug reports and feature requests. Run once in Supabase SQL Editor.

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  kind text not null check (kind in ('bug', 'feature')),
  title text not null,
  details text not null default '',
  status text not null default 'open' check (
    status in ('open', 'planned', 'fixed', 'wontfix')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feedback_items_household_created_idx
  on public.feedback_items (household_id, created_at desc);

alter table public.feedback_items enable row level security;

drop policy if exists "feedback_anon_all" on public.feedback_items;

create policy "feedback_anon_all" on public.feedback_items
  for all to anon
  using (true)
  with check (true);
