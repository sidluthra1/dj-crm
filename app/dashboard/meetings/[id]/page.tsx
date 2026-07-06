"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Video, Ticket, FileText, Trash2, CheckCircle2,
} from "lucide-react";
import { Button, Card, Badge, ConfirmModal, SkeletonRows } from "@/components/ui/kit";
import { meetingTypeTone } from "@/components/meeting-card";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";

interface MeetingDetail {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
  client_name: string | null;
  notes: string | null;
  events: { id: string; title: string } | null;
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const { toast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMeeting = useCallback(async () => {
    const { data } = await supabase
      .from("meetings")
      .select("*, events ( id, title )")
      .eq("id", id)
      .single();
    if (data) setMeeting(data as unknown as MeetingDetail);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const markCompleted = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from("meetings").update({ status: "Completed" }).eq("id", id);
    setIsUpdating(false);
    if (error) return toast(error.message, "error");
    toast("Meeting marked as completed.", "success");
    fetchMeeting();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    setIsDeleting(false);
    if (error) return toast(error.message, "error");
    toast("Meeting deleted.", "success");
    router.push("/dashboard/meetings/upcoming");
  };

  if (isLoading || !meeting) {
    return (
      <div className="mx-auto max-w-4xl">
        <SkeletonRows count={2} height="h-44" />
      </div>
    );
  }

  const isVirtual =
    meeting.location?.toLowerCase().includes("zoom") ||
    meeting.location?.toLowerCase().includes("meet") ||
    meeting.location?.toLowerCase().includes("teams");

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to meetings
      </button>

      <Enter>
        <Card className="mb-6 flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone={meetingTypeTone(meeting.meeting_type)}>{meeting.meeting_type}</Badge>
              <Badge tone={meeting.status === "Completed" ? "green" : "neutral"}>
                {meeting.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{meeting.title}</h1>
            {meeting.client_name && (
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-accent">
                <Users size={15} /> {meeting.client_name}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-3">
            {meeting.status !== "Completed" && (
              <Button variant="secondary" onClick={markCompleted} loading={isUpdating}>
                <CheckCircle2 size={15} /> Mark completed
              </Button>
            )}
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </Card>
      </Enter>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Enter delay={0.05}>
          <Card className="h-full p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              When & where
            </h3>
            <div className="space-y-3.5 text-sm">
              <p className="flex items-center gap-3">
                <Calendar className="size-4 text-accent" />
                <span className="font-medium">
                  {new Date(meeting.meeting_date).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="flex items-center gap-3 text-ink-secondary">
                <Clock className="size-4 text-ink-tertiary" />
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
              <p className="flex items-center gap-3 text-ink-secondary">
                {isVirtual ? (
                  <Video className="size-4 text-accent" />
                ) : (
                  <MapPin className="size-4 text-ink-tertiary" />
                )}
                {meeting.location ? (
                  isVirtual && meeting.location.startsWith("http") ? (
                    <a
                      href={meeting.location}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      Join meeting link
                    </a>
                  ) : (
                    meeting.location
                  )
                ) : (
                  "Location TBD"
                )}
              </p>
            </div>

            {meeting.events && (
              <div className="mt-6 border-t border-black/5 pt-5">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
                  Related event
                </h3>
                <button
                  onClick={() => meeting.events && router.push(`/dashboard/events/${meeting.events.id}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-black/5 bg-[#fafafa] p-3.5 text-left transition-all hover:border-accent/30 hover:bg-[#f5f9ff]"
                >
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <Ticket size={15} className="text-accent" /> {meeting.events.title}
                  </span>
                  <span className="text-xs font-medium text-accent">View →</span>
                </button>
              </div>
            )}
          </Card>
        </Enter>

        <Enter delay={0.1}>
          <Card className="h-full p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
              <FileText size={13} /> Agenda / notes
            </h3>
            <p className="rounded-xl bg-[#fafafa] p-4 text-sm leading-relaxed text-ink-secondary">
              {meeting.notes || "No agenda notes for this meeting."}
            </p>
          </Card>
        </Enter>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this meeting?"
        description={`"${meeting.title}" will be permanently removed.`}
        loading={isDeleting}
      />
    </div>
  );
}
