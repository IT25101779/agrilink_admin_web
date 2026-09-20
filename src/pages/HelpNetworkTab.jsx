import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const KINDS = ["agrarian_service_centre", "extension_officer", "cooperative", "research_station", "government_office", "other"];
const DISTRICTS = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
const Card = ({ children }) => <div className="bg-white rounded-2xl border border-slate-100 p-5">{children}</div>;
const inp = "border border-slate-200 rounded-lg px-3 py-1.5 text-sm";

function Offices({ token }) {
  const [district, setDistrict] = useState("Kandy");
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ name: "", kind: KINDS[0], phone: "", address: "", hours: "" });
  const load = useCallback(() => api.call(token, "GET", `/help/offices?district=${district}`).then((r) => r.success && setRows(r.data)), [token, district]);
  useEffect(() => { load(); }, [load]);
  const add = async () => { const r = await api.call(token, "POST", "/admin/offices", { ...f, district }); if (!r.success) return alert(r.message); setF({ name: "", kind: KINDS[0], phone: "", address: "", hours: "" }); load(); };
  const edit = async (o) => { const phone = window.prompt("Phone number", o.phone); if (phone === null) return; await api.call(token, "PATCH", `/admin/offices/${o.id}`, { phone, isSample: false }); load(); };
  const del = async (o) => { if (window.confirm(`Delete ${o.name}?`)) { await api.call(token, "DELETE", `/admin/offices/${o.id}`); load(); } };
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold mb-3">Agriculture offices & contacts</h3>
      <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 mb-3">Rows marked “sample” are placeholders. Replace them with verified contact details before farmers rely on them.</p>
      <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inp}>{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        <input className={inp} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className={inp} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
        <input className={inp} placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className={inp} placeholder="Opening hours" value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} />
        <input className={`${inp} sm:col-span-2`} placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      </div>
      <button onClick={add} className="mt-3 bg-indigo-600 text-white rounded-lg px-4 py-1.5 text-sm">Add to {district}</button>
      <div className="mt-4 divide-y">{rows.map((o) => <div key={o.id} className="py-2 flex flex-wrap items-center gap-2"><div className="flex-1"><b>{o.name}</b> <span className="text-xs text-ink-400">{o.kind}{o.isSample ? " · SAMPLE" : ""}</span><div className="text-sm text-ink-700">{o.phone || "no phone"} · {o.address} · {o.hours}</div></div><button onClick={() => edit(o)} className="text-sm text-indigo-600">Edit phone</button><button onClick={() => del(o)} className="text-sm text-rose-600">Delete</button></div>)}{rows.length === 0 && <p className="py-2 text-ink-400">Nothing listed for {district}.</p>}</div>
    </Card>
  );
}

function Officers({ token }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState([]);
  const search = async () => { const r = await api.call(token, "GET", `/admin/users/search?q=${encodeURIComponent(q)}`); if (r.success) setFound(r.data); else alert(r.message); };
  const make = async (u) => { const districts = window.prompt("Districts this officer covers (comma separated)", u.district || ""); if (!districts) return; const title = window.prompt("Title (e.g. Agriculture Instructor)", "") || ""; const r = await api.call(token, "POST", `/admin/users/${u.id}/officer`, { districts: districts.split(",").map((x) => x.trim()), title }); alert(r.success ? `Done: ${r.role}${r.districts ? " for " + r.districts.join(", ") : ""}. They must log in again.` : r.message); search(); };
  const remove = async (u) => { if (window.confirm(`Make ${u.name} a normal farmer again?`)) { await api.call(token, "POST", `/admin/users/${u.id}/officer`, { districts: [] }); search(); } };
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold mb-1">Agriculture officers</h3>
      <p className="text-sm text-ink-700 mb-3">Officers answer farmers' questions and see disease reports for their districts. Only you can create them — the person registers normally first, then you promote them here.</p>
      <div className="flex gap-2"><input className={`${inp} flex-1`} placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} /><button onClick={search} className="border border-slate-200 rounded-lg px-4 text-sm">Search</button></div>
      <div className="mt-3 divide-y">{found.map((u) => <div key={u.id} className="py-2 flex items-center gap-2"><div className="flex-1"><b>{u.name}</b> <span className="text-xs text-ink-400">{u.email} · {u.role}{u.officerDistricts.length ? ` · ${u.officerDistricts.join(", ")}` : ""}</span></div>{u.role === "officer" ? <button onClick={() => remove(u)} className="text-sm text-rose-600">Remove officer role</button> : u.role !== "admin" && <button onClick={() => make(u)} className="text-sm text-indigo-600">Make officer</button>}</div>)}</div>
    </Card>
  );
}

function SupportPrices({ token }) {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ cropType: "Rice", label: "", pricePerKg: "", source: "" });
  const load = useCallback(() => api.call(token, "GET", "/records/support-prices").then((r) => r.success && setRows(r.data)), [token]);
  useEffect(() => { load(); }, [load]);
  const add = async () => { const r = await api.call(token, "POST", "/admin/support-prices", { ...f, pricePerKg: Number(f.pricePerKg) }); if (!r.success) return alert(r.message); setF({ ...f, pricePerKg: "", label: "" }); load(); };
  const del = async (id) => { await api.call(token, "DELETE", `/admin/support-prices/${id}`); load(); };
  return (
    <Card>
      <h3 className="font-display text-lg font-semibold mb-1">Government guaranteed prices</h3>
      <p className="text-sm text-ink-700 mb-3">Type the figure from the official notice and name the source. Farmers see the latest per crop in the Price board.</p>
      <div className="grid sm:grid-cols-4 gap-2"><input className={inp} placeholder="Crop (English name)" value={f.cropType} onChange={(e) => setF({ ...f, cropType: e.target.value })} /><input className={inp} placeholder="Label (e.g. Samba, dry)" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /><input className={inp} placeholder="LKR per kg" value={f.pricePerKg} onChange={(e) => setF({ ...f, pricePerKg: e.target.value })} /><input className={inp} placeholder="Source (notice / date)" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></div>
      <button onClick={add} className="mt-3 bg-indigo-600 text-white rounded-lg px-4 py-1.5 text-sm">Publish</button>
      <div className="mt-4 divide-y">{rows.map((p) => <div key={p.id} className="py-2 flex items-center gap-2"><div className="flex-1"><b>{p.cropType}</b> {p.label} — LKR {p.pricePerKg}/kg <span className="text-xs text-ink-400">{p.source}</span></div><button onClick={() => del(p.id)} className="text-sm text-rose-600">Remove</button></div>)}</div>
    </Card>
  );
}

export default function HelpNetworkTab() {
  const token = auth.getSession().token;
  return <div className="space-y-6"><Offices token={token} /><Officers token={token} /><SupportPrices token={token} /></div>;
}
