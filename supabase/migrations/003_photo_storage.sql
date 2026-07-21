-- Photo URL on check-ins + public storage bucket for creature pics.

alter table public.checkins
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "checkin_photos_select" on storage.objects;
drop policy if exists "checkin_photos_insert" on storage.objects;
drop policy if exists "checkin_photos_update" on storage.objects;
drop policy if exists "checkin_photos_delete" on storage.objects;

create policy "checkin_photos_select" on storage.objects
  for select to anon
  using (bucket_id = 'checkin-photos');

create policy "checkin_photos_insert" on storage.objects
  for insert to anon
  with check (bucket_id = 'checkin-photos');

create policy "checkin_photos_update" on storage.objects
  for update to anon
  using (bucket_id = 'checkin-photos');

create policy "checkin_photos_delete" on storage.objects
  for delete to anon
  using (bucket_id = 'checkin-photos');
