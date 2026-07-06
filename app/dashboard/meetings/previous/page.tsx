"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Archive } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows } from "@/components/ui/kit";
import { MeetingCard, type MeetingSummary } from "@/components/meeting-card";
import { Stagger, StaggerItem } from "@/components/motion";

export default function PreviousMeetingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("meetings")
        .select("*, events ( title )")
        .lt("meeting_date", startOfDay.toISOString())
        .order("meeting_date", { ascending: false });

      if (data) setMeetings(data);
      setIsLoading(false);
    }
    fetchMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <PageHeader title="Past meetings" subtitle="Your meeting history and completed syncs." />

      {isLoading ? (
        <SkeletonRows count={3} height="h-48" />
      ) : meetings.length > 0 ? (
        <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {meetings.map((meeting) => (
            <StaggerItem key={meeting.id}>
              <MeetingCard
                meeting={meeting}
                onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={<Archive className="size-6" />}
          title="No past meetings"
          description="Completed meetings will be archived here."
        />
      )}
    </div>
  );
}
