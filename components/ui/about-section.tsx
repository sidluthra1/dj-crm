"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Music, Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "DJs Supported", value: "300+" },
  { label: "Events Managed", value: "800+" },
  { label: "Happy Clients", value: "99%" },
  { label: "Countries", value: "40+" },
];

const EASE = [0.25, 0.4, 0.25, 1] as const;

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: EASE },
  },
});

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative pt-10 pb-28 px-6 bg-[#13131f]"
    >
      {/* Subtle ambient glow at the very top — continues the hero's purple haze */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[180px] bg-purple-900/30 blur-[90px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-12">

        {/* ── Header ── */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 md:gap-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            One Platform.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
              Infinite Control.
            </span>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed self-center">
            Nexora was built for the realities of a working DJ career — juggling
            bookings, equipment, tracks, and clients. We handle the heavy
            lifting so you can stay focused on the mix.
          </p>
        </motion.div>

        {/* ── Card grid ── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left big card */}
          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="md:flex-1 relative rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-purple-950/60 via-[#13131f] to-[#13131f] min-h-[440px] flex flex-col justify-between"
          >
            {/* Glow blob inside card */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 bg-purple-700/25 blur-[80px] rounded-full" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-20 bg-purple-600/20 blur-2xl rounded-full" />

            {/* Headphones image sitting at the bottom-right */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/headphones.png"
              alt="DJ Headphones"
              className="absolute bottom-0 right-0 w-56 opacity-80 drop-shadow-[0_0_40px_rgba(168,85,247,0.5)] pointer-events-none select-none"
            />

            <div className="relative z-10 p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
                <Cpu className="size-3 text-purple-400" />
                <span className="text-xs text-purple-300 tracking-wide">The Mission</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 leading-snug">
                Built for DJs.<br />By DJs.
              </h3>
              <p className="text-white/45 text-sm leading-relaxed max-w-[260px]">
                Our goal is to give every DJ — from solo acts to full production
                companies — the same tools used by industry giants.
              </p>
            </div>
          </motion.div>

          {/* Right two cards */}
          <div className="flex flex-col gap-6 md:flex-1">

            {/* Card 1 — Performance */}
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-purple-950/10 p-7 flex flex-col justify-between min-h-[200px]"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 w-40 h-40 bg-purple-600/15 blur-[50px] rounded-full" />
              <div className="relative z-10">
                <div className="p-2.5 bg-purple-600/20 rounded-xl border border-purple-500/30 inline-flex mb-4">
                  <Music className="text-purple-400 size-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Performance-First Tools</h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  Automate file management and crate curation with AI-driven insights.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="relative z-10 mt-5 border-purple-500/30 bg-transparent text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 hover:border-purple-400/50 w-fit gap-1"
              >
                <Link href="#">
                  Learn More <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            </motion.div>

            {/* Card 2 — CRM */}
            <motion.div
              variants={fadeUp(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/30 to-purple-950/10 p-7 flex flex-col justify-between min-h-[200px]"
            >
              <div className="pointer-events-none absolute -bottom-6 -left-6 w-40 h-40 bg-fuchsia-600/15 blur-[50px] rounded-full" />
              <div className="relative z-10">
                <div className="p-2.5 bg-fuchsia-600/20 rounded-xl border border-fuchsia-500/30 inline-flex mb-4">
                  <Shield className="text-fuchsia-400 size-5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enterprise-Grade CRM</h3>
                <p className="text-sm text-white/45 leading-relaxed">
                  Professional contracts, invoices, and client portals that reflect your brand.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="relative z-10 mt-5 border-fuchsia-500/30 bg-transparent text-fuchsia-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-200 hover:border-fuchsia-400/50 w-fit gap-1"
              >
                <Link href="#">
                  Learn More <ChevronRight className="size-3.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          variants={fadeUp(0.4)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/[0.07] pt-14"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/40 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
