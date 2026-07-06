"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Calendar,
  FileText,
  CreditCard,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardTitle, Badge, statusTone, SkeletonRows } from "@/components/ui/kit";
import { Enter } from "@/components/motion";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  status: string;
  client_name: string | null;
  pay: number | string | null;
  deposit_amount: number | string | null;
  balance_due: number | string | null;
}

interface ActionItem {
  id: string;
  type: "contract" | "payment";
  message: string;
  eventId: string;
}

export default function DashboardOverview() {
  const supabase = createClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingGigs: 0,
    pendingContracts: 0,
    unpaidBalance: 0,
    totalClients: 0,
  });
  const [nextEvent, setNextEvent] = useState<EventRow | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: allEvents, error } = await supabase
        .from("events")
        .select("id, title, event_date, status, client_name, pay, deposit_amount, balance_due")
        .order("event_date", { ascending: true });

      if (error || !allEvents) {
        setIsLoading(false);
        return;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = allEvents.filter((e) => new Date(e.event_date) >= now);
      const pendingCount = allEvents.filter((e) => e.status === "Contract Pending").length;

      // Outstanding balance across all events (negative balances ignored).
      const balanceOf = (e: EventRow) => {
        const stored = Number(e.balance_due);
        if (!Number.isNaN(stored) && e.balance_due !== null) return stored;
        return (Number(e.pay) || 0) - (Number(e.deposit_amount) || 0);
      };
      const totalUnpaid = allEvents.reduce((sum, e) => sum + Math.max(balanceOf(e), 0), 0);
      const uniqueClients = new Set(allEvents.map((e) => e.client_name).filter(Boolean));

      setStats({
        upcomingGigs: upcoming.length,
        pendingContracts: pendingCount,
        unpaidBalance: totalUnpaid,
        totalClients: uniqueClients.size,
      });

      if (upcoming.length > 0) setNextEvent(upcoming[0]);

      const actions: ActionItem[] = [];
      allEvents.forEach((e) => {
        if (e.status === "Contract Pending") {
          actions.push({
            id: `contract-${e.id}`,
            type: "contract",
            message: `Send / sign contract for ${e.client_name || e.title}`,
            eventId: e.id,
          });
        }
        const bal = balanceOf(e);
        if (bal > 0 && new Date(e.event_date) >= now) {
          actions.push({
            id: `payment-${e.id}`,
            type: "payment",
            message: `Collect $${bal.toFixed(2)} balance for ${e.title}`,
            eventId: e.id,
          });
        }
      });

      setActionItems(actions.slice(0, 6));
      setIsLoading(false);
    }

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-[1.25rem]" />
          ))}
        </div>
        <SkeletonRows count={2} height="h-48" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Enter>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back to the booth.</h2>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </Enter>

      {/* Quick stats */}
      <Enter delay={0.05}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Upcoming gigs"
            value={stats.upcomingGigs.toString()}
            icon={<Calendar className="size-5 text-accent" />}
            tint="bg-[#e8f2ff]"
          />
          <StatCard
            title="Pending contracts"
            value={stats.pendingContracts.toString()}
            icon={<FileText className="size-5 text-[#b25000]" />}
            tint="bg-[#fff3e0]"
          />
          <StatCard
            title="Outstanding balance"
            value={`$${stats.unpaidBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<CreditCard className="size-5 text-[#1e7b36]" />}
            tint="bg-[#e6f6ea]"
          />
          <StatCard
            title="Total clients"
            value={stats.totalClients.toString()}
            icon={<Users className="size-5 text-[#5b45b0]" />}
            tint="bg-[#f0ecfd]"
          />
        </div>
      </Enter>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next performance */}
        <Enter delay={0.1} className="lg:col-span-2">
          <Card className="flex h-full flex-col p-7">
            <CardTitle className="mb-5 flex items-center gap-2 text-base">
              <Calendar className="size-4 text-accent" /> Next performance
            </CardTitle>

            {nextEvent ? (
              <div
                onClick={() => router.push(`/dashboard/events/${nextEvent.id}`)}
                className="group flex flex-1 cursor-pointer flex-col justify-between gap-5 rounded-2xl border border-black/5 bg-[#fafafa] p-6 transition-all duration-300 hover:border-accent/30 hover:bg-[#f5f9ff] md:flex-row md:items-center"
              >
                <div>
                  <h4 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {nextEvent.title}
                  </h4>
                  <div className="mt-2 flex items-center gap-3 text-sm text-ink-secondary">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-accent" />
                      {new Date(nextEvent.event_date).toLocaleDateString([], {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(nextEvent.event_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Badge tone={statusTone(nextEvent.status)}>{nextEvent.status}</Badge>
                  <span className="flex items-center gap-1 text-xs font-medium text-ink-tertiary transition-transform group-hover:translate-x-0.5">
                    View details <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-hairline py-12 text-center">
                <Calendar className="mb-3 size-8 text-ink-tertiary" />
                <p className="text-sm font-medium text-ink-secondary">
                  No upcoming performances scheduled.
                </p>
              </div>
            )}
          </Card>
        </Enter>

        {/* Action items */}
        <Enter delay={0.15}>
          <Card className="h-full p-7">
            <CardTitle className="mb-5 flex items-center gap-2 text-base">
              <AlertCircle className="size-4 text-[#b25000]" /> Action needed
            </CardTitle>

            {actionItems.length > 0 ? (
              <ul className="space-y-1">
                {actionItems.map((action) => (
                  <li
                    key={action.id}
                    onClick={() => router.push(`/dashboard/events/${action.eventId}`)}
                    className="group -mx-2 flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-black/[0.03]"
                  >
                    <div
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        action.type === "payment" ? "bg-[#1e7b36]" : "bg-[#b25000]"
                      }`}
                    />
                    <p className="text-sm leading-relaxed text-ink-secondary transition-colors group-hover:text-ink">
                      {action.message}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-[#e6f6ea]">
                  <CheckCircle2 className="size-5 text-[#1e7b36]" />
                </div>
                <p className="text-sm font-medium text-ink-secondary">You&apos;re all caught up!</p>
              </div>
            )}
          </Card>
        </Enter>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  tint,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  tint: string;
}) {
  return (
    <Card className="group p-6">
      <div
        className={`mb-4 flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${tint}`}
      >
        {icon}
      </div>
      <h4 className="text-3xl font-semibold tracking-tight">{value}</h4>
      <p className="mt-1 text-[13px] text-ink-secondary">{title}</p>
    </Card>
  );
}
