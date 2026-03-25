"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar, FileText, CreditCard, Users, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardOverview() {
  const supabase = createClient();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingGigs: 0,
    pendingContracts: 0,
    unpaidInvoices: 0,
    totalClients: 0,
  });
  
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [actionItems, setActionItems] = useState<{ id: string, type: string, message: string, eventId: string }[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch all events to calculate global stats
      const { data: allEvents, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error || !allEvents) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
        return;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      // 1. Calculate Quick Stats
      const upcoming = allEvents.filter(e => new Date(e.event_date) >= now);
      const pendingCount = allEvents.filter(e => e.status === 'Contract Pending').length;
      
      // Sum up all balance_due fields
      const totalUnpaid = allEvents.reduce((sum, e) => sum + (Number(e.balance_due) || 0), 0);
      
      // Get unique clients by throwing them into a Set
      const uniqueClients = new Set(allEvents.map(e => e.client_name).filter(Boolean));

      setStats({
        upcomingGigs: upcoming.length,
        pendingContracts: pendingCount,
        unpaidInvoices: totalUnpaid,
        totalClients: uniqueClients.size,
      });

      // 2. Set the "Next Performance" (first item in the upcoming array)
      if (upcoming.length > 0) {
        setNextEvent(upcoming[0]);
      }

      // 3. Generate Action Items dynamically
      const actions: { id: string, type: string, message: string, eventId: string }[] = [];
      
      allEvents.forEach(e => {
        // Look for pending contracts
        if (e.status === 'Contract Pending') {
          actions.push({
            id: `contract-${e.id}`,
            type: 'contract',
            message: `Send/Sign contract for ${e.client_name}`,
            eventId: e.id
          });
        }
        // Look for upcoming events that still owe money
        if (Number(e.balance_due) > 0 && new Date(e.event_date) >= now) {
          actions.push({
            id: `payment-${e.id}`,
            type: 'payment',
            message: `Collect $${e.balance_due.toFixed(2)} balance for ${e.title}`,
            eventId: e.id
          });
        }
      });

      // Limit to top 5 actions so it doesn't break the UI layout
      setActionItems(actions.slice(0, 5));
      setIsLoading(false);
    }

    fetchDashboardData();
  }, [supabase]);

  if (isLoading) {
    return <div className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest">Compiling Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold mb-2 text-white">Welcome back to the booth.</h2>
        <p className="text-gray-400">Here is what's happening with your business today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Upcoming Gigs" value={stats.upcomingGigs.toString()} icon={<Calendar className="text-purple-400" />} />
        <StatCard title="Pending Contracts" value={stats.pendingContracts.toString()} icon={<FileText className="text-blue-400" />} />
        <StatCard title="Unpaid Invoices" value={`$${stats.unpaidInvoices.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<CreditCard className="text-green-400" />} />
        <StatCard title="Total Clients" value={stats.totalClients.toString()} icon={<Users className="text-pink-400" />} />
      </div>

      {/* Recent Activity / Next Event Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Next Event Widget */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="text-purple-400 size-5" /> Next Performance
          </h3>
          
          {nextEvent ? (
            <div 
              onClick={() => router.push(`/dashboard/events/${nextEvent.id}`)}
              className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-white/5 transition-colors group flex-1"
            >
              <div>
                <h4 className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">{nextEvent.title}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm font-bold text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={14} className="text-purple-400"/> {new Date(nextEvent.event_date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <span>{new Date(nextEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full border w-max
                  ${nextEvent.status === 'Confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}
                `}>
                  {nextEvent.status}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Details →</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/20 border border-white/5 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center flex-1">
              <Calendar className="size-10 text-gray-600 mb-3" />
              <p className="text-gray-400 font-bold">No upcoming performances scheduled.</p>
            </div>
          )}
        </div>

        {/* Action Items Widget */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="text-orange-400 size-5" /> Action Needed
          </h3>
          
          {actionItems.length > 0 ? (
            <ul className="space-y-4">
              {actionItems.map((action) => (
                <li 
                  key={action.id} 
                  onClick={() => router.push(`/dashboard/events/${action.eventId}`)}
                  className="flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className={`size-2.5 rounded-full mt-1.5 shrink-0 ${action.type === 'payment' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                    {action.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
               <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                 <Clock className="text-green-400 size-6" />
               </div>
               <p className="text-sm font-bold text-gray-400">You're all caught up!</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

// Helper component for the stat cards
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm hover:bg-white/10 transition-colors group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-4xl font-black text-white mb-1 tracking-tight">{value}</h4>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
}