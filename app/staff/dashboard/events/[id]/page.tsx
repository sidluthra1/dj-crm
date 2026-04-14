"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, MapPin, Clock, Package, 
  Navigation, Users, FileText, Download, Music, 
  ShieldCheck, MessageSquare
} from "lucide-react";

export default function StaffEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEventDetails() {
      // 1. Verify they are logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Fetch the event, including the gear pack list
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_equipment (
            quantity_allocated,
            inventory (
              name,
              category
            )
          )
        `)
        .eq('id', id)
        .single();

      if (data) setEvent(data);
      setIsLoading(false);
    }

    fetchEventDetails();
  }, [id, router, supabase]);

  if (isLoading || !event) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-purple-400 font-bold uppercase tracking-widest animate-pulse">Loading Event...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 pb-20">
      
      {/* MINIMAL NAVBAR */}
      <nav className="h-20 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center px-6 lg:px-12 sticky top-0 z-50">
        <button onClick={() => router.push('/staff/dashboard')} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6 lg:p-12 space-y-8">
        
        {/* HEADER: High-Level Overview */}
        <div className="bg-gradient-to-br from-purple-900/30 to-black border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-white/10 text-gray-300 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
                {event.event_type || "Private Event"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-400">
               <span className="flex items-center gap-2">
                 <Clock size={16} className="text-purple-400"/> 
                 {new Date(event.event_date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
               </span>
            </div>
          </div>
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
             <Music size={400} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: Timeline & Venue (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={16}/> Run of Show</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-gray-400 text-sm font-bold">Call / Setup Time</span>
                  <span className="text-purple-400 font-black">{event.setup_time ? new Date(event.setup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-gray-400 text-sm font-bold">Event Start</span>
                  <span className="text-white font-black">{new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-bold">Event End</span>
                  <span className="text-gray-300 font-black">{event.event_end_time ? new Date(event.event_end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={16}/> Location Details</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-white font-bold text-lg">{event.venue_name || event.location}</p>
                  <p className="text-gray-400 text-sm mt-1">{event.venue_address || "Address pending"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><Navigation size={12}/> Distance</p>
                    <p className="text-sm font-bold text-white">{event.distance_to_venue || "TBD"}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><Clock size={12}/> Travel Time</p>
                    <p className="text-sm font-bold text-white">{event.travel_time || "TBD"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                <Users className="size-6 text-purple-400 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Est. Guests</p>
                <p className="text-xl font-black text-white">{event.guest_count || "-"}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center">
                <ShieldCheck className="size-6 text-blue-400 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Attire</p>
                <p className="text-sm font-bold text-white mt-1">{event.attire || "Standard"}</p>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Notes & Gear (Span 7) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            
            {/* Notes Section */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare size={16}/> Client Requests</h3>
                  <p className="text-sm text-purple-300/80 italic leading-relaxed bg-purple-900/10 p-5 rounded-2xl border border-purple-500/20">
                    "{event.client_notes || "No special requests from the client at this time."}"
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={16}/> Run of Show Notes</h3>
                  <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-5 rounded-2xl border border-white/5">
                    {event.internal_notes || "No internal operational notes."}
                  </p>
                </div>
              </div>
            </div>

            {/* Read-Only Pack List */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8 flex-1">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Package size={16}/> Required Gear</h3>
              <div className="space-y-3">
                {event.event_equipment?.length > 0 ? (
                  event.event_equipment.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                      <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-black">
                        {item.quantity_allocated}x
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-white truncate">{item.inventory?.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{item.inventory?.category}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-black/20 rounded-2xl border border-white/5 border-dashed">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No Gear Assigned</p>
                  </div>
                )}
              </div>
            </div>

            {/* Safe Documents (No Financials) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <DocButton label="Event Timeline" isAvailable={!!event.timeline_url} />
               <DocButton label="Music Requests" isAvailable={!!event.music_list_url} icon={<Music size={16}/>} color="text-pink-400" />
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

// Reusable Document Button (Matches the main app but styled for staff portal)
function DocButton({ label, isAvailable, icon = <FileText size={16}/>, color = "text-blue-400" }: any) {
  return (
    <button 
      disabled={!isAvailable}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
        isAvailable 
        ? 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer' 
        : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isAvailable ? color : "text-gray-600"}>{icon}</span>
        <span className={`text-sm font-bold ${isAvailable ? 'text-white' : 'text-gray-500'}`}>{label}</span>
      </div>
      {isAvailable ? <Download size={16} className="text-gray-400" /> : <span className="text-[10px] uppercase font-black text-gray-600 tracking-widest">Pending</span>}
    </button>
  );
}