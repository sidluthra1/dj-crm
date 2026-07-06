"use client";

import { Calendar, Clock, MapPin, Users, Video, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/kit";

export interface MeetingSummary {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
  client_name: string | null;
  events?: { title: string } | null;
}

const TYPE_TONES: Record<string, "blue" | "orange" | "violet" | "neutral"> = {
  "Client Consult": "blue",
  "Venue Walkthrough": "orange",
  "Team Meeting": "violet",
};

export function meetingTypeTone(type: string) {
  return TYPE_TONES[type] || "neutral";
}

export function MeetingCard({
  meeting,
  onClick,
}: {
  meeting: MeetingSummary;
  onClick: () => void;
}) {
  const isVirtual =
    meeting.location?.toLowerCase().includes("zoom") ||
    meeting.location?.toLowerCase().includes("meet") ||
    meeting.location?.toLowerCase().includes("teams");

  return (
    <div
      onClick={onClick}
      className="shadow-card group cursor-pointer rounded-[1.25rem] border border-black/[0.04] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <Badge tone={meetingTypeTone(meeting.meeting_type)}>{meeting.meeting_type}</Badge>
        <span className="text-[11px] font-medium text-ink-tertiary">{meeting.status}</span>
      </div>

      <h3 className="text-xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-accent">
        {meeting.title}
      </h3>

      {meeting.client_name && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-accent">
          <Users size={14} /> {meeting.client_name}
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm text-ink-secondary">
        <p className="flex items-center gap-2.5">
          <Calendar className="size-4 shrink-0 text-ink-tertiary" />
          <span className="font-medium text-ink">
            {new Date(meeting.meeting_date).toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
        <p className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0 text-ink-tertiary" />
          {meeting.start_time
            ? new Date(meeting.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "TBD"}
          {meeting.end_time &&
            ` – ${new Date(meeting.end_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </p>
        <p className="flex items-center gap-2.5">
          {isVirtual ? (
            <Video className="size-4 shrink-0 text-accent" />
          ) : (
            <MapPin className="size-4 shrink-0 text-ink-tertiary" />
          )}
          <span className="truncate">{meeting.location || "Location TBD"}</span>
        </p>
      </div>

      {meeting.events && (
        <div className="mt-5 border-t border-black/5 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fafafa] px-2.5 py-1.5 text-xs font-medium text-ink-secondary">
            <Ticket size={12} className="text-accent" /> {meeting.events.title}
          </span>
        </div>
      )}
    </div>
  );
}
