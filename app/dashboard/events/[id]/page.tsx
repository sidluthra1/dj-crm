"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, MapPin, User, Clock, Package, DollarSign, Edit, Trash2, 
  Mail, Phone, Globe, Navigation, Users, FileText, Download, Music, 
  ShieldCheck, MessageSquare, Info, UserPlus, FileSignature, CreditCard, X, Plus, Minus, Loader2
} from "lucide-react";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // GEAR MODAL STATE
  const [isGearModalOpen, setIsGearModalOpen] = useState(false);
  const [fullInventory, setFullInventory] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [isSavingGear, setIsSavingGear] = useState(false);

  // Abstracted fetch so we can call it again after saving gear
  const fetchEventDetails = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_equipment (
          inventory_id,
          quantity_allocated,
          inventory (
            id,
            name,
            category,
            rental_price,
            quantity
          )
        )
      `)
      .eq('id', id)
      .single();

    if (data) setEvent(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, supabase]);

  // --- GEAR ASSIGNMENT LOGIC ---
  const openGearModal = async () => {
    setIsGearModalOpen(true);
    
    // 1. Fetch the entire inventory catalogue
    const { data } = await supabase.from('inventory').select('*').order('category');
    if (data) setFullInventory(data);

    // 2. Pre-fill the modal with the gear already assigned to this event
    const currentAllocs: Record<string, number> = {};
    event.event_equipment?.forEach((eq: any) => {
      currentAllocs[eq.inventory_id] = eq.quantity_allocated;
    });
    setAllocations(currentAllocs);
  };

  const updateAllocation = (inventoryId: string, delta: number, maxQty: number) => {
    setAllocations(prev => {
      const currentQty = prev[inventoryId] || 0;
      let newQty = currentQty + delta;
      
      // Keep boundaries between 0 and the max amount owned
      if (newQty < 0) newQty = 0;
      if (newQty > maxQty) newQty = maxQty;
      
      return { ...prev, [inventoryId]: newQty };
    });
  };

  const saveGearPackList = async () => {
    setIsSavingGear(true);

    // 1. Wipe the current pack list for this event
    await supabase.from('event_equipment').delete().eq('event_id', id);

    // 2. Build the new list of inserts based on what > 0 in the modal
    const inserts = Object.entries(allocations)
      .filter(([invId, qty]) => qty > 0)
      .map(([invId, qty]) => ({
        event_id: id,
        inventory_id: invId,
        quantity_allocated: qty
      }));

    // 3. Save to database
    if (inserts.length > 0) {
      const { error } = await supabase.from('event_equipment').insert(inserts);
      if (error) console.error("Error saving gear:", error);
    }

    // 4. Close modal and refresh the background page data
    setIsGearModalOpen(false);
    setIsSavingGear(false);
    fetchEventDetails();
  };

  if (isLoading || !event) return <div className="p-20 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest">Loading Event Profile...</div>;

  // Group the full inventory by category for the modal
  const groupedInventory = fullInventory.reduce((acc, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
        <ArrowLeft size={16} /> Back to Events
      </button>

      {/* HEADER: High-Level Overview */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">{event.status}</span>
            <span className="bg-white/10 text-gray-300 border border-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">{event.event_type || "Private Event"}</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
             <span className="flex items-center gap-2"><Clock size={16} className="text-purple-400"/> {new Date(event.event_date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 py-3.5 px-6 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-all"><Edit size={18} /> Edit Profile</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN 1: Logistics, Financials & Venue (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock size={16}/> Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-gray-400 text-sm font-bold">Setup Time</span>
                <span className="text-white font-black">{event.setup_time ? new Date(event.setup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-gray-400 text-sm font-bold">Event Start</span>
                <span className="text-yellow-400 font-black">{new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-bold">Event End</span>
                <span className="text-white font-black">{event.event_end_time ? new Date(event.event_end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><CreditCard size={16}/> Financials</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-gray-400 text-sm font-bold">Total Invoice</span>
                <span className="text-white font-black text-lg">${event.pay || "0.00"}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-gray-400 text-sm font-bold">Deposit Paid</span>
                <span className="text-green-400 font-black">${event.deposit_amount || "0.00"}</span>
              </div>
              <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-gray-400 text-sm font-bold">Balance Due</span>
                <span className="text-yellow-400 font-black text-xl">
                  ${event.balance_due !== null ? event.balance_due : (event.pay - (event.deposit_amount || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={16}/> Venue & Travel</h3>
            <div className="space-y-5">
              <div>
                <p className="text-white font-bold">{event.venue_name || event.location}</p>
                <p className="text-gray-400 text-sm">{event.venue_address || "Address not provided"}</p>
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
              <div className="space-y-2 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-400 flex items-center gap-2"><User size={14}/> {event.venue_contact_email || "No contact listed"}</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><Phone size={14}/> {event.venue_contact_phone || "No phone listed"}</p>
                <p className="text-xs text-purple-400 flex items-center gap-2"><Globe size={14}/> {event.venue_website || "No website listed"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={16}/> Client Info</h3>
            <div className="space-y-3">
              <p className="text-white font-bold text-lg">{event.client_name}</p>
              <p className="text-sm text-gray-400 flex items-center gap-2"><Mail size={16}/> {event.client_email || "Pending"}</p>
              <p className="text-sm text-gray-400 flex items-center gap-2"><Phone size={16}/> {event.client_phone || "Pending"}</p>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Details, Staff & Notes (Span 4) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
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

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><UserPlus size={16}/> Crew / Staff</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-full">
                Manage Staff
              </button>
            </div>
            
            <div className="space-y-3">
              {event.assigned_staff?.length > 0 ? (
                event.assigned_staff.map((staff: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                    <div className="size-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-black text-xs border border-purple-500/30">
                      {staff.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-white">{staff}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No Crew Assigned</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare size={16}/> Client / Guest Notes</h3>
                <p className="text-sm text-purple-300/80 italic leading-relaxed bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                  "{event.client_notes || "No special requests from the client at this time."}"
                </p>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={16}/> Internal Notes</h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                  {event.internal_notes || "No internal operational notes."}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 3: Documents & Gear (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Event Files</h3>
            <div className="space-y-3">
              <DocButton label="Master Planning Doc" isAvailable={!!event.planning_doc_url} icon={<FileSignature size={16}/>} color="text-yellow-400" />
              <DocButton label="Contract Agreement" isAvailable={!!event.contract_url} />
              <DocButton label="Event Invoice" isAvailable={!!event.invoice_url} />
              <DocButton label="Event Timeline" isAvailable={!!event.timeline_url} />
              <DocButton label="Music Request List" isAvailable={!!event.music_list_url} icon={<Music size={16}/>} color="text-pink-400" />
            </div>
          </div>

          {/* PACK LIST DISPLAY */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Package size={16}/> Gear Pack List</h3>
              
              {/* TRIGGER THE MODAL */}
              <button 
                onClick={openGearModal}
                className="text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white transition-colors border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-full"
              >
                Modify Gear
              </button>
            </div>

            <div className="space-y-3">
              {event.event_equipment?.length > 0 ? (
                event.event_equipment.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                    <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-black">
                      {item.quantity_allocated}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-white truncate">{item.inventory?.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{item.inventory?.category}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-black/20 rounded-xl border border-white/5 border-dashed">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No Gear Routed</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- GEAR ASSIGNMENT MODAL OVERLAY --- */}
      {isGearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 w-full max-w-3xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,1)]">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-2xl font-black text-white">Route Equipment</h2>
                <p className="text-sm text-gray-400 mt-1">Assign gear from your inventory to {event.title}</p>
              </div>
              <button onClick={() => setIsGearModalOpen(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body: Scrollable Inventory List */}
            <div className="overflow-y-auto p-8 flex-1 space-y-8 custom-scrollbar">
              {(Object.entries(groupedInventory) as [string, any[]][]).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] border-b border-white/5 pb-2">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item: any) => {
                      const qtyAssigned = allocations[item.id] || 0;
                      const isAssigned = qtyAssigned > 0;

                      return (
                        <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isAssigned ? 'bg-purple-900/20 border-purple-500/30' : 'bg-black/40 border-white/5'}`}>
                          <div className="overflow-hidden pr-2">
                            <p className={`font-bold text-sm truncate ${isAssigned ? 'text-white' : 'text-gray-300'}`}>{item.name}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Owned: {item.quantity}</p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 shrink-0 bg-black/50 p-1.5 rounded-xl border border-white/5">
                            <button 
                              onClick={() => updateAllocation(item.id, -1, item.quantity)}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className={`w-4 text-center text-sm font-black ${isAssigned ? 'text-purple-400' : 'text-gray-500'}`}>
                              {qtyAssigned}
                            </span>
                            <button 
                              onClick={() => updateAllocation(item.id, 1, item.quantity)}
                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <p className="text-sm font-bold text-gray-400">
                Total Items Routed: <span className="text-white">{Object.values(allocations).reduce((a, b) => a + b, 0)}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsGearModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={saveGearPackList}
                  disabled={isSavingGear}
                  className="px-6 py-3 rounded-full text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  {isSavingGear ? <Loader2 className="animate-spin" size={16} /> : <Package size={16} />}
                  {isSavingGear ? "Saving Pack List..." : "Save Pack List"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function DocButton({ label, isAvailable, icon = <FileText size={16}/>, color = "text-blue-400" }: any) {
  return (
    <button 
      disabled={!isAvailable}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
        isAvailable 
        ? 'bg-black/40 border-white/10 hover:bg-white/10 cursor-pointer' 
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