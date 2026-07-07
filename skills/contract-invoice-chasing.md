# Skill: Contract & invoice chasing

## When to use
Weekly sweep of every event that still needs a contract signed or a balance collected, and attaching the resulting documents to the event.

## Steps, in order
1. Query all events: `supabase.from("events").select("id, title, event_date, status, client_name, pay, deposit_amount, balance_due")` ordered by `event_date` ascending.
2. Compute each event's real balance with the fallback used in `app/dashboard/page.tsx`:
   ```ts
   const balanceOf = (e) => {
     const stored = Number(e.balance_due);
     if (!Number.isNaN(stored) && e.balance_due !== null) return stored;
     return (Number(e.pay) || 0) - (Number(e.deposit_amount) || 0);
   };
   ```
3. Build the action list, exactly as the dashboard does:
   - Every event with `status === "Contract Pending"` → a **contract** action.
   - Every event with `balanceOf(e) > 0` AND `event_date >= start of today` → a **payment** action.
4. Work each action: send/sign the contract, or request the balance from `client_email` / `client_phone` on the event.
5. When a document exists, store its link on the event row. The five URL slots (see the DocButton list in `app/dashboard/events/[id]/page.tsx`) are: `planning_doc_url` (Master planning doc), `contract_url` (Contract agreement), `invoice_url` (Event invoice), `timeline_url` (Event timeline), `music_list_url` (Music request list). Some will eventually be CRM-generated; others are uploaded/pasted manually — either way the URL goes in these fields.
6. Flip `status` as things resolve: Contract Pending → Confirmed once signed; use Invoice Sent when the invoice goes out. Update `deposit_amount` when money arrives and recompute `balance_due`.
7. Cap the visible action list at the most urgent items (the dashboard shows `actions.slice(0, 6)`).

## Example of a good final output (real action-item shape from app/dashboard/page.tsx)
```ts
const actions: ActionItem[] = [
  {
    id: "contract-9f3c...",
    type: "contract",
    message: "Send / sign contract for UVA Programming Council",
    eventId: "9f3c...",
  },
  {
    id: "payment-9f3c...",
    type: "payment",
    message: "Collect $800.00 balance for UVA Spring Formal 2026",
    eventId: "9f3c...",
  },
];
```
Contract messages use `client_name || title`; payment messages use `title` and format the balance with `.toFixed(2)`.

## Mistakes to avoid (corrections already baked into this repo)
- **Never trust stored `balance_due` blindly** — the `balanceOf` fallback exists because stored values drift. Always recompute from `pay - deposit_amount` when the stored value is null/NaN, and clamp negatives with `Math.max(bal, 0)` when summing outstanding totals.
- **`pay`, `deposit_amount`, `balance_due` may arrive as strings** from Postgres numerics. `Number()` them before comparing or `.toFixed()` — a string `"800.00" > 0` check will mislead you.
- Only chase payment for events on/after **today at local midnight** — past events with balances are a bookkeeping question, not a pre-event reminder (the dashboard filters `new Date(e.event_date) >= now` with hours zeroed).
- Status values are exact strings: `'Confirmed' | 'Contract Pending' | 'Invoice Sent' | 'Lead / Inquiry'`. Don't invent variants like "Pending" or "Signed".
- Document fields hold **URLs only** — don't try to store file blobs on the events row.
