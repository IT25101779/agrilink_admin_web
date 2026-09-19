import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Radio, Pause } from "lucide-react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import AdFormModal from "../components/AdFormModal.jsx";
import { staggerContainer, fadeSlideUp } from "../motion/variants.js";

export default function AdSchedulerTab() {
  const session = auth.getSession();
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadAds() {
    setIsLoading(true);
    const result = await api.getAds();
    setAds(result.success ? result.data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAds();
  }, []);

  async function handleCreate(adData) {
    setIsSubmitting(true);
    const result = await api.createAd(session.token, adData);
    setIsSubmitting(false);
    if (result.success) {
      setShowForm(false);
      loadAds();
    } else {
      alert(result.message || "Failed to create ad.");
    }
  }

  async function toggleActive(ad) {
    const result = await api.updateAd(session.token, ad._id, { isActive: !ad.isActive });
    if (result.success) loadAds();
  }

  async function handleDelete(ad) {
    if (!confirm(`Delete the "${ad.brandName}" ad?`)) return;
    const result = await api.deleteAd(session.token, ad._id);
    if (result.success) loadAds();
  }

  const isCurrentlyRunning = (ad) => {
    const now = new Date();
    return ad.isActive && new Date(ad.scheduleStart) <= now && new Date(ad.scheduleEnd) >= now;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Advertisement Scheduler</h3>
          <p className="text-sm text-ink-400 mt-1">
            Banners shown contextually to farmers based on their active crop and timeline stage.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={15} />
          Schedule New Ad
        </motion.button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-400 py-10 text-center">Loading…</p>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-ink-400 text-sm">
          No ads scheduled yet. Click "Schedule New Ad" to create your first campaign.
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <motion.div key={ad._id} variants={fadeSlideUp} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-ink-900">{ad.brandName}</h4>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {new Date(ad.scheduleStart).toLocaleDateString()} — {new Date(ad.scheduleEnd).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${
                    isCurrentlyRunning(ad) ? "bg-forest-50 text-forest-500" : "bg-slate-100 text-ink-400"
                  }`}
                >
                  {isCurrentlyRunning(ad) ? <Radio size={10} /> : <Pause size={10} />}
                  {isCurrentlyRunning(ad) ? "Live" : ad.isActive ? "Scheduled" : "Paused"}
                </span>
              </div>

              {ad.targetCropTypes?.length > 0 && (
                <p className="text-xs text-ink-400 mb-1">
                  <span className="font-medium">Crops:</span> {ad.targetCropTypes.join(", ")}
                </p>
              )}
              {ad.targetTimelinePhase?.length > 0 && (
                <p className="text-xs text-ink-400 mb-1">
                  <span className="font-medium">Phases:</span> {ad.targetTimelinePhase.join(", ").replace(/_/g, " ")}
                </p>
              )}
              {ad.targetDistricts?.length > 0 && (
                <p className="text-xs text-ink-400 mb-3">
                  <span className="font-medium">Districts:</span> {ad.targetDistricts.join(", ")}
                </p>
              )}

              <div className="flex items-center justify-between text-xs font-mono text-ink-400 mb-4 mt-3 pt-3 border-t border-slate-50">
                <span>{ad.impressions} impressions</span>
                <span>{ad.clicks} clicks</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(ad)}
                  className="flex-1 text-sm border border-slate-200 text-ink-700 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {ad.isActive ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => handleDelete(ad)}
                  className="flex-1 text-sm border border-amber-500/40 text-amber-500 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showForm && (
        <AdFormModal onClose={() => setShowForm(false)} onSubmit={handleCreate} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
