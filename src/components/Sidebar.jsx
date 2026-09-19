import { motion } from "framer-motion";
import { LayoutDashboard, Receipt, Megaphone, LogOut, Sprout, Store, Handshake } from "lucide-react";
import { auth } from "../services/auth.js";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "marketplace", label: "Marketplace Oversight", icon: Receipt },
  { id: "suppliers", label: "Supplier Directory", icon: Store },
  { id: "community", label: "Rentals & Seeds", icon: Handshake },
  { id: "ads", label: "Ad Scheduler", icon: Megaphone },
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  const session = auth.getSession();

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Sprout size={18} className="text-indigo-400" />
          </div>
          <h1 className="font-display text-xl font-semibold">AgriLink AI</h1>
        </div>
        <p className="text-xs text-indigo-400 mt-2 tracking-wide uppercase pl-0.5">Command Center</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 bg-indigo-500 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={17} className={`relative z-10 ${isActive ? "text-white" : "text-slate-100/60"}`} />
              <span className={`relative z-10 font-medium text-sm ${isActive ? "text-white" : "text-slate-100/60"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium truncate">{session?.user?.fullName}</p>
          <p className="text-xs text-slate-100/40 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg border border-slate-800 text-slate-100/70 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </aside>
  );
}
