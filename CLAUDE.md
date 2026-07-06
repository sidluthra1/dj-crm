# NEXORA — DJ Business CRM

Guidance for Claude (all model sizes) working in this repo. Read this fully before making changes.

## What this app is

NEXORA is a SaaS CRM for DJ businesses. One product, three surfaces:

1. **Marketing site** — `/` (landing), `/pricing`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
2. **Owner dashboard** — `/dashboard/*` (requires `subscription_tier = 'crm'`). Events, calendar, meetings, inventory, staff roster, settings, tools.
3. **Staff portal** — `/staff/login`, `/staff/setup`, `/staff/dashboard/*`. Crew members invited by an owner log in and see only the gigs they are assigned to.

Subscription tiers stored on `profiles.subscription_tier`: `none` | `free` | `premium` | `crm` (later: `company`). There is **no payment processor yet** — tier changes go through `POST /api/tier` (see Security).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (config lives in `app/globals.css` via `@theme`, NOT a tailwind.config file)
- Supabase (auth + Postgres + RLS). `@supabase/ssr` for clients.
- Framer Motion for animation, lucide-react for icons
- Fonts: Geist / Geist Mono (loaded in `app/layout.tsx`)

Commands: `npm run dev`, `npm run build`, `npm run lint`. Typecheck with `npx tsc --noEmit`.

## Directory map

```
app/
  page.tsx                 Landing page (Apple-style, light theme)
  pricing/                 Pricing tiers; calls POST /api/tier
  login/ signup/           Owner auth
  forgot-password/ reset-password/
  auth/callback/route.ts   OAuth + email-link code exchange
  api/staff/invite/        POST — owner invites a staff member (auth-checked, service role)
  api/tier/route.ts        POST — server-side tier changes (only place tier may change)
  dashboard/               Owner CRM (protected by middleware, tier 'crm')
    layout.tsx             Sidebar + topbar shell
    page.tsx               Overview stats + next event + action items
    calendar/              Month grid of events
    events/  upcoming | previous | new | [id] | [id]/edit
    meetings/ upcoming | previous | new | [id]
    inventory/ list | new | [id]
    staff/                 Roster + invite modal
    settings/              Profile, plan, password
    tools/[tool]/          Coming-soon pages (duplicate-remover, missing-files, spotify, upgrade)
  staff/                   Staff portal (login, setup, dashboard, dashboard/events/[id])
components/
  ui/kit.tsx               Design-system primitives (Button, Card, Input, Modal, Badge, ...)
  motion.tsx               FadeUp / Stagger scroll-reveal wrappers
  toast.tsx                ToastProvider + useToast (never use alert())
  event-form.tsx           Shared form used by events/new and events/[id]/edit
lib/utils.ts               cn() class merger
utils/supabase/
  client.ts                Browser client (client components)
  server.ts                Server client (route handlers / server components)
  middleware.ts            updateSession + route protection logic
middleware.ts              Next middleware entry
supabase/migrations/       Numbered .sql files — run in Supabase SQL editor in order
```

## Database schema (Supabase Postgres)

All tables have RLS enabled (see `supabase/migrations/002_rls.sql`). `auth.uid()` scoping is the security boundary — but **always still filter queries by owner where sensible**.

- **profiles** — `id (uuid, = auth.users.id)`, `full_name`, `subscription_tier`. Created by DB trigger on signup. A DB trigger blocks `subscription_tier` changes unless made with the service role.
- **events** — `user_id` (owner), `title`, `event_type`, `status` ('Confirmed' | 'Contract Pending' | 'Invoice Sent' | 'Lead / Inquiry'), `event_date` (timestamptz, the START time), `setup_time`, `event_end_time`, `pay` (numeric total), `deposit_amount`, `balance_due`, client_* fields, venue_* fields, `guest_count`, `attire`, `client_notes`, `internal_notes`, document url fields (`contract_url`, `invoice_url`, `timeline_url`, `music_list_url`, `planning_doc_url`), `assigned_staff text[]` (LEGACY — do not write to it; use `event_staff`).
- **inventory** — `user_id`, `name`, `category`, `quantity` (total owned), `repair_quantity`, `available_quantity` (legacy, prefer computing), `rental_price`, `current_location`, `owner` (text: who owns the gear), `notes`.
- **event_equipment** — junction: `event_id`, `inventory_id`, `quantity_allocated`.
- **staff** — `owner_id` (the business owner), `user_id` (the staff member's auth id, set after invite), `full_name`, `stage_name`, `email`, `phone`, `address`, `birthday`, `role` ('DJ' | 'MC' | 'Roadie' | 'Coordinator' | 'Admin'), `contract_url`, `status` ('Active' | 'Inactive').
- **event_staff** — junction: `event_id`, `staff_id`. This is the source of truth for crew assignment (replaces `events.assigned_staff` name strings).
- **meetings** — `user_id`, `title`, `meeting_type` ('Client Consult' | 'Venue Walkthrough' | 'Team Meeting'), `meeting_date`, `start_time`, `end_time`, `location`, `status`, `client_name`, `notes`, `event_id` (nullable FK to events).

### Business logic conventions

- "Upcoming" = `event_date >= start of today` (local midnight). "Live" = now between `setup_time` (or `event_date`) and `event_end_time`.
- Warehouse quantity for an inventory item = `quantity - repair_quantity - sum(quantity_allocated of currently-live events)`.
- `balance_due = pay - deposit_amount`; recompute on every write, never trust the stored value blindly. `pay` may come back from Postgres as a string — wrap in `Number()` before math/`.toFixed()`.
- Staff assignment: write rows to `event_staff`; read staff via join. The staff portal finds gigs via `event_staff.staff_id -> staff.user_id = auth.uid()`.

## Security rules (do not regress these)

1. **Never expose `SUPABASE_SECRET_KEY` to the client.** It is only used inside `app/api/**` route handlers via `createClient(url, secretKey)`.
2. **Every API route must authenticate the caller** with the server Supabase client (cookies) before doing anything, and must verify authorization (e.g. invite requires the caller's tier to be `crm`).
3. **Tier changes only happen in `POST /api/tier`.** Client code must never `update({ subscription_tier })` directly — RLS + a DB trigger will reject it anyway.
4. Route protection lives in `utils/supabase/middleware.ts`: `/dashboard/*` requires login + `crm` tier; `/staff/dashboard/*` requires login; logged-in users are bounced off `/login` & `/signup`.
5. RLS is the real boundary; if you add a table, add policies in a new migration file.

## Design system ("Apple-clean")

Light theme modeled on apple.com. Defined in `app/globals.css` + `components/ui/kit.tsx`. **Use the kit primitives — do not hand-roll new card/button styles.**

- Background `#f5f5f7`, surfaces white, text `#1d1d1f`, secondary text `#6e6e73`, hairline borders `#d2d2d7`.
- Accent: `#0071e3` (buttons/links). Brand gradient (violet→blue) reserved for hero headline text only.
- Radius: cards `rounded-[1.25rem]`, buttons/pills `rounded-full`. Shadows are soft and subtle (`shadow-card` utility).
- Typography: big, tight-tracking semibold headlines (`tracking-tight`); labels are 12px medium gray, NOT uppercase-black-widest (that was the old dark theme).
- Motion: use `FadeUp` / `Stagger` from `components/motion.tsx` for scroll reveals. Standard easing `[0.22, 1, 0.36, 1]`, durations 0.5–0.8s. Hover states: slight lift/scale (1.01–1.02), never flashy.
- Feedback: `useToast()` from `components/toast.tsx`. Never `alert()`/`window.confirm()` — use the `ConfirmModal` in kit.tsx for destructive actions.

## Coding conventions

- Pages that need interactivity are client components (`"use client"`) using `createClient()` from `utils/supabase/client`. Route handlers use `utils/supabase/server.ts`.
- Dynamic route params in client pages: `{ params }: { params: Promise<{ id: string }> }` then `const { id } = use(params)` (React 19).
- Type Supabase rows with local `interface`s in the page file (no generated types yet). Avoid `any` where practical.
- Dates: store timestamptz ISO strings; render with `toLocaleDateString` / `toLocaleTimeString`. Convert `datetime-local` input values with `new Date(v).toISOString()` before insert.
- Loading states: skeleton shimmer (`.skeleton` utility) not text pulses.
- Empty states: use `EmptyState` from kit.tsx with an icon, title, description, and action.
- Keep files under ~400 lines; extract shared pieces into `components/`.

## Gotchas

- Tailwind v4: no `tailwind.config.js`. Theme tokens go in `@theme` inside `globals.css`.
- `middleware.ts` matcher excludes static assets; if you add public routes, no middleware change needed unless they must be protected.
- The Tools section (duplicate remover, missing-file finder, Spotify downloader) is intentionally "coming soon" — these need desktop file access and the Spotify one can't ship as-is for legal reasons. Do not attempt to implement actual audio downloading.
- Supabase invite emails redirect to `/staff/setup`, which exchanges the code/hash tokens for a session, then the user sets a password and is sent to `/staff/login?setup=complete`.
- `.env.local` keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, optional `NEXT_PUBLIC_SITE_URL`, optional `ALLOW_DEV_TIER_OVERRIDE=true` (lets you self-assign paid tiers while developing).
- If a migration hasn't been run yet, code that relies on `event_staff` / `staff.owner_id` will error — check `supabase/migrations/` and tell the user to run pending files.

## When asked to add a feature

1. Check this file's schema section — extend via a new numbered migration if needed (never edit old migrations).
2. Reuse kit.tsx primitives and motion wrappers.
3. Add the nav link in `app/dashboard/layout.tsx` if it's a new dashboard section.
4. Scope every query by the logged-in user and add RLS policies for new tables.
5. Run `npx tsc --noEmit` before finishing.
