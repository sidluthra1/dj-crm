"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import AboutSection from "@/components/ui/about-section";

const Navbar = () => {
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md bg-black/10 border-b border-white/5">
      <div className="flex-1">
        <Link href="/" className="text-2xl font-light tracking-[0.2em] uppercase text-white">
          NEXORA
        </Link>
      </div>
      <div className="hidden md:flex flex-1 justify-center items-center gap-10">
        <a 
          href="#about" 
          onClick={(e) => scrollToSection(e, "about")}
          className="text-white font-bold text-sm tracking-wide hover:text-purple-400 transition-colors"
        >
          About
        </a>
        <a 
          href="#contact" 
          onClick={(e) => scrollToSection(e, "contact")}
          className="text-white font-bold text-sm tracking-wide hover:text-purple-400 transition-colors"
        >
          Contact Us
        </a>
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="/login" className="text-sm font-bold text-white hover:text-purple-400 transition-colors border border-white/20 px-6 py-2 rounded-full hover:bg-white/10">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default function Home() {
  useEffect(() => {
    // Tell the browser NOT to remember the scroll position
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Force the window to the very top
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Navbar />
      
      <main className="bg-[#13131f] text-white min-h-screen">

        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center overflow-hidden">

          {/* ── Elegant floating shapes (framer-motion) ── */}
          <ElegantShape delay={0.3} width={500} height={110} rotate={12}  gradient="from-purple-500/[0.12]" className="left-[-8%] top-[18%]" />
          <ElegantShape delay={0.5} width={320} height={80}  rotate={-10} gradient="from-fuchsia-500/[0.10]" className="left-[5%] bottom-[12%]" />
          <ElegantShape delay={0.6} width={180} height={50}  rotate={20}  gradient="from-violet-500/[0.12]" className="left-[30%] top-[8%]" />

          {/* ── Decorative corner brackets ── */}
          <div className="pointer-events-none absolute top-[4.5rem] right-5 w-24 h-24 border-t-[1.5px] border-r-[1.5px] border-white/20" />
          <div className="pointer-events-none absolute top-[5.5rem] right-9 w-14 h-14 border-t border-r border-white/10" />
          <div className="pointer-events-none absolute bottom-10 left-6 w-20 h-20 border-b-[1.5px] border-l-[1.5px] border-white/20" />

          {/* ── Neon accent lines ── */}
          <div className="pointer-events-none absolute bottom-28 right-0 w-52 h-[1.5px] bg-gradient-to-l from-fuchsia-500/75 to-transparent" />
          <div className="pointer-events-none absolute bottom-20 right-0 w-32 h-[1px] bg-gradient-to-l from-purple-400/50 to-transparent" />
          <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-[1.5px] h-40 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />

          {/* ── Left: text + buttons ── */}
          <div className="relative z-10 w-1/2 pl-14 pr-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-[4.5rem] md:text-[5.5rem] font-black leading-[1.05] tracking-tight mb-5 text-white"
            >
              Your Entire<br />DJ Business
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-xl font-semibold text-white/70 mb-10 tracking-wide"
            >
              Synced. Performance-Ready.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="flex items-center gap-4"
            >
              <Link href="/signup">
                <button className="group relative flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl text-white font-semibold text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Zap className="relative z-10 size-4 fill-current" />
                  <span className="relative z-10">Get Started</span>
                </button>
              </Link>
              <Link href="/login">
                <button className="group flex items-center gap-2 px-7 py-3.5 bg-white/5 border border-white/25 rounded-xl text-white font-semibold text-base transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:scale-105">
                  <ArrowRight className="size-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  Login
                </button>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: headphones image ── */}
          <div className="pointer-events-none select-none absolute right-0 top-0 h-full w-1/2 flex items-center justify-center">
            {/* Large outer glow — fills the right half like the mockup spotlight */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[700px] h-[700px] rounded-full bg-purple-900/60 blur-[120px]" />
            </div>
            {/* Tighter inner glow — hot purple core behind the headphones */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[380px] h-[380px] rounded-full bg-purple-700/45 blur-[70px]" />
            </div>
            {/* Floor reflection glow */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-96 h-10 rounded-full bg-purple-600/40 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/headphones.png"
              alt="DJ Headphones"
              className="relative z-10 w-[580px] max-w-none drop-shadow-[0_8px_60px_rgba(139,92,246,0.6)]"
            />
          </div>

          {/* Gradient fade — blends hero glow into the about section below */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#13131f] via-[#13131f]/80 to-transparent z-20" />

        </section>

        <AboutSection />

        {/* CONTACT SECTION */}
        <section id="contact" className="relative py-28 px-6 bg-[#13131f] overflow-hidden">

          {/* Ambient glow blobs */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-purple-900/25 blur-[100px] rounded-full" />
          <div className="pointer-events-none absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-fuchsia-900/15 blur-[80px] rounded-full" />

          {/* Decorative corner brackets */}
          <div className="pointer-events-none absolute bottom-10 right-6 w-20 h-20 border-b-[1.5px] border-r-[1.5px] border-white/15" />
          <div className="pointer-events-none absolute top-10 left-6 w-20 h-20 border-t-[1.5px] border-l-[1.5px] border-white/15" />

          <div className="relative z-10 max-w-2xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-5">
                <span className="text-xs text-purple-300 tracking-wide">Get in Touch</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Contact{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                  Us
                </span>
              </h2>
              <p className="text-white/45 text-lg leading-relaxed">
                Ready to transform your DJ business? Send us a message and our team will get back to you shortly.
              </p>
            </motion.div>

            {/* Form card */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-8 md:p-10 space-y-6"
            >
              {/* Subtle inner glow top-right */}
              <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 bg-purple-700/15 blur-[60px] rounded-full" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-white/35 uppercase tracking-widest">Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.06] transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-white/35 uppercase tracking-widest">Email</label>
                  <input
                    type="email"
                    placeholder="dj@example.com"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-white/35 uppercase tracking-widest">Message</label>
                <textarea
                  rows={4}
                  placeholder="How can we help your business?"
                  className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-purple-500/60 focus:bg-white/[0.06] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl text-white font-semibold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(168,85,247,0.45)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Send Message</span>
              </button>
            </motion.form>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-10 text-center bg-[#13131f]">
          <span className="text-white/25 text-sm tracking-wide">&copy; 2026 NEXORA. All rights reserved.</span>
        </footer>

      </main>
    </>
  );
}