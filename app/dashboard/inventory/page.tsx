"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Package, 
  Plus, 
  Search,
  ChevronDown,
  ChevronUp,
  Folder,
  MoreVertical,
  Calendar as CalendarIcon,
  DollarSign
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  available_quantity: number;
  repair_quantity: number;
  rental_price: number;
  event_equipment: {
    events: {
      event_date: string;
      setup_time: string | null;
      event_end_time: string | null;
    }
  }[];
}

export default function InventoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventory() {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          event_equipment (
            events (
              event_date,
              setup_time,
              event_end_time
            )
          )
        `)
        .order('category', { ascending: true });

      if (data) {
        setInventoryItems(data);
        const categories = [...new Set(data.map(item => item.category))];
        const initialOpenState = categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
        setOpenCategories(initialOpenState);
      }
      setIsLoading(false);
    }
    fetchInventory();

    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [supabase]);

  const groupedInventory = inventoryItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // LOGIC: Find the closest upcoming date from the events array
  const getNextUseDate = (item: InventoryItem) => {
    if (!item.event_equipment || item.event_equipment.length === 0) return null;

    const now = new Date();
    const upcomingDates = item.event_equipment
      .map(ee => new Date(ee.events.event_date))
      .filter(date => date > now)
      .sort((a, b) => a.getTime() - b.getTime());

    return upcomingDates.length > 0 ? upcomingDates[0].toISOString() : null;
  };

  // LOGIC: Calculate real-time "In Warehouse" quantity vs "Total"
  const getRealTimeWarehouseQty = (item: InventoryItem) => {
    const now = new Date();
    const currentDeployed = item.event_equipment?.reduce((sum, ee) => {
      const start = ee.events.setup_time ? new Date(ee.events.setup_time) : new Date(ee.events.event_date);
      const end = ee.events.event_end_time ? new Date(ee.events.event_end_time) : new Date(ee.events.event_date);
      return (now >= start && now <= end) ? sum + 1 : sum; // Assuming 1 per event for the main list summary
    }, 0) || 0;

    return item.quantity - item.repair_quantity - currentDeployed;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not Scheduled";
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Equipment Inventory</h2>
          <p className="text-gray-400">Track your gear, location, and rental rates.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input 
              type="text" 
              placeholder="Search gear..." 
              className="pl-11 pr-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-purple-500 transition-colors w-64 text-white"
            />
          </div>
          <button 
            onClick={() => router.push('/dashboard/inventory/new')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading equipment database...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInventory).map(([category, items]) => {
            const hasOpenMenu = items.some(item => item.id === openMenuId);

            return (
              <div 
                key={category} 
                className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all relative ${hasOpenMenu ? 'z-50' : 'z-10'}`}
              >
                <button 
                  onClick={() => toggleCategory(category)} 
                  className={`w-full flex items-center justify-between p-6 hover:bg-white/10 transition-colors ${openCategories[category] ? 'rounded-t-2xl' : 'rounded-2xl'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300">
                      <Folder size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{category}</h3>
                    <span className="bg-black/40 border border-white/10 text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
                      {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  {openCategories[category] ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
                </button>

                {openCategories[category] && (
                  <div className="border-t border-white/10 bg-black/20 rounded-b-2xl">
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-3">Next Use</div>
                      <div className="col-span-2 text-center">Avail / Total</div>
                      <div className="col-span-2 text-right pr-10">Rent Price</div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {items.map((item, index) => {
                        const isLastItem = index === items.length - 1;
                        const nextUseDate = getNextUseDate(item);
                        const warehouseQty = getRealTimeWarehouseQty(item);

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 py-5 hover:bg-white/10 transition-colors group items-center cursor-pointer ${isLastItem ? 'rounded-b-2xl' : ''}`}
                          >
                            <div className="lg:col-span-5 font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                              {item.name}
                            </div>
                            
                            <div className="lg:col-span-3 flex items-center gap-2 text-xs text-gray-400">
                              <CalendarIcon className="size-3.5 text-purple-400 shrink-0" />
                              <span>{formatDate(nextUseDate)}</span>
                            </div>
                            
                            <div className="lg:col-span-2 flex justify-start lg:justify-center">
                              <span className="text-sm font-bold text-gray-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                                <span className="text-white">{warehouseQty}</span> / <span className="text-gray-500">{item.quantity}</span>
                              </span>
                            </div>
                            
                            <div className="lg:col-span-2 flex items-center justify-end gap-3">
                              <div className="flex items-center text-sm font-bold text-green-400">
                                <DollarSign className="size-4" />
                                {item.rental_price}
                              </div>
                              
                              <div className="relative">
                                <button 
                                  onClick={(e) => toggleMenu(e, item.id)} 
                                  className={`p-2 transition-colors rounded-lg shrink-0 ${openMenuId === item.id ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
                                >
                                  <MoreVertical size={18} />
                                </button>

                                {openMenuId === item.id && (
                                  <div 
                                    className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button className="w-full text-left px-5 py-3.5 text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5">
                                      Remove/Assign to Event
                                    </button>
                                    <button className="w-full text-left px-5 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                                      Delete Item
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}