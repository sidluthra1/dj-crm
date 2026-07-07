# Skill: Gear pack list (route equipment to an event)

## When to use
A gig needs equipment assigned from inventory, or you need to know what's actually available in the warehouse right now.

## Steps, in order
1. Open the event detail page (`app/dashboard/events/[id]/page.tsx`) → "Gear pack list" card → **Modify**. All allocation logic lives there.
2. Load the full inventory: `supabase.from("inventory").select("id, name, category, quantity").order("category")`, grouped by `category` for display.
3. Pre-seed the allocation map from the event's existing `event_equipment` rows (`inventory_id → quantity_allocated`).
4. Adjust quantities per item, clamped to `0 ≤ qty ≤ item.quantity` (you can't route more than you own).
5. Save with the delete-then-insert pattern from `saveGearPackList`:
   - `delete from event_equipment where event_id = <id>`
   - insert one row per item with `qty > 0`: `{ event_id, inventory_id, quantity_allocated }`
6. To answer "what's in the warehouse", compute it — never read a stored availability column. Real-time warehouse qty (from `app/dashboard/inventory/page.tsx`):
   - An event is "live" if `now` is between its `setup_time` (falling back to `event_date`) and its `event_end_time` (falling back to `event_date`).
   - `warehouse = quantity - repair_quantity - sum(quantity_allocated of live events)`
7. Check the item's next booked date before promising it elsewhere: earliest upcoming `event_date` among its `event_equipment` joins (`getNextUseDate`).

## Example of a good final output (real insert shape from saveGearPackList)
```ts
// Pack list for one event, written to event_equipment:
const inserts = [
  { event_id: id, inventory_id: "a1b2...", quantity_allocated: 2 }, // e.g. 2x QSC K12.2 (Speakers)
  { event_id: id, inventory_id: "c3d4...", quantity_allocated: 1 }, // e.g. 1x DJM-900NXS2 (Mixers)
  { event_id: id, inventory_id: "e5f6...", quantity_allocated: 4 }, // e.g. 4x Uplights (Lighting)
];
await supabase.from("event_equipment").delete().eq("event_id", id);
await supabase.from("event_equipment").insert(inserts);
```
And the warehouse computation that must accompany any availability answer:
```ts
const deployed = (item.event_equipment || []).reduce((sum, ee) => {
  if (!ee.events) return sum;
  const start = ee.events.setup_time ? new Date(ee.events.setup_time) : new Date(ee.events.event_date);
  const end   = ee.events.event_end_time ? new Date(ee.events.event_end_time) : new Date(ee.events.event_date);
  return now >= start && now <= end ? sum + ee.quantity_allocated : sum;
}, 0);
return item.quantity - (item.repair_quantity || 0) - deployed;
```

## Mistakes to avoid (corrections already baked into this repo)
- **`inventory.available_quantity` is legacy — do not read or write it.** Availability is always computed from `quantity - repair_quantity - live allocations` (that's why `getWarehouseQty` exists).
- Filter out zero-quantity allocations before inserting (`.filter(([, qty]) => qty > 0)`) — don't write rows with `quantity_allocated: 0`.
- Only count allocations of **currently-live** events as deployed. Summing all `event_equipment` rows makes everything look permanently checked out.
- "Live" starts at `setup_time` when present, not `event_date` — gear leaves the warehouse at load-in, not at the downbeat.
- Deleting an inventory item is destructive; confirm with `ConfirmModal` from kit.tsx, never `window.confirm()`.
- `rental_price` is typed `number | string` — `Number()` it before math.
