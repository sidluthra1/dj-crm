"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, Edit, MapPin, User, Trash2, Wrench, Clock, Truck, FileText, Save,
} from "lucide-react";
import {
  Button, Card, Badge, Field, Input, Modal, ConfirmModal, SkeletonRows, Textarea,
} from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  repair_quantity: number;
  rental_price: number | string;
  current_location: string | null;
  owner: string | null;
  notes: string | null;
  event_equipment: {
    quantity_allocated: number;
    events: {
      id?: string;
      title: string;
      event_date: string;
      setup_time: string | null;
      event_end_time: string | null;
    } | null;
  }[];
}

export default function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    quantity: "1",
    repair_quantity: "0",
    rental_price: "0",
    current_location: "",
    owner: "",
    notes: "",
  });

  const fetchItem = useCallback(async () => {
    const { data } = await supabase
      .from("inventory")
      .select(
        `*, event_equipment ( quantity_allocated, events ( id, title, event_date, setup_time, event_end_time ) )`
      )
      .eq("id", id)
      .single();

    if (data) setItem(data);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const openEdit = () => {
    if (!item) return;
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      repair_quantity: String(item.repair_quantity || 0),
      rental_price: String(item.rental_price ?? 0),
      current_location: item.current_location ?? "",
      owner: item.owner ?? "",
      notes: item.notes ?? "",
    });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    setIsSavingEdit(true);
    const { error } = await supabase
      .from("inventory")
      .update({
        name: editForm.name,
        category: editForm.category,
        quantity: parseInt(editForm.quantity) || 1,
        repair_quantity: parseInt(editForm.repair_quantity) || 0,
        rental_price: parseFloat(editForm.rental_price) || 0,
        current_location: editForm.current_location || null,
        owner: editForm.owner || null,
        notes: editForm.notes || null,
      })
      .eq("id", id);

    setIsSavingEdit(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setIsEditOpen(false);
    toast("Item updated.", "success");
    fetchItem();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    setIsDeleting(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Item deleted.", "success");
    router.push("/dashboard/inventory");
  };

  if (isLoading || !item) {
    return (
      <div className="mx-auto max-w-5xl">
        <SkeletonRows count={3} height="h-40" />
      </div>
    );
  }

  /* ----- time-based math ----- */
  const now = new Date();
  const assignments = item.event_equipment?.filter((a) => a.events) || [];

  const activeDeployments = assignments.filter((a) => {
    const eventStart = new Date(a.events!.event_date);
    const setupStart = a.events!.setup_time ? new Date(a.events!.setup_time) : eventStart;
    const end = a.events!.event_end_time ? new Date(a.events!.event_end_time) : eventStart;
    return now >= setupStart && now <= end;
  });

  const futureBookings = assignments.filter((a) => {
    const eventStart = new Date(a.events!.event_date);
    const setupStart = a.events!.setup_time ? new Date(a.events!.setup_time) : eventStart;
    return setupStart > now;
  });

  const deployedCount = activeDeployments.reduce((sum, a) => sum + a.quantity_allocated, 0);
  const warehouseQty = item.quantity - (item.repair_quantity || 0) - deployedCount;

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to inventory
      </button>

      {/* Header */}
      <Enter>
        <Card className="mb-6 flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center">
          <div>
            <Badge tone="violet" className="mb-3">{item.category}</Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{item.name}</h1>
            <p className="mt-2 text-lg font-semibold text-[#1e7b36]">
              ${Number(item.rental_price || 0)}
              <span className="ml-1 text-sm font-normal text-ink-tertiary">/ day</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button variant="secondary" onClick={openEdit}>
              <Edit size={15} /> Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </Card>
      </Enter>

      {/* Metrics */}
      <Enter delay={0.05}>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="Total owned" value={item.quantity} />
          <MetricCard
            label="In warehouse"
            value={warehouseQty}
            className={warehouseQty <= 0 ? "text-[#b25000]" : "text-[#1e7b36]"}
          />
          <MetricCard label="At event / setup" value={deployedCount} className="text-[#b25000]" />
          <MetricCard label="In repair" value={item.repair_quantity || 0} className="text-[#c30010]" />
        </div>
      </Enter>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details */}
        <Enter delay={0.1}>
          <Card className="h-full p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              Details
            </h3>
            <div className="space-y-4 text-sm">
              <DetailRow icon={<MapPin size={15} />} label="Location" value={item.current_location || "Main Warehouse"} />
              <DetailRow icon={<User size={15} />} label="Owner" value={item.owner || "Company"} />
              <DetailRow icon={<Wrench size={15} />} label="In repair" value={`${item.repair_quantity || 0} units`} />
            </div>
            {item.notes && (
              <>
                <h3 className="mb-2 mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                  <FileText size={13} /> Notes
                </h3>
                <p className="rounded-xl bg-[#fafafa] p-4 text-sm leading-relaxed text-ink-secondary">
                  {item.notes}
                </p>
              </>
            )}
          </Card>
        </Enter>

        {/* Deployments */}
        <Enter delay={0.15} className="lg:col-span-2">
          <Card className="h-full p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              <Truck size={13} /> Deployments & bookings
            </h3>

            {activeDeployments.length === 0 && futureBookings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline py-10 text-center">
                <p className="text-sm font-medium text-ink-tertiary">
                  This item isn&apos;t routed to any events.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {activeDeployments.length > 0 && (
                  <BookingGroup
                    title="Out right now"
                    items={activeDeployments}
                    live
                    onOpen={(eid) => eid && router.push(`/dashboard/events/${eid}`)}
                  />
                )}
                {futureBookings.length > 0 && (
                  <BookingGroup
                    title="Upcoming bookings"
                    items={futureBookings}
                    onOpen={(eid) => eid && router.push(`/dashboard/events/${eid}`)}
                  />
                )}
              </div>
            )}
          </Card>
        </Enter>
      </div>

      {/* Edit modal */}
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit equipment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} loading={isSavingEdit}>
              {!isSavingEdit && <Save size={15} />}
              {isSavingEdit ? "Saving..." : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Item name">
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            </Field>
            <Field label="Rental price / day ($)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editForm.rental_price}
                onChange={(e) => setEditForm({ ...editForm, rental_price: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity owned">
              <Input
                type="number"
                min="0"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </Field>
            <Field label="Units in repair">
              <Input
                type="number"
                min="0"
                value={editForm.repair_quantity}
                onChange={(e) => setEditForm({ ...editForm, repair_quantity: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <Input
                value={editForm.current_location}
                onChange={(e) => setEditForm({ ...editForm, current_location: e.target.value })}
              />
            </Field>
            <Field label="Owner">
              <Input value={editForm.owner} onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this item?"
        description={`"${item.name}" will be removed from inventory and from any event pack lists.`}
        loading={isDeleting}
      />
    </div>
  );
}

/* ---------- helpers ---------- */

function MetricCard({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <Card className="p-5 text-center">
      <p className={cn("text-2xl font-semibold tracking-tight", className)}>{value}</p>
      <p className="mt-1 text-xs text-ink-tertiary">{label}</p>
    </Card>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-ink-secondary">
        <span className="text-ink-tertiary">{icon}</span> {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function BookingGroup({
  title,
  items,
  live = false,
  onOpen,
}: {
  title: string;
  items: InventoryItem["event_equipment"];
  live?: boolean;
  onOpen: (eventId?: string) => void;
}) {
  return (
    <div>
      <p className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold">
        {live && (
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d70015] opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#d70015]" />
          </span>
        )}
        {title}
      </p>
      <div className="space-y-2">
        {items.map((a, i) => (
          <div
            key={i}
            onClick={() => onOpen(a.events?.id)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all hover:border-accent/30 hover:bg-[#f5f9ff]",
              live ? "border-[#d70015]/15 bg-[#fff8f8]" : "border-black/5 bg-[#fafafa]"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#f0f4ff] text-xs font-semibold text-accent">
                {a.quantity_allocated}
              </div>
              <div>
                <p className="text-sm font-medium">{a.events?.title}</p>
                <p className="flex items-center gap-1 text-xs text-ink-tertiary">
                  <Clock size={11} />
                  {a.events &&
                    new Date(a.events.event_date).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-accent">View →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
