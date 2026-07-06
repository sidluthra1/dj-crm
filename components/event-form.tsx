"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Clock, CreditCard, Info, MapPin, User, FileText, Save } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";

export interface EventFormValues {
  title: string;
  event_type: string;
  status: string;
  event_date: string;
  setup_time: string;
  event_end_time: string;
  pay: string;
  deposit_amount: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  venue_name: string;
  venue_address: string;
  distance_to_venue: string;
  travel_time: string;
  venue_contact_email: string;
  venue_contact_phone: string;
  venue_website: string;
  guest_count: string;
  attire: string;
  client_notes: string;
  internal_notes: string;
}

export const EMPTY_EVENT: EventFormValues = {
  title: "",
  event_type: "Private Event",
  status: "Confirmed",
  event_date: "",
  setup_time: "",
  event_end_time: "",
  pay: "",
  deposit_amount: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  venue_name: "",
  venue_address: "",
  distance_to_venue: "",
  travel_time: "",
  venue_contact_email: "",
  venue_contact_phone: "",
  venue_website: "",
  guest_count: "",
  attire: "Standard",
  client_notes: "",
  internal_notes: "",
};

/** Convert a stored ISO timestamp to a datetime-local input value. */
export function isoToLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  initial,
  eventId,
}: {
  initial: EventFormValues;
  eventId?: string; // present = edit mode
}) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormValues>(initial);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentTotal = parseFloat(formData.pay) || 0;
  const currentDeposit = parseFloat(formData.deposit_amount) || 0;
  const currentBalance = currentTotal - currentDeposit;

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

    const formatForDB = (v: string) => (v ? new Date(v).toISOString() : null);

    const payload = {
      user_id: user.id,
      title: formData.title,
      event_type: formData.event_type,
      status: formData.status,
      event_date: formatForDB(formData.event_date),
      setup_time: formatForDB(formData.setup_time),
      event_end_time: formatForDB(formData.event_end_time),
      pay: currentTotal,
      deposit_amount: currentDeposit,
      balance_due: currentBalance,
      client_name: formData.client_name,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      venue_name: formData.venue_name || null,
      venue_address: formData.venue_address || null,
      distance_to_venue: formData.distance_to_venue || null,
      travel_time: formData.travel_time || null,
      venue_contact_email: formData.venue_contact_email || null,
      venue_contact_phone: formData.venue_contact_phone || null,
      venue_website: formData.venue_website || null,
      guest_count: parseInt(formData.guest_count) || null,
      attire: formData.attire || null,
      client_notes: formData.client_notes || null,
      internal_notes: formData.internal_notes || null,
    };

    const result = eventId
      ? await supabase.from("events").update(payload).eq("id", eventId).select().single()
      : await supabase.from("events").insert([payload]).select().single();

    setIsSubmitting(false);

    if (result.error) {
      toast(result.error.message, "error");
    } else {
      toast(eventId ? "Event updated." : "Event created.", "success");
      router.push(`/dashboard/events/${result.data.id}`);
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <Enter>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            {eventId ? "Edit event" : "Draft new event"}
          </h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {eventId
              ? "Update the details for this booking."
              : "Fill out the logistics to add a new booking to your pipeline."}
          </p>
        </div>
      </Enter>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core */}
        <Enter delay={0.05}>
          <Card className="p-7">
            <SectionTitle icon={<Info className="size-4 text-accent" />}>Core details</SectionTitle>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Event title *" className="md:col-span-2">
                <Input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., UVA Spring Formal 2026"
                />
              </Field>
              <Field label="Event type">
                <Select name="event_type" value={formData.event_type} onChange={handleChange}>
                  <option>Private Event</option>
                  <option>Wedding</option>
                  <option>Club / Nightlife</option>
                  <option>Corporate</option>
                  <option>School / Greek</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <option>Confirmed</option>
                  <option>Contract Pending</option>
                  <option>Invoice Sent</option>
                  <option>Lead / Inquiry</option>
                </Select>
              </Field>
            </div>
          </Card>
        </Enter>

        {/* Timeline + Financials */}
        <Enter delay={0.1}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-7">
              <SectionTitle icon={<Clock className="size-4 text-[#b25000]" />}>Timeline</SectionTitle>
              <div className="space-y-4">
                <Field label="Setup / load-in">
                  <Input
                    type="datetime-local"
                    name="setup_time"
                    value={formData.setup_time}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Event start *">
                  <Input
                    required
                    type="datetime-local"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Event end">
                  <Input
                    type="datetime-local"
                    name="event_end_time"
                    value={formData.event_end_time}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </Card>

            <Card className="flex flex-col p-7">
              <SectionTitle icon={<CreditCard className="size-4 text-[#1e7b36]" />}>
                Financials
              </SectionTitle>
              <div className="space-y-4">
                <Field label="Total invoice amount ($)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name="pay"
                    value={formData.pay}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Deposit paid ($)">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    name="deposit_amount"
                    value={formData.deposit_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Field>
              </div>
              <div className="mt-auto flex items-center justify-between rounded-xl bg-[#fafafa] px-5 py-4">
                <span className="text-sm text-ink-secondary">Balance due</span>
                <span className="text-xl font-semibold tracking-tight">
                  ${currentBalance.toFixed(2)}
                </span>
              </div>
            </Card>
          </div>
        </Enter>

        {/* Client + Venue */}
        <Enter delay={0.15}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-7">
              <SectionTitle icon={<User className="size-4 text-accent" />}>Client info</SectionTitle>
              <div className="space-y-4">
                <Field label="Client / organization name *">
                  <Input required name="client_name" value={formData.client_name} onChange={handleChange} />
                </Field>
                <Field label="Email">
                  <Input type="email" name="client_email" value={formData.client_email} onChange={handleChange} />
                </Field>
                <Field label="Phone">
                  <Input type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} />
                </Field>
              </div>
            </Card>

            <Card className="p-7">
              <SectionTitle icon={<MapPin className="size-4 text-[#c30010]" />}>Venue info</SectionTitle>
              <div className="space-y-4">
                <Field label="Venue name">
                  <Input name="venue_name" value={formData.venue_name} onChange={handleChange} />
                </Field>
                <Field label="Full address">
                  <Input name="venue_address" value={formData.venue_address} onChange={handleChange} />
                </Field>
                <Field label="Venue website">
                  <Input
                    type="url"
                    name="venue_website"
                    value={formData.venue_website}
                    onChange={handleChange}
                    placeholder="https://"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Travel time">
                    <Input
                      name="travel_time"
                      value={formData.travel_time}
                      onChange={handleChange}
                      placeholder="45 mins"
                    />
                  </Field>
                  <Field label="Distance">
                    <Input
                      name="distance_to_venue"
                      value={formData.distance_to_venue}
                      onChange={handleChange}
                      placeholder="30 miles"
                    />
                  </Field>
                </div>
              </div>
            </Card>
          </div>
        </Enter>

        {/* Notes */}
        <Enter delay={0.2}>
          <Card className="p-7">
            <SectionTitle icon={<FileText className="size-4 text-[#5b45b0]" />}>
              Logistics & notes
            </SectionTitle>
            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Est. guest count">
                <Input type="number" min="0" name="guest_count" value={formData.guest_count} onChange={handleChange} />
              </Field>
              <Field label="Attire">
                <Input
                  name="attire"
                  value={formData.attire}
                  onChange={handleChange}
                  placeholder="e.g. Formal, Casual, All-Black"
                />
              </Field>
            </div>
            <div className="space-y-5">
              <Field label="Client / guest notes">
                <Textarea
                  name="client_notes"
                  value={formData.client_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Special requests from the client..."
                />
              </Field>
              <Field label="Internal notes">
                <Textarea
                  name="internal_notes"
                  value={formData.internal_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Private notes for the team..."
                />
              </Field>
            </div>
          </Card>
        </Enter>

        {/* Sticky submit bar */}
        <div className="frosted shadow-card sticky bottom-6 z-40 flex items-center justify-between rounded-2xl border border-black/5 px-6 py-4">
          <p className="hidden text-sm text-ink-secondary md:block">
            Double-check your timeline before saving.
          </p>
          <div className="flex w-full gap-3 md:w-auto">
            <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1 md:flex-none">
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1 md:flex-none">
              {!isSubmitting && <Save size={16} />}
              {isSubmitting ? "Saving..." : eventId ? "Save changes" : "Create event"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
      {icon}
      {children}
    </h2>
  );
}
