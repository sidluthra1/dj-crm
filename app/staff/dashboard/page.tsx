"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Calendar, LogOut } from "lucide-react";
import { Badge, Card, EmptyState, SkeletonRows, statusTone } from "@/components/ui/kit";
import { Enter, Stagger, StaggerItem } from "@/components/motion";

interface StaffProfile {
  id: string;
  full_name: string;
  stage_name: string | null;
  role: string;
}

interface GigEvent {
  id: string;
  title: string;
  event_date: string;
  setup_time: string | null;
  event_end_time: string | null;
  venue_name: string | null;
  location: string | null;
  status: string;
  attire: string | null;
}

export default function StaffDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<GigEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<GigEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStaffData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/staff/login");
        return;
      }

      const { data: staffProfile } = await supabase
        .from("staff")
        .select("id, full_name, stage_name, role")
        .eq("user_id", user.id)
        .single();

      if (staffProfile) {
        setProfile(staffProfile);

        // Assignments come from the event_staff junction table.
        const { data: assignments } = await supabase
          .from("event_staff")
          .select(
            "events ( id, title, event_date, setup_time, event_end_time, venue_name, location, status, attire )"
          )
          .eq("staff_id", staffProfile.id);

        const rows = (assignments || []) as unknown as { events: GigEvent | null }[];
        const events: GigEvent[] = rows
          .map((a) => a.events)
          .filter((e): e is GigEvent => !!e)
          .sort(
            (a: GigEvent, b: GigEvent) =>
              new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
          );

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setUpcomingEvents(events.filter((e) => new Date(e.event_date) >= now));
        setPastEvents(events.filter((e) => new Date(e.event_date) < now).reverse());
      }
      setIsLoading(false);
    }

    loadStaffData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/staff/login");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Nav */}
      <nav className="frosted sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/5 px-5 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.18em]">NEXORA</span>
          <Badge tone="blue">Crew portal</Badge>
        </div>
        <div className="flex items-center gap-4">
          {profile && (
            <span className="hidden text-sm text-ink-secondary sm:block">
              {profile.stage_name || profile.full_name} · {profile.role}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-hairline px-4 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-5 py-10">
        {isLoading ? (
          <SkeletonRows count={3} height="h-32" />
        ) : !profile ? (
          <EmptyState
            icon={<Calendar className="size-6" />}
            title="No staff profile found"
            description="Your account isn't linked to a staff roster yet. Contact your administrator."
          />
        ) : (
          <>
            <Enter>
              <h1 className="text-3xl font-semibold tracking-tight">
                Hey, {profile.stage_name || profile.full_name.split(" ")[0]}.
              </h1>
              <p className="mt-1 text-[15px] text-ink-secondary">
                Here are the gigs you&apos;re booked on.
              </p>
            </Enter>

            {/* Upcoming */}
            <section className="mt-10">
              <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink-secondary">
                Upcoming gigs
              </h2>
              {upcomingEvents.length > 0 ? (
                <Stagger className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <StaggerItem key={event.id}>
                      <GigRow
                        event={event}
                        onClick={() => router.push(`/staff/dashboard/events/${event.id}`)}
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <EmptyState
                  icon={<Calendar className="size-6" />}
                  title="No upcoming gigs"
                  description="When you're assigned to an event, it will show up here."
                />
              )}
            </section>

            {/* Past */}
            {pastEvents.length > 0 && (
              <section className="mt-12">
                <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-ink-secondary">
                  Past gigs
                </h2>
                <div className="space-y-4 opacity-70">
                  {pastEvents.map((event) => (
                    <GigRow
                      key={event.id}
                      event={event}
                      onClick={() => router.push(`/staff/dashboard/events/${event.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function GigRow({ event, onClick }: { event: GigEvent; onClick: () => void }) {
  const d = new Date(event.event_date);
  return (
    <Card hover onClick={onClick} className="flex items-center gap-5 p-5">
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#f0f4ff]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
          {d.toLocaleString("default", { month: "short" })}
        </span>
        <span className="text-xl font-semibold leading-none text-ink">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold tracking-tight">{event.title}</h3>
        <p className="mt-0.5 truncate text-sm text-ink-secondary">
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {event.venue_name || event.location ? ` · ${event.venue_name || event.location}` : ""}
          {event.setup_time &&
            ` · Setup ${new Date(event.setup_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </p>
      </div>
      <Badge tone={statusTone(event.status)} className="hidden sm:inline-flex">
        {event.status}
      </Badge>
    </Card>
  );
}
