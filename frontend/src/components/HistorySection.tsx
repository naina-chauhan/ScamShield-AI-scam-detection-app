import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import type { AnalysisResult } from "./ResultSection";

export interface HistoryItem extends AnalysisResult {
  timestamp: Date;
  id: string;
}

const statusIcons = { scam: ShieldAlert, safe: ShieldCheck, warning: AlertTriangle };
const statusColors = { scam: "text-destructive", safe: "text-safe", warning: "text-warning" };
const statusBg = { scam: "bg-destructive/10", safe: "bg-safe/10", warning: "bg-warning/10" };

const HistorySection = ({ history }: { history: HistoryItem[] }) => {
  if (!history.length) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 font-heading text-2xl font-bold">Analysis History</h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {history.map((item, i) => {
            const Icon = statusIcons[item.status];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                <div className={`rounded-lg p-2 ${statusBg[item.status]}`}>
                  <Icon className={`h-5 w-5 ${statusColors[item.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">{item.original_message}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.timestamp.toLocaleString()}
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBg[item.status]} ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                    <span className="rounded-full border px-2 py-0.5 text-[10px]">{item.scan_type}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{item.confidence}%</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
