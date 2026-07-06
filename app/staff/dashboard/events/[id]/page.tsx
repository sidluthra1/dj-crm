"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, Clock, MapPin, Package, ShieldCheck, Users, MessageSquare, Navigation,
} from "lucide-react";
import { Badge, Card, SkeletonRows, statusTone } from "@/components/ui/kit";
import { Enter } from "@/components/motion";

interface CrewMember {
  id: string;
  full_name: string;
  stage_name: string | null;
  role: string;
}

interface StaffEventDetail {
  id: string;
  title: string;
  event_type: string | null;
  status: string;
  event_date: string;
  setup_time: string | null;
  event_end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  location: string | null;
  distance_to_venue: string | null;
  travel_time: string | null;
  guest_count: number | null;
  attire: string | null;
  client_notes: string | null;
  event_equipment: {
    quantity_allocated: number;
    inventory: { name: string; category: string } | null;
  }[];
  event_staff: { staff: CrewMember | null }[];
}

/**
 * Staff-facing, read-only event view. RLS only exposes events the logged-in
 * crew member is assigned to (via event_staff), and only the fields they need.
 */
export default function StaffEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();

  const [event, setEvent] = useState<StaffEventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from("events")
        .select(
          `id, title, event_type, status, event_date, setup_time, event_end_time,
           venue_name, venue_address, location, distance_to_venue, travel_time,
           guest_count, attire, client_notes,
           event_equipment ( quantity_allocated, inventory ( name, category ) ),
           event_staff ( staff ( id, full_name, stage_name, role ) )`
        )
        .eq("id", id)
        .single();

      if (data) setEvent(data as unknown as StaffEventDetail);
      setIsLoading(false);
    }
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <SkeletonRows count={3} height="h-36" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center text-ink-secondary">
        Event not found, or you&apos;re not assigned to it.
      </div>
    );
  }

  const crew = (event.event_staff || [])
    .map((es) => es.staff)
    .filter((s): s is CrewMember => !!s);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <main className="mx-auto max-w-3xl px-5 py-10 pb-20">
        <button
          onClick={() => router.push("/staff/dashboard")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Back to my gigs
        </button>

        <Enter>
          <Card className="mb-6 p-7">
            <div className="mb-3 flex items-center gap-2">
              <Badge tone={statusTone(event.status)}>{event.status}</Badge>
              <Badge>{event.event_type || "Private Event"}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
              <Clock className="size-4 text-accent" />
              {new Date(event.event_date).toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </Card>
        </Enter>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Call times */}
          <Enter delay={0.05}>
            <Card className="h-full p-6">
              <SectionLabel>Call times</SectionLabel>
              <Row label="Setup / load-in" value={fmt(event.setup_time)} strong />
              <Row label="Event start" value={fmt(event.event_date)} />
              <Row label="Event end" value={fmt(event.event_end_time)} last />
              {event.attire && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-[#f0ecfd] px-4 py-3 text-sm font-medium text-[#5b45b0]">
                  <ShieldCheck size={15} /> Attire: {event.attire}
                </p>
              )}
            </Card>
          </Enter>

          {/* Venue */}
          <Enter delay={0.1}>
            <Card className="h-full p-6">
              <SectionLabel>Venue</SectionLabel>
              <p className="font-medium">{event.venue_name || event.location || "TBD"}</p>
              <p className="mt-0.5 text-sm text-ink-secondary">
                {event.venue_address || "Address not provided"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#fafafa] p-3">
                  <p className="mb-1 flex items-center gap-1 text-[11px] text-ink-tertiary">
                    <Navigation size={11} /> Distance
                  </p>
                  <p className="font-medium">{event.distance_to_venue || "TBD"}</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] p-3">
                  <p className="mb-1 flex items-center gap-1 text-[11px] text-ink-tertiary">
                    <Clock size={11} /> Travel time
                  </p>
                  <p className="font-medium">{event.travel_time || "TBD"}</p>
                </div>
              </div>
              {event.venue_address && (
                <a
                  href={`https://maps.apple.com/?q=${encodeURIComponent(event.venue_address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  <MapPin size={14} /> Open in Maps
                </a>
              )}
            </Card>
          </Enter>

          {/* Pack list */}
          <Enter delay={0.15}>
            <Card className="h-full p-6">
              <SectionLabel icon={<Package size={13} />}>Gear pack list</SectionLabel>
              {event.event_equipment?.length > 0 ? (
                <div className="space-y-2.5">
                  {event.event_equipment.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-[#fafafa] p-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f4ff] text-xs font-semibold text-accent">
                        {item.quantity_allocated}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.inventory?.name}</p>
                        <p className="truncate text-xs text-ink-tertiary">
                          {item.inventory?.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-hairline py-5 text-center text-xs font-medium text-ink-tertiary">
                  No gear routed yet
                </p>
              )}
            </Card>
          </Enter>

          {/* Crew + notes */}
          <Enter delay={0.2}>
            <Card className="h-full p-6">
              <SectionLabel icon={<Users size={13} />}>Crew on this gig</SectionLabel>
              <div className="mb-5 flex flex-wrap gap-2">
                {crew.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-[#f0f4ff] px-3 py-1.5 text-xs font-medium text-accent"
                  >
                    {s.stage_name || s.full_name} · {s.role}
                  </span>
                ))}
                {crew.length === 0 && (
                  <span className="text-xs text-ink-tertiary">No other crew listed.</span>
                )}
              </div>
              <SectionLabel icon={<MessageSquare size={13} />}>Client notes</SectionLabel>
              <p className="rounded-xl bg-[#f5f9ff] p-4 text-sm italic leading-relaxed text-ink-secondary">
                &ldquo;{event.client_notes || "No special requests from the client."}&rdquo;
              </p>
            </Card>
          </Enter>
        </div>
      </main>
    </div>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SectionLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
      {icon}
      {children}
    </h3>
  );
}

function Row({
  label,
  value,
  strong = false,
  last = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${!last ? "border-b border-black/5" : ""}`}>
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={`text-sm font-semibold ${strong ? "text-accent" : ""}`}>{value}</span>
    </div>
  );
}
