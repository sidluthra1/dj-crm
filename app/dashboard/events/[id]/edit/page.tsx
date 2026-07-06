"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { EventForm, EMPTY_EVENT, isoToLocal, type EventFormValues } from "@/components/event-form";
import { SkeletonRows } from "@/components/ui/kit";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [initial, setInitial] = useState<EventFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error || !data) {
        setNotFound(true);
        return;
      }
      setInitial({
        ...EMPTY_EVENT,
        title: data.title ?? "",
        event_type: data.event_type ?? "Private Event",
        status: data.status ?? "Confirmed",
        event_date: isoToLocal(data.event_date),
        setup_time: isoToLocal(data.setup_time),
        event_end_time: isoToLocal(data.event_end_time),
        pay: data.pay != null ? String(data.pay) : "",
        deposit_amount: data.deposit_amount != null ? String(data.deposit_amount) : "",
        client_name: data.client_name ?? "",
        client_email: data.client_email ?? "",
        client_phone: data.client_phone ?? "",
        venue_name: data.venue_name ?? "",
        venue_address: data.venue_address ?? "",
        distance_to_venue: data.distance_to_venue ?? "",
        travel_time: data.travel_time ?? "",
        venue_contact_email: data.venue_contact_email ?? "",
        venue_contact_phone: data.venue_contact_phone ?? "",
        venue_website: data.venue_website ?? "",
        guest_count: data.guest_count != null ? String(data.guest_count) : "",
        attire: data.attire ?? "",
        client_notes: data.client_notes ?? "",
        internal_notes: data.internal_notes ?? "",
      });
    }
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center text-ink-secondary">
        Event not found.
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="mx-auto max-w-4xl">
        <SkeletonRows count={3} height="h-48" />
      </div>
    );
  }

  return <EventForm initial={initial} eventId={id} />;
}
