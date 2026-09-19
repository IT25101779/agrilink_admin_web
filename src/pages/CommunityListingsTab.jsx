import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Phone, MapPin, User } from "lucide-react";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import { SkeletonGrid } from "../components/Skeleton.jsx";
import { staggerContainer, fadeSlideUp } from "../motion/variants.js";

const TYPE_LABELS = {
  equipment_rental: "Equipment Rental",
  seeds_for_sale: "Seeds for Sale",
  other: "Other",
};

/**
 * Pure moderation view — farmers create/edit/delete their own community
 * listings from the mobile app; admin's only action here is removing
 * anything inappropriate or spam. No create/edit form, intentionally.
 */
export default function CommunityListingsTab() {
  const session = auth.getSession();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  async function loadListings() {
    setIsLoading(true);
    const result = await api.getAllCommunityListings(session.token);
    setListings(result.success ? result.data : []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleRemove(listing) {
    if (!confirm(`Remove "${listing.title}" posted by ${listing.farmer?.fullName || "this farmer"}?`)) return;
    const result = await api.adminDeleteCommunityListing(session.token, listing._id);
    if (result.success) loadListings();
    else alert(result.message || "Failed to remove listing.");
  }

  const filtered = listings.filter((l) => typeFilter === "all" || l.listingType === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Rentals & Seeds — Moderation</h3>
          <p className="text-sm text-ink-400 mt-1">
            Farmer-posted equipment rentals and seed listings. Farmers manage their own postings in the app — this view is for removing anything inappropriate.
          </p>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-100"
        >
          <option value="all">All types</option>
          <option value="equipment_rental">Equipment Rental</option>
          <option value="seeds_for_sale">Seeds for Sale</option>
          <option value="other">Other</option>
        </select>
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center text-ink-400 text-sm">
          No listings match this filter.
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <motion.div key={l._id} variants={fadeSlideUp} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-ink-900">{l.title}</h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${
                    l.isActive ? "bg-forest-50 text-forest-500" : "bg-slate-100 text-ink-400"
                  }`}
                >
                  {l.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-indigo-500 font-medium mb-2">{TYPE_LABELS[l.listingType] || l.listingType}</p>
              <p className="text-sm text-ink-700 mb-3 line-clamp-2">{l.description}</p>
              {l.priceInfo && (
                <p className="text-sm font-mono text-forest-600 mb-3">
                  LKR {l.priceInfo.amount} {l.priceInfo.unit}
                </p>
              )}
              <p className="text-xs text-ink-400 flex items-center gap-1 mb-1">
                <User size={11} />
                {l.farmer?.fullName || "Unknown farmer"} ({l.farmer?.phone || "no phone on file"})
              </p>
              <p className="text-xs text-ink-400 flex items-center gap-1 mb-1">
                <MapPin size={11} />
                {l.district}
              </p>
              <p className="text-xs text-ink-400 flex items-center gap-1 mb-4">
                <Phone size={11} />
                {l.contactPhone}
              </p>
              <button
                onClick={() => handleRemove(l)}
                className="w-full flex items-center justify-center gap-1 text-sm border border-amber-500/40 text-amber-500 py-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <Trash2 size={13} />
                Remove Listing
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
