"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Package, Plus, Search, ChevronDown, Folder, Calendar as CalendarIcon, Trash2,
} from "lucide-react";
import { PageHeader, Button, Input, EmptyState, SkeletonRows, ConfirmModal } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  repair_quantity: number;
  rental_price: number | string;
  event_equipment: {
    quantity_allocated: number;
    events: {
      event_date: string;
      setup_time: string | null;
      event_end_time: string | null;
    } | null;
  }[];
}

export default function InventoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInventory = async () => {
    const { data } = await supabase
      .from("inventory")
      .select(
        `*, event_equipment ( quantity_allocated, events ( event_date, setup_time, event_end_time ) )`
      )
      .order("category", { ascending: true });

    if (data) {
      setInventoryItems(data);
      const categories = [...new Set(data.map((item) => item.category))];
      setOpenCategories(categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {}));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [inventoryItems, query]);

  const groupedInventory = useMemo(
    () =>
      filtered.reduce((acc, item) => {
        (acc[item.category] ||= []).push(item);
        return acc;
      }, {} as Record<string, InventoryItem[]>),
    [filtered]
  );

  const toggleCategory = (category: string) =>
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));

  /** Closest upcoming date this item is booked for. */
  const getNextUseDate = (item: InventoryItem) => {
    const now = new Date();
    const upcoming = (item.event_equipment || [])
      .map((ee) => (ee.events ? new Date(ee.events.event_date) : null))
      .filter((d): d is Date => !!d && d > now)
      .sort((a, b) => a.getTime() - b.getTime());
    return upcoming[0] ?? null;
  };

  /** Real-time warehouse qty = total − in repair − currently deployed (by allocated qty). */
  const getWarehouseQty = (item: InventoryItem) => {
    const now = new Date();
    const deployed = (item.event_equipment || []).reduce((sum, ee) => {
      if (!ee.events) return sum;
      const start = ee.events.setup_time
        ? new Date(ee.events.setup_time)
        : new Date(ee.events.event_date);
      const end = ee.events.event_end_time
        ? new Date(ee.events.event_end_time)
        : new Date(ee.events.event_date);
      return now >= start && now <= end ? sum + ee.quantity_allocated : sum;
    }, 0);
    return item.quantity - (item.repair_quantity || 0) - deployed;
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("inventory").delete().eq("id", pendingDelete.id);
    setIsDeleting(false);
    setPendingDelete(null);
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Item deleted.", "success");
      fetchInventory();
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <PageHeader
        title="Equipment inventory"
        subtitle="Track your gear, availability, and rental rates."
        actions={
          <>
            <div className="relative hidden md:block">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gear..."
                className="w-56 pl-10"
              />
            </div>
            <Button onClick={() => router.push("/dashboard/inventory/new")}>
              <Plus size={16} /> Add item
            </Button>
          </>
        }
      />

      {isLoading ? (
        <SkeletonRows count={3} height="h-40" />
      ) : Object.keys(groupedInventory).length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title={query ? "No matches" : "No equipment yet"}
          description={
            query
              ? "Try a different search term."
              : "Log your speakers, decks, lighting, and cables to start routing gear to events."
          }
          action={
            !query ? (
              <Button onClick={() => router.push("/dashboard/inventory/new")}>
                <Plus size={16} /> Add your first item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInventory).map(([category, items]) => (
            <div
              key={category}
              className="shadow-card overflow-hidden rounded-[1.25rem] border border-black/[0.04] bg-white"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-[#fafafa]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#f0f4ff] text-accent">
                    <Folder size={18} />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">{category}</h3>
                  <span className="rounded-full bg-[#f0f0f2] px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-ink-tertiary transition-transform duration-300",
                    openCategories[category] && "rotate-180"
                  )}
                />
              </button>

              {openCategories[category] && (
                <div className="border-t border-black/5">
                  <div className="hidden grid-cols-12 gap-4 border-b border-black/5 bg-[#fafafa] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary lg:grid">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Next use</div>
                    <div className="col-span-2 text-center">Avail / total</div>
                    <div className="col-span-2 pr-10 text-right">Rent price</div>
                  </div>

                  <div className="divide-y divide-black/5">
                    {items.map((item) => {
                      const nextUse = getNextUseDate(item);
                      const warehouseQty = getWarehouseQty(item);
                      return (
                        <div
                          key={item.id}
                          onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
                          className="group grid cursor-pointer grid-cols-1 items-center gap-3 px-6 py-4 transition-colors hover:bg-[#f5f9ff] lg:grid-cols-12 lg:gap-4"
                        >
                          <div className="text-sm font-medium transition-colors group-hover:text-accent lg:col-span-5">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-secondary lg:col-span-3">
                            <CalendarIcon className="size-3.5 shrink-0 text-accent" />
                            {nextUse
                              ? nextUse.toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Not scheduled"}
                          </div>
                          <div className="flex lg:col-span-2 lg:justify-center">
                            <span
                              className={cn(
                                "rounded-lg border border-black/5 bg-[#fafafa] px-2.5 py-1 text-sm font-medium",
                                warehouseQty <= 0 && "text-[#b25000]"
                              )}
                            >
                              {warehouseQty} <span className="text-ink-tertiary">/ {item.quantity}</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2 lg:col-span-2">
                            <span className="text-sm font-semibold text-[#1e7b36]">
                              ${Number(item.rental_price || 0)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDelete(item);
                              }}
                              title="Delete item"
                              className="rounded-lg p-2 text-ink-tertiary opacity-0 transition-all hover:bg-[#fff0f0] hover:text-danger group-hover:opacity-100"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this item?"
        description={`"${pendingDelete?.name}" will be removed from inventory and from any event pack lists.`}
        loading={isDeleting}
      />
    </div>
  );
}
