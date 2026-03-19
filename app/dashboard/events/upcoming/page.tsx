"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Calendar, MapPin, Clock, DollarSign, MoreVertical, Plus, Zap, Truck } from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_date: string;
  setup_time: string | null;
  event_end_time: string | null;
  location: string;
  client_name: string;
  pay: number;
  status: string;
}

export default function UpcomingEventsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_end_time', startOfDay.toISOString()) 
        .order('event_date', { ascending: true });

      if (data) setEvents(data);
      setIsLoading(false);
    }
    fetchEvents();
  }, [supabase]);

  const now = new Date();

  // FILTER LOGIC
  const liveEvents = events.filter(event => {
    const start = event.setup_time ? new Date(event.setup_time) : new Date(event.event_date);
    const end = event.event_end_time ? new Date(event.event_end_time) : new Date(event.event_date);
    return now >= start && now <= end;
  });

  const upcomingEvents = events.filter(event => {
    const start = event.setup_time ? new Date(event.setup_time) : new Date(event.event_date);
    return start > now;
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Event Schedule</h2>
          <p className="text-gray-400">Real-time tracking of your active and future bookings.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/events/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <Plus size={20} /> Add New Event
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse uppercase tracking-[0.3em]">Syncing Calendar...</div>
      ) : (
        <div className="space-y-16">
          
          {/* SECTION 1: LIVE OR IN SETUP */}
          {liveEvents.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-3 bg-red-500 rounded-full animate-ping" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest">Live / Active Now</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {liveEvents.map((event) => (
                  <EventCard key={event.id} event={event} isLive={true} onClick={() => router.push(`/dashboard/events/${event.id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: UPCOMING */}
          <section>
            <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-6">Coming Up</h3>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} isLive={false} onClick={() => router.push(`/dashboard/events/${event.id}`)} />
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center">
                <Calendar className="size-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No future events scheduled.</p>
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}

function EventCard({ event, isLive, onClick }: { event: Event, isLive: boolean, onClick: () => void }) {
  const now = new Date();
  const isSetup = isLive && now < new Date(event.event_date);

  return (
    <div 
      onClick={onClick}
      className={`relative border rounded-[2.5rem] p-8 transition-all group cursor-pointer ${
        isLive 
        ? 'bg-gradient-to-br from-purple-900/40 to-black border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]' 
        : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="mb-6">
        <div className="flex justify-between items-start">
            <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">{event.client_name}</p>
            <button className="text-gray-600 hover:text-white transition-colors"><MoreVertical size={18}/></button>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 group-hover:text-purple-300 transition-colors leading-tight">{event.title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 mb-8">
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <Calendar className="size-4 text-purple-500 shrink-0" />
          <span>{new Date(event.event_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <MapPin className="size-4 text-purple-500 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <Clock className="size-4 text-purple-500 shrink-0" />
          <div className="flex flex-col">
              <span className="font-bold text-white">
                {new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.event_end_time ? new Date(event.event_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
              </span>
              {event.setup_time && <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Setup: {new Date(event.setup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-sm">
          <DollarSign className="size-4 text-green-400 shrink-0" />
          <span className="font-black text-white text-lg">${event.pay}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
           {isSetup ? <Truck className="text-orange-400 size-4" /> : isLive ? <Zap className="text-yellow-400 size-4" /> : <Calendar className="text-gray-500 size-4" />}
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             {isSetup ? "Gear Deployed / Setup" : isLive ? "Event in Progress" : "Confirmed Booking"}
           </span>
        </div>
        <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">View Details →</span>
      </div>
    </div>
  );
}