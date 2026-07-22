-- Captions on good stuff photos + encouragement jar notes.

alter table public.good_stuff_photos
  add column if not exists caption text;

create table if not exists public.encouragement_notes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  author_name text not null default 'Someone who loves you',
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists encouragement_notes_household_created_idx
  on public.encouragement_notes (household_id, created_at desc);

alter table public.encouragement_notes enable row level security;

drop policy if exists "encouragement_notes_anon_all" on public.encouragement_notes;

create policy "encouragement_notes_anon_all" on public.encouragement_notes
  for all
  to anon
  using (true)
  with check (true);
