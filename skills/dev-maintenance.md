# Skill: Dev maintenance on NEXORA (migrations, checks, features)

## When to use
Any code change to this repo: adding a feature, changing the schema, or the weekly build/verify chores.

## Steps, in order
1. Read `CLAUDE.md` first — it is the authoritative spec (schema, security rules, design system, conventions).
2. **Schema changes:** create a **new numbered file** in `supabase/migrations/` (next: `003_*.sql`). Never edit `001_schema.sql` or `002_rls.sql`. Write idempotent SQL (`create table if not exists`, `add column if not exists`, `drop trigger if exists` before `create trigger` — the style used throughout 001). Every new table gets RLS policies in the migration.
3. Migrations are applied by hand: paste the file into the Supabase SQL editor and run, **in numeric order**. If code references a table/column that errors, check whether a migration hasn't been run yet and say so.
4. **Feature work:** reuse `components/ui/kit.tsx` primitives (Button, Card, Modal, Badge, EmptyState, ConfirmModal) and `components/motion.tsx` wrappers — never hand-roll card/button styles. Theme tokens live in `@theme` inside `app/globals.css` (Tailwind v4 — there is **no** `tailwind.config.js`).
5. New dashboard sections get a nav link in `app/dashboard/layout.tsx`. New API routes authenticate with the server client (`utils/supabase/server.ts`) before anything else; only `app/api/**` may touch `SUPABASE_SECRET_KEY`.
6. Client pages use `createClient()` from `utils/supabase/client`; dynamic params in client pages are `{ params }: { params: Promise<{ id: string }> }` unwrapped with `const { id } = use(params)` (React 19).
7. Verify before finishing, in this order:
   ```
   npx tsc --noEmit
   npm run lint
   npm run build
   ```
8. Keep files under ~400 lines; extract shared pieces into `components/` (e.g. `event-form.tsx` is shared by events/new and events/[id]/edit).

## Example of a good final output (real idempotent migration style from 001_schema.sql)
```sql
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

create index if not exists idx_event_staff_staff on public.event_staff (staff_id);
```
Note the pattern: `if not exists` everywhere, cascade rules chosen deliberately, legacy data backfilled with `on conflict do nothing`, and an index for the query path the app actually uses.

## Mistakes to avoid (corrections already baked into this repo)
- **Never edit old migrations** — extend with a new numbered file. 001 itself exists as a "hardening" pass cleaning up earlier schema mistakes.
- **Never expose `SUPABASE_SECRET_KEY` to the client**, and never change `subscription_tier` outside `POST /api/tier` — a DB trigger (`prevent_tier_change`) rejects client-side changes because this was worth locking at the database level.
- Don't add a `tailwind.config.js` — Tailwind v4 config lives in `@theme` in `app/globals.css`; a config file will be silently ignored or mislead the next reader.
- Don't skip `npx tsc --noEmit` — Supabase rows are typed with local `interface`s per page, so type drift (e.g. `pay: number | string | null`) only surfaces at typecheck.
- Don't use `alert()`/`window.confirm()` anywhere — `useToast()` and `ConfirmModal` exist and CLAUDE.md forbids the natives.
- Route protection lives in `utils/supabase/middleware.ts` — RLS is the real boundary, but queries still filter by `user_id`/`owner_id` as defense in depth.
- New public routes need no middleware change (matcher excludes static assets), but protected ones must be added to the middleware logic.
