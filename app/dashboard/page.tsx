// app/dashboard/page.tsx
import { Calendar, FileText, CreditCard, Users } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back to the booth.</h2>
        <p className="text-gray-400">Here is what's happening with your business today.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Upcoming Gigs" value="4" icon={<Calendar className="text-purple-400" />} />
        <StatCard title="Pending Contracts" value="2" icon={<FileText className="text-blue-400" />} />
        <StatCard title="Unpaid Invoices" value="$1,250" icon={<CreditCard className="text-green-400" />} />
        <StatCard title="Total Clients" value="28" icon={<Users className="text-pink-400" />} />
      </div>

      {/* Recent Activity / Next Event Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Next Event Widget */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-purple-400 size-5" /> Next Performance
          </h3>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold">Downtown Club Residency</h4>
              <p className="text-sm text-gray-400 mt-1">Saturday, Oct 28 • 10:00 PM - 2:00 AM</p>
            </div>
            <span className="px-4 py-2 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest rounded-full border border-green-500/30 w-max">
              Confirmed
            </span>
          </div>
        </div>

        {/* Action Items Widget */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6">Action Needed</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm">
              <div className="size-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <p className="text-gray-300">Sign <span className="text-white font-bold">Wedding Contract</span> for Sarah & John.</p>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <div className="size-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
              <p className="text-gray-300">Send invoice for <span className="text-white font-bold">Corporate Holiday Party</span>.</p>
            </li>
          </ul>
        </div>
        
      </div>
    </div>
  );
}

// Helper component for the stat cards
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-black mb-1">{value}</h4>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}