"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Package, Save } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { Enter } from "@/components/motion";

const DEFAULT_CATEGORIES = ["Audio", "Lighting", "DJ Equipment", "Cables & Power", "Staging", "Transport"];

export default function NewInventoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Audio",
    quantity: "1",
    rental_price: "0.00",
    current_location: "Main Warehouse",
    owner: "Company",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target.name === "category" && e.target.value === "ADD_NEW") {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: "" });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast("You must be logged in to add inventory.", "error");
      setIsSubmitting(false);
      return;
    }

    const qty = parseInt(formData.quantity) || 1;
    const price = parseFloat(formData.rental_price) || 0;

    const { data, error } = await supabase
      .from("inventory")
      .insert([
        {
          user_id: user.id,
          name: formData.name,
          category: formData.category || "Uncategorized",
          quantity: qty,
          available_quantity: qty,
          repair_quantity: 0,
          rental_price: price,
          current_location: formData.current_location,
          owner: formData.owner,
          notes: formData.notes || null,
        },
      ])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("Item added to inventory.", "success");
      router.push(`/dashboard/inventory/${data.id}`);
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
          <h1 className="text-3xl font-semibold tracking-tight">Add new equipment</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Log a new piece of gear into your warehouse inventory.
          </p>
        </div>
      </Enter>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Enter delay={0.05}>
          <Card className="space-y-5 p-7">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <Package className="size-4 text-accent" /> Core details
            </h2>

            <Field label="Item name / model *">
              <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., QSC K12.2 Active Speaker"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-end justify-between">
                  <span className="text-[13px] font-medium text-ink-secondary">Category</span>
                  {isCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData({ ...formData, category: "Audio" });
                      }}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      Back to list
                    </button>
                  )}
                </div>
                {isCustomCategory ? (
                  <Input
                    autoFocus
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="New category name"
                    required
                  />
                ) : (
                  <Select name="category" value={formData.category} onChange={handleChange}>
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                    <option value="ADD_NEW">+ Add new category…</option>
                  </Select>
                )}
              </div>

              <Field label="Quantity owned">
                <Input
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Rental price / day ($)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="rental_price"
                  value={formData.rental_price}
                  onChange={handleChange}
                />
              </Field>
              <Field label="Owner">
                <Select name="owner" value={formData.owner} onChange={handleChange}>
                  <option>Company</option>
                  <option>Personal</option>
                  <option>Rented / Leased</option>
                </Select>
              </Field>
            </div>

            <Field label="Current location">
              <Input
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                placeholder="Main Warehouse"
              />
            </Field>

            <Field label="Notes">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Serial numbers, condition, quirks..."
              />
            </Field>
          </Card>
        </Enter>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {!isSubmitting && <Save size={16} />}
            {isSubmitting ? "Saving..." : "Add to inventory"}
          </Button>
        </div>
      </form>
    </div>
  );
}
