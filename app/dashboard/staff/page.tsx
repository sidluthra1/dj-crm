"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  UserPlus, Mail, Phone, MapPin, Calendar, 
  FileText, Briefcase, X, Loader2, Music, ShieldCheck
} from "lucide-react";

interface StaffMember {
  id: string;
  stage_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  birthday: string | null;
  contract_url: string | null;
  role: string;
  status: string;
}

export default function StaffPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    stage_name: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    birthday: "",
    role: "DJ",
    contract_url: ""
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('full_name', { ascending: true });

    if (data) setStaff(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Authentication error. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('staff').insert([{
      user_id: user.id,
      stage_name: formData.stage_name || null,
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      birthday: formData.birthday || null,
      role: formData.role,
      contract_url: formData.contract_url || null,
      status: 'Active'
    }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error adding staff:", error);
      alert(error.message);
    } else {
      // Reset form, close modal, and refresh data
      setFormData({
        stage_name: "", full_name: "", email: "", phone: "", 
        address: "", birthday: "", role: "DJ", contract_url: ""
      });
      setIsModalOpen(false);
      fetchStaff();
    }
  };

  // Helper for role badge colors
  const getRoleColor = (role: string) => {
    switch(role) {
      case 'DJ': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'MC': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'Roadie': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Coordinator': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Team & Roster</h1>
          <p className="text-gray-400">Manage your DJs, MCs, and event crew.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          <UserPlus size={18} /> Add Staff
        </button>
      </div>

      {/* STAFF GRID */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-bold animate-pulse uppercase tracking-[0.3em]">Loading Crew...</div>
      ) : staff.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center">
          <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <UserPlus className="size-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No team members yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8">Build out your roster by adding DJs, MCs, and roadies to easily assign them to upcoming events.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-purple-400 font-bold hover:text-white transition-colors">
            + Add your first team member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-colors group">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-inner">
                    {member.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {member.stage_name || member.full_name}
                    </h3>
                    {member.stage_name && (
                      <p className="text-xs text-gray-400 font-bold">{member.full_name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${getRoleColor(member.role)}`}>
                  {member.role}
                </span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${member.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                {member.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Phone className="size-4 text-gray-500" /> {member.phone}
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Mail className="size-4 text-gray-500" /> <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin className="size-4 text-gray-500" /> <span className="truncate">{member.address}</span>
                  </div>
                )}
                {member.birthday && (
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Calendar className="size-4 text-gray-500" /> 
                    {new Date(member.birthday).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                  </div>
                )}
                {member.contract_url && (
                  <div className="flex items-center gap-3 text-sm text-purple-400">
                    <FileText className="size-4" /> <a href={member.contract_url} target="_blank" rel="noreferrer" className="hover:underline font-bold">View Contract</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD STAFF MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,1)]">
            
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white">Add Team Member</h2>
                <p className="text-sm text-gray-400 mt-1">Add a new DJ, MC, or crew member to your roster.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Legal Name *</label>
                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Music size={14}/> Stage Name</label>
                    <input type="text" name="stage_name" value={formData.stage_name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="DJ Apollo" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={14}/> Primary Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer">
                      <option value="DJ">DJ</option>
                      <option value="MC">MC</option>
                      <option value="Roadie">Roadie / AV Tech</option>
                      <option value="Coordinator">Event Coordinator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Birthday</label>
                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors dark:[color-scheme:dark]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Home Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="123 Main St, City, ST 12345" />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14}/> Contract / W9 Document URL</label>
                  <input type="url" name="contract_url" value={formData.contract_url} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="https://drive.google.com/..." />
                  <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Link to their signed contractor agreement or W9.</p>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button 
                type="submit" 
                form="staff-form"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-full text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                {isSubmitting ? "Saving..." : "Save Team Member"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}