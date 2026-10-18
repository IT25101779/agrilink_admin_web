import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5">
    <h3 className="font-display text-lg font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

const LABELS = { driving_license: "Driving license", vehicle_license: "Vehicle license", vehicle_photo: "Vehicle photo" };

/**
 * The backend's verification/approval machinery (submit → pending → admin
 * decides → verified/rejected) already existed for farmers and buyers'
 * optional NIC/business-registration badge — but nothing on the admin
 * site ever showed those pending requests, and nothing handled a driver's
 * MANDATORY 3-document submission (driving license, vehicle license,
 * vehicle photo) that gates whether they can even log in. This tab is
 * both: one queue, two shapes of card depending on how many documents
 * came with the request.
 */
export default function AccountApprovalsTab() {
  const token = auth.getSession().token;
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});
  const [noteDraft, setNoteDraft] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setRows(null);
    const r = await api.call(token, "GET", `/admin/verifications?status=${status}`);
    if (!r.success) return alert(r.message || "Could not load approvals.");
    setRows(r.data);
    // Fetch every photo as a private blob URL (same pattern as chat-media moderation).
    const ids = r.data.flatMap((u) => (u.photos && u.photos.length ? u.photos.map((p) => p.id) : u.photoId ? [u.photoId] : []));
    const entries = await Promise.all(ids.map(async (id) => [id, await api.photoBlobUrl(token, id)]));
    setPhotoUrls((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
  }, [token, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(userId, decision) {
    if (decision === "rejected" && !noteDraft[userId]?.trim()) {
      if (!confirm("Reject with no reason given? The person won't know what to fix. Continue anyway?")) return;
    }
    setBusyId(userId);
    const r = await api.call(token, "POST", `/admin/verifications/${userId}`, { decision, note: noteDraft[userId] || "" });
    setBusyId(null);
    if (!r.success) return alert(r.message || "Failed.");
    load();
  }

  const docTypeLabel = { nic: "NIC", business_reg: "Business registration", farmer_card: "Farmer card", driver_docs: "Driver documents (3)" };

  return (
    <div className="space-y-4">
      <Card title="Account approvals">
        <p className="text-sm text-ink-700 mb-4">
          Farmer/buyer ID checks are optional (just a trust badge). A <b>driver account cannot log in at all</b> until
          approved here — the app blocks login and every driver action on the backend, not just in the app's UI.
        </p>
        <div className="flex gap-2 mb-4">
          {["pending", "verified", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${status === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-ink-700"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {rows === null ? (
          <p className="text-ink-400">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-ink-400 py-4">No {status} requests right now.</p>
        ) : (
          <div className="space-y-4">
            {rows.map((u) => {
              const isDriver = u.docType === "driver_docs";
              const photoList = isDriver ? u.photos : u.photoId ? [{ id: u.photoId, label: u.docType }] : [];
              return (
                <div key={u.userId} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold">
                        {u.name} <span className="text-xs text-ink-400 uppercase">{u.role}</span>
                      </p>
                      <p className="text-sm text-ink-700">
                        {u.phone} {u.district ? `· ${u.district}` : ""} {u.company ? `· ${u.company}` : ""}
                      </p>
                      <p className="text-xs text-ink-400">
                        {docTypeLabel[u.docType] || u.docType} · submitted {u.submittedAt ? new Date(u.submittedAt).toLocaleString() : "—"}
                      </p>
                      {isDriver && u.vehicleRegistrationNo && (
                        <p className="text-xs text-ink-700 mt-1">
                          Vehicle: <b>{u.vehicleRegistrationNo}</b>
                          {u.vehicleLicenseExpiryDate && (
                            <>
                              {" "}
                              · license expires {new Date(u.vehicleLicenseExpiryDate).toLocaleDateString()}
                              {u.vehicleLicenseExpired && <span className="text-rose-600 font-semibold"> — EXPIRED</span>}
                              {!u.vehicleLicenseExpired && u.vehicleLicenseExpiringSoon && <span className="text-amber-600 font-semibold"> — expiring soon</span>}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    {status === "rejected" && u.note && <p className="text-sm text-rose-600 max-w-xs">Reason given: {u.note}</p>}
                  </div>

                  {photoList.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {photoList.map((p) => (
                        <a key={p.id} href={photoUrls[p.id] || "#"} target="_blank" rel="noreferrer" className="block">
                          <p className="text-xs text-ink-400 mb-1">{LABELS[p.label] || p.label || "Document"}</p>
                          {photoUrls[p.id] ? (
                            <img src={photoUrls[p.id]} alt={p.label} className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <div className="w-32 h-32 rounded-lg bg-slate-100 animate-pulse" />
                          )}
                        </a>
                      ))}
                    </div>
                  )}

                  {status === "pending" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
                        placeholder="Rejection reason (shown to the person)"
                        value={noteDraft[u.userId] || ""}
                        onChange={(e) => setNoteDraft({ ...noteDraft, [u.userId]: e.target.value })}
                      />
                      <button
                        disabled={busyId === u.userId}
                        onClick={() => decide(u.userId, "verified")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === u.userId}
                        onClick={() => decide(u.userId, "rejected")}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
