import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalPanel } from "../motion/variants.js";

const SUPPLIER_TYPES = [
  { value: "seed_store", label: "Seed Store" },
  { value: "fertilizer_store", label: "Fertilizer Store" },
  { value: "tool_store", label: "Tool Store" },
  { value: "equipment_rental", label: "Equipment Rental" },
];

export default function SupplierFormModal({ initialData, onClose, onSubmit, isSubmitting }) {
  const coords = initialData?.location?.coordinates || [80.6337, 7.2906]; // [lng, lat]

  const [form, setForm] = useState({
    businessName: initialData?.businessName || "",
    supplierType: initialData?.supplierType || "seed_store",
    address: initialData?.address || "",
    district: initialData?.district || "",
    contactPhone: initialData?.contactPhone || "",
    latitude: coords[1],
    longitude: coords[0],
    isVerified: initialData?.isVerified || false,
    itemsAvailable: (initialData?.itemsAvailable || []).join(", "),
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      businessName: form.businessName,
      supplierType: form.supplierType,
      address: form.address,
      district: form.district,
      contactPhone: form.contactPhone,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      isVerified: form.isVerified,
      itemsAvailable: form.itemsAvailable.split(",").map((s) => s.trim()).filter(Boolean),
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
            <h3 className="font-display text-xl font-semibold text-ink-900">{initialData ? "Edit Supplier" : "Add Supplier"}</h3>
            <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Business name</label>
              <input
                required
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Type</label>
              <select
                value={form.supplierType}
                onChange={(e) => update("supplierType", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUPPLIER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Address</label>
              <input
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">District</label>
              <input
                required
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Contact phone</label>
              <input
                required
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                placeholder="+94..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Latitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => update("latitude", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Longitude</label>
                <input
                  required
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => update("longitude", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <p className="text-xs text-ink-400 -mt-2">
              Tip: right-click any location on Google Maps and copy the coordinates shown, then paste the two numbers above.
            </p>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Items available (comma-separated, optional)</label>
              <input
                value={form.itemsAvailable}
                onChange={(e) => update("itemsAvailable", e.target.value)}
                placeholder="tomato seeds, urea fertilizer, sprayers"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.isVerified} onChange={(e) => update("isVerified", e.target.checked)} />
              Mark as verified
            </label>

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
                {isSubmitting ? "Saving…" : "Save Supplier"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
