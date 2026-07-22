-- Links Donna saves (YouTube, TikTok, etc.).

create table if not exists public.shared_videos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  url text not null,
  platform text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists shared_videos_household_created_idx
  on public.shared_videos (household_id, created_at desc);

alter table public.shared_videos enable row level security;

drop policy if exists "shared_videos_anon_all" on public.shared_videos;

create policy "shared_videos_anon_all" on public.shared_videos
  for all
  to anon
  using (true)
  with check (true);
