"use client";

import { useEffect } from "react";
import { ArrowRight, Zap, Music, Shield, Cpu } from "lucide-react";
import Link from "next/link";

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
      
      <main className="bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white min-h-screen">
        
        {/* HERO SECTION */}
        <section className="h-[85vh] flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="text-4xl font-light tracking-[0.2em] uppercase text-purple-400 mb-2">
              Nexora
            </h2>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Your Entire DJ Business <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                Synced. Performance-Ready.
              </span>
            </h1>
          </div>

          <div className="flex gap-6 justify-center items-center">
            <Link href="/signup">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <Zap className="size-5 group-hover:scale-110 transition-transform fill-current" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            <Link href="/login">
              <button className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-full text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/50">
                <span className="relative z-10 flex items-center gap-2">
                  Login
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-8 leading-tight">
                One Platform. <br />
                <span className="text-purple-400">Infinite Control.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Nexora was born from the chaos of managing a growing DJ career. We realized that juggling Serato crates, Excel spreadsheets for equipment, and email threads for contracts was slowing us down. 🎧
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
                    <Music className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Performance-First Tools</h4>
                    <p className="text-gray-400 text-sm">Automate your file management and crate curation with AI-driven insights.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
                    <Shield className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Enterprise-Grade CRM</h4>
                    <p className="text-gray-400 text-sm">Professional contracts, invoices, and client portals that reflect your brand.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 size-64 bg-purple-600/20 blur-[100px]" />
              <Cpu className="size-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">The Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                Our goal is to give every DJ—from solo acts to full-scale production companies—the same tools used by industry giants. We handle the logistical heavy lifting so you can stay focused on the mix.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-6 ">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Contact Us</h2>
            <p className="text-gray-400 max-w-lg text-lg">
              Ready to transform your DJ business? Send us a message and our team will get back to you shortly.
            </p>
          </div>

          <form className="w-full max-w-4xl space-y-8 bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Name</label>
                <input type="text" placeholder="Your Name" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500 transition-all text-white" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" placeholder="dj@example.com" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500 transition-all text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
              <textarea rows={4} placeholder="How can we help your business?" className="bg-white/5 border border-white/10 rounded-3xl px-6 py-4 focus:outline-none focus:border-purple-500 transition-all resize-none text-white" />
            </div>
            <div className="flex justify-center pt-4">
              <button type="submit" className="px-16 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-purple-500 hover:text-white transition-all scale-105 shadow-2xl">
                Send Message
              </button>
            </div>
          </form>
        </section>

        <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm">
          &copy; 2026 NEXORA. All rights reserved.
        </footer>

      </main>
    </>
  );
}