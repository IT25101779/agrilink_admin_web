import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const SUBS = [["disputes", "Disputes"], ["reports", "User reports"], ["verify", "ID verification"], ["feedback", "Feedback"]];
const Card = ({ children }) => <div className="bg-white rounded-2xl border border-slate-100 p-5">{children}</div>;
const Pill = ({ children, tone = "slate" }) => <span className={`text-xs px-2 py-0.5 rounded-full bg-${tone}-100 text-${tone}-700`}>{children}</span>;

function Disputes({ token }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("open");
  const [text, setText] = useState({});
  const load = useCallback(() => api.call(token, "GET", `/admin/disputes?status=${status}`).then((r) => r.success && setRows(r.data)), [token, status]);
  useEffect(() => { load(); }, [load]);
  const resolve = async (id, outcome) => { const resolution = window.prompt("Note for both sides (what was decided):", ""); if (resolution === null) return; await api.call(token, "POST", `/admin/disputes/${id}/resolve`, { outcome, resolution }); load(); };
  const say = async (id) => { if (!text[id]) return; await api.call(token, "POST", `/admin/disputes/${id}/message`, { text: text[id] }); setText({ ...text, [id]: "" }); load(); };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">{["open", "resolved", "dismissed"].map((s) => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 rounded-lg text-sm border ${status === s ? "bg-indigo-600 text-white" : "bg-white border-slate-200"}`}>{s}</button>)}</div>
      {rows.length === 0 && <p className="text-ink-400">No {status} disputes.</p>}
      {rows.map((d) => (
        <Card key={d.id}>
          <div className="flex flex-wrap gap-2 items-center"><b>{d.order?.cropType}</b><span className="text-sm">{d.order?.quantityKg} kg · LKR {d.order?.totalLkr}</span><Pill tone="amber">{d.reason}</Pill><Pill>{d.order?.status}</Pill></div>
          <p className="text-sm text-ink-700 mt-1">Opened by <b>{d.openedBy?.fullName}</b> ({d.openedBy?.role}, {d.openedBy?.phone}) against <b>{d.against?.fullName}</b> ({d.against?.role}, {d.against?.phone})</p>
          <div className="mt-3 space-y-1">{d.messages.map((m, i) => <p key={i} className="text-sm"><b>{m.role}:</b> {m.text}</p>)}</div>
          {d.resolution && <p className="mt-2 text-sm bg-emerald-50 rounded p-2">Decision: {d.resolution}</p>}
          {d.status === "open" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <input value={text[d.id] || ""} onChange={(e) => setText({ ...text, [d.id]: e.target.value })} placeholder="Write to both sides…" className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
              <button onClick={() => say(d.id)} className="border border-slate-200 rounded-lg px-3 text-sm">Send</button>
              <button onClick={() => resolve(d.id, "resolved")} className="bg-emerald-600 text-white rounded-lg px-3 text-sm">Resolve</button>
              <button onClick={() => resolve(d.id, "dismissed")} className="bg-slate-600 text-white rounded-lg px-3 text-sm">Dismiss</button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Reports({ token }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(() => api.call(token, "GET", "/admin/reports").then((r) => r.success && setRows(r.data)), [token]);
  useEffect(() => { load(); }, [load]);
  const set = async (id, status) => { await api.call(token, "PATCH", `/admin/reports/${id}`, { status }); load(); };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-ink-400">No reports.</p>}
      {rows.map((r) => (
        <Card key={r.id}>
          <div className="flex flex-wrap gap-2 items-center"><b>{r.reported?.fullName}</b><span className="text-xs">({r.reported?.role}, {r.reported?.phone})</span><Pill tone="rose">{r.reason}</Pill><Pill>{r.status}</Pill>{r.reportsAgainstThisPerson > 1 && <Pill tone="amber">{r.reportsAgainstThisPerson} reports on this person</Pill>}</div>
          <p className="text-sm text-ink-700 mt-1">Reported by {r.reporter?.fullName} · {r.context}{r.note ? ` · “${r.note}”` : ""}</p>
          <div className="mt-2 flex gap-2">{["open", "reviewed", "actioned"].map((s) => <button key={s} onClick={() => set(r.id, s)} className={`px-3 py-1 rounded-lg text-xs border ${r.status === s ? "bg-indigo-600 text-white" : "border-slate-200"}`}>{s}</button>)}</div>
        </Card>
      ))}
    </div>
  );
}

function Verify({ token }) {
  const [rows, setRows] = useState([]);
  const [img, setImg] = useState({});
  const load = useCallback(() => api.call(token, "GET", "/admin/verifications?status=pending").then((r) => r.success && setRows(r.data)), [token]);
  useEffect(() => { load(); }, [load]);
  const show = async (row) => setImg({ ...img, [row.userId]: await api.photoBlobUrl(token, row.photoId) });
  const decide = async (row, decision) => { const note = decision === "rejected" ? window.prompt("Why? (the person will see this)", "Photo too blurry") || "" : ""; await api.call(token, "POST", `/admin/verifications/${row.userId}`, { decision, note }); load(); };
  return (
    <div className="space-y-3">
      <p className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">ID photos are sensitive. Open one only to decide; it is deleted automatically the moment you approve or reject.</p>
      {rows.length === 0 && <p className="text-ink-400">Nothing waiting.</p>}
      {rows.map((v) => (
        <Card key={v.userId}>
          <b>{v.name}</b> <span className="text-sm text-ink-700">({v.role}{v.district ? `, ${v.district}` : ""}{v.company ? `, ${v.company}` : ""}) · {v.phone} · {v.docType}</span>
          <div className="mt-2">{img[v.userId] ? <img src={img[v.userId]} alt="document" className="max-h-72 rounded-lg border" /> : <button onClick={() => show(v)} className="border border-slate-200 rounded-lg px-3 py-1 text-sm">Open document photo</button>}</div>
          <div className="mt-3 flex gap-2"><button onClick={() => decide(v, "verified")} className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm">Approve</button><button onClick={() => decide(v, "rejected")} className="bg-rose-600 text-white rounded-lg px-4 py-1.5 text-sm">Reject</button></div>
        </Card>
      ))}
    </div>
  );
}

function Feedback({ token }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(() => api.call(token, "GET", "/admin/feedback").then((r) => r.success && setRows(r.data)), [token]);
  useEffect(() => { load(); }, [load]);
  const set = async (id, status) => { await api.call(token, "PATCH", `/admin/feedback/${id}`, { status }); load(); };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-ink-400">No feedback yet.</p>}
      {rows.map((f) => (
        <Card key={f.id}>
          <div className="flex flex-wrap gap-2 items-center"><Pill tone={f.kind === "bug" ? "rose" : f.kind === "praise" ? "emerald" : "indigo"}>{f.kind}</Pill><Pill>{f.status}</Pill><span className="text-xs text-ink-400">{f.user?.name} {f.user?.district ? `· ${f.user.district}` : ""} · {f.screen || "—"} · v{f.appVersion || "?"} · {new Date(f.createdAt).toLocaleString()}</span></div>
          <p className="mt-2 text-sm">{f.message}</p>
          <div className="mt-2 flex gap-2">{["new", "seen", "done"].map((s) => <button key={s} onClick={() => set(f.id, s)} className={`px-3 py-1 rounded-lg text-xs border ${f.status === s ? "bg-indigo-600 text-white" : "border-slate-200"}`}>{s}</button>)}</div>
        </Card>
      ))}
    </div>
  );
}

export default function SafetyTab() {
  const token = auth.getSession().token;
  const [sub, setSub] = useState("disputes");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">{SUBS.map(([id, label]) => <button key={id} onClick={() => setSub(id)} className={`px-4 py-2 rounded-xl text-sm font-medium ${sub === id ? "bg-slate-900 text-white" : "bg-white border border-slate-200"}`}>{label}</button>)}</div>
      {sub === "disputes" && <Disputes token={token} />}
      {sub === "reports" && <Reports token={token} />}
      {sub === "verify" && <Verify token={token} />}
      {sub === "feedback" && <Feedback token={token} />}
    </div>
  );
}
