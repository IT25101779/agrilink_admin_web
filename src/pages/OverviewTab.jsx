import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, Building2, Sprout, Bug, Wallet, Megaphone, Truck, Tag } from "lucide-react";
import MetricCard from "../components/MetricCard.jsx";
import { staggerContainer, fadeSlideUp } from "../motion/variants.js";

const TIER_COLORS = { primary: "#0B5D3B", secondary: "#C2811B" };
const STATUS_COLORS = ["#4F46E5", "#0B5D3B", "#C2811B", "#94A3B8", "#EF4444"];

export default function OverviewTab({ metrics }) {
  if (!metrics) return null;

  const tierData = Object.entries(metrics.listingsByTier || {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(metrics.listingsByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={fadeSlideUp}><MetricCard label="Registered Farmers" value={metrics.users.farmers} accent="forest" icon={Sprout} /></motion.div>
        <motion.div variants={fadeSlideUp}><MetricCard label="Registered Buyers" value={metrics.users.buyers} accent="indigo" icon={Building2} /></motion.div>
        <motion.div variants={fadeSlideUp}>
          <MetricCard label="Active Timelines" value={metrics.timelines.active} accent="forest" subtext={`${metrics.timelines.completed} completed`} icon={Sprout} />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <MetricCard
            label="Active Outbreak Clusters"
            value={metrics.disease.activeOutbreakClusters}
            accent={metrics.disease.activeOutbreakClusters > 0 ? "amber" : "slate"}
            subtext={`${metrics.disease.totalLogs} total disease scans`}
            icon={Bug}
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}>
          <MetricCard
            label="Gross Marketplace Value"
            value={`LKR ${Number(metrics.marketplace.totalSoldValueLkr).toLocaleString()}`}
            accent="forest"
            subtext="Sold listings"
            icon={Wallet}
          />
        </motion.div>
        <motion.div variants={fadeSlideUp}><MetricCard label="Active Advertisements" value={metrics.activeAdsCount} accent="indigo" icon={Megaphone} /></motion.div>
        <motion.div variants={fadeSlideUp}><MetricCard label="Registered Drivers" value={metrics.users.drivers} accent="slate" icon={Truck} /></motion.div>
        <motion.div variants={fadeSlideUp}>
          <MetricCard
            label="Secondary Market Share"
            value={`${
              tierData.length
                ? Math.round(((tierData.find((t) => t.name === "secondary")?.value || 0) / tierData.reduce((s, t) => s + t.value, 0)) * 100)
                : 0
            }%`}
            accent="amber"
            subtext="Of all listings"
            icon={Tag}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Listings by Tier</h3>
          {tierData.length === 0 ? (
            <p className="text-sm text-ink-400">No listings yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {tierData.map((entry) => (
                    <Cell key={entry.name} fill={TIER_COLORS[entry.name] || "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Listings by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-ink-400">No listings yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EE" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-ink-400" />
          <h3 className="font-display text-lg font-semibold">Recent Listings</h3>
        </div>
        {metrics.recentListings.length === 0 ? (
          <p className="text-sm text-ink-400">No listings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Crop</th>
                <th className="pb-2 font-medium">Farmer</th>
                <th className="pb-2 font-medium">Tier</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Price/kg</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recentListings.map((l) => (
                <tr key={l._id} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium">{l.cropType}</td>
                  <td className="py-2.5 text-ink-400">{l.farmer?.fullName || "—"}</td>
                  <td className="py-2.5 capitalize">{l.tier}</td>
                  <td className="py-2.5 capitalize">{l.status}</td>
                  <td className="py-2.5 font-mono text-right">LKR {l.currentPricePerKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
