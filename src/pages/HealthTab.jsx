import { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const Card = ({ title, children }) => <div className="bg-white rounded-2xl border border-slate-100 p-5"><h3 className="font-display text-lg font-semibold mb-3">{title}</h3>{children}</div>;
const Stat = ({ label, value, warn }) => <div className={`rounded-xl p-3 ${warn ? "bg-rose-50" : "bg-slate-50"}`}><div className="text-2xl font-bold">{value}</div><div className="text-xs text-ink-700">{label}</div></div>;

export default function HealthTab() {
  const token = auth.getSession().token;
  const [sys, setSys] = useState(null);
  const [imp, setImp] = useState(null);
  const [ref, setRef] = useState(null);
  useEffect(() => {
    api.call(token, "GET", "/admin/system").then((r) => r.success && setSys(r.data));
    api.call(token, "GET", "/admin/impact/districts").then((r) => r.success && setImp(r));
    api.call(token, "GET", "/admin/referrals").then((r) => r.success && setRef(r));
  }, [token]);
  const max = imp ? Math.max(...imp.data.map((d) => d.farmers), 1) : 1;
  return (
    <div className="space-y-6">
      {sys && (
        <Card title="System health">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Database" value={sys.database} warn={sys.database !== "connected"} />
            <Stat label="Server errors, last 24 h" value={sys.errors24h} warn={sys.errors24h > 0} />
            <Stat label="Slow requests, last 24 h" value={sys.slow24h} />
            <Stat label="Open disputes" value={sys.needsAttention.openDisputes} warn={sys.needsAttention.openDisputes > 0} />
            <Stat label="Open user reports" value={sys.needsAttention.openReports} warn={sys.needsAttention.openReports > 0} />
            <Stat label="New feedback" value={sys.needsAttention.newFeedback} />
            <Stat label="ID checks waiting" value={sys.needsAttention.pendingVerifications} warn={sys.needsAttention.pendingVerifications > 0} />
            <Stat label={`SMS sent this month${sys.sms.gatewayConfigured ? "" : " (no gateway set)"}`} value={sys.sms.sentThisMonth} />
          </div>
          <p className="text-xs text-ink-400 mt-3">Push notifications: {sys.pushConfigured ? "on" : "off (Firebase key not set)"} · Users: {Object.entries(sys.users).map(([k, v]) => `${k} ${v}`).join(", ")}</p>
          {sys.recent.length > 0 && <div className="mt-3 text-xs font-mono bg-slate-50 rounded-lg p-3 space-y-1">{sys.recent.map((e, i) => <div key={i}>{new Date(e.at).toLocaleString()} · {e.kind} · {e.method} {e.path} → {e.status} ({e.ms} ms) {e.message}</div>)}</div>}
        </Card>
      )}
      {imp && (
        <Card title="Impact by district (real counts)">
          <p className="text-sm text-ink-700 mb-3">{imp.total.farmers} farmers · {imp.total.paidOrders} paid sales · {Math.round(imp.total.soldKg).toLocaleString()} kg · LKR {Math.round(imp.total.soldLkr).toLocaleString()}</p>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs text-ink-400"><th>District</th><th>Farmers</th><th>Listings</th><th>Paid sales</th><th>kg sold</th><th>LKR sold</th><th>Truck bookings</th><th>Wildlife 7d</th><th>Open Qs</th></tr></thead><tbody>{imp.data.map((d) => <tr key={d.district} className="border-t"><td className="py-1.5 font-medium">{d.district}</td><td><div className="flex items-center gap-2"><div className="h-2 rounded bg-emerald-500" style={{ width: `${(d.farmers / max) * 60}px` }} />{d.farmers}</div></td><td>{d.activeListings}</td><td>{d.paidOrders}</td><td>{Math.round(d.soldKg).toLocaleString()}</td><td>{Math.round(d.soldLkr).toLocaleString()}</td><td>{d.confirmedTruckBookings}</td><td>{d.wildlifeReports7d}</td><td>{d.openQuestions}</td></tr>)}</tbody></table></div>
        </Card>
      )}
      {ref && (
        <Card title={`Referrals (${ref.totalReferred} people brought in)`}>
          {ref.data.length === 0 ? <p className="text-ink-400">No referrals yet. Give village helpers and field agents their invitation code from Profile → Settings.</p> : <table className="w-full text-sm"><thead><tr className="text-left text-xs text-ink-400"><th>Person</th><th>District</th><th>Code</th><th>Brought in</th><th>Farmers</th></tr></thead><tbody>{ref.data.map((r) => <tr key={r.code} className="border-t"><td className="py-1.5">{r.name}</td><td>{r.district || "—"}</td><td className="font-mono">{r.code}</td><td>{r.total}</td><td>{r.farmers}</td></tr>)}</tbody></table>}
        </Card>
      )}
    </div>
  );
}
