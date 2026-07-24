import { motion } from "framer-motion";
import { BarChart3, ShieldAlert, ShieldCheck, Activity } from "lucide-react";
import type { HistoryItem } from "./HistorySection";

const StatsSection = ({ history }: { history: HistoryItem[] }) => {
  const total = history.length;
  const scams = history.filter(h => h.status === "scam").length;
  const safe = history.filter(h => h.status === "safe").length;
  const warnings = history.filter(h => h.status === "warning").length;

  const stats = [
    { label: "Total Analyzed", value: total, icon: BarChart3, color: "text-primary" },
    { label: "Scams Detected", value: scams, icon: ShieldAlert, color: "text-destructive" },
    { label: "Safe Messages", value: safe, icon: ShieldCheck, color: "text-safe" },
    { label: "Warnings", value: warnings, icon: Activity, color: "text-warning" },
  ];

  if (!total) return null;

  return (
    <section className="border-t py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 font-heading text-2xl font-bold">Dashboard</h2>
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-4 text-center"
            >
              <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
              <p className="text-3xl font-bold font-heading">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Simple bar visualization */}
        {total > 0 && (
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
              {scams > 0 && <div className="bg-destructive transition-all" style={{ width: `${(scams / total) * 100}%` }} />}
              {warnings > 0 && <div className="bg-warning transition-all" style={{ width: `${(warnings / total) * 100}%` }} />}
              {safe > 0 && <div className="bg-safe transition-all" style={{ width: `${(safe / total) * 100}%` }} />}
            </div>
            <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />Scam</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" />Warning</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" />Safe</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
