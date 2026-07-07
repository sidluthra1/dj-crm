# Skill: Lead intake & client communication

## When to use
A new inquiry arrives (email, SMS, or call today; the CRM should eventually handle these automatically) and needs to become a tracked lead/event, or a client needs a quote, follow-up, or reminder.

## Steps, in order
1. Capture the inquiry into the CRM immediately as an event with `status: "Lead / Inquiry"` — that status exists precisely so unconfirmed leads live in the same pipeline (see the status Select in `components/event-form.tsx`). Minimum viable row: `title`, `event_date` (best-known start time), `client_name`, plus whatever contact info you have in `client_email` / `client_phone`.
2. Put the client's own words into `client_notes` ("Special requests from the client...") and your read on it into `internal_notes` ("Private notes for the team...").
3. As the conversation progresses, advance `status` along the real pipeline: `Lead / Inquiry` → `Contract Pending` → `Invoice Sent` → `Confirmed`, updating `pay` / `deposit_amount` (and recomputing `balance_due`) as numbers firm up.
4. For follow-ups, work from the dashboard "Action needed" list (`app/dashboard/page.tsx`) — it derives contract and payment reminders automatically from status and balance (see `contract-invoice-chasing.md`).
5. If building the automated version of this (planned): create a `leads` table via a **new numbered migration** with RLS policies, a public capture form, and an API route in `app/api/leads/` that follows the auth pattern in `app/api/staff/invite/route.ts` — authenticate with the server client from `utils/supabase/server.ts`, authorize, only then act. Any email/SMS sending must go through a server route; never expose provider keys to the client.
6. Book any resulting consult as a meeting (`meeting_type: "Client Consult"`) linked to the event via `meetings.event_id` (see `meetings-and-calendar.md`).

## Example of a good final output (a lead captured with real form values/placeholders)
```ts
const payload = {
  user_id: user.id,
  title: "UVA Spring Formal 2026",
  event_type: "School / Greek",
  status: "Lead / Inquiry",              // not Confirmed — nothing is signed yet
  event_date: "2026-04-18T19:00:00.000Z",
  setup_time: null,
  event_end_time: null,
  pay: 1200,                              // quoted, not invoiced
  deposit_amount: 0,
  balance_due: 1200,
  client_name: "UVA Programming Council",
  client_email: "events@virginia.edu",
  client_phone: "434-555-0100",
  venue_name: "Newcomb Hall Ballroom",
  venue_address: null,
  guest_count: 350,
  attire: null,
  client_notes: "Wants open-format set, strict 12am cutoff, needs mic for announcements.",
  internal_notes: "Came in via email 7/6. Quote sent, awaiting committee approval.",
};
```

## Mistakes to avoid (corrections already baked into this repo)
- **Don't leave leads outside the CRM** (inbox, notes app). The `Lead / Inquiry` status and the "Total clients" stat both assume every conversation becomes an events row.
- Status strings are exact: `"Lead / Inquiry"` with spaces around the slash. A typo'd status silently drops the event from pending-contract counts and `statusTone` badge colors.
- Client identity lives on the event (`client_name` et al.) — there is **no separate clients table**; the dashboard counts unique clients with `new Set(allEvents.map(e => e.client_name))`. Spell a repeat client's name identically or they count twice.
- Any future email/SMS automation is a server-side route handler: authenticate the caller first, keep `SUPABASE_SECRET_KEY` and provider keys out of client components (Security rules 1–2 in CLAUDE.md).
- New tables (e.g. `leads`) require a **new** migration file with RLS policies — never edit `001_schema.sql`/`002_rls.sql`.
- Use `useToast()` for send/save feedback, never `alert()`.
