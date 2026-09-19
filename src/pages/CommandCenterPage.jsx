import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import OverviewTab from "./OverviewTab.jsx";
import MarketplaceOversightTab from "./MarketplaceOversightTab.jsx";
import SupplierManagementTab from "./SupplierManagementTab.jsx";
import CommunityListingsTab from "./CommunityListingsTab.jsx";
import AdSchedulerTab from "./AdSchedulerTab.jsx";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import { pageTransition } from "../motion/variants.js";

const TAB_TITLES = {
  overview: "Platform Overview",
  marketplace: "Marketplace Oversight",
  suppliers: "Supplier Directory",
  community: "Rentals & Seeds",
  ads: "Ad Scheduler",
};

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const session = auth.getSession();

  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  useEffect(() => {
    if (activeTab === "overview") {
      (async () => {
        setIsLoadingMetrics(true);
        const result = await api.getMetrics(session.token);
        setMetrics(result.success ? result.data : null);
        setIsLoadingMetrics(false);
      })();
    }
  }, [activeTab, session.token]);

  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <h2 className="font-display text-2xl font-semibold text-ink-900 mb-6">{TAB_TITLES[activeTab]}</h2>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={pageTransition} initial="hidden" animate="visible" exit="exit">
            {activeTab === "overview" &&
              (isLoadingMetrics ? (
                <p className="text-sm text-ink-400 py-20 text-center">Loading platform metrics…</p>
              ) : (
                <OverviewTab metrics={metrics} />
              ))}
            {activeTab === "marketplace" && <MarketplaceOversightTab />}
            {activeTab === "suppliers" && <SupplierManagementTab />}
            {activeTab === "community" && <CommunityListingsTab />}
            {activeTab === "ads" && <AdSchedulerTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
