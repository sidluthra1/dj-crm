"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { createClient } from "@/utils/supabase/client"; // Added Supabase client
import { 
  Music, 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronUp,
  Wrench,
  Star
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // THE LOGOUT FUNCTION 🚪
  const handleLogout = async () => {
    // 1. Tell Supabase to destroy the session
    await supabase.auth.signOut();
    
    // 2. Send them back to the login page
    router.push("/login");
    
    // 3. Force Next.js to refresh so the middleware kicks in immediately
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Music className="text-purple-400 size-6" />
            <span className="text-xl font-light tracking-[0.2em] uppercase">NEXORA</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink 
            href="/dashboard" 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={pathname === "/dashboard"} 
          />
          
          {/* Events Dropdown Menu */}
          <div>
            <button 
              onClick={() => setIsEventsOpen(!isEventsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                pathname.includes("/dashboard/events") 
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} />
                Events
              </div>
              {isEventsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isEventsOpen && (
              <div className="flex flex-col gap-2 mt-2 pl-11 pr-4">
                <Link 
                  href="/dashboard/events/upcoming" 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    pathname === "/dashboard/events/upcoming" ? "text-purple-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Upcoming Events
                </Link>
                <Link 
                  href="/dashboard/events/previous" 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    pathname === "/dashboard/events/previous" ? "text-purple-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Previous Events
                </Link>
              </div>
            )}
          </div>

          {/* Tools Dropdown Menu */}
          <div>
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                pathname.includes("/dashboard/tools") 
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench size={20} />
                Tools
              </div>
              {isToolsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isToolsOpen && (
              <div className="flex flex-col gap-2 mt-2 pl-11 pr-4">
                <Link 
                  href="/dashboard/tools/duplicate-remover" 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    pathname === "/dashboard/tools/duplicate-remover" ? "text-purple-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Duplicate Remover
                </Link>
                <Link 
                  href="/dashboard/tools/missing-files" 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    pathname === "/dashboard/tools/missing-files" ? "text-purple-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Missing File Finder
                </Link>
                <Link 
                  href="/dashboard/tools/spotify" 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    pathname === "/dashboard/tools/spotify" ? "text-purple-400" : "text-gray-500 hover:text-white"
                  }`}
                >
                  Spotify Downloader
                </Link>

                <div className="pt-3 mt-1 border-t border-white/10">
                  <Link 
                    href="/dashboard/tools/upgrade" 
                    className="flex items-center gap-2 text-[11px] font-black text-pink-400 hover:text-pink-300 transition-colors uppercase tracking-widest"
                  >
                    <Star size={12} className="fill-current" />
                    Premium Upgrade
                  </Link>
                </div>
              </div>
            )}
          </div>

          <SidebarLink 
            href="/dashboard/inventory" 
            icon={<Package size={20} />} 
            label="Inventory" 
            active={pathname === "/dashboard/inventory"} 
          />
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2 shrink-0">
          <SidebarLink 
            href="/dashboard/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={pathname === "/dashboard/settings"}
          />
          {/* LOGOUT BUTTON WITH onClick HANDLER */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-purple-600 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              DJ
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active 
          ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}