import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sprout, Recycle, PackageCheck, Users, Handshake, HandCoins, Megaphone, Bug, Wallet } from "lucide-react";
import MetricCard from "../components/MetricCard.jsx";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";
import { staggerContainer, fadeSlideUp } from "../motion/variants.js";

const n = (v) => Number(v || 0).toLocaleString();
const lkr = (v) => `LKR ${n(v)}`;

function Section({ title, subtitle, children }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      {subtitle && <p className="text-xs text-ink-400 mt-0.5 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {children}
      </motion.div>
    </div>
  );
}

const Cell = ({ children }) => <motion.div variants={fadeSlideUp}>{children}</motion.div>;

export default function ImpactTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const result = await api.getImpact(auth.getSession().token);
      if (result.success) setData(result.data);
      else setError(result.message || "Could not load impact figures.");
    })();
  }, []);

  if (error) return <p className="text-sm text-red-600 py-20 text-center">{error}</p>;
  if (!data) return <p className="text-sm text-ink-400 py-20 text-center">Loading impact figures…</p>;

  const fulfilledPct = data.demandBoard.kgRequested > 0 ? Math.round((data.demandBoard.kgFulfilled / data.demandBoard.kgRequested) * 100) : 0;
  const weekly = data.weekly.map((w) => ({ ...w, label: w.weekEnding.slice(5) }));

  return (
    <div className="space-y-8">
      <p className="text-xs text-ink-400 bg-white border border-slate-100 rounded-lg px-4 py-2.5">
        Live figures counted directly from the platform database — nothing is estimated. If demo data is loaded, these are demo figures.
        Generated {new Date(data.generatedAt).toLocaleString()}.
      </p>

      <Section title="Headline impact">
        <Cell><MetricCard label="Farmers on the platform" value={n(data.users.farmers)} accent="forest" subtext={`${n(data.users.buyers)} buyers`} icon={Sprout} /></Cell>
        <Cell><MetricCard label="Produce sold" value={`${n(data.sales.kgSold)} kg`} accent="forest" subtext={`${lkr(data.sales.valueLkr)} · ${n(data.sales.completed)} sales`} icon={Wallet} /></Cell>
        <Cell><MetricCard label="Waste rescued" value={`${n(data.wasteRescued.kgRescued)} kg`} accent="amber" subtext={`${lkr(data.wasteRescued.valueLkr)} from rejected produce`} icon={Recycle} /></Cell>
        <Cell><MetricCard label="Small farmers in bulk sales" value={n(data.groupSelling.smallFarmersReachingBulkBuyers)} accent="indigo" subtext="Contributed 100 kg or less" icon={Users} /></Cell>
      </Section>

      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h3 className="font-display text-lg font-semibold mb-1">Sales value per week</h3>
        <p className="text-xs text-ink-400 mb-4">Completed sales, last 8 weeks</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9EE" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
            <Tooltip formatter={(v, name) => (name === "valueLkr" ? [lkr(v), "Sales value"] : [v, name])} labelFormatter={(l) => `Week ending ${l}`} />
            <Bar dataKey="valueLkr" fill="#0B5D3B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Section title="Waste rescued" subtitle="Produce a buyer rejected that was redirected to the flash-sale market instead of being thrown away.">
        <Cell><MetricCard label="Rescued and sold" value={`${n(data.wasteRescued.kgRescued)} kg`} accent="amber" subtext={`${n(data.wasteRescued.rescuedSales)} sales`} icon={Recycle} /></Cell>
        <Cell><MetricCard label="Value recovered" value={lkr(data.wasteRescued.valueLkr)} accent="amber" icon={Wallet} /></Cell>
        <Cell><MetricCard label="Listings redirected" value={n(data.wasteRescued.listingsRedirected)} accent="slate" subtext="Moved to secondary market" icon={PackageCheck} /></Cell>
        <Cell><MetricCard label="On flash sale now" value={`${n(data.wasteRescued.kgWaitingOnFlashSale)} kg`} accent="slate" subtext="Waiting for a buyer" icon={Recycle} /></Cell>
      </Section>

      <Section title="Group selling" subtitle="Farmers pooling harvest so a buyer can take a whole lot.">
        <Cell><MetricCard label="Lots claimed by buyers" value={n(data.groupSelling.lotsClaimed)} accent="indigo" icon={Handshake} /></Cell>
        <Cell><MetricCard label="Volume pooled" value={`${n(data.groupSelling.kgPooled)} kg`} accent="indigo" icon={PackageCheck} /></Cell>
        <Cell><MetricCard label="Farmers participating" value={n(data.groupSelling.farmersParticipating)} accent="forest" icon={Users} /></Cell>
        <Cell><MetricCard label="Small farmers reached" value={n(data.groupSelling.smallFarmersReachingBulkBuyers)} accent="forest" subtext="100 kg or less each" icon={Users} /></Cell>
      </Section>

      <Section title="Buyer demand board" subtitle="What buyers asked for, and how much farmers have already committed to.">
        <Cell><MetricCard label="Requests posted" value={n(data.demandBoard.requestsPosted)} accent="indigo" subtext={`${n(data.demandBoard.requestsOpen)} open`} icon={Megaphone} /></Cell>
        <Cell><MetricCard label="Volume requested" value={`${n(data.demandBoard.kgRequested)} kg`} accent="slate" icon={PackageCheck} /></Cell>
        <Cell><MetricCard label="Volume fulfilled" value={`${n(data.demandBoard.kgFulfilled)} kg`} accent="forest" subtext={`${fulfilledPct}% of requested`} icon={PackageCheck} /></Cell>
        <Cell><MetricCard label="Offers accepted" value={`${n(data.demandBoard.offersAccepted)} / ${n(data.demandBoard.offersReceived)}`} accent="indigo" subtext="Of offers received" icon={Handshake} /></Cell>
      </Section>

      <Section title="Funding & disease watch">
        <Cell><MetricCard label="Raised from investors" value={lkr(data.funding.raisedLkr)} accent="forest" subtext={`${n(data.funding.campaignsFunded)} campaigns funded`} icon={HandCoins} /></Cell>
        <Cell><MetricCard label="Campaigns repaid" value={n(data.funding.campaignsRepaid)} accent="forest" subtext={`${n(data.funding.investors)} investors`} icon={HandCoins} /></Cell>
        <Cell><MetricCard label="Disease scans" value={n(data.diseaseWatch.scans)} accent="slate" subtext={`${n(data.diseaseWatch.outbreakReports)} outbreak reports`} icon={Bug} /></Cell>
        <Cell><MetricCard label="Districts with outbreaks" value={n(data.diseaseWatch.districtsWithOutbreaks)} accent={data.diseaseWatch.districtsWithOutbreaks > 0 ? "amber" : "slate"} icon={Bug} /></Cell>
      </Section>

      <Section title="Farming">
        <Cell><MetricCard label="Active crops" value={n(data.farming.activeTimelines)} accent="forest" icon={Sprout} /></Cell>
        <Cell><MetricCard label="Completed crop cycles" value={n(data.farming.completedTimelines)} accent="forest" icon={Sprout} /></Cell>
        <Cell><MetricCard label="Acres managed" value={n(data.farming.acresUnderManagement)} accent="indigo" subtext="Active crops" icon={Sprout} /></Cell>
      </Section>
    </div>
  );
}
