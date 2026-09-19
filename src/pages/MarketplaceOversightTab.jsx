import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { api } from "../services/api.js";
import { SkeletonRow } from "../components/Skeleton.jsx";

export default function MarketplaceOversightTab() {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await api.getAllListings();
      setListings(result.success ? result.data : []);
      setIsLoading(false);
    })();
  }, []);

  const filtered = listings.filter((l) => {
    if (tierFilter !== "all" && l.tier !== tierFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold">All Marketplace Transactions</h3>
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-ink-400" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-100"
          >
            <option value="all">All tiers</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-100"
          >
            <option value="all">All statuses</option>
            <option value="listed">Listed</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
            <option value="redirected">Redirected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-400 py-10 text-center">No transactions match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Crop</th>
                <th className="pb-2 font-medium">Farmer</th>
                <th className="pb-2 font-medium">Qty (kg)</th>
                <th className="pb-2 font-medium">Price/kg</th>
                <th className="pb-2 font-medium">Tier</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Rejections</th>
                <th className="pb-2 font-medium">Listed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-2.5 font-medium">{l.cropType}</td>
                  <td className="py-2.5 text-ink-400">{l.farmer?.fullName || "—"}</td>
                  <td className="py-2.5 font-mono">{l.quantityKg}</td>
                  <td className="py-2.5 font-mono">
                    LKR {l.currentPricePerKg}
                    {l.markdownPercentApplied > 0 && (
                      <span className="text-amber-500 text-xs ml-1">(-{l.markdownPercentApplied}%)</span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        l.tier === "secondary" ? "bg-amber-50 text-amber-500" : "bg-forest-50 text-forest-500"
                      }`}
                    >
                      {l.tier}
                    </span>
                  </td>
                  <td className="py-2.5 capitalize">{l.status}</td>
                  <td className="py-2.5">{l.rejectionHistory?.length || 0}</td>
                  <td className="py-2.5 text-ink-400">{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
