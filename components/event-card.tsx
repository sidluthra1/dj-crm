"use client";

import { Calendar, MapPin, Clock, Zap, Truck } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export interface EventSummary {
  id: string;
  title: string;
  event_date: string;
  setup_time: string | null;
  event_end_time: string | null;
  location?: string | null;
  venue_name?: string | null;
  client_name: string | null;
  pay: number | string | null;
  status: string;
}

export function EventCard({
  event,
  isLive = false,
  onClick,
}: {
  event: EventSummary;
  isLive?: boolean;
  onClick: () => void;
}) {
  const now = new Date();
  const isSetup = isLive && now < new Date(event.event_date);
  const place = event.venue_name || event.location;

  return (
    <div
      onClick={onClick}
      className={cn(
        "shadow-card group cursor-pointer rounded-[1.25rem] border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover",
        isLive ? "border-accent/40 ring-1 ring-accent/20" : "border-black/[0.04]"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {event.client_name && (
            <p className="mb-1 truncate text-xs font-medium text-accent">{event.client_name}</p>
          )}
          <h3 className="truncate text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
            {event.title}
          </h3>
        </div>
        <Badge tone={isLive ? "red" : statusTone(event.status)}>
          {isSetup ? "Setup" : isLive ? "Live" : event.status}
        </Badge>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        <div className="flex items-center gap-2.5 text-sm text-ink-secondary">
          <Calendar className="size-4 shrink-0 text-ink-tertiary" />
          {new Date(event.event_date).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        {place && (
          <div className="flex items-center gap-2.5 text-sm text-ink-secondary">
            <MapPin className="size-4 shrink-0 text-ink-tertiary" />
            <span className="truncate">{place}</span>
          </div>
        )}
        <div className="flex items-start gap-2.5 text-sm text-ink-secondary">
          <Clock className="mt-0.5 size-4 shrink-0 text-ink-tertiary" />
          <div>
            <span className="font-medium text-ink">
              {new Date(event.event_date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" – "}
              {event.event_end_time
                ? new Date(event.event_end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "TBD"}
            </span>
            {event.setup_time && (
              <p className="text-xs text-ink-tertiary">
                Setup{" "}
                {new Date(event.setup_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <span className="font-semibold text-ink">
            ${Number(event.pay || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-tertiary">
          {isSetup ? (
            <>
              <Truck className="size-3.5 text-[#b25000]" /> Gear deployed / setup
            </>
          ) : isLive ? (
            <>
              <Zap className="size-3.5 text-[#b25000]" /> Event in progress
            </>
          ) : (
            <>
              <Calendar className="size-3.5" /> Booking
            </>
          )}
        </span>
        <span className="text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
          View details →
        </span>
      </div>
    </div>
  );
}
