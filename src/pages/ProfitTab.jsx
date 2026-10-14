import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5">
    <h3 className="font-display text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);
const Stat = ({ label, value }) => (
  <div className="rounded-xl p-3 bg-slate-50">
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-ink-700">{label}</div>
  </div>
);
const inp = "border border-slate-200 rounded-lg px-3 py-1.5 text-sm";
const lkr = (n) => `LKR ${Math.round(n || 0).toLocaleString()}`;

/**
 * "from admin site the developers should be able to see all profit" —
 * both revenue lines in one place: the 5% deal commission (GET
 * /api/admin/profit) and the data-as-a-service licensing revenue (GET/POST
 * /api/admin/data-partners). A small bar-style sparkline for the daily
 * commission series, no chart library needed.
 */
export default function ProfitTab() {
  const token = auth.getSession().token;
  const [profit, setProfit] = useState(null);
  const [partners, setPartners] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [form, setForm] = useState({ orgName: "", contactEmail: "", contactPhone: "", monthlyFeeLkr: "" });

  const loadProfit = useCallback(() => {
    api.call(token, "GET", "/admin/profit").then((r) => r.success && setProfit(r.data));
  }, [token]);
  const loadPartners = useCallback(() => {
    api.call(token, "GET", "/admin/data-partners").then((r) => r.success && setPartners(r));
  }, [token]);

  useEffect(() => {
    loadProfit();
    loadPartners();
  }, [loadProfit, loadPartners]);

  async function createPartner() {
    if (!form.orgName.trim()) return alert("Organization name is required.");
    const r = await api.call(token, "POST", "/admin/data-partners", {
      ...form,
      monthlyFeeLkr: Number(form.monthlyFeeLkr) || 0,
    });
    if (!r.success) return alert(r.message);
    setNewKey(r.data); // show the full API key once — the list below only shows it truncated
    setForm({ orgName: "", contactEmail: "", contactPhone: "", monthlyFeeLkr: "" });
    loadPartners();
  }

  async function revokePartner(id) {
    if (!confirm("Revoke this partner's API key? They will stop being able to call the partner-insights endpoints immediately.")) return;
    const r = await api.call(token, "PATCH", `/admin/data-partners/${id}/revoke`);
    if (!r.success) return alert(r.message);
    loadPartners();
  }

  const maxDaily = profit && profit.dailySeries.length ? Math.max(...profit.dailySeries.map((d) => d.commissionLkr), 1) : 1;

  return (
    <div className="space-y-6">
      {profit && (
        <Card title="Platform commission (5% per deal, flat Rs. 20 fee under Rs. 1000)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <Stat label="Total commission earned" value={lkr(profit.totalCommissionLkr)} />
            <Stat label="Total deal value processed" value={lkr(profit.totalDealValueLkr)} />
            <Stat label="Completed deals" value={profit.dealCount} />
          </div>

          <h4 className="text-sm font-semibold text-ink-700 mb-2">By source</h4>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-400">
                  <th>Source</th>
                  <th>Deals</th>
                  <th>Deal value</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(profit.bySource).map(([source, s]) => (
                  <tr key={source} className="border-t">
                    <td className="py-1.5 font-medium">{source.replace(/_/g, " ")}</td>
                    <td>{s.count}</td>
                    <td>{lkr(s.dealValueLkr)}</td>
                    <td>{lkr(s.commissionLkr)}</td>
                  </tr>
                ))}
                {Object.keys(profit.bySource).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-ink-400">
                      No completed deals yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {profit.dailySeries.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-ink-700 mb-2">Daily commission (last {profit.dailySeries.length} days with activity)</h4>
              <div className="flex items-end gap-1 h-24">
                {profit.dailySeries.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end group relative" title={`${d.day}: ${lkr(d.commissionLkr)}`}>
                    <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${Math.max(4, (d.commissionLkr / maxDaily) * 90)}px` }} />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      <Card title="Data-as-a-service partners (second revenue line, billed offline)">
        {partners && (
          <p className="text-sm text-ink-700 mb-3">
            {partners.data.length} partner(s) · <span className="font-semibold">{lkr(partners.monthlyRecurringRevenueLkr)}/month</span> from active partners (invoiced manually — no online payment)
          </p>
        )}

        {newKey && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
            <p className="font-semibold mb-1">Partner created — copy this API key now, it won't be shown in full again:</p>
            <code className="block bg-white rounded px-2 py-1 break-all">{newKey.apiKey}</code>
            <p className="text-xs text-ink-700 mt-2">Give it to {newKey.orgName} to use as the <code>X-Api-Key</code> header against <code>/api/partner-insights/*</code>.</p>
            <button onClick={() => setNewKey(null)} className="text-xs text-indigo-600 mt-2">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <input className={inp} placeholder="Organization name" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} />
          <input className={inp} placeholder="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <input className={inp} placeholder="Contact phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          <input className={inp} placeholder="Monthly fee (LKR)" type="number" value={form.monthlyFeeLkr} onChange={(e) => setForm({ ...form, monthlyFeeLkr: e.target.value })} />
          <button onClick={createPartner} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">
            Create partner + API key
          </button>
        </div>

        <div className="divide-y">
          {partners?.data.map((p) => (
            <div key={p._id} className="py-2 flex flex-wrap items-center gap-2">
              <div className="flex-1">
                <b>{p.orgName}</b> <span className="text-xs text-ink-400">{p.isActive ? "active" : "REVOKED"}</span>
                <div className="text-sm text-ink-700">
                  {p.contactEmail || "no email"} · {lkr(p.monthlyFeeLkr)}/month · key ends {p.apiKey.slice(-6)}
                  {p.lastUsedAt ? ` · last used ${new Date(p.lastUsedAt).toLocaleDateString()}` : " · never used yet"}
                </div>
              </div>
              {p.isActive && (
                <button onClick={() => revokePartner(p._id)} className="text-sm text-rose-600">
                  Revoke
                </button>
              )}
            </div>
          ))}
          {partners?.data.length === 0 && <p className="py-2 text-ink-400">No data partners yet.</p>}
        </div>
      </Card>
    </div>
  );
}
