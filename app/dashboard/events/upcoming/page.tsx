"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Calendar, Plus } from "lucide-react";
import { PageHeader, Button, EmptyState, SkeletonRows } from "@/components/ui/kit";
import { EventCard, type EventSummary } from "@/components/event-card";
import { Stagger, StaggerItem } from "@/components/motion";

export default function UpcomingEventsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // An event is still relevant if it hasn't ended yet (or has no end and
      // starts today or later).
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, setup_time, event_end_time, location, venue_name, client_name, pay, status")
        .or(
          `event_end_time.gte.${startOfDay.toISOString()},and(event_end_time.is.null,event_date.gte.${startOfDay.toISOString()})`
        )
        .order("event_date", { ascending: true });

      if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();

  const liveEvents = events.filter((event) => {
    const start = event.setup_time ? new Date(event.setup_time) : new Date(event.event_date);
    const end = event.event_end_time ? new Date(event.event_end_time) : new Date(event.event_date);
    return now >= start && now <= end;
  });

  const upcomingEvents = events.filter((event) => {
    const start = event.setup_time ? new Date(event.setup_time) : new Date(event.event_date);
    return start > now;
  });

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <PageHeader
        title="Event schedule"
        subtitle="Real-time tracking of your active and future bookings."
        actions={
          <Button onClick={() => router.push("/dashboard/events/new")}>
            <Plus size={16} /> New event
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonRows count={3} height="h-52" />
      ) : (
        <div className="space-y-12">
          {liveEvents.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d70015] opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[#d70015]" />
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight">Live / active now</h3>
              </div>
              <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {liveEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <EventCard
                      event={event}
                      isLive
                      onClick={() => router.push(`/dashboard/events/${event.id}`)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          <section>
            <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-ink-secondary">
              Coming up
            </h3>
            {upcomingEvents.length > 0 ? (
              <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <EventCard
                      event={event}
                      onClick={() => router.push(`/dashboard/events/${event.id}`)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <EmptyState
                icon={<Calendar className="size-6" />}
                title="No future events scheduled"
                description="When you book your next gig, it will show up here."
                action={
                  <Button onClick={() => router.push("/dashboard/events/new")}>
                    <Plus size={16} /> Add your first event
                  </Button>
                }
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
