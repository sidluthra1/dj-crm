"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Archive, Search } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows, Input } from "@/components/ui/kit";
import { EventCard, type EventSummary } from "@/components/event-card";
import { Stagger, StaggerItem } from "@/components/motion";

export default function PreviousEventsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Past = the event has ended (or, with no end time, started before today).
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, setup_time, event_end_time, location, venue_name, client_name, pay, status")
        .or(
          `event_end_time.lt.${startOfDay.toISOString()},and(event_end_time.is.null,event_date.lt.${startOfDay.toISOString()})`
        )
        .order("event_date", { ascending: false });

      if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.client_name || "").toLowerCase().includes(q) ||
        (e.venue_name || e.location || "").toLowerCase().includes(q)
    );
  }, [events, query]);

  // Group by year for an archive feel
  const byYear = useMemo(() => {
    const groups: Record<string, EventSummary[]> = {};
    filtered.forEach((e) => {
      const year = new Date(e.event_date).getFullYear().toString();
      (groups[year] ||= []).push(e);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <PageHeader
        title="Previous events"
        subtitle="Your performance history and completed bookings."
        actions={
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search past events..."
              className="w-64 pl-10"
            />
          </div>
        }
      />

      {isLoading ? (
        <SkeletonRows count={3} height="h-52" />
      ) : byYear.length === 0 ? (
        <EmptyState
          icon={<Archive className="size-6" />}
          title={query ? "No matches" : "No past events yet"}
          description={
            query
              ? "Try a different search term."
              : "Once your first gig wraps, it will be archived here."
          }
        />
      ) : (
        <div className="space-y-10">
          {byYear.map(([year, list]) => (
            <section key={year}>
              <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-ink-secondary">
                {year} <span className="text-ink-tertiary">· {list.length} events</span>
              </h3>
              <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {list.map((event) => (
                  <StaggerItem key={event.id}>
                    <EventCard
                      event={event}
                      onClick={() => router.push(`/dashboard/events/${event.id}`)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
