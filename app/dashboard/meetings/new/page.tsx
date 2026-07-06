"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Users, Clock, MapPin, FileText, Save } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";

interface EventOption {
  id: string;
  title: string;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    meeting_type: "Client Consult",
    meeting_date: "",
    start_time: "",
    end_time: "",
    location: "",
    client_name: "",
    event_id: "",
    notes: "",
  });

  // Load upcoming events so a meeting can be linked to one
  useEffect(() => {
    async function fetchEvents() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("events")
        .select("id, title")
        .gte("event_date", startOfDay.toISOString())
        .order("event_date", { ascending: true });
      if (data) setEventOptions(data);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast("You must be logged in.", "error");
      setIsSubmitting(false);
      return;
    }

    const toISO = (v: string) => (v ? new Date(v).toISOString() : null);

    // meeting_date anchors the day; start_time/end_time carry the clock.
    const meetingDateISO = toISO(formData.start_time) || toISO(`${formData.meeting_date}T09:00`);
    if (!meetingDateISO) {
      toast("Please provide a meeting date or start time.", "error");
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("meetings")
      .insert([
        {
          user_id: user.id,
          title: formData.title,
          meeting_type: formData.meeting_type,
          meeting_date: meetingDateISO,
          start_time: toISO(formData.start_time),
          end_time: toISO(formData.end_time),
          location: formData.location || null,
          status: "Scheduled",
          client_name: formData.client_name || null,
          event_id: formData.event_id || null,
          notes: formData.notes || null,
        },
      ])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("Meeting scheduled.", "success");
      router.push(`/dashboard/meetings/${data.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-20">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <Enter>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Schedule a meeting</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Book a client consult, venue walkthrough, or team sync.
          </p>
        </div>
      </Enter>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Enter delay={0.05}>
          <Card className="space-y-5 p-7">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <Users className="size-4 text-accent" /> Meeting details
            </h2>

            <Field label="Meeting title *">
              <Input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Final song list review with the Smiths"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Meeting type">
                <Select name="meeting_type" value={formData.meeting_type} onChange={handleChange}>
                  <option>Client Consult</option>
                  <option>Venue Walkthrough</option>
                  <option>Team Meeting</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Client / contact name">
                <Input name="client_name" value={formData.client_name} onChange={handleChange} />
              </Field>
            </div>

            <Field label="Related event (optional)">
              <Select name="event_id" value={formData.event_id} onChange={handleChange}>
                <option value="">Not linked to an event</option>
                {eventOptions.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </Select>
            </Field>
          </Card>
        </Enter>

        <Enter delay={0.1}>
          <Card className="space-y-5 p-7">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <Clock className="size-4 text-[#b25000]" /> When & where
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Start *">
                <Input
                  required
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </Field>
              <Field label="End">
                <Input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <Field label="Location">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-tertiary" />
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Address, or Zoom / Google Meet link"
                  className="pl-10"
                />
              </div>
            </Field>
          </Card>
        </Enter>

        <Enter delay={0.15}>
          <Card className="space-y-5 p-7">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <FileText className="size-4 text-[#5b45b0]" /> Agenda / notes
            </h2>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Topics to cover, questions to ask..."
            />
          </Card>
        </Enter>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {!isSubmitting && <Save size={16} />}
            {isSubmitting ? "Scheduling..." : "Schedule meeting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
