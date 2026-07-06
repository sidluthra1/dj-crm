"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  UserPlus, Mail, Phone, MapPin, Calendar, FileText, Trash2,
} from "lucide-react";
import {
  PageHeader, Button, Card, Badge, Field, Input, Select, Modal, ConfirmModal,
  EmptyState, SkeletonRows,
} from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Stagger, StaggerItem } from "@/components/motion";

interface StaffMember {
  id: string;
  stage_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  birthday: string | null;
  contract_url: string | null;
  role: string;
  status: string;
}

const ROLE_TONES: Record<string, "violet" | "red" | "orange" | "blue" | "neutral"> = {
  DJ: "violet",
  MC: "red",
  Roadie: "orange",
  Coordinator: "blue",
};

const EMPTY_FORM = {
  stage_name: "",
  full_name: "",
  email: "",
  phone: "",
  address: "",
  birthday: "",
  role: "DJ",
  contract_url: "",
};

export default function StaffPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .order("full_name", { ascending: true });
    if (data) setStaff(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast("An email address is required to invite a team member.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to invite staff member");

      setFormData(EMPTY_FORM);
      setIsModalOpen(false);
      fetchStaff();
      toast(`Invite email sent to ${formData.email}.`, "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("staff").delete().eq("id", pendingDelete.id);
    setIsDeleting(false);
    setPendingDelete(null);
    if (error) {
      toast("Failed to remove team member: " + error.message, "error");
    } else {
      toast("Team member removed.", "success");
      fetchStaff();
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <PageHeader
        title="Team & roster"
        subtitle="Manage your DJs, MCs, and event crew."
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} /> Add staff
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonRows count={2} height="h-56" />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="size-6" />}
          title="No team members yet"
          description="Build out your roster by inviting DJs, MCs, and roadies. They'll get their own portal to see assigned gigs."
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus size={16} /> Add your first team member
            </Button>
          }
        />
      ) : (
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <StaggerItem key={member.id}>
              <Card className="group h-full p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6e56cf] to-[#0071e3] text-lg font-semibold text-white">
                      {member.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight tracking-tight">
                        {member.stage_name || member.full_name}
                      </h3>
                      {member.stage_name && (
                        <p className="text-xs text-ink-tertiary">{member.full_name}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setPendingDelete(member)}
                    title="Remove team member"
                    className="rounded-lg p-2 text-ink-tertiary opacity-0 transition-all hover:bg-[#fff0f0] hover:text-danger group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="mb-5 flex gap-2">
                  <Badge tone={ROLE_TONES[member.role] || "neutral"}>{member.role}</Badge>
                  <Badge tone={member.status === "Active" ? "green" : "red"}>{member.status}</Badge>
                </div>

                <div className="space-y-2.5 border-t border-black/5 pt-5 text-sm text-ink-secondary">
                  {member.phone && (
                    <p className="flex items-center gap-2.5">
                      <Phone className="size-3.5 text-ink-tertiary" /> {member.phone}
                    </p>
                  )}
                  {member.email && (
                    <p className="flex items-center gap-2.5">
                      <Mail className="size-3.5 text-ink-tertiary" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  )}
                  {member.address && (
                    <p className="flex items-center gap-2.5">
                      <MapPin className="size-3.5 text-ink-tertiary" />
                      <span className="truncate">{member.address}</span>
                    </p>
                  )}
                  {member.birthday && (
                    <p className="flex items-center gap-2.5">
                      <Calendar className="size-3.5 text-ink-tertiary" />
                      {new Date(member.birthday).toLocaleDateString([], {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  {member.contract_url && (
                    <a
                      href={member.contract_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 font-medium text-accent hover:underline"
                    >
                      <FileText className="size-3.5" /> View contract
                    </a>
                  )}
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Add staff modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add team member"
        subtitle="They'll receive an email invite to set up their crew portal account."
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="staff-form" loading={isSubmitting}>
              {isSubmitting ? "Sending invite..." : "Send invite"}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full legal name *">
              <Input required name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" />
            </Field>
            <Field label="Stage name">
              <Input name="stage_name" value={formData.stage_name} onChange={handleChange} placeholder="DJ Apollo" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Primary role">
              <Select name="role" value={formData.role} onChange={handleChange}>
                <option value="DJ">DJ</option>
                <option value="MC">MC</option>
                <option value="Roadie">Roadie / AV Tech</option>
                <option value="Coordinator">Event Coordinator</option>
                <option value="Admin">Admin</option>
              </Select>
            </Field>
            <Field label="Birthday">
              <Input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Email address *">
              <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            </Field>
            <Field label="Phone number">
              <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
            </Field>
          </div>

          <Field label="Home address">
            <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, City, ST 12345" />
          </Field>

          <Field label="Contract / W9 document URL">
            <Input type="url" name="contract_url" value={formData.contract_url} onChange={handleChange} placeholder="https://drive.google.com/..." />
            <p className="mt-1.5 text-xs text-ink-tertiary">
              Link to their signed contractor agreement or W9.
            </p>
          </Field>
        </form>
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Remove team member?"
        description={`${pendingDelete?.stage_name || pendingDelete?.full_name} will be removed from your roster and unassigned from all events.`}
        confirmLabel="Remove"
        loading={isDeleting}
      />
    </div>
  );
}
