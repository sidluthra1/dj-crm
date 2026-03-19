"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Package, DollarSign, MapPin, FileText, 
  Save, Loader2, User, Layers
} from "lucide-react";

export default function NewInventoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // NEW: State to hold the logged-in user's ID
  const [userId, setUserId] = useState<string | null>(null);

  // NEW: Fetch the user when the page loads
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, [supabase]);

  const [formData, setFormData] = useState({
    name: "",
    category: "Audio",
    quantity: "1",
    rental_price: "0.00",
    current_location: "Main Warehouse",
    owner: "Company",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "category" && e.target.value === "ADD_NEW") {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: "" }); 
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // NEW: Stop the submission if they aren't logged in
    if (!userId) return alert("You must be logged in to add inventory.");
    
    setIsSubmitting(true);

    const qty = parseInt(formData.quantity) || 1;
    const price = parseFloat(formData.rental_price) || 0;

    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        user_id: userId, // NEW: Attach the user ID to the row!
        name: formData.name,
        category: formData.category,
        quantity: qty,
        available_quantity: qty, 
        repair_quantity: 0,
        rental_price: price,
        current_location: formData.current_location,
        owner: formData.owner,
        notes: formData.notes
      }])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error("Error creating inventory item:", error);
      alert(`Error: ${error.message}`);
    } else {
      router.push(`/dashboard/inventory/${data.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} /> Cancel & Go Back
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Add New Equipment</h1>
        <p className="text-gray-400">Log a new piece of gear into your main warehouse inventory.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="text-purple-400"/> Core Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Item Name / Model *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., QSC K12.2 Active Speaker" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            
            {/* DYNAMIC CATEGORY LOGIC */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Category</label>
                {isCustomCategory && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsCustomCategory(false);
                      setFormData({...formData, category: "Audio"}); 
                    }}
                    className="text-[10px] text-purple-400 hover:text-white font-bold uppercase tracking-widest transition-colors"
                  >
                    Cancel / Use List
                  </button>
                )}
              </div>

              {isCustomCategory ? (
                <input 
                  required 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  placeholder="Type new category..." 
                  className="w-full bg-black/40 border border-purple-500/50 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                />
              ) : (
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer">
                  <option value="Audio">Audio</option>
                  <option value="Lighting">Lighting</option>
                  <option value="DJ Gear">DJ Gear</option>
                  <option value="Cables & Power">Cables & Power</option>
                  <option value="Rigging & Stands">Rigging & Stands</option>
                  <option value="Misc / Consumables">Misc / Consumables</option>
                  <option disabled>──────────</option>
                  <option value="ADD_NEW" className="text-purple-400 font-bold">+ Add New Category</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={14}/> Daily Rental Rate ($)</label>
              <input type="number" step="0.01" name="rental_price" value={formData.rental_price} onChange={handleChange} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Logistics & Ownership */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin className="text-blue-400"/> Logistics & Ownership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Quantity Owned *</label>
              <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Default Storage Location</label>
              <input type="text" name="current_location" value={formData.current_location} onChange={handleChange} placeholder="e.g., Main Warehouse - Shelf B" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={14}/> Asset Owner</label>
              <input type="text" name="owner" value={formData.owner} onChange={handleChange} placeholder="e.g., Company, DJ Smith" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="text-pink-400"/> Operational Notes</h2>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Notes & Maintenance Quirks</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="e.g., Requires firmware update before use, scratch on the left side..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none" />
          </div>
        </div>

        {/* Sticky Submit Footer */}
        <div className="sticky bottom-8 mt-10 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50">
          <p className="text-gray-400 text-sm hidden md:block">Newly added gear is immediately available for routing.</p>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" onClick={() => router.back()} className="px-6 py-4 rounded-full font-bold text-white bg-white/5 hover:bg-white/10 transition-colors flex-1 md:flex-none">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-4 rounded-full font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSubmitting ? "Saving..." : "Add to Inventory"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}