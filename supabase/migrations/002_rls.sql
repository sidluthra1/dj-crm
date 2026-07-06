-- ============================================================
-- 002_rls.sql — Row Level Security for all NEXORA tables
-- Run AFTER 001_schema.sql. Safe to re-run.
-- ============================================================

alter table public.profiles        enable row level security;
alter table public.events          enable row level security;
alter table public.inventory       enable row level security;
alter table public.event_equipment enable row level security;
alter table public.staff           enable row level security;
alter table public.event_staff     enable row level security;
alter table public.meetings        enable row level security;

-- Helper: is the current user assigned (as staff) to an event?
create or replace function public.is_assigned_staff(p_event_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.event_staff es
    join public.staff s on s.id = es.staff_id
    where es.event_id = p_event_id
      and s.user_id = auth.uid()
  );
$$;

-- PROFILES -----------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- (tier changes still blocked by trg_prevent_tier_change)

-- EVENTS ---------------------------------------------------------------------
drop policy if exists "events_owner_all" on public.events;
create policy "events_owner_all" on public.events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "events_staff_read" on public.events;
create policy "events_staff_read" on public.events
  for select using (public.is_assigned_staff(id));

-- INVENTORY -------------------------------------------------------------------
drop policy if exists "inventory_owner_all" on public.inventory;
create policy "inventory_owner_all" on public.inventory
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Staff may read gear that is routed to one of their assigned events
drop policy if exists "inventory_staff_read" on public.inventory;
create policy "inventory_staff_read" on public.inventory
  for select using (
    exists (
      select 1 from public.event_equipment ee
      where ee.inventory_id = inventory.id
        and public.is_assigned_staff(ee.event_id)
    )
  );

-- EVENT_EQUIPMENT ---------------------------------------------------------------
drop policy if exists "event_equipment_owner_all" on public.event_equipment;
create policy "event_equipment_owner_all" on public.event_equipment
  for all using (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  );

drop policy if exists "event_equipment_staff_read" on public.event_equipment;
create policy "event_equipment_staff_read" on public.event_equipment
  for select using (public.is_assigned_staff(event_id));

-- STAFF ---------------------------------------------------------------------------
drop policy if exists "staff_owner_all" on public.staff;
create policy "staff_owner_all" on public.staff
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- A staff member can see + edit their own row (contact info)
drop policy if exists "staff_self_select" on public.staff;
create policy "staff_self_select" on public.staff
  for select using (user_id = auth.uid());

drop policy if exists "staff_self_update" on public.staff;
create policy "staff_self_update" on public.staff
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- EVENT_STAFF -----------------------------------------------------------------------
drop policy if exists "event_staff_owner_all" on public.event_staff;
create policy "event_staff_owner_all" on public.event_staff
  for all using (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.events e where e.id = event_id and e.user_id = auth.uid())
  );

drop policy if exists "event_staff_self_read" on public.event_staff;
create policy "event_staff_self_read" on public.event_staff
  for select using (
    exists (select 1 from public.staff s where s.id = staff_id and s.user_id = auth.uid())
  );

-- MEETINGS ----------------------------------------------------------------------------
drop policy if exists "meetings_owner_all" on public.meetings;
create policy "meetings_owner_all" on public.meetings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
