# Skill: Meetings & calendar upkeep

## When to use
A client consult, venue walkthrough, or team meeting needs scheduling, or the week's calendar needs reviewing.

## Steps, in order
1. Create meetings via `app/dashboard/meetings/new/page.tsx`, which inserts into the `meetings` table (schema in `supabase/migrations/001_schema.sql`).
2. Choose `meeting_type` from the exact set: `'Client Consult' | 'Venue Walkthrough' | 'Team Meeting'`.
3. Set `meeting_date` (timestamptz) plus optional `start_time` / `end_time`, `location`, `client_name`, and `notes`. `status` defaults to `'Scheduled'`.
4. If the meeting is about a specific gig, link it: `event_id` is a nullable FK to `events` (`on delete set null`) — always set it when the event exists so the meeting survives on its own if the event is deleted, but stays connected while it lives.
5. Convert any `datetime-local` input values with `new Date(v).toISOString()` before insert, and scope the row with `user_id`.
6. Review the week on `app/dashboard/calendar/page.tsx` (month grid of events) and the meetings lists: `meetings/upcoming` vs `meetings/previous` split at start of today, same local-midnight rule as events.
7. There is no external calendar sync yet — anything that must alert your phone has to be added to your personal calendar manually (planned automation: an ICS feed route).

## Example of a good final output (meetings row matching the real schema in 001_schema.sql)
```ts
await supabase.from("meetings").insert([{
  user_id: user.id,
  title: "Walkthrough — Newcomb Hall Ballroom",
  meeting_type: "Venue Walkthrough",         // 'Client Consult' | 'Venue Walkthrough' | 'Team Meeting'
  meeting_date: "2026-04-10T15:00:00.000Z",
  start_time: "2026-04-10T15:00:00.000Z",
  end_time: "2026-04-10T16:00:00.000Z",
  location: "180 McCormick Rd, Charlottesville, VA 22904",
  status: "Scheduled",
  client_name: "UVA Programming Council",
  notes: "Confirm load-in path, power drops near stage, and 12am hard stop.",
  event_id: "9f3c...",                        // FK to the Spring Formal event
}]);
```

## Mistakes to avoid (corrections already baked into this repo)
- `meeting_type` and `status` are exact strings — invented variants won't match the list filters or badge tones.
- `meeting_date` is a timestamptz, not a date — insert a full ISO instant, and render with `toLocaleDateString` / `toLocaleTimeString` (never hand-format).
- Don't duplicate event data into a "Team Meeting" — link with `event_id` instead; the FK is `on delete set null` by design.
- "Upcoming" is `>= start of today at local midnight`, consistent with events — using raw `new Date()` hides today's meetings that already started.
- Scope every meetings query by the logged-in user; RLS enforces it, but queries should still filter (CLAUDE.md convention).
