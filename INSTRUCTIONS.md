# INSTRUCTIONS — how I work (read me first)

I'm a solo DJ business owner (Charlottesville, VA — lots of UVA / school / Greek, wedding, and corporate gigs) building **NEXORA**, a CRM for DJ businesses that I also run my own business on. You are stepping into both jobs: operating the business in the app, and building the app itself. This file is the onboarding layer; **`CLAUDE.md` is the binding technical spec** — when in doubt, it wins. The **`skills/`** folder has step-by-step playbooks for every recurring task.

## Stack, tools, clients, formats

- **Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (tokens in `@theme` in `app/globals.css` — there is NO tailwind.config), Supabase (auth + Postgres + RLS), Framer Motion, lucide-react.
- **Tools I actually run:** `npm run dev` / `build` / `lint`, `npx tsc --noEmit`. Migrations are numbered `.sql` files in `supabase/migrations/` pasted into the Supabase SQL editor by hand, in order. DJ software: Serato and Rekordbox (library tools target both).
- **Clients:** event types are exactly `Private Event | Wedding | Club / Nightlife | Corporate | School / Greek`. There is no clients table — the client lives on the event row (`client_name`, `client_email`, `client_phone`), so spell repeat clients identically.
- **Formats:** DB stores timestamptz ISO strings (`new Date(v).toISOString()` on the way in); UI renders with `toLocaleDateString` / `toLocaleTimeString`, never hand-formatted. Money renders `$` + `.toFixed(2)` and numerics may arrive as strings — always `Number()` first. Event documents are URLs on the event row (contract, invoice, timeline, planning doc, music list), not blobs. Docs I write are markdown.

## Tone & writing rules

My voice is Apple-clean: short, confident, sentence case, warm but never gimmicky. It applies to UI copy, toasts, empty states, and docs.

1. Sentence case everywhere — headlines, buttons, labels. Never ALL-CAPS labels (that was the old theme; it got ripped out).
2. Short declaratives that end with a period, even tiny ones. Toasts are 2–4 words: `"Pack list saved."`, `"Event deleted."`
3. One light DJ metaphor per surface, max — "the booth", "before the downbeat", gear is "routed". Don't stack puns.
4. Empty states are calm and directive, not apologetic: `"No gear routed"`, `"No crew assigned"`, and they say what to do next.
5. At most one exclamation point per page, reserved for genuinely good news (`"You're all caught up!"`).
6. Helper text is a quiet nudge: `"Double-check your timeline before saving."`

**Sample (real copy of mine, imitate this):**
> Welcome back to the booth. Here's what's happening with your business today.
> Contracts that chase themselves. Pending contracts and unpaid balances surface automatically on your overview, so nothing slips before the downbeat.

Commit messages: short imperative summaries of the feature ("Added calendar and staffing features"). Code comments: full sentences with periods, only where the code can't say it; section dividers like `/* ---------- Gear ---------- */`.

## Weekly tasks → skill files (ordered by hours spent)

| Task | Skill file |
|---|---|
| Music library upkeep — duplicates, missing files, Serato↔Rekordbox (~5+ hrs) | `skills/music-library-maintenance.md` |
| Lead intake & client comms (email/SMS/calls → `Lead / Inquiry` events) | `skills/lead-intake-client-comms.md` |
| Building/maintaining NEXORA (migrations, checks, features) | `skills/dev-maintenance.md` |
| Booking intake — the full event form, 3+ gigs/wk | `skills/event-intake.md` |
| Contract & invoice chasing, event documents | `skills/contract-invoice-chasing.md` |
| Gear pack lists & warehouse availability | `skills/gear-pack-list.md` |
| Crew assignment & staff invites | `skills/crew-assignment.md` |
| Meetings & calendar review | `skills/meetings-and-calendar.md` |

Each file has the exact steps, a real example, and the mistakes I've already had to fix. Follow them literally.

## Non-negotiables (the short version of CLAUDE.md)

- `event_staff` is the source of truth for crew. **Never write `events.assigned_staff`.**
- Recompute `balance_due = pay − deposit_amount` on every write; never trust the stored value.
- Compute warehouse availability (`quantity − repair_quantity − live allocations`); `available_quantity` is legacy.
- `SUPABASE_SECRET_KEY` only in `app/api/**`; every API route authenticates then authorizes; tier changes only via `POST /api/tier`.
- New schema = new numbered migration with RLS. Never edit old migrations.
- UI comes from `components/ui/kit.tsx` + `components/motion.tsx`. Never `alert()`/`window.confirm()` — `useToast()` and `ConfirmModal`.
- "Upcoming" = `event_date >=` today at **local midnight**.

## What a good day's output looks like

**A good ops day:** every new inquiry exists as an event with the right status (`Lead / Inquiry` if unsigned), the dashboard "Action needed" list is worked to empty or near it, this week's gigs each have a saved pack list and assigned crew (crew notified — the app doesn't notify yet), balances updated with `balance_due` recomputed, and any new documents linked on their event rows.

**A good dev day:** one coherent feature or fix, not five half-done ones. Concretely: a new migration (if schema changed) that runs clean in the SQL editor; pages built from kit primitives with skeleton loading and an `EmptyState`; nav link added in `app/dashboard/layout.tsx` if it's a new section; every query scoped to the user; files under ~400 lines; and `npx tsc --noEmit`, `npm run lint`, `npm run build` all passing **before** you call it done. If a migration hasn't been run yet, say so explicitly instead of letting the app error.

**Always:** if you're unsure whether something is a convention or an accident, check `CLAUDE.md`, then the nearest existing page — match what's there.
