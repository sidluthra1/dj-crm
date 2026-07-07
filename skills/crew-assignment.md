# Skill: Crew assignment & staffing

## When to use
A gig needs staff assigned, a new crew member needs inviting, or you need to know who works which event.

## Steps, in order

### Assigning crew to an event
1. Open the event detail page (`app/dashboard/events/[id]/page.tsx`) → "Crew / staff" card → **Manage**.
2. Load the roster of assignable people: `supabase.from("staff").select("id, full_name, stage_name, role").eq("status", "Active").order("role")` — only **Active** staff are assignable.
3. Toggle selections, then save with the delete-then-insert pattern from `saveStaffList`:
   - `delete from event_staff where event_id = <id>`
   - insert `{ event_id, staff_id }` for each selected staff id.
4. Read assignments back via the join: `event_staff ( staff_id, staff ( id, full_name, stage_name, role ) )`. Display `stage_name || full_name`.
5. Notify the assigned crew yourself (text/email) — the app does not send notifications on assignment yet. Staff can also see the gig in the staff portal, which resolves gigs via `event_staff.staff_id → staff.user_id = auth.uid()`.

### Inviting a new staff member
1. Use the roster page (`app/dashboard/staff/page.tsx`) invite modal, which POSTs to `/api/staff/invite`.
2. The route (`app/api/staff/invite/route.ts`) must, in order: authenticate the caller with the server Supabase client → verify the caller's `subscription_tier === "crm"` → use the service-role client to `inviteUserByEmail(email, { data, redirectTo: <site>/staff/setup })` → insert the `staff` row with `owner_id = caller`, `user_id = invited auth id`, `status: "Active"`.
3. Required fields: `full_name` and `email`. `role` must be one of: DJ, MC, Roadie, Coordinator, Admin (defaults to DJ).
4. The invite email lands on `/staff/setup`, where the invitee exchanges tokens for a session, sets a password, and is sent to `/staff/login?setup=complete`.

## Example of a good final output (real shapes from this repo)
Crew saved to the junction table:
```ts
await supabase.from("event_staff").delete().eq("event_id", id);
await supabase.from("event_staff").insert([
  { event_id: id, staff_id: "s1..." }, // e.g. a DJ
  { event_id: id, staff_id: "s2..." }, // e.g. an MC
]);
```
Staff row created by an invite (from app/api/staff/invite/route.ts):
```ts
await supabaseAdmin.from("staff").insert([{
  owner_id: user.id,          // the business owner who invited
  user_id: authData.user.id,  // the staff member's auth id
  full_name: "Jane Doe",
  stage_name: "DJ Jane",
  email: "jane@example.com",
  phone: null,
  address: null,
  birthday: null,
  role: "DJ",                 // 'DJ' | 'MC' | 'Roadie' | 'Coordinator' | 'Admin'
  contract_url: null,
  status: "Active",
}]);
```

## Mistakes to avoid (corrections already baked into this repo)
- **`event_staff` is the source of truth. Never write to `events.assigned_staff`** — that legacy `text[]` of names caused a one-time backfill migration (001_schema.sql matches names against `stage_name`/`full_name` to recover data). Name strings break the staff portal, which joins on ids.
- Never call `inviteUserByEmail` from the client — the service key (`SUPABASE_SECRET_KEY`) lives only in `app/api/**` route handlers.
- The invite route must check tier `crm` **before** doing anything with the service-role client; it runs with god-mode permissions.
- Don't offer Inactive staff in the assignment modal — the query filters `status = 'Active'` on purpose.
- `owner_id` (the business owner) and `user_id` (the staff member's login) are different columns; mixing them up breaks both RLS and the staff portal lookup.
- Display names are `stage_name || full_name` — don't show only `full_name` when a stage name exists.
