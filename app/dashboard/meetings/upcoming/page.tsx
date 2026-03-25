"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Calendar, MapPin, Clock, Users, Plus, Video, Ticket } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string;
  status: string;
  client_name: string;
  assigned_staff: string[];
  events?: {
    title: string;
  } | null;
}

export default function UpcomingMeetingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          events (
            title
          )
        `)
        .gte('meeting_date', startOfDay.toISOString()) 
        .order('meeting_date', { ascending: true });

      if (data) setMeetings(data);
      setIsLoading(false);
    }
    fetchMeetings();
  }, [supabase]);

  // Styling helper for meeting types
  const getTypeColor = (type: string) => {
    switch(type) {
      case "Client Consult": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Venue Walkthrough": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Team Meeting": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Upcoming Meetings</h2>
          <p className="text-gray-400">Track client consults, venue walkthroughs, and internal syncs.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/meetings/new')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full transition-all shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <Plus size={20} /> Schedule Meeting
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse uppercase tracking-[0.3em]">Syncing Calendar...</div>
      ) : (
        <div className="space-y-6">
          {meetings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  onClick={() => router.push(`/dashboard/meetings/${meeting.id}`)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-[2.5rem] p-8 transition-all group cursor-pointer"
                >
                  <div className="mb-6 flex justify-between items-start">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getTypeColor(meeting.meeting_type)}`}>
                      {meeting.meeting_type}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">{meeting.status}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors leading-tight">
                    {meeting.title}
                  </h3>

                  {meeting.client_name && (
                    <p className="text-purple-400 font-bold text-sm mb-6 flex items-center gap-2">
                      <Users size={16}/> {meeting.client_name}
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                      <Calendar className="size-4 text-gray-500 shrink-0" />
                      <span className="font-bold text-white">
                        {new Date(meeting.meeting_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                      <Clock className="size-4 text-gray-500 shrink-0" />
                      <span>
                        {meeting.start_time ? new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'} 
                        {meeting.end_time && ` - ${new Date(meeting.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 text-sm">
                      {meeting.location?.toLowerCase().includes('zoom') || meeting.location?.toLowerCase().includes('meet') 
                        ? <Video className="size-4 text-blue-400 shrink-0" /> 
                        : <MapPin className="size-4 text-red-400 shrink-0" />
                      }
                      <span className="truncate">{meeting.location || 'Location TBD'}</span>
                    </div>
                  </div>

                  {/* Footer: Event Link & Staff */}
                  <div className="pt-5 border-t border-white/10 flex justify-between items-end">
                    <div className="flex-1">
                      {meeting.events && (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                           <Ticket size={12} className="text-purple-400"/> {meeting.events.title}
                        </div>
                      )}
                    </div>

                    {/* Staff Avatars */}
                    {meeting.assigned_staff?.length > 0 && (
                      <div className="flex -space-x-2 shrink-0">
                        {meeting.assigned_staff.map((staff, i) => (
                          <div key={i} className="size-8 rounded-full bg-purple-900 border-2 border-black flex items-center justify-center text-[10px] font-black text-purple-300 z-10" title={staff}>
                            {staff.substring(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center">
              <Users className="size-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No upcoming meetings scheduled.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}