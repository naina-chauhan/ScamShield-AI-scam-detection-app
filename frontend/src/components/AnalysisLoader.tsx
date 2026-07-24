import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const AnalysisLoader = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mx-auto max-w-2xl"
  >
    <div className="rounded-xl border bg-card p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <Shield className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse-glow" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-heading font-semibold">Scanning Message...</p>
          <p className="text-sm text-muted-foreground">Analyzing patterns and checking for threats</p>
        </div>
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  </motion.div>
);

export default AnalysisLoader;
