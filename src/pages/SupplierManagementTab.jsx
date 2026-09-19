import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import { SkeletonGrid } from "../components/Skeleton.jsx";
import { staggerContainer, fadeSlideUp } from "../motion/variants.js";
import SupplierFormModal from "../components/SupplierFormModal.jsx";

const TYPE_LABELS = {
  seed_store: "Seed Store",
  fertilizer_store: "Fertilizer Store",
  tool_store: "Tool Store",
  equipment_rental: "Equipment Rental",
};

export default function SupplierManagementTab() {
  const session = auth.getSession();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadSuppliers() {
    setIsLoading(true);
    const result = await api.getAllSuppliers(session.token);
    setSuppliers(result.success ? result.data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function handleSave(formData) {
    setIsSubmitting(true);
    const result = editingSupplier
      ? await api.updateSupplier(session.token, editingSupplier._id, formData)
      : await api.createSupplier(session.token, formData);
    setIsSubmitting(false);

    if (result.success) {
      setShowForm(false);
      setEditingSupplier(null);
      loadSuppliers();
    } else {
      alert(result.message || "Failed to save supplier.");
    }
  }

  async function handleDelete(supplier) {
    if (!confirm(`Remove "${supplier.businessName}"? This can't be undone.`)) return;
    const result = await api.deleteSupplier(session.token, supplier._id);
    if (result.success) loadSuppliers();
    else alert(result.message || "Failed to delete supplier.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Supplier & Rental Directory</h3>
          <p className="text-sm text-ink-400 mt-1">
            Seed/fertilizer/tool stores and equipment rental businesses shown to farmers in the app.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={15} />
          Add Supplier
        </motion.button>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-ink-400 text-sm">
          No suppliers yet. Click "Add Supplier" to create the first one, or run the backend's seedSuppliers.js script for sample data.
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <motion.div key={s._id} variants={fadeSlideUp} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-ink-900">{s.businessName}</h4>
                {s.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-forest-50 text-forest-500 uppercase">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-500 font-medium mb-2">{TYPE_LABELS[s.supplierType] || s.supplierType}</p>
              <p className="text-xs text-ink-400 flex items-center gap-1 mb-1">
                <MapPin size={11} />
                {s.address}, {s.district}
              </p>
              <p className="text-xs text-ink-400 flex items-center gap-1 mb-4">
                <Phone size={11} />
                {s.contactPhone}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSupplier(s);
                    setShowForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 text-sm border border-slate-200 text-ink-700 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="flex-1 flex items-center justify-center gap-1 text-sm border border-amber-500/40 text-amber-500 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showForm && (
        <SupplierFormModal
          initialData={editingSupplier}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
