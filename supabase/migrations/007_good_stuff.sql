-- Random "good stuff" photos (separate from check-in bunny photos).

create table if not exists public.good_stuff_photos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists good_stuff_photos_household_created_idx
  on public.good_stuff_photos (household_id, created_at desc);

alter table public.good_stuff_photos enable row level security;

drop policy if exists "good_stuff_photos_anon_all" on public.good_stuff_photos;

create policy "good_stuff_photos_anon_all" on public.good_stuff_photos
  for all
  to anon
  using (true)
  with check (true);

insert into storage.buckets (id, name, public)
values ('good-stuff-photos', 'good-stuff-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "good_stuff_storage_select" on storage.objects;
drop policy if exists "good_stuff_storage_insert" on storage.objects;
drop policy if exists "good_stuff_storage_update" on storage.objects;
drop policy if exists "good_stuff_storage_delete" on storage.objects;

create policy "good_stuff_storage_select" on storage.objects
  for select to anon
  using (bucket_id = 'good-stuff-photos');

create policy "good_stuff_storage_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'good-stuff-photos');

create policy "good_stuff_storage_update" on storage.objects
  for update to anon
  using (bucket_id = 'good-stuff-photos');

create policy "good_stuff_storage_delete" on storage.objects
  for delete to anon
  using (bucket_id = 'good-stuff-photos');
