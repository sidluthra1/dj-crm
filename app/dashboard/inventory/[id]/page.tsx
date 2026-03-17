"use client";

import { use, useEffect, useState } from "react"; 
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Edit, MapPin, User, Calendar, Trash2, PackageSearch, Wrench, AlertCircle, Clock, Truck, FileText
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available_quantity: number;
  repair_quantity: number; 
  rental_price: number;
  current_location: string;
  owner: string;
  notes: string;
  event_equipment: {
    quantity_allocated: number;
    events: {
      title: string;
      event_date: string; 
      setup_time: string | null; 
      event_end_time: string | null; 
    }
  }[];
}

export default function InventoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          event_equipment (
            quantity_allocated,
            events (
              title,
              event_date,
              setup_time,
              event_end_time
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) console.error("Error fetching item:", error.message);
      else if (data) setItem(data);
      setIsLoading(false);
    }
    fetchItem();
  }, [id, supabase]);

  if (isLoading || !item) return <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading...</div>;

  // --- TIME-BASED CALCULATIONS ---
  const now = new Date();

  const activeDeployments = item.event_equipment?.filter(assignment => {
    const eventStart = new Date(assignment.events.event_date);
    const setupStart = assignment.events.setup_time ? new Date(assignment.events.setup_time) : eventStart;
    const end = assignment.events.event_end_time ? new Date(assignment.events.event_end_time) : eventStart;
    return now >= setupStart && now <= end;
  }) || [];

  const futureBookings = item.event_equipment?.filter(assignment => {
    const eventStart = new Date(assignment.events.event_date);
    const setupStart = assignment.events.setup_time ? new Date(assignment.events.setup_time) : eventStart;
    return setupStart > now;
  }) || [];

  const currentDeployedCount = activeDeployments.reduce((sum, a) => sum + a.quantity_allocated, 0);
  const trueAvailableAtWarehouse = item.quantity - item.repair_quantity - currentDeployedCount;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      {/* Header Profile Section */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">{item.category}</span>
          <h1 className="text-5xl font-black text-white mb-2">{item.name}</h1>
          <div className="flex items-center gap-4">
             <p className="text-2xl text-green-400 font-black">${item.rental_price} <span className="text-sm font-bold text-gray-500 uppercase tracking-tighter">/ day</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 py-3.5 px-6 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all"><Calendar size={18} /> Remove/Assign to Event</button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 py-3.5 px-6 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all"><Edit size={18} /> Edit Info</button>
          <button className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 py-3.5 px-6 rounded-full text-sm font-bold hover:bg-red-500/20 transition-all"><Trash2 size={18} /> Delete</button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Owned" value={item.quantity} color="text-white" />
        <StatCard label="Warehouse" value={trueAvailableAtWarehouse} color="text-green-400" />
        <StatCard label="At Event / Setup" value={currentDeployedCount} color="text-yellow-400" />
        <StatCard label="In Repair" value={item.repair_quantity} color="text-red-400" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Distribution & Logistics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Live Status Card */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><MapPin className="text-purple-400" size={20}/> Live Distribution</h3>
            <div className="space-y-4">
              <DistributionRow icon={<MapPin className="text-blue-400" />} label="Main Warehouse" sublabel={item.current_location} qty={trueAvailableAtWarehouse} />
              
              {activeDeployments.map((a, i) => {
                  const isSetup = now < new Date(a.events.event_date);
                  return (
                    <DistributionRow 
                      key={i} 
                      icon={isSetup ? <Truck className="text-orange-400" /> : <Calendar className="text-yellow-400" />} 
                      label={a.events.title} 
                      sublabel={isSetup ? "Load-in / Setup Phase" : "Event Live"} 
                      qty={a.quantity_allocated} 
                      isYellow={!isSetup}
                      isOrange={isSetup}
                    />
                  );
              })}

              {item.repair_quantity > 0 && (
                <DistributionRow icon={<Wrench className="text-red-400" />} label="Maintenance Bench" sublabel="Technical Repair" qty={item.repair_quantity} isRed />
              )}
            </div>
          </div>

          {/* Logistics Table (Owner/Notes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><User className="text-pink-400" size={18}/> Ownership</h3>
                <p className="text-sm text-gray-400">Assigned Owner:</p>
                <p className="text-xl font-bold text-white mt-1">{item.owner}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><FileText className="text-blue-400" size={18}/> Internal Notes</h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                    {item.notes || "No internal notes provided for this unit."}
                </p>
            </div>
          </div>
        </div>

{/* Right Column: Future Timeline */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Clock className="text-purple-400" size={20}/> Upcoming Reservations
          </h3>
          <div className="space-y-4">
            {futureBookings.length > 0 ? futureBookings.map((a, i) => (
              <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                <p className="text-base font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {a.events.title}
                </p>
                
                <div className="space-y-2 text-xs font-medium">
                  {/* Setup Time */}
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-2"><Truck size={14} className="text-orange-400"/> Setup</span>
                    <span className="text-white">
                      {new Date(a.events.setup_time || a.events.event_date).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {/* Start Time */}
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-yellow-400"/> Event Start</span>
                    <span className="text-white">
                      {new Date(a.events.event_date).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {/* End Time */}
                  <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-blue-400"/> Return / End</span>
                    <span className="text-white">
                      {a.events.event_end_time 
                        ? new Date(a.events.event_end_time).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})
                        : "No End Set"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 font-mono">Reserved Qty</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-black text-white">{a.quantity_allocated}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                  <p className="text-sm text-gray-500 italic">No future reservations found.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center backdrop-blur-sm">
      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function DistributionRow({ icon, label, sublabel, qty, isYellow, isOrange, isRed }: any) {
  let bgColor = "bg-white/5 border-white/5";
  if (isYellow) bgColor = "bg-yellow-500/10 border-yellow-500/20";
  if (isOrange) bgColor = "bg-orange-500/10 border-orange-500/20";
  if (isRed) bgColor = "bg-red-500/10 border-red-500/20";

  return (
    <div className={`flex items-center justify-between p-5 rounded-2xl border ${bgColor} transition-all`}>
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="shrink-0">{icon}</div>
        <div className="overflow-hidden">
          <p className={`text-sm font-bold truncate ${isYellow ? 'text-yellow-400' : isOrange ? 'text-orange-400' : isRed ? 'text-red-400' : 'text-white'}`}>{label}</p>
          <p className="text-xs text-gray-500 truncate">{sublabel}</p>
        </div>
      </div>
      <span className={`text-xl font-black shrink-0 ml-4 ${isYellow ? 'text-yellow-400' : isOrange ? 'text-orange-400' : isRed ? 'text-red-400' : 'text-white'}`}>{qty}</span>
    </div>
  );
}