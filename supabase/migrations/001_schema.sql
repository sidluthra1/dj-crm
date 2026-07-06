-- ============================================================
-- 001_schema.sql — NEXORA schema hardening
-- Run this in the Supabase SQL editor BEFORE 002_rls.sql
-- Safe to re-run (idempotent).
-- ============================================================

-- 1. Ensure owner columns exist ------------------------------------------

alter table public.events    add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.inventory add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.staff     add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Backfill owner_id on staff rows created before this migration.
-- Assumes a single admin account so far; adjust the sub-select if needed.
update public.staff
set owner_id = (select id from public.profiles order by created_at asc nulls last limit 1)
where owner_id is null;

-- 2. Meetings table (created if it doesn't exist yet) ---------------------

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  meeting_type text not null default 'Client Consult',
  meeting_date timestamptz not null,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  status text not null default 'Scheduled',
  client_name text,
  notes text,
  event_id uuid references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.meetings add column if not exists notes text;
alter table public.meetings add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 3. event_staff junction — replaces events.assigned_staff name strings ---

create table if not exists public.event_staff (
  event_id uuid not null references public.events(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, staff_id)
);

-- Backfill from the legacy assigned_staff text[] (matches stage_name or full_name)
insert into public.event_staff (event_id, staff_id)
select e.id, s.id
from public.events e
join public.staff s
  on (s.stage_name = any(e.assigned_staff) or s.full_name = any(e.assigned_staff))
where e.assigned_staff is not null
on conflict do nothing;

-- 4. Helpful indexes -------------------------------------------------------

create index if not exists idx_events_user_date      on public.events (user_id, event_date);
create index if not exists idx_inventory_user        on public.inventory (user_id);
create index if not exists idx_meetings_user_date    on public.meetings (user_id, meeting_date);
create index if not exists idx_staff_owner           on public.staff (owner_id);
create index if not exists idx_event_staff_staff     on public.event_staff (staff_id);
create index if not exists idx_event_equipment_event on public.event_equipment (event_id);

-- 5. Protect subscription_tier: only the service role may change it -------

create or replace function public.prevent_tier_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.subscription_tier is distinct from old.subscription_tier
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'subscription_tier can only be changed server-side';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_tier_change on public.profiles;
create trigger trg_prevent_tier_change
  before update on public.profiles
  for each row execute function public.prevent_tier_change();
