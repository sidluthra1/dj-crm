"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  status: string;
  event_type: string;
}

const PILL_COLORS: Record<string, string> = {
  Wedding: "bg-[#fdeef3] text-[#b03060] border-[#f5c9d8]",
  "Club / Nightlife": "bg-[#f0ecfd] text-[#5b45b0] border-[#ddd3f5]",
  Corporate: "bg-[#e8f2ff] text-[#0064d1] border-[#c9e0fa]",
  "School / Greek": "bg-[#e6f6ea] text-[#1e7b36] border-[#c8e9d0]",
};

export default function CalendarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfGrid = new Date(year, month - 1, 20).toISOString();
      const endOfGrid = new Date(year, month + 1, 15).toISOString();

      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, status, event_type")
        .gte("event_date", startOfGrid)
        .lte("event_date", endOfGrid)
        .order("event_date", { ascending: true });

      if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q));
  }, [events, query]);

  /* ----- calendar math ----- */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  let nextMonthDay = 1;
  while (calendarDays.length % 7 !== 0 || calendarDays.length < 35) {
    calendarDays.push({ date: new Date(year, month + 1, nextMonthDay++), isCurrentMonth: false });
  }

  const isToday = (date: Date) => {
    const t = new Date();
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    );
  };

  const getEventsForDay = (date: Date) =>
    filteredEvents.filter((e) => {
      const d = new Date(e.event_date);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-7xl flex-col pb-2">
      <div className="shadow-card flex flex-1 flex-col overflow-hidden rounded-[1.25rem] border border-black/[0.04] bg-white">
        {/* Header */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 flex-col items-center justify-center rounded-xl border border-black/5 bg-[#fafafa]">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-tertiary">
                {currentDate.toLocaleString("default", { month: "short" })}
              </span>
              <span className="text-base font-semibold leading-none text-accent">
                {new Date().getMonth() === month && new Date().getFullYear() === year
                  ? new Date().getDate()
                  : 1}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h1>
              {isLoading && <span className="skeleton h-4 w-16 rounded-md" />}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="flex items-center">
              {searchOpen && (
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Filter events..."
                  className="mr-2 w-44 rounded-full border border-hairline px-4 py-1.5 text-sm transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-full p-2 text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink"
              >
                <Search size={17} />
              </button>
            </div>

            {/* Month nav */}
            <div className="flex overflow-hidden rounded-full border border-hairline">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="border-r border-hairline px-2.5 py-1.5 text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3.5 py-1.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="border-l border-hairline px-2.5 py-1.5 text-ink-secondary transition-colors hover:bg-black/5 hover:text-ink"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <Button size="sm" onClick={() => router.push("/dashboard/events/new")}>
              <Plus size={14} />
              <span className="hidden sm:inline">Add event</span>
            </Button>
          </div>
        </header>

        {/* Days of week */}
        <div className="grid shrink-0 grid-cols-7 border-b border-black/5 bg-[#fafafa]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="custom-scrollbar grid flex-1 grid-cols-7 grid-rows-5 gap-px overflow-y-auto bg-black/5">
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day.date);
            const today = isToday(day.date);
            return (
              <div
                key={idx}
                className={cn(
                  "relative flex min-h-[110px] flex-col space-y-1 overflow-hidden p-1.5 transition-colors",
                  day.isCurrentMonth ? "bg-white hover:bg-[#fafafa]" : "bg-[#f7f7f9]",
                  today && "z-10 ring-1 ring-inset ring-accent"
                )}
              >
                <div className="mb-0.5 flex items-start justify-between">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-[13px] font-medium",
                      today
                        ? "bg-accent text-white"
                        : day.isCurrentMonth
                          ? "text-ink"
                          : "text-ink-tertiary"
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="mr-0.5 mt-1 hidden text-[10px] font-medium text-ink-tertiary lg:block">
                      {dayEvents.length} {dayEvents.length === 1 ? "gig" : "gigs"}
                    </span>
                  )}
                </div>

                <div className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
                  {dayEvents.slice(0, 4).map((e) => (
                    <div
                      key={e.id}
                      onClick={() => router.push(`/dashboard/events/${e.id}`)}
                      title={e.title}
                      className={cn(
                        "flex cursor-pointer justify-between truncate rounded-md border px-2 py-1 text-xs font-medium transition-all hover:brightness-95",
                        PILL_COLORS[e.event_type] || "bg-[#f0f0f2] text-ink-secondary border-black/5"
                      )}
                    >
                      <span className="truncate pr-1.5">{e.title}</span>
                      <span className="hidden whitespace-nowrap opacity-70 lg:block">
                        {new Date(e.event_date).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="pl-1 text-[10px] font-medium text-ink-tertiary">
                      +{dayEvents.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
