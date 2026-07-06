"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Wrench,
  Ticket,
  Users,
  Contact,
  Menu,
  X,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PAGE_TITLES: [string, string][] = [
  ["/dashboard/calendar", "Calendar"],
  ["/dashboard/events/new", "New Event"],
  ["/dashboard/events/previous", "Previous Events"],
  ["/dashboard/events", "Events"],
  ["/dashboard/meetings/new", "New Meeting"],
  ["/dashboard/meetings/previous", "Past Meetings"],
  ["/dashboard/meetings", "Meetings"],
  ["/dashboard/inventory/new", "Add Equipment"],
  ["/dashboard/inventory", "Inventory"],
  ["/dashboard/staff", "Team & Staff"],
  ["/dashboard/settings", "Settings"],
  ["/dashboard/tools", "Tools"],
  ["/dashboard", "Overview"],
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [initials, setInitials] = useState("DJ");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      const name = profile?.full_name || user.email || "DJ";
      setInitials(
        name
          .split(" ")
          .map((w: string) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      );
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close the mobile drawer on navigation
  useEffect(() => setMobileOpen(false), [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const pageTitle = PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

  const sidebar = (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-black/5 px-6">
        <Link href="/dashboard" className="text-sm font-semibold tracking-[0.18em] text-ink">
          NEXORA
        </Link>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Overview"
          active={pathname === "/dashboard"}
        />
        <SidebarLink
          href="/dashboard/calendar"
          icon={<Calendar size={18} />}
          label="Calendar"
          active={pathname === "/dashboard/calendar"}
        />

        <SidebarGroup
          icon={<Ticket size={18} />}
          label="Events"
          active={pathname.includes("/dashboard/events")}
          links={[
            { href: "/dashboard/events/upcoming", label: "Upcoming" },
            { href: "/dashboard/events/previous", label: "Previous" },
            { href: "/dashboard/events/new", label: "New event" },
          ]}
          pathname={pathname}
        />

        <SidebarGroup
          icon={<Users size={18} />}
          label="Meetings"
          active={pathname.includes("/dashboard/meetings")}
          links={[
            { href: "/dashboard/meetings/upcoming", label: "Upcoming" },
            { href: "/dashboard/meetings/previous", label: "Past meetings" },
            { href: "/dashboard/meetings/new", label: "New meeting" },
          ]}
          pathname={pathname}
        />

        <SidebarLink
          href="/dashboard/staff"
          icon={<Contact size={18} />}
          label="Team & Staff"
          active={pathname.includes("/dashboard/staff")}
        />
        <SidebarLink
          href="/dashboard/inventory"
          icon={<Package size={18} />}
          label="Inventory"
          active={pathname.includes("/dashboard/inventory")}
        />

        <SidebarGroup
          icon={<Wrench size={18} />}
          label="Tools"
          active={pathname.includes("/dashboard/tools")}
          links={[
            { href: "/dashboard/tools/duplicate-remover", label: "Duplicate remover" },
            { href: "/dashboard/tools/missing-files", label: "Missing file finder" },
            { href: "/dashboard/tools/library-sync", label: "Library sync" },
          ]}
          pathname={pathname}
          extra={
            <Link
              href="/dashboard/tools/upgrade"
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-[#b25000] transition-colors hover:bg-[#fff3e0]"
            >
              <Star size={13} className="fill-current" /> Premium upgrade
            </Link>
          }
        />
      </nav>

      <div className="shrink-0 space-y-1 border-t border-black/5 p-3">
        <SidebarLink
          href="/dashboard/settings"
          icon={<Settings size={18} />}
          label="Settings"
          active={pathname === "/dashboard/settings"}
        />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-[#fff0f0] hover:text-danger"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/5 bg-white md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white shadow-card-hover md:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="frosted flex h-16 shrink-0 items-center justify-between border-b border-black/5 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-ink-secondary hover:bg-black/5 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-[17px] font-semibold tracking-tight">{pageTitle}</h1>
          </div>
          <Link
            href="/dashboard/settings"
            className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6e56cf] to-[#0071e3] text-xs font-semibold text-white shadow-sm transition-transform hover:scale-105"
            title="Account settings"
          >
            {initials}
          </Link>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-[#f0f4ff] text-accent" : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function SidebarGroup({
  icon,
  label,
  active,
  links,
  pathname,
  extra,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  links: { href: string; label: string }[];
  pathname: string;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(active);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-[#f0f4ff] text-accent" : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink"
        )}
      >
        <span className="flex items-center gap-3">
          {icon}
          {label}
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-1 space-y-0.5 border-l border-black/5 pl-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    pathname === l.href
                      ? "text-accent"
                      : "text-ink-tertiary hover:bg-black/[0.04] hover:text-ink"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              {extra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
