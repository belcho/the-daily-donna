-- Bunny count per check-in day. Run in Supabase SQL Editor.

alter table public.checkins
  add column if not exists bunny_count smallint check (
    bunny_count is null or (bunny_count >= 0 and bunny_count <= 999)
  );
