"use client";

import { EventForm, EMPTY_EVENT } from "@/components/event-form";

export default function NewEventPage() {
  return <EventForm initial={EMPTY_EVENT} />;
}
