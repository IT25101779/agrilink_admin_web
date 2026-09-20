import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const MARKETS = ["Dambulla", "Manning", "Pettah", "Kandy", "Jaffna", "Meegoda"];
const DEFAULT_CROPS = ["Tomato", "Beans (Bush)", "Carrot", "Cabbage", "Brinjal (Eggplant)", "Pumpkin", "Cucumber", "Okra (Bandakka)", "Bitter Gourd", "Onion (Big/Red)", "Chili", "Banana"];

/** The admin enters today's wholesale prices. Publishing also fires farmers' price alerts and "market shock" notices. */
export default function PricesTab() {
  const session = auth.getSession();
  const [market, setMarket] = useState("Dambulla");
  const [inputs, setInputs] = useState({});
  const [extra, setExtra] = useState("");
  const [crops, setCrops] = useState(DEFAULT_CROPS);
  const [board, setBoard] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const loadBoard = useCallback(async () => {
    const result = await api.getPriceBoard(session.token, market);
    if (result.success) setBoard(result.data);
  }, [market, session.token]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  async function publish() {
    const prices = crops.filter((c) => Number(inputs[c]) > 0).map((c) => ({ cropType: c, pricePerKg: Number(inputs[c]) }));
    if (prices.length === 0) return setMessage({ ok: false, text: "Enter at least one price." });
    setBusy(true);
    const result = await api.publishPrices(session.token, market, prices);
    setBusy(false);
    if (result.success) {
      setMessage({ ok: true, text: `Published ${result.saved} prices for ${market}. ${result.alertsTriggered} farmer price alerts fired and ${result.shockReminders} market-shock notices were sent.` });
      setInputs({});
      loadBoard();
    } else {
      setMessage({ ok: false, text: result.message || "Could not publish." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {MARKETS.map((m) => (
            <button key={m} onClick={() => setMarket(m)} className={`text-sm px-4 py-1.5 rounded-full border ${market === m ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-ink-700"}`}>{m}</button>
          ))}
        </div>
        <p className="text-sm text-ink-400 mb-4">Enter today's wholesale price (LKR per kg) for {market}. Leave a crop empty to skip it. Publishing again on the same day replaces that day's price.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {crops.map((c) => (
            <label key={c} className="text-sm text-ink-700">
              {c}
              <input type="number" min="0" value={inputs[c] || ""} onChange={(e) => setInputs({ ...inputs, [c]: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="LKR/kg" />
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Add another crop (exact name, e.g. Ginger)" className="flex-1 px-3 py-2 rounded-lg border border-slate-200" />
          <button onClick={() => { if (extra.trim() && !crops.includes(extra.trim())) setCrops([...crops, extra.trim()]); setExtra(""); }} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">Add</button>
        </div>
        {message && <p className={`mt-4 text-sm ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>}
        <button onClick={publish} disabled={busy} className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg disabled:opacity-50">{busy ? "Publishing…" : `Publish ${market} prices`}</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900 mb-3">Currently published — {market}</h3>
        {board.length === 0 ? <p className="text-sm text-ink-400">Nothing published for this market yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink-400"><th className="py-2">Crop</th><th>Price</th><th>Change</th><th>Farmers saw</th><th>Date</th></tr></thead>
            <tbody>
              {board.map((r) => (
                <tr key={r.cropType} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{r.cropType}</td>
                  <td>LKR {r.pricePerKg}</td>
                  <td className={r.changePercent > 0 ? "text-emerald-700" : r.changePercent < 0 ? "text-red-600" : ""}>{r.changePercent == null ? "—" : `${r.changePercent > 0 ? "+" : ""}${r.changePercent}%`}</td>
                  <td>{r.communityMedian ? `LKR ${r.communityMedian} (${r.communityReports})` : "—"}</td>
                  <td>{r.day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
