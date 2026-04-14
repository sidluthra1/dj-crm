"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Calendar, MapPin, Clock, LogOut, Music, ShieldCheck, User 
} from "lucide-react";

export default function StaffDashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStaffData() {
      // 1. Get logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/staff/login");
        return;
      }

      // 2. Get their staff profile
      const { data: staffProfile } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (staffProfile) {
        setProfile(staffProfile);

        // We search for the exact name that was saved to the event array
        const searchName = staffProfile.stage_name || staffProfile.full_name;

        // 3. Get ONLY the events they are assigned to
        const { data: assignedEvents } = await supabase
          .from('events')
          .select('*')
          .contains('assigned_staff', [searchName]) // This looks inside the Postgres array!
          .order('event_date', { ascending: true });

        if (assignedEvents) {
          const now = new Date();
          now.setHours(0,0,0,0);
          
          setUpcomingEvents(assignedEvents.filter(e => new Date(e.event_date) >= now));
          setPastEvents(assignedEvents.filter(e => new Date(e.event_date) < now));
        }
      }
      setIsLoading(false);
    }

    loadStaffData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/staff/login");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-purple-400 font-bold uppercase tracking-widest animate-pulse">Loading Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* STAFF NAVBAR */}
      <nav className="h-20 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Music className="text-white size-5" />
          </div>
          <div>
            <span className="text-lg font-light tracking-[0.2em] uppercase leading-none block">NEXORA</span>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Crew Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 text-sm font-bold text-gray-300 border-r border-white/10 pr-6">
            <User size={16} className="text-gray-500" />
            {profile?.stage_name || profile?.full_name}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-900/40 to-black border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white mb-2">Welcome back, {profile?.stage_name || profile?.full_name.split(' ')[0]}.</h1>
            <p className="text-gray-400 text-lg">You have <span className="text-purple-400 font-bold">{upcomingEvents.length}</span> upcoming gigs on the schedule.</p>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
            <Music size={300} />
          </div>
        </div>

        {/* UPCOMING GIGS */}
        <section>
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Calendar size={16} /> Your Upcoming Gigs
          </h2>
          
          {upcomingEvents.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-[2rem] p-12 text-center">
              <p className="text-gray-400 font-bold">You have no upcoming events assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8 hover:bg-white/10 transition-colors flex flex-col md:flex-row gap-6 md:items-center group">
                  
                  {/* Date Block */}
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px] shrink-0">
                    <span className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">
                      {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-3xl font-black text-white leading-none">
                      {new Date(event.event_date).getDate()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {event.event_type}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 group-hover:text-purple-300 transition-colors">{event.title}</h3>
                    
                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500"/> 
                        {event.setup_time ? new Date(event.setup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'} Call Time
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500"/> 
                        {event.venue_name || event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-gray-500"/> 
                        Attire: <span className="text-white">{event.attire || "Standard"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 flex flex-col gap-3 justify-center">
                    <button className="px-6 py-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold text-sm rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                      View Notes & Details
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}