"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, Zap, Star, Shield, Users } from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";
import { Button } from "@/components/ui/kit";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Tier changes go through the server — never written from the client.
  const handleTierSelect = async (tier: string) => {
    setUpdatingTier(tier);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/signup");
      return;
    }

    try {
      const res = await fetch("/api/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast(result.error || "Could not update your plan.", "error");
        setUpdatingTier(null);
        return;
      }

      router.push(tier === "crm" ? "/dashboard" : "/");
      router.refresh();
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setUpdatingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Slim nav */}
      <nav className="frosted fixed top-0 z-50 w-full border-b border-black/5">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em]">
            NEXORA
          </Link>
          <Link href="/login" className="text-xs font-medium text-accent hover:opacity-70">
            Sign in
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <FadeUp className="mb-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Choose your <span className="text-gradient-brand">performance level.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-ink-secondary">
            Tailored tools for solo acts and full-scale production companies.
          </p>
        </FadeUp>

        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <PricingCard
              title="Free"
              description="Basic tool access"
              price="Free"
              subtext="For solo DJs with 1–3 bookings a month."
              icon={<Zap className="size-5 text-[#b25000]" />}
              features={[
                "Remove duplicate files",
                "Find missing tracks",
                "Library tools (limited daily usage)",
              ]}
              buttonText="Get started"
              onSelect={() => handleTierSelect("free")}
              loading={updatingTier === "free"}
            />
          </StaggerItem>

          <StaggerItem>
            <PricingCard
              title="Premium Tools"
              description="Advanced performance access"
              price="$15"
              period="/mo"
              subtext="Or $200 lifetime. For consistent 3+ bookings a month."
              icon={<Star className="size-5 text-accent" />}
              features={[
                "Everything in Free",
                "Unlimited library tools",
                "Set curation & music recommendations",
                "AI-powered file system sorter",
                "Serato ↔ Rekordbox conversion",
              ]}
              buttonText="Go Premium"
              onSelect={() => handleTierSelect("premium")}
              loading={updatingTier === "premium"}
            />
          </StaggerItem>

          <StaggerItem>
            <PricingCard
              title="CRM"
              description="Business management"
              price="$25"
              period="/mo"
              subtext="For 8+ bookings a month or gear inventory owners."
              icon={<Shield className="size-5 text-[#5b45b0]" />}
              highlight
              features={[
                "Everything in Free",
                "Event & calendar management",
                "Contracts & invoices",
                "Gear inventory + pack lists",
                "Crew roster & staff portal",
              ]}
              buttonText="Unlock CRM"
              onSelect={() => handleTierSelect("crm")}
              loading={updatingTier === "crm"}
            />
          </StaggerItem>

          <StaggerItem>
            <PricingCard
              title="Company"
              description="Full enterprise solution"
              price="Custom"
              subtext="For multi-DJ production companies."
              icon={<Users className="size-5 text-[#1e7b36]" />}
              features={[
                "Everything in CRM & Premium",
                "Advanced client portal",
                "Staff performance tracking",
                "Priority support",
              ]}
              buttonText="Contact sales"
              onSelect={scrollToContact}
            />
          </StaggerItem>
        </Stagger>

        {/* Company inquiry form */}
        <FadeUp className="mx-auto mt-24 max-w-xl">
          <div id="contact-form" className="shadow-card rounded-[1.5rem] bg-white p-8 md:p-10">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Company tier inquiry
            </h2>
            <p className="mt-2 text-center text-[15px] text-ink-secondary">
              Tell us about your team and we&apos;ll build a custom package.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Company name"
                className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
              <input
                type="email"
                placeholder="Business email"
                className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
              <textarea
                rows={4}
                placeholder="Tell us about your staff size and requirements..."
                className="w-full resize-none rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
              <Button className="w-full" size="lg" type="submit">
                Request quote + demo
              </Button>
            </form>
          </div>
        </FadeUp>
      </main>
    </div>
  );
}

function PricingCard({
  title,
  description,
  price,
  period,
  subtext,
  features,
  icon,
  buttonText,
  highlight = false,
  onSelect,
  loading = false,
}: {
  title: string;
  description: string;
  price: string;
  period?: string;
  subtext: string;
  features: string[];
  icon: ReactNode;
  buttonText: string;
  highlight?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "shadow-card relative flex h-full flex-col rounded-[1.5rem] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        highlight && "ring-2 ring-accent"
      )}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          Most popular
        </div>
      )}

      <div className="mb-1 flex items-center gap-2.5">
        {icon}
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="text-[13px] text-ink-secondary">{description}</p>

      <div className="mt-5">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        {period && <span className="text-[15px] text-ink-secondary">{period}</span>}
      </div>
      <p className="mt-1.5 min-h-[36px] text-[13px] leading-snug text-ink-tertiary">{subtext}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex gap-2.5 text-[14px] leading-snug text-ink-secondary">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        className="mt-7 w-full"
        variant={highlight ? "primary" : "secondary"}
        onClick={onSelect}
        loading={loading}
      >
        {buttonText}
      </Button>
    </div>
  );
}
