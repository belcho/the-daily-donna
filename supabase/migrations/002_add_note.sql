-- Optional daily note on check-ins. Run in Supabase SQL Editor after 001.

alter table public.checkins
  add column if not exists note text;
