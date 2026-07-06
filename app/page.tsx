"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  FileSignature,
  Package,
  Users,
  CreditCard,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { FadeUp, Stagger, StaggerItem, APPLE_EASE } from "@/components/motion";
import { Button } from "@/components/ui/kit";

function Navbar() {
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="frosted fixed top-0 z-50 w-full border-b border-black/5">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-ink">
          NEXORA
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" onClick={(e) => scrollTo(e, "features")} className="text-xs text-ink-secondary transition-colors hover:text-ink">
            Features
          </a>
          <Link href="/pricing" className="text-xs text-ink-secondary transition-colors hover:text-ink">
            Pricing
          </Link>
          <a href="#contact" onClick={(e) => scrollTo(e, "contact")} className="text-xs text-ink-secondary transition-colors hover:text-ink">
            Contact
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-xs font-medium text-accent transition-opacity hover:opacity-70">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

const FEATURES = [
  {
    icon: <CalendarDays className="size-6" />,
    title: "Every booking, one calendar.",
    body: "Live, upcoming, and past events in a single timeline — with setup windows, travel time, and venue details attached to each gig.",
  },
  {
    icon: <FileSignature className="size-6" />,
    title: "Contracts that chase themselves.",
    body: "Pending contracts and unpaid balances surface automatically on your overview, so nothing slips before the downbeat.",
  },
  {
    icon: <Package className="size-6" />,
    title: "Know where every speaker is.",
    body: "Route gear to events with pack lists. NEXORA tracks what's in the warehouse, what's deployed, and what's in repair — in real time.",
  },
  {
    icon: <Users className="size-6" />,
    title: "Your crew, on the same page.",
    body: "Invite DJs, MCs, and roadies to their own portal. They see their assigned gigs and pack lists — nothing else.",
  },
  {
    icon: <CreditCard className="size-6" />,
    title: "Deposits and balances, handled.",
    body: "Enter the invoice and deposit; NEXORA computes the balance due and reminds you to collect before the event.",
  },
  {
    icon: <Sparkles className="size-6" />,
    title: "Built by DJs, for DJs.",
    body: "No generic CRM bloat. Every screen is shaped around how mobile DJ businesses actually run.",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      <Navbar />

      <main className="bg-canvas text-ink">
        {/* ============ HERO ============ */}
        <section ref={heroRef} className="relative overflow-hidden px-6 pb-10 pt-32 md:pt-40">
          <motion.div style={{ opacity: heroOpacity }} className="mx-auto max-w-4xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: APPLE_EASE }}
              className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
            >
              Your entire DJ business.
              <br />
              <span className="text-gradient-brand">Synced.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: APPLE_EASE }}
              className="mx-auto mt-6 max-w-xl text-lg text-ink-secondary md:text-xl"
            >
              Bookings, contracts, gear, and crew — managed from one beautiful
              dashboard, so you can focus on the music.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: APPLE_EASE }}
              className="mt-8 flex items-center justify-center gap-5"
            >
              <Link href="/signup">
                <Button size="lg">Get started free</Button>
              </Link>
              <a
                href="#features"
                className="group inline-flex items-center gap-1 text-[15px] font-medium text-accent"
              >
                Learn more
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </motion.div>

          {/* Product visual — dark tile, Apple-style */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.6, ease: APPLE_EASE }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0b0b0f] shadow-card-hover">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[420px] w-[420px] rounded-full bg-purple-700/40 blur-[110px]" />
              </div>
              <motion.div
                style={{ scale: imgScale, y: imgY }}
                className="relative flex items-center justify-center py-14 md:py-20"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/headphones.png"
                  alt="DJ headphones"
                  className="w-[440px] max-w-[80%] drop-shadow-[0_20px_60px_rgba(139,92,246,0.5)]"
                />
              </motion.div>
              <div className="relative pb-12 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-white/50">
                  PERFORMANCE-READY
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <FadeUp className="mb-16 text-center">
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Everything between
                <br />
                the booking and the encore.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-ink-secondary">
                One system of record for the business behind your sets.
              </p>
            </FadeUp>

            <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <StaggerItem key={f.title}>
                  <div className="shadow-card group h-full rounded-[1.5rem] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#f0f4ff] text-accent transition-transform duration-300 group-hover:scale-110">
                      {f.icon}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold tracking-tight">{f.title}</h3>
                    <p className="text-[15px] leading-relaxed text-ink-secondary">{f.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ STATS BAND ============ */}
        <section className="px-6 pb-24">
          <FadeUp className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[2rem] bg-black/5 sm:grid-cols-3">
              {[
                { value: "3 min", label: "to log a new booking" },
                { value: "1 view", label: "for gigs, gear, and crew" },
                { value: "0", label: "spreadsheets required" },
              ].map((s) => (
                <div key={s.label} className="bg-white px-8 py-12 text-center">
                  <p className="text-gradient-brand text-5xl font-semibold tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-2 text-[15px] text-ink-secondary">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* ============ CTA ============ */}
        <section className="px-6 pb-24">
          <FadeUp className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0b0b0f] px-8 py-20 text-center">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-purple-700/30 blur-[100px]" />
              <h2 className="relative text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Ready to run a tighter show?
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-lg text-white/60">
                Start free. Upgrade when the bookings do.
              </p>
              <div className="relative mt-8 flex items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg">
                    Get started <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link
                  href="/pricing"
                  className="text-[15px] font-medium text-white/80 transition-colors hover:text-white"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="px-6 pb-28">
          <div className="mx-auto max-w-xl">
            <FadeUp className="mb-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Get in touch.</h2>
              <p className="mt-3 text-[15px] text-ink-secondary">
                Questions about NEXORA or the Company tier? We&apos;ll get back to you shortly.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="shadow-card space-y-5 rounded-[1.5rem] bg-white p-8"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="How can we help your business?"
                  className="w-full resize-none rounded-xl border border-hairline px-4 py-3 text-[15px] transition-all focus:border-accent focus:ring-4 focus:ring-accent/10"
                />
                <Button className="w-full" size="lg" type="submit">
                  Send message
                </Button>
              </form>
            </FadeUp>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t border-black/5 bg-canvas px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-ink-tertiary md:flex-row">
            <span className="font-semibold tracking-[0.18em] text-ink-secondary">NEXORA</span>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
              <Link href="/login" className="transition-colors hover:text-ink">Sign in</Link>
              <Link href="/staff/login" className="transition-colors hover:text-ink">Crew portal</Link>
            </div>
            <span>&copy; 2026 NEXORA. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
