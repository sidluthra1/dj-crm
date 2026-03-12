"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, Zap, Star, Shield, Users, Plus } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Track which tier is currently being saved to the database
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);
  
  // Manual scroll function to fix the anchor link issue
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // THE NEW LOGIC: Save the tier to Supabase and route the user
  const handleTierSelect = async (tier: string) => {
    setUpdatingTier(tier);
    
    // 1. Check if they are logged in
    const { data: { session } } = await supabase.auth.getSession();

    // If not logged in, send them to signup first
    if (!session) {
      router.push("/signup");
      return;
    }

    // 2. Update their profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', session.user.id);

    if (error) {
      console.error("Failed to update tier:", error.message);
      setUpdatingTier(null);
      return;
    }

    // 3. Send them to the dashboard! 
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl font-light tracking-[0.2em] uppercase text-white">NEXORA</span>
          </Link>
          <h1 className="text-5xl font-bold mb-4">Choose Your Performance Level</h1>
          <p className="text-gray-400 text-xl">Tailored tools for solo acts and full-scale production companies.</p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* FREE TIER */}
          <PricingCard
            title="Free Tier"
            description="Basic Tool Access"
            price="Free"
            subtext="Recommended for Solo DJs (1-3 bookings/mo)"
            icon={<Zap className="text-purple-400" />}
            features={[
              "Remove Duplicate Files",
              "Find Missing Tracks",
              "Spotify Downloader (1 song/day, 1 playlist/week)"
            ]}
            buttonText="Get Started"
            onButtonClick={() => handleTierSelect('free')}
            isLoading={updatingTier === 'free'}
          />

          {/* PREMIUM TIER */}
          <PricingCard
            title="Premium Tools"
            description="Advanced Performance Access"
            price="$15"
            period="/month"
            subtext="or $200 Lifetime. For consistent 3+ bookings/mo."
            icon={<Star className="text-yellow-400" />}
            highlight={true}
            features={[
              "Everything in Free",
              "Spotify Downloader (500 playlists/mo, 1000 songs/mo)",
              "Set Curation Helper / Music Recommendation",
              "AI Powered File System Sorter",
              "Serato <-> Rekordbox XML Conversion"
            ]}
            buttonText="Go Premium"
            onButtonClick={() => handleTierSelect('premium')}
            isLoading={updatingTier === 'premium'}
          />

          {/* CRM ACCESS */}
          <PricingCard
            title="Basic CRM"
            description="Business Management"
            price="$25"
            period="/month"
            subtext="For 8+ bookings/mo or gear inventory owners."
            icon={<Shield className="text-blue-400" />}
            features={[
              "Includes all Free Tools (Premium tools upgrade available anytime after purchase)",
              "AI Generated Contracts & Invoices",
              "Calendar & Event Management",
              "Client Portal",
              "Inventory Tracking"
            ]}
            buttonText="Unlock CRM"
            isCombo={true}
            footer="Upgrade to premium tools available in your dashboard after purchase"
            onButtonClick={() => handleTierSelect('crm')}
            isLoading={updatingTier === 'crm'}
          />

          {/* COMPANY TIER */}
          <PricingCard
            title="Company Tier"
            description="Full Enterprise Solution"
            price="Custom"
            subtext="Fill out the form below for a quote estimate."
            icon={<Users className="text-pink-400" />}
            features={[
              "Includes Basic CRM & Premium Tools",
              "Advanced Client Portal (Zoom Integration)",
              "Staff Portal & Management Capabilities",
              "Assign staff to events & track performance"
            ]}
            buttonText="Contact Sales"
            onButtonClick={scrollToContact} 
          />
        </div>

        {/* Custom Quote Form Placeholder */}
        <div id="contact-form" className="mt-24 max-w-2xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-[2.5rem]">
          <h2 className="text-3xl font-bold mb-6 text-center">Company Tier Inquiry</h2>
          <p className="text-gray-400 text-center mb-8">Tell us about your team and we'll build a custom package for you.</p>
          <form className="space-y-4">
             <input type="text" placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4" />
             <input type="email" placeholder="Business Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4" />
             <textarea placeholder="Tell us about your staff size and requirements..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4" />
             <button className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-full hover:bg-purple-500 hover:text-white transition-all">Request Quote + Demo</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, description, price, period, subtext, features, icon, buttonText, highlight = false, isCombo = false, footer, buttonHref = "/signup", onButtonClick, isLoading = false }: any) {
  // Consolidate the styling so both buttons and links get the correct highlight colors!
  const btnStyle = `w-full py-4 rounded-full font-bold transition-all ${highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : isCombo ? 'bg-blue-600/20 hover:bg-blue-600/40 text-white border border-blue-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <div className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] flex-1 ${highlight ? 'bg-white/15 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-white/10'} ${isCombo ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : ''}`}>
      {highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg w-max whitespace-nowrap">Most Popular</div>}
      
      {isCombo && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg w-max whitespace-nowrap">
          <Plus size={10} strokeWidth={4} /> Premium Add-on Available
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-6">{description}</p>
      <div className="mb-2">
        <span className="text-4xl font-black">{price}</span>
        {period && <span className="text-gray-400">{period}</span>}
      </div>
      <p className="text-xs text-gray-400 mb-8 min-h-[32px]">{subtext}</p>
      
      <div className="flex-grow space-y-4 mb-8">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex gap-3 text-sm">
            <Check className="size-5 text-purple-400 shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {onButtonClick ? (
          <button 
            onClick={onButtonClick}
            disabled={isLoading}
            className={btnStyle}
          >
            {isLoading ? "Processing..." : buttonText}
          </button>
        ) : (
          <Link href={buttonHref} className="block">
            <button className={btnStyle}>
              {buttonText}
            </button>
          </Link>
        )}
      </div>
      
      {footer && <p className="mt-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] leading-relaxed">{footer}</p>}
    </div>
  );
}