import { motion } from "framer-motion";

export default function MetricCard({ label, value, accent = "slate", subtext, icon: Icon }) {
  const accentClasses = {
    slate: "text-slate-900",
    forest: "text-forest-500",
    indigo: "text-indigo-500",
    amber: "text-amber-500",
  };
  const iconBg = {
    slate: "bg-slate-100 text-slate-500",
    forest: "bg-forest-50 text-forest-500",
    indigo: "bg-indigo-50 text-indigo-500",
    amber: "bg-amber-50 text-amber-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg[accent]}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className={`font-mono text-3xl font-semibold ${accentClasses[accent]}`}>{value}</p>
      {subtext && <p className="text-xs text-ink-400 mt-1">{subtext}</p>}
    </motion.div>
  );
}
