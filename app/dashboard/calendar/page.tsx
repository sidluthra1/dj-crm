"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon 
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  event_date: string;
  setup_time: string | null;
  status: string;
  event_type: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      
      // Calculate the start and end of the visible calendar to limit payload
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startOfGrid = new Date(year, month - 1, 20).toISOString(); // Buffer previous month
      const endOfGrid = new Date(year, month + 1, 15).toISOString();   // Buffer next month

      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, setup_time, status, event_type')
        .gte('event_date', startOfGrid)
        .lte('event_date', endOfGrid)
        .order('event_date', { ascending: true });

      if (data) setEvents(data);
      setIsLoading(false);
    }
    
    fetchEvents();
  }, [currentDate, supabase]);

  // --- CALENDAR MATH ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // 1. Pad Previous Month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // 2. Current Month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // 3. Pad Next Month (Fill out the grid to 35 or 42 slots)
  let nextMonthDay = 1;
  while (calendarDays.length % 7 !== 0 || calendarDays.length < 35) {
    calendarDays.push({
      date: new Date(year, month + 1, nextMonthDay++),
      isCurrentMonth: false,
    });
  }

  // --- HELPERS ---
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      const eDate = new Date(e.event_date);
      return eDate.getDate() === date.getDate() &&
             eDate.getMonth() === date.getMonth() &&
             eDate.getFullYear() === date.getFullYear();
    });
  };

  // Assign dark-theme pill colors based on event type
  const getPillColor = (type: string) => {
    switch(type) {
      case "Wedding": return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "Club / Nightlife": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "Corporate": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] pb-8 flex flex-col">
      
      {/* WRAPPER */}
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col flex-1 backdrop-blur-md">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-black/40">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center justify-center w-12 h-12 border border-white/10 rounded-xl bg-white/5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{currentDate.toLocaleString('default', { month: 'short' })}</span>
              <span className="text-xl font-black text-purple-400 leading-none mt-0.5">{currentDate.getDate()}</span>
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                {isLoading && <span className="text-xs font-bold text-gray-500 animate-pulse uppercase tracking-widest">Syncing...</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
              <Search size={20} />
            </button>
            
            {/* Navigation */}
            <div className="flex rounded-lg border border-white/10 overflow-hidden bg-white/5">
              <button onClick={prevMonth} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border-r border-white/10">
                <ChevronLeft size={20} />
              </button>
              <button onClick={goToday} className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border-l border-white/10">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* View Selector (Placeholder) */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
              <CalendarIcon size={16} className="text-purple-400" />
              Month view
            </button>

            {/* Add Event */}
            <button 
              onClick={() => router.push('/dashboard/events/new')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add event</span>
            </button>
          </div>
        </header>

        {/* GRID LAYOUT */}
        <div className="flex-1 flex flex-col min-h-0 bg-black/20">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-px border-b border-white/10 bg-black/40 shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-white/5 overflow-y-auto custom-scrollbar">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day.date);
              const isTodayDate = isToday(day.date);
              
              return (
                <div 
                  key={idx} 
                  className={`relative min-h-[120px] p-2 transition-colors group flex flex-col space-y-1 overflow-hidden 
                    ${day.isCurrentMonth ? 'bg-black/40 hover:bg-white/5' : 'bg-black/60 opacity-60 hover:opacity-100'} 
                    ${isTodayDate ? 'ring-1 ring-inset ring-purple-500 z-10' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                      ${isTodayDate ? 'bg-purple-600 text-white' : day.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
                    `}>
                      {day.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-gray-600 mt-1 mr-1 hidden lg:block">{dayEvents.length} Gigs</span>
                    )}
                  </div>

                  {/* Event Pills */}
                  <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                    {dayEvents.slice(0, 4).map((e) => (
                      <div 
                        key={e.id}
                        onClick={() => router.push(`/dashboard/events/${e.id}`)}
                        className={`px-2 py-1.5 rounded-md text-xs font-bold border truncate flex justify-between cursor-pointer hover:brightness-125 transition-all ${getPillColor(e.event_type)}`}
                        title={e.title}
                      >
                        <span className="truncate pr-2">{e.title}</span>
                        <span className="opacity-70 whitespace-nowrap hidden lg:block">
                          {new Date(e.event_date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                        </span>
                      </div>
                    ))}
                    
                    {/* Overflow Indicator */}
                    {dayEvents.length > 4 && (
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1 mt-1 cursor-pointer hover:text-white transition-colors">
                        + {dayEvents.length - 4} more
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}