"use client";

import { use, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, MapPin, User, Clock, Package, Edit, Trash2, Mail, Phone, Globe,
  Navigation, Users, FileText, Download, Music, ShieldCheck, MessageSquare,
  UserPlus, FileSignature, CreditCard, Plus, Minus, Check,
} from "lucide-react";
import {
  Button, Card, Badge, statusTone, Modal, ConfirmModal, SkeletonRows,
} from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";
import { cn } from "@/lib/utils";

interface StaffRow {
  id: string;
  full_name: string;
  stage_name: string | null;
  role: string;
}

interface InventoryRow {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

interface EquipmentJoin {
  inventory_id: string;
  quantity_allocated: number;
  inventory: { id: string; name: string; category: string } | null;
}

interface StaffJoin {
  staff_id: string;
  staff: StaffRow | null;
}

interface EventDetail {
  id: string;
  title: string;
  event_type: string | null;
  status: string;
  event_date: string;
  setup_time: string | null;
  event_end_time: string | null;
  pay: number | string | null;
  deposit_amount: number | string | null;
  balance_due: number | string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  venue_name: string | null;
  venue_address: string | null;
  location: string | null;
  distance_to_venue: string | null;
  travel_time: string | null;
  venue_contact_email: string | null;
  venue_contact_phone: string | null;
  venue_website: string | null;
  guest_count: number | null;
  attire: string | null;
  client_notes: string | null;
  internal_notes: string | null;
  planning_doc_url: string | null;
  contract_url: string | null;
  invoice_url: string | null;
  timeline_url: string | null;
  music_list_url: string | null;
  event_equipment: EquipmentJoin[];
  event_staff: StaffJoin[];
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<StaffRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gear modal
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [fullInventory, setFullInventory] = useState<InventoryRow[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isSavingGear, setIsSavingGear] = useState(false);

  // Staff modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [fullStaffList, setFullStaffList] = useState<StaffRow[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select(
        `*,
        event_equipment ( inventory_id, quantity_allocated, inventory ( id, name, category ) ),
        event_staff ( staff_id, staff ( id, full_name, stage_name, role ) )`
      )
      .eq("id", id)
      .single();

    if (data) {
      const detail = data as unknown as EventDetail;
      setEvent(detail);
      setAssignedStaff(
        (detail.event_staff || []).map((es) => es.staff).filter((s): s is StaffRow => !!s)
      );
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  /* ---------- Gear ---------- */

  const openGearModal = async () => {
    setIsGearModalOpen(true);
    const { data } = await supabase.from("inventory").select("id, name, category, quantity").order("category");
    if (data) setFullInventory(data);

    const current: Record<string, number> = {};
    event?.event_equipment?.forEach((eq) => {
      current[eq.inventory_id] = eq.quantity_allocated;
    });
    setAllocations(current);
  };

  const updateAllocation = (inventoryId: string, delta: number, maxQty: number) => {
    setAllocations((prev) => {
      const next = Math.min(Math.max((prev[inventoryId] || 0) + delta, 0), maxQty);
      return { ...prev, [inventoryId]: next };
    });
  };

  const saveGearPackList = async () => {
    setIsSavingGear(true);
    const { error: delError } = await supabase.from("event_equipment").delete().eq("event_id", id);

    const inserts = Object.entries(allocations)
      .filter(([, qty]) => qty > 0)
      .map(([invId, qty]) => ({ event_id: id, inventory_id: invId, quantity_allocated: qty }));

    let insError = null;
    if (inserts.length > 0) {
      ({ error: insError } = await supabase.from("event_equipment").insert(inserts));
    }

    setIsSavingGear(false);
    if (delError || insError) {
      toast((delError || insError)!.message, "error");
      return;
    }
    setIsGearModalOpen(false);
    toast("Pack list saved.", "success");
    fetchEventDetails();
  };

  /* ---------- Staff (event_staff junction — source of truth) ---------- */

  const openStaffModal = async () => {
    setIsStaffModalOpen(true);
    const { data } = await supabase
      .from("staff")
      .select("id, full_name, stage_name, role")
      .eq("status", "Active")
      .order("role");
    if (data) setFullStaffList(data);
    setSelectedStaffIds(assignedStaff.map((s) => s.id));
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId) ? prev.filter((x) => x !== staffId) : [...prev, staffId]
    );
  };

  const saveStaffList = async () => {
    setIsSavingStaff(true);
    const { error: delError } = await supabase.from("event_staff").delete().eq("event_id", id);

    let insError = null;
    if (selectedStaffIds.length > 0) {
      ({ error: insError } = await supabase
        .from("event_staff")
        .insert(selectedStaffIds.map((staff_id) => ({ event_id: id, staff_id }))));
    }

    setIsSavingStaff(false);
    if (delError || insError) {
      toast((delError || insError)!.message, "error");
      return;
    }
    setIsStaffModalOpen(false);
    toast("Crew list saved.", "success");
    fetchEventDetails();
  };

  /* ---------- Delete ---------- */

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("events").delete().eq("id", id);
    setIsDeleting(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    toast("Event deleted.", "success");
    router.push("/dashboard/events/upcoming");
  };

  if (isLoading || !event) {
    return (
      <div className="mx-auto max-w-6xl">
        <SkeletonRows count={3} height="h-44" />
      </div>
    );
  }

  const pay = Number(event.pay) || 0;
  const deposit = Number(event.deposit_amount) || 0;
  const balance =
    event.balance_due !== null && !Number.isNaN(Number(event.balance_due))
      ? Number(event.balance_due)
      : pay - deposit;

  const groupedInventory = fullInventory.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {} as Record<string, InventoryRow[]>);

  const groupedStaff = fullStaffList.reduce((acc, staff) => {
    (acc[staff.role] ||= []).push(staff);
    return acc;
  }, {} as Record<string, StaffRow[]>);

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to events
      </button>

      {/* Header */}
      <Enter>
        <Card className="mb-6 flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone={statusTone(event.status)}>{event.status}</Badge>
              <Badge>{event.event_type || "Private Event"}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{event.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
              <Clock className="size-4 text-accent" />
              {new Date(event.event_date).toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="secondary" onClick={() => router.push(`/dashboard/events/${id}/edit`)}>
              <Edit size={15} /> Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </Card>
      </Enter>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Col 1 */}
        <div className="space-y-6 lg:col-span-4">
          <Enter delay={0.05}>
            <Card className="p-6">
              <SectionLabel icon={<Clock size={14} />}>Timeline</SectionLabel>
              <InfoRow label="Setup" value={fmtTime(event.setup_time)} />
              <InfoRow label="Event start" value={fmtTime(event.event_date)} highlight />
              <InfoRow label="Event end" value={fmtTime(event.event_end_time)} last />
            </Card>
          </Enter>

          <Enter delay={0.1}>
            <Card className="p-6">
              <SectionLabel icon={<CreditCard size={14} />}>Financials</SectionLabel>
              <InfoRow label="Total invoice" value={`$${pay.toFixed(2)}`} />
              <InfoRow label="Deposit paid" value={`$${deposit.toFixed(2)}`} />
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#fafafa] px-4 py-3.5">
                <span className="text-sm text-ink-secondary">Balance due</span>
                <span
                  className={cn(
                    "text-lg font-semibold tracking-tight",
                    balance > 0 ? "text-[#b25000]" : "text-[#1e7b36]"
                  )}
                >
                  ${balance.toFixed(2)}
                </span>
              </div>
            </Card>
          </Enter>

          <Enter delay={0.15}>
            <Card className="p-6">
              <SectionLabel icon={<MapPin size={14} />}>Venue & travel</SectionLabel>
              <p className="font-medium">{event.venue_name || event.location || "TBD"}</p>
              <p className="mt-0.5 text-sm text-ink-secondary">
                {event.venue_address || "Address not provided"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat icon={<Navigation size={12} />} label="Distance" value={event.distance_to_venue || "TBD"} />
                <MiniStat icon={<Clock size={12} />} label="Travel time" value={event.travel_time || "TBD"} />
              </div>
              <div className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm text-ink-secondary">
                <p className="flex items-center gap-2"><Mail size={14} /> {event.venue_contact_email || "No contact listed"}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {event.venue_contact_phone || "No phone listed"}</p>
                {event.venue_website ? (
                  <a
                    href={event.venue_website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-accent hover:underline"
                  >
                    <Globe size={14} /> Venue website
                  </a>
                ) : (
                  <p className="flex items-center gap-2"><Globe size={14} /> No website listed</p>
                )}
              </div>
            </Card>
          </Enter>

          <Enter delay={0.2}>
            <Card className="p-6">
              <SectionLabel icon={<User size={14} />}>Client info</SectionLabel>
              <p className="text-lg font-medium">{event.client_name}</p>
              <div className="mt-2 space-y-2 text-sm text-ink-secondary">
                <p className="flex items-center gap-2"><Mail size={14} /> {event.client_email || "Pending"}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {event.client_phone || "Pending"}</p>
              </div>
            </Card>
          </Enter>
        </div>

        {/* Col 2 */}
        <div className="space-y-6 lg:col-span-4">
          <Enter delay={0.05}>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 text-center">
                <Users className="mx-auto mb-2 size-5 text-accent" />
                <p className="text-xs text-ink-tertiary">Est. guests</p>
                <p className="text-xl font-semibold tracking-tight">{event.guest_count || "—"}</p>
              </Card>
              <Card className="p-5 text-center">
                <ShieldCheck className="mx-auto mb-2 size-5 text-[#5b45b0]" />
                <p className="text-xs text-ink-tertiary">Attire</p>
                <p className="mt-0.5 text-sm font-medium">{event.attire || "Standard"}</p>
              </Card>
            </div>
          </Enter>

          {/* Crew */}
          <Enter delay={0.1}>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel icon={<UserPlus size={14} />} noMargin>Crew / staff</SectionLabel>
                <Button size="sm" variant="ghost" onClick={openStaffModal}>
                  Manage
                </Button>
              </div>
              {assignedStaff.length > 0 ? (
                <div className="space-y-2.5">
                  {assignedStaff.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl bg-[#fafafa] p-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#f0f4ff] text-xs font-semibold text-accent">
                        {(s.stage_name || s.full_name).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.stage_name || s.full_name}</p>
                        <p className="text-xs text-ink-tertiary">{s.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DashedEmpty>No crew assigned</DashedEmpty>
              )}
            </Card>
          </Enter>

          <Enter delay={0.15}>
            <Card className="p-6">
              <SectionLabel icon={<MessageSquare size={14} />}>Client / guest notes</SectionLabel>
              <p className="rounded-xl bg-[#f5f9ff] p-4 text-sm italic leading-relaxed text-ink-secondary">
                &ldquo;{event.client_notes || "No special requests from the client at this time."}&rdquo;
              </p>
              <SectionLabel icon={<FileText size={14} />} className="mt-6">Internal notes</SectionLabel>
              <p className="rounded-xl bg-[#fafafa] p-4 text-sm leading-relaxed text-ink-secondary">
                {event.internal_notes || "No internal operational notes."}
              </p>
            </Card>
          </Enter>
        </div>

        {/* Col 3 */}
        <div className="space-y-6 lg:col-span-4">
          <Enter delay={0.1}>
            <Card className="p-6">
              <SectionLabel icon={<FileText size={14} />}>Event files</SectionLabel>
              <div className="space-y-2.5">
                <DocButton label="Master planning doc" url={event.planning_doc_url} icon={<FileSignature size={15} />} />
                <DocButton label="Contract agreement" url={event.contract_url} />
                <DocButton label="Event invoice" url={event.invoice_url} />
                <DocButton label="Event timeline" url={event.timeline_url} />
                <DocButton label="Music request list" url={event.music_list_url} icon={<Music size={15} />} />
              </div>
            </Card>
          </Enter>

          {/* Pack list */}
          <Enter delay={0.15}>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <SectionLabel icon={<Package size={14} />} noMargin>Gear pack list</SectionLabel>
                <Button size="sm" variant="ghost" onClick={openGearModal}>
                  Modify
                </Button>
              </div>
              {event.event_equipment?.length > 0 ? (
                <div className="space-y-2.5">
                  {event.event_equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl bg-[#fafafa] p-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f4ff] text-xs font-semibold text-accent">
                        {item.quantity_allocated}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.inventory?.name}</p>
                        <p className="truncate text-xs text-ink-tertiary">{item.inventory?.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DashedEmpty>No gear routed</DashedEmpty>
              )}
            </Card>
          </Enter>
        </div>
      </div>

      {/* Gear modal */}
      <Modal
        open={isGearModalOpen}
        onClose={() => setIsGearModalOpen(false)}
        title="Route equipment"
        subtitle={`Assign gear from your inventory to ${event.title}`}
        wide
        footer={
          <>
            <p className="mr-auto text-sm text-ink-secondary">
              Items routed:{" "}
              <span className="font-semibold text-ink">
                {Object.values(allocations).reduce((a, b) => a + b, 0)}
              </span>
            </p>
            <Button variant="secondary" onClick={() => setIsGearModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGearPackList} loading={isSavingGear}>
              {isSavingGear ? "Saving..." : "Save pack list"}
            </Button>
          </>
        }
      >
        <div className="space-y-7">
          {Object.entries(groupedInventory).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-3 border-b border-black/5 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((item) => {
                  const qty = allocations[item.id] || 0;
                  const isAssigned = qty > 0;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3.5 transition-all",
                        isAssigned ? "border-accent/30 bg-[#f5f9ff]" : "border-black/5 bg-[#fafafa]"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-ink-tertiary">Owned: {item.quantity}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 rounded-lg border border-black/5 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => updateAllocation(item.id, -1, item.quantity)}
                          className="flex size-6 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-black/5 hover:text-ink"
                        >
                          <Minus size={13} />
                        </button>
                        <span className={cn("w-5 text-center text-sm font-semibold", isAssigned ? "text-accent" : "text-ink-tertiary")}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateAllocation(item.id, 1, item.quantity)}
                          className="flex size-6 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-black/5 hover:text-ink"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {fullInventory.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-secondary">
              No inventory yet — add gear under Inventory first.
            </p>
          )}
        </div>
      </Modal>

      {/* Staff modal */}
      <Modal
        open={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Assign crew"
        subtitle="Select staff members from your roster to work this event."
        wide
        footer={
          <>
            <p className="mr-auto text-sm text-ink-secondary">
              Assigned: <span className="font-semibold text-ink">{selectedStaffIds.length}</span>
            </p>
            <Button variant="secondary" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveStaffList} loading={isSavingStaff}>
              {isSavingStaff ? "Saving..." : "Save crew list"}
            </Button>
          </>
        }
      >
        <div className="space-y-7">
          {Object.entries(groupedStaff).map(([role, members]) => (
            <div key={role}>
              <h3 className="mb-3 border-b border-black/5 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                {role}
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {members.map((member) => {
                  const isSelected = selectedStaffIds.includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => toggleStaffSelection(member.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                        isSelected
                          ? "border-accent/40 bg-[#f5f9ff]"
                          : "border-black/5 bg-[#fafafa] hover:border-black/15"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-xl text-sm font-semibold",
                            isSelected ? "bg-accent text-white" : "bg-black/5 text-ink-secondary"
                          )}
                        >
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.stage_name || member.full_name}</p>
                          {member.stage_name && (
                            <p className="text-xs text-ink-tertiary">{member.full_name}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected ? "border-accent bg-accent text-white" : "border-black/10 text-transparent"
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {fullStaffList.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-secondary">
              No active staff — invite team members under Team &amp; Staff first.
            </p>
          )}
        </div>
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this event?"
        description={`"${event.title}" and its pack list / crew assignments will be permanently removed. This cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
}

/* ---------- helpers ---------- */

function fmtTime(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SectionLabel({
  icon,
  children,
  noMargin = false,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  noMargin?: boolean;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary",
        !noMargin && "mb-4",
        className
      )}
    >
      {icon}
      {children}
    </h3>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
  last = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3",
        !last && "border-b border-black/5"
      )}
    >
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={cn("text-sm font-semibold", highlight && "text-accent")}>{value}</span>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fafafa] p-3">
      <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-ink-tertiary">
        {icon} {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function DashedEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline py-5 text-center">
      <p className="text-xs font-medium text-ink-tertiary">{children}</p>
    </div>
  );
}

function DocButton({
  label,
  url,
  icon = <FileText size={15} />,
}: {
  label: string;
  url: string | null;
  icon?: ReactNode;
}) {
  const available = !!url;
  return (
    <a
      href={available ? url! : undefined}
      target="_blank"
      rel="noreferrer"
      aria-disabled={!available}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border p-3.5 transition-all",
        available
          ? "border-black/5 bg-[#fafafa] hover:border-accent/30 hover:bg-[#f5f9ff]"
          : "pointer-events-none border-black/5 bg-[#fafafa] opacity-50"
      )}
    >
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <span className={available ? "text-accent" : "text-ink-tertiary"}>{icon}</span>
        {label}
      </span>
      {available ? (
        <Download size={15} className="text-ink-tertiary" />
      ) : (
        <span className="text-[11px] font-medium text-ink-tertiary">Pending</span>
      )}
    </a>
  );
}
