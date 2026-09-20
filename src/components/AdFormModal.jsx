import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalPanel } from "../motion/variants.js";

const PLACEMENTS = [
  { id: "marketplace", label: "Marketplace" },
  { id: "logistics", label: "Logistics (farmers)" },
  { id: "driver", label: "Driver dashboard" },
  { id: "timeline", label: "Timeline" },
  { id: "scanner", label: "Disease scanner" },
];
const CATEGORIES = ["general", "fuel", "tyres", "insurance", "vehicle", "seeds", "fertilizer", "equipment", "finance", "cold_storage"];
const TIMELINE_PHASES = ["land_prep", "planting", "growth", "pest_control", "harvest", "post_harvest"];

export default function AdFormModal({ onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    brandName: "",
    bannerImageUrl: "",
    clickThroughUrl: "",
    targetCropTypes: "",
    targetTimelinePhase: [],
    targetDistricts: "",
    scheduleStart: "",
    scheduleEnd: "",
    placements: ["marketplace"],
    category: "general",
    headline: "",
    body: "",
    ctaLabel: "Learn more",
    emoji: "📢",
    accentColor: "#0B5D3B",
  });
  const [formError, setFormError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function togglePhase(phase) {
    setForm((prev) => ({
      ...prev,
      targetTimelinePhase: prev.targetTimelinePhase.includes(phase)
        ? prev.targetTimelinePhase.filter((p) => p !== phase)
        : [...prev.targetTimelinePhase, phase],
    }));
  }

  function togglePlacement(id) {
    setForm((prev) => ({
      ...prev,
      placements: prev.placements.includes(id) ? prev.placements.filter((p) => p !== id) : [...prev.placements, id],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.placements.length === 0) return setFormError("Choose at least one place to show the ad.");
    if (!form.bannerImageUrl.trim() && !form.headline.trim()) return setFormError("Add a banner picture URL, or a headline for a text ad.");
    setFormError("");
    onSubmit({
      ...form,
      targetCropTypes: form.targetCropTypes.split(",").map((s) => s.trim()).filter(Boolean),
      targetDistricts: form.targetDistricts.split(",").map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
      >
        <motion.div variants={modalPanel} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-2xl p-6 w-full max-w-lg my-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl font-semibold text-ink-900">Schedule new advertisement</h3>
            <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700">
              <X size={18} />
            </button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Brand name</label>
            <input
              required
              value={form.brandName}
              onChange={(e) => update("brandName", e.target.value)}
              placeholder="e.g. CIC Agri Fertilizers"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Banner image URL <span className="text-ink-400 font-normal">(optional — leave empty for a text ad)</span></label>
            <input
              type="url"
              value={form.bannerImageUrl}
              onChange={(e) => update("bannerImageUrl", e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Where to show it</label>
            <div className="flex flex-wrap gap-2">
              {PLACEMENTS.map((p) => (
                <button key={p.id} type="button" onClick={() => togglePlacement(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.placements.includes(p.id) ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-ink-400"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-3 space-y-3 bg-slate-50">
            <p className="text-xs font-semibold text-ink-700">Text ad (used when there is no picture)</p>
            <div className="grid grid-cols-3 gap-2">
              <input value={form.emoji} maxLength={4} onChange={(e) => update("emoji", e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-center text-xl" />
              <input value={form.accentColor} type="color" onChange={(e) => update("accentColor", e.target.value)} className="h-full w-full rounded-lg border border-slate-200 p-1" />
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="px-2 py-2 rounded-lg border border-slate-200 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <input value={form.headline} maxLength={80} onChange={(e) => update("headline", e.target.value)} placeholder="Headline, e.g. Save Rs. 8 on every litre" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
            <input value={form.body} maxLength={160} onChange={(e) => update("body", e.target.value)} placeholder="One short line of detail" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
            <input value={form.ctaLabel} maxLength={24} onChange={(e) => update("ctaLabel", e.target.value)} placeholder="Button text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Click-through URL</label>
            <input
              required
              type="url"
              value={form.clickThroughUrl}
              onChange={(e) => update("clickThroughUrl", e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Target crop types (comma-separated)</label>
            <input
              value={form.targetCropTypes}
              onChange={(e) => update("targetCropTypes", e.target.value)}
              placeholder="tomato, chili"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Target timeline phases</label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_PHASES.map((phase) => (
                <button
                  key={phase}
                  type="button"
                  onClick={() => togglePhase(phase)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.targetTimelinePhase.includes(phase)
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "border-slate-200 text-ink-400"
                  }`}
                >
                  {phase.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Target districts (comma-separated)</label>
            <input
              value={form.targetDistricts}
              onChange={(e) => update("targetDistricts", e.target.value)}
              placeholder="Kandy, Kurunegala"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Start date</label>
              <input
                required
                type="date"
                value={form.scheduleStart}
                onChange={(e) => update("scheduleStart", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">End date</label>
              <input
                required
                type="date"
                value={form.scheduleEnd}
                onChange={(e) => update("scheduleEnd", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-ink-700 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Scheduling…" : "Schedule Ad"}
            </button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
