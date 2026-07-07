# Skill: Event intake (create or edit a booking)

## When to use
A new gig inquiry or confirmed booking needs to become an `events` row — or an existing booking's details changed.

## Steps, in order
1. Open the shared form component `components/event-form.tsx`. Both `app/dashboard/events/new/page.tsx` and `app/dashboard/events/[id]/edit/page.tsx` render `<EventForm>`; never build a second event form.
2. Collect the core details first (required fields are `title`, `event_date`, `client_name`). `event_type` must be one of: Private Event, Wedding, Club / Nightlife, Corporate, School / Greek. `status` must be one of: Confirmed, Contract Pending, Invoice Sent, Lead / Inquiry.
3. Enter the timeline as three `datetime-local` values: `setup_time` (load-in), `event_date` (**this is the START time**, not just a date), `event_end_time`.
4. Enter financials: `pay` (total invoice) and `deposit_amount`. Compute `balance_due = pay - deposit_amount` at write time and include it in the payload.
5. Fill client info (`client_name`, `client_email`, `client_phone`) and venue info (`venue_name`, `venue_address`, `venue_website`, `distance_to_venue`, `travel_time` — the last two are free text like "30 miles" / "45 mins", looked up from the venue address).
6. Add `guest_count` (integer), `attire`, `client_notes` (what the client asked for), `internal_notes` (private team notes).
7. Convert every datetime-local value with `new Date(v).toISOString()` before insert (`formatForDB` in event-form.tsx does this). Empty optional strings become `null`, not `""`.
8. Insert into `events` with `user_id` set to the logged-in user (`supabase.auth.getUser()`); update by `.eq("id", eventId)` in edit mode.
9. On success, toast (`useToast()`) and route to `/dashboard/events/{id}`.
10. Gear and crew are NOT part of this form — assign them afterward on the event detail page (see `gear-pack-list.md` and `crew-assignment.md`).

## Example of a good final output (real payload shape from event-form.tsx)
```ts
const payload = {
  user_id: user.id,
  title: "UVA Spring Formal 2026",        // real placeholder used in the form
  event_type: "School / Greek",
  status: "Confirmed",
  event_date: "2026-04-18T19:00:00.000Z", // START time, ISO via formatForDB
  setup_time: "2026-04-18T17:00:00.000Z",
  event_end_time: "2026-04-19T00:00:00.000Z",
  pay: 1200,
  deposit_amount: 400,
  balance_due: 800,                        // recomputed: pay - deposit, never trusted
  client_name: "UVA Programming Council",
  client_email: "events@virginia.edu",
  client_phone: null,
  venue_name: "Newcomb Hall Ballroom",
  venue_address: "180 McCormick Rd, Charlottesville, VA 22904",
  distance_to_venue: "3 miles",
  travel_time: "10 mins",
  venue_contact_email: null,
  venue_contact_phone: null,
  venue_website: null,
  guest_count: 350,
  attire: "Formal",
  client_notes: "Special requests from the client...",
  internal_notes: "Private notes for the team...",
};
```

## Mistakes to avoid (corrections already baked into this repo)
- **Do not write to `events.assigned_staff`.** It is a legacy `text[]` of names; crew lives in the `event_staff` junction table. A migration had to backfill from it once already.
- **Never trust the stored `balance_due`** — recompute `pay - deposit_amount` on every write. The dashboard even has fallback code for rows where it's wrong.
- **`pay` can come back from Postgres as a string.** Wrap in `Number()` before math or `.toFixed()` — page types declare `pay: number | string | null` for this reason.
- Don't insert raw `datetime-local` strings; convert with `new Date(v).toISOString()` first.
- Don't use `alert()` or `window.confirm()` — use `useToast()` and `ConfirmModal` from `components/ui/kit.tsx`.
- "Upcoming" means `event_date >= start of TODAY` (local midnight, `now.setHours(0,0,0,0)`), not `>= new Date()` — otherwise tonight's gig disappears from upcoming lists.
