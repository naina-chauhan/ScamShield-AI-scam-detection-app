import { Search, ShieldCheck, Link, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type ScanType = "text" | "url" | "email";

interface HeroSectionProps {
  message: string;
  onMessageChange: (v: string) => void;
  onAnalyze: (scanType: ScanType) => void;
  isAnalyzing: boolean;
}

const tabs: { id: ScanType; label: string; icon: typeof Search; placeholder: string }[] = [
  { id: "text", label: "Text", icon: Search, placeholder: "Paste suspicious message or SMS here..." },
  { id: "url", label: "URL", icon: Link, placeholder: "Paste suspicious URL here (e.g. https://amaz0n-verify.com)..." },
  { id: "email", label: "Email", icon: Mail, placeholder: "Paste suspicious email content here..." },
];

const HeroSection = ({ message, onMessageChange, onAnalyze, isAnalyzing }: HeroSectionProps) => {
  const [scanType, setScanType] = useState<ScanType>("text");
  const maxChars = 5000;
  const currentTab = tabs.find(t => t.id === scanType)!;

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            AI-Powered Protection
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="text-gradient">AI Scam</span> Detector
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Detect fraudulent messages, phishing URLs, and scam emails instantly with AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="glow-primary rounded-xl border bg-card p-1.5">
            {/* Scan type tabs */}
            <div className="mb-2 flex gap-1 rounded-lg bg-secondary/50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setScanType(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    scanType === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value.slice(0, maxChars))}
              placeholder={currentTab.placeholder}
              rows={5}
              className="w-full resize-none rounded-lg bg-secondary/50 px-4 py-3 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-xs text-muted-foreground">
                {message.length}/{maxChars}
              </span>
              <button
                onClick={() => onAnalyze(scanType)}
                disabled={!message.trim() || isAnalyzing}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
export type { ScanType };
