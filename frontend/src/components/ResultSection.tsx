import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Flag, Tag } from "lucide-react";

export interface AnalysisResult {
  status: "scam" | "safe" | "warning";
  confidence: number;
  explanation: string;
  suspicious_words: string[];
  scam_category: string;
  original_message: string;
  scan_type: string;
}

const statusConfig = {
  scam: { icon: ShieldAlert, label: "Scam Detected", colorClass: "text-destructive", bgClass: "bg-destructive/10 border-destructive/30", badgeBg: "bg-destructive" },
  safe: { icon: ShieldCheck, label: "Safe Message", colorClass: "text-safe", bgClass: "bg-safe/10 border-safe/30", badgeBg: "bg-safe" },
  warning: { icon: AlertTriangle, label: "Suspicious", colorClass: "text-warning", bgClass: "bg-warning/10 border-warning/30", badgeBg: "bg-warning" },
};

const categoryLabels: Record<string, string> = {
  phishing: "Phishing",
  lottery_scam: "Lottery Scam",
  job_scam: "Job Scam",
  otp_fraud: "OTP Fraud",
  upi_fraud: "UPI Fraud",
  romance_scam: "Romance Scam",
  tech_support_scam: "Tech Support Scam",
  investment_scam: "Investment Scam",
  impersonation: "Impersonation",
  general_fraud: "General Fraud",
  none: "None",
};

interface ResultSectionProps {
  result: AnalysisResult;
  onReport?: () => void;
}

const ResultSection = ({ result, onReport }: ResultSectionProps) => {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  const highlightMessage = (text: string, words: string[]) => {
    if (!words.length) return text;
    const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      words.some(w => w.toLowerCase() === part.toLowerCase())
        ? <mark key={i} className="rounded bg-destructive/20 px-0.5 text-destructive font-medium">{part}</mark>
        : part
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl"
    >
      <div className={`rounded-xl border p-6 ${config.bgClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.colorClass}`} />
            <div>
              <h3 className={`font-heading text-xl font-bold ${config.colorClass}`}>{config.label}</h3>
              <p className="text-sm text-muted-foreground">AI-powered analysis complete</p>
            </div>
          </div>
          <div className={`flex flex-col items-center rounded-lg ${config.badgeBg} px-4 py-2`}>
            <span className="text-2xl font-bold text-primary-foreground">{result.confidence}%</span>
            <span className="text-[10px] uppercase tracking-wider text-primary-foreground/80">Confidence</span>
          </div>
        </div>

        {result.scam_category && result.scam_category !== "none" && (
          <div className="mt-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="rounded-full border px-3 py-0.5 text-xs font-medium">
              {categoryLabels[result.scam_category] || result.scam_category}
            </span>
          </div>
        )}

        <div className="mt-5 rounded-lg border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Scanned Content</p>
          <p className="font-mono text-sm leading-relaxed">{highlightMessage(result.original_message, result.suspicious_words)}</p>
        </div>

        <div className="mt-4 rounded-lg border bg-card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Explanation</p>
          <p className="text-sm leading-relaxed">{result.explanation}</p>
        </div>

        {result.suspicious_words.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground">Flagged:</span>
            {result.suspicious_words.map((w) => (
              <span key={w} className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">{w}</span>
            ))}
          </div>
        )}

        {result.status !== "safe" && onReport && (
          <button
            onClick={onReport}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Flag className="h-3 w-3" /> Report this scam
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ResultSection;
