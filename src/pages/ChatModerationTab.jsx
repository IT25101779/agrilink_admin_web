import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning, ShieldCheck, Trash2, Ban, Undo2, Image as ImageIcon, User } from "lucide-react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import MetricCard from "../components/MetricCard.jsx";

const REASON_LABELS = {
  abuse: "Abuse / bullying",
  spam: "Spam / selling",
  personal_info: "Personal information",
  unsafe_image: "Unsafe photo",
  other: "Something else",
};

function groupLabel(key) {
  if (key === "all") return "All farmers";
  if (key.startsWith("district:")) return `${key.slice(9)} farmers`;
  if (key.startsWith("crop:")) return `${key.slice(5)} growers`;
  if (key.startsWith("cropdist:")) return key.slice(9).replace("|", " · ");
  return key;
}

function ReportCard({ item, token, onChanged }) {
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const run = async (action, doneText) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result.success) {
      setNote(doneText);
      onChanged();
    } else {
      setNote(result.message || "Something went wrong.");
    }
  };

  const showPhoto = async () => setPhoto(await api.fetchChatMedia(token, item.mediaId));
  const banned = item.sender?.bannedUntil && new Date(item.sender.bannedUntil) > new Date();

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-ink-400">
            {groupLabel(item.groupKey)} · posted as <span className="font-semibold text-slate-700">{item.alias}</span> · {new Date(item.sentAt).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.reasons.map((r) => (
              <span key={r} className="text-[11px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{REASON_LABELS[r] || r}</span>
            ))}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.reports} report{item.reports === 1 ? "" : "s"}</span>
            {item.messageStatus === "hidden" && <span className="text-[11px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">auto-hidden</span>}
            {item.messageStatus === "removed" && <span className="text-[11px] font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">removed</span>}
          </div>
        </div>
        {item.sender && (
          <div className="text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 min-w-[210px]">
            <p className="flex items-center gap-1 font-semibold text-slate-700"><User size={12} /> {item.sender.name} <span className="ml-1 text-[10px] font-medium text-indigo-500">admin only</span></p>
            <p className="text-ink-400 mt-0.5">{item.sender.phone}</p>
            <p className="text-ink-400">{item.sender.email}</p>
            {banned && <p className="text-red-500 font-medium mt-1">Banned until {new Date(item.sender.bannedUntil).toLocaleDateString()}</p>}
          </div>
        )}
      </div>

      <div className="mt-3 bg-slate-50 rounded-lg p-3 text-sm text-slate-800 whitespace-pre-wrap break-words">
        {item.text || <span className="text-ink-400 italic">(no text — {item.type} message)</span>}
        {item.hasMedia && item.type === "image" && (
          <div className="mt-2">
            {photo ? <img src={photo} alt="reported" className="max-h-64 rounded-lg" /> : (
              <button onClick={showPhoto} className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:underline"><ImageIcon size={13} /> Show reported photo</button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <button disabled={busy || item.messageStatus === "removed"} onClick={() => run(() => api.removeChatMessage(token, item.messageId), "Message removed.")} className="flex items-center gap-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"><Trash2 size={13} /> Remove message</button>
        <button disabled={busy || item.messageStatus === "removed"} onClick={() => run(() => api.restoreChatMessage(token, item.messageId), "Kept — reports dismissed.")} className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 hover:bg-forest-600 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"><Undo2 size={13} /> Keep (false alarm)</button>
        {item.sender && !banned && [3, 30].map((days) => (
          <button key={days} disabled={busy} onClick={() => run(() => api.banChatUser(token, item.sender.id, days), `Sender banned for ${days} days.`)} className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 px-3 py-2 rounded-lg transition-colors"><Ban size={13} /> Ban {days} days</button>
        ))}
        {item.sender && banned && (
          <button disabled={busy} onClick={() => run(() => api.banChatUser(token, item.sender.id, 0, true), "Sender can chat again.")} className="text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg">Lift ban</button>
        )}
        {note && <span className="text-xs text-ink-400">{note}</span>}
      </div>
    </motion.div>
  );
}

export default function ChatModerationTab() {
  const token = auth.getSession().token;
  const [status, setStatus] = useState("open");
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([api.getChatStats(token), api.getChatReports(token, status)]);
    if (s.success) setStats(s.data);
    if (r.success) { setItems(r.data); setError(null); } else setError(r.message || "Could not load reports.");
  }, [token, status]);

  useEffect(() => { setItems(null); load(); }, [load]);

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-400 bg-white border border-slate-100 rounded-lg px-4 py-2.5">
        Farmers chat anonymously — other farmers only ever see a random alias. When a message is reported you can see who really sent it, here only.
        Three different reporters hide a message automatically until you decide. Nothing is deleted until you press <b>Remove</b>.
      </p>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Messages" value={stats.messages} icon={MessageSquareWarning} accent="slate" />
          <MetricCard label="Last 24 hours" value={stats.messages24h} accent="forest" subtext={stats.busiestGroups[0] ? `Busiest: ${groupLabel(stats.busiestGroups[0].groupKey)}` : undefined} />
          <MetricCard label="Group memberships" value={stats.memberships} accent="indigo" />
          <MetricCard label="Open reports" value={stats.openReports} accent="amber" icon={ShieldCheck} subtext={`${stats.hiddenMessages} auto-hidden`} />
        </div>
      )}

      <div className="flex gap-2">
        {["open", "actioned", "dismissed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`text-xs font-semibold px-3.5 py-2 rounded-lg capitalize transition-colors ${status === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{s}</button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!items && !error && <p className="text-sm text-ink-400 py-10 text-center">Loading reports…</p>}
      {items && items.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-100 py-16 text-center">
          <ShieldCheck className="mx-auto text-forest-500 mb-2" size={28} />
          <p className="text-sm text-ink-400">Nothing here — the community is behaving. 🌱</p>
        </div>
      )}
      <AnimatePresence>
        <div className="space-y-4">
          {items && items.map((item) => <ReportCard key={item.messageId} item={item} token={token} onChanged={load} />)}
        </div>
      </AnimatePresence>
    </div>
  );
}
