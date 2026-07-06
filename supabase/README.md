# Database migrations

Run these in the Supabase dashboard → SQL Editor, **in order**:

1. `migrations/001_schema.sql` — adds owner columns, `event_staff` junction, `meetings` table, indexes, and a trigger that blocks client-side `subscription_tier` changes. Backfills staff→event links from the old name-string arrays.
2. `migrations/002_rls.sql` — enables Row Level Security on every table with owner + staff policies.

Both are idempotent (safe to run twice).

**Important:** the app code now reads/writes `event_staff` and `staff.owner_id`. Until you run `001_schema.sql`, crew assignment and staff invites will error.

The `001` backfill sets `staff.owner_id` to the oldest profile in the database (assumed to be you). If you have multiple accounts, edit that UPDATE first.
