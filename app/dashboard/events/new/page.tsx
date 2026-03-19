"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Calendar, Clock, MapPin, User, DollarSign, 
  Info, Navigation, CreditCard, ShieldCheck, FileText, Save, Loader2,
  Globe, UserPlus, Package
} from "lucide-react";

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, [supabase]);

  const [formData, setFormData] = useState({
    title: "",
    event_type: "Private Event",
    status: "Confirmed",
    event_date: "", 
    setup_time: "", 
    event_end_time: "", 
    pay: "",
    deposit_amount: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    venue_name: "",
    venue_address: "",
    distance_to_venue: "",
    travel_time: "",
    venue_contact_email: "",
    venue_contact_phone: "",
    venue_website: "", // Now included in the UI
    guest_count: "",
    attire: "Standard",
    internal_notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Live Math Calculation for the UI
  const currentTotal = parseFloat(formData.pay) || 0;
  const currentDeposit = parseFloat(formData.deposit_amount) || 0;
  const currentBalance = currentTotal - currentDeposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("You must be logged in to create an event.");
    setIsSubmitting(true);

    const formatForDB = (dateString: string) => {
      if (!dateString) return null;
      return new Date(dateString).toISOString();
    };

    const { data, error } = await supabase
      .from('events')
      .insert([{
        user_id: userId,
        title: formData.title,
        event_type: formData.event_type,
        status: formData.status,
        event_date: formatForDB(formData.event_date),
        setup_time: formatForDB(formData.setup_time),
        event_end_time: formatForDB(formData.event_end_time),
        pay: currentTotal,
        deposit_amount: currentDeposit,
        balance_due: currentBalance,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        distance_to_venue: formData.distance_to_venue,
        travel_time: formData.travel_time,
        venue_contact_email: formData.venue_contact_email,
        venue_contact_phone: formData.venue_contact_phone,
        venue_website: formData.venue_website,
        guest_count: parseInt(formData.guest_count) || null,
        attire: formData.attire,
        internal_notes: formData.internal_notes
      }])
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error("Supabase Error Details:", error);
      alert(`Error: ${error.message}`);
    } else {
      router.push(`/dashboard/events/${data.id}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} /> Cancel & Go Back
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Draft New Event</h1>
        <p className="text-gray-400">Fill out the logistics to add a new booking to your pipeline.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Info className="text-purple-400"/> Core Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., UVA Spring Formal 2026" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Type</label>
              <select name="event_type" value={formData.event_type} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                <option>Private Event</option>
                <option>Wedding</option>
                <option>Club / Nightlife</option>
                <option>Corporate</option>
                <option>School / Greek</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                <option>Confirmed</option>
                <option>Contract Pending</option>
                <option>Invoice Sent</option>
                <option>Lead / Inquiry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline & Financials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="text-orange-400"/> Timeline</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Setup / Load-in</label>
              <input type="datetime-local" name="setup_time" value={formData.setup_time} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Start *</label>
              <input required type="datetime-local" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event End</label>
              <input type="datetime-local" name="event_end_time" value={formData.event_end_time} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]" />
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard className="text-green-400"/> Financials</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Invoice Amount ($)</label>
              <input type="number" step="0.01" name="pay" value={formData.pay} onChange={handleChange} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deposit Paid ($)</label>
              <input type="number" step="0.01" name="deposit_amount" value={formData.deposit_amount} onChange={handleChange} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div className="mt-auto bg-black/40 border border-white/5 p-5 rounded-xl flex justify-between items-center">
               <span className="text-sm font-bold text-gray-400">Calculated Balance Due:</span>
               <span className="text-2xl font-black text-yellow-400">${currentBalance.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Client & Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Client Details */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><User className="text-blue-400"/> Client Info</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Client / Organization Name *</label>
              <input required type="text" name="client_name" value={formData.client_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" name="client_email" value={formData.client_email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
              <input type="tel" name="client_phone" value={formData.client_phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          {/* Venue Details */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin className="text-red-400"/> Venue Info</h2>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Venue Name</label>
              <input type="text" name="venue_name" value={formData.venue_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Address</label>
              <input type="text" name="venue_address" value={formData.venue_address} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={14}/> Venue Website</label>
              <input type="url" name="venue_website" value={formData.venue_website} onChange={handleChange} placeholder="https://" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Travel Time</label>
                <input type="text" name="travel_time" value={formData.travel_time} onChange={handleChange} placeholder="e.g. 45 mins" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Distance</label>
                <input type="text" name="distance_to_venue" value={formData.distance_to_venue} onChange={handleChange} placeholder="e.g. 30 miles" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Staff & Equipment Placeholders (UI Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><UserPlus className="text-blue-400"/> Staff Assignment</h2>
            <p className="text-sm text-gray-400 mb-6">You will be able to assign staff members after creating the event.</p>
            <div className="flex gap-3 opacity-50 pointer-events-none">
              <select className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-500 appearance-none">
                <option>Select staff member...</option>
              </select>
              <button className="px-6 py-4 bg-white/5 rounded-xl border border-white/10 text-white font-bold">+</button>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Package className="text-purple-400"/> Equipment Routing</h2>
            <p className="text-sm text-gray-400 mb-6">You will be able to build your gear pack list after creating the event.</p>
            <div className="flex gap-3 opacity-50 pointer-events-none">
              <select className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-500 appearance-none">
                <option>Select gear from inventory...</option>
              </select>
              <button className="px-6 py-4 bg-white/5 rounded-xl border border-white/10 text-white font-bold">+</button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileText className="text-pink-400"/> Logistics & Internal Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Est. Guest Count</label>
              <input type="number" name="guest_count" value={formData.guest_count} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Attire</label>
              <input type="text" name="attire" value={formData.attire} onChange={handleChange} placeholder="e.g. Formal, Casual, All-Black" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Internal Logistics Notes</label>
            <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} rows={4} placeholder="Private notes for the team..." className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none" />
          </div>
        </div>

        {/* Sticky Submit Footer */}
        <div className="sticky bottom-8 mt-10 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50">
          <p className="text-gray-400 text-sm hidden md:block">Double check your timeline dates before saving.</p>
          <div className="flex gap-4 w-full md:w-auto">
            <button type="button" onClick={() => router.back()} className="px-6 py-4 rounded-full font-bold text-white bg-white/5 hover:bg-white/10 transition-colors flex-1 md:flex-none">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-4 rounded-full font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSubmitting ? "Saving..." : "Create Event"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}