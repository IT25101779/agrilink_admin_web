import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalPanel } from "../motion/variants.js";

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
  });

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

  function handleSubmit(e) {
    e.preventDefault();
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
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Banner image URL</label>
            <input
              required
              type="url"
              value={form.bannerImageUrl}
              onChange={(e) => update("bannerImageUrl", e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
