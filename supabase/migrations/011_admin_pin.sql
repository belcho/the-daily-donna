-- Optional family admin PIN (separate from Donna’s private code).

alter table public.household_settings
  alter column donna_pin_hash drop not null;

alter table public.household_settings
  add column if not exists admin_pin_hash text;
