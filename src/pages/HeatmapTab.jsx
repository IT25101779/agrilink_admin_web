import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

// Cell colour: red = crowded, amber = getting busy, green = room. The stronger
// the colour, the larger that crop's share of the district's plantings.
function cellStyle(cell) {
  if (!cell) return { backgroundColor: "transparent" };
  const rgb = cell.level === "high" ? "239,68,68" : cell.level === "medium" ? "194,129,27" : "11,93,59";
  const alpha = Math.min(0.14 + (cell.sharePercent / 100) * 1.1, 0.95);
  return { backgroundColor: `rgba(${rgb},${alpha})`, color: alpha > 0.55 ? "#fff" : "#1F2A24" };
}

export default function HeatmapTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await api.getMarketHeatmap(auth.getSession().token);
      if (result.success) setData(result.data);
      else setError(result.message || "Could not load the heatmap.");
    })();
  }, []);

  if (error) return <p className="text-sm text-red-600 py-20 text-center">{error}</p>;
  if (!data) return <p className="text-sm text-ink-400 py-20 text-center">Loading market heatmap…</p>;

  const columns = data.topCrops.map((c) => c.cropType);

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-400 bg-white border border-slate-100 rounded-lg px-4 py-2.5">
        Which crops are being grown where, right now, from farmers' active crop timelines. This is the same data farmers see in their
        Oversupply Guard, for the whole country. Only counts are shown — no names.
      </p>

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-amber-500" />
          <h3 className="font-display text-lg font-semibold">Oversupply hotspots</h3>
        </div>
        {data.hotspots.length === 0 ? (
          <p className="text-sm text-ink-400">No crowded crops right now.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.hotspots.map((h) => (
              <span key={`${h.district}-${h.cropType}`} className="text-xs font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-full">
                {h.cropType} · {h.district} — {h.farmers} farmers ({Math.round(h.sharePercent)}%)
              </span>
            ))}
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-lg font-semibold">Crops by district (number of farmers growing)</h3>
          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(239,68,68,0.8)" }} /> Crowded</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(194,129,27,0.7)" }} /> Busy</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: "rgba(11,93,59,0.35)" }} /> Room</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left font-medium text-ink-400 px-2 py-1">District</th>
                {columns.map((crop) => (
                  <th key={crop} className="font-medium text-ink-400 px-1 py-1 text-xs align-bottom" style={{ minWidth: 72 }}>
                    {crop}
                  </th>
                ))}
                <th className="font-medium text-ink-400 px-2 py-1 text-xs">Crops in ground</th>
              </tr>
            </thead>
            <tbody>
              {data.districts.map((d) => (
                <tr key={d.district}>
                  <td className="px-2 py-1.5 font-medium whitespace-nowrap">
                    {d.district}
                    {!d.enoughData && <span className="block text-[10px] font-normal text-ink-400">limited data</span>}
                  </td>
                  {columns.map((crop) => {
                    const cell = d.crops.find((c) => c.cropType === crop);
                    return (
                      <td
                        key={crop}
                        title={cell ? `${d.district} — ${crop}: ${cell.farmers} farmers, ${cell.plantings} plantings, ${cell.acres} acres (${cell.sharePercent}% of district)` : `${d.district} — ${crop}: none`}
                        className="text-center rounded-md font-mono text-xs py-2"
                        style={cellStyle(cell)}
                      >
                        {cell ? cell.farmers : ""}
                      </td>
                    );
                  })}
                  <td className="text-center font-mono text-xs text-ink-400">{d.totalPlantings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-400 mt-3">Districts with fewer than 5 active crops are marked “limited data” and never shown as crowded.</p>
      </motion.div>

      {data.demand.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="font-display text-lg font-semibold mb-1">Open buyer demand</h3>
          <p className="text-xs text-ink-400 mb-3">Volume buyers are still asking for on the Demand Board — good crops to steer farmers toward.</p>
          <div className="flex flex-wrap gap-2">
            {data.demand.map((d) => (
              <span key={d.cropType} className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full">
                {d.cropType} — {d.kgNeeded.toLocaleString()} kg needed
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
