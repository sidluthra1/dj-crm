// app/dashboard/layout.tsx
import Link from "next/link";
import { 
  Music, 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  CreditCard, 
  Package, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Music className="text-purple-400 size-6" />
            <span className="text-xl font-light tracking-[0.2em] uppercase">NEXORA</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
          <SidebarLink href="/dashboard/calendar" icon={<Calendar size={20} />} label="Calendar" />
          <SidebarLink href="/dashboard/contracts" icon={<FileText size={20} />} label="Contracts" />
          <SidebarLink href="/dashboard/invoices" icon={<CreditCard size={20} />} label="Invoices" />
          <SidebarLink href="/dashboard/inventory" icon={<Package size={20} />} label="Inventory" />
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-purple-600 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              DJ
            </div>
          </div>
        </header>

        {/* Dynamic Page Content (This is where page.tsx gets injected) */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper component for cleaner code
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