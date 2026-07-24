import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import HeroSection, { type ScanType } from "@/components/HeroSection";
import AnalysisLoader from "@/components/AnalysisLoader";
import ResultSection, { type AnalysisResult } from "@/components/ResultSection";
import HistorySection, { type HistoryItem } from "@/components/HistorySection";
import StatsSection from "@/components/StatsSection";
import ChatSection from "@/components/ChatSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
  );
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeSection, setActiveSection] = useState("Home");
  const [privacyMode, setPrivacyMode] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load history from DB
  useEffect(() => {
    if (!user) return;
    api.scan.getHistory({ limit: 20 })
      .then((data) => {
        if (data) {
          setHistory(data.map((d: any) => ({
            id: d.id,
            status: d.status as AnalysisResult["status"],
            confidence: d.confidence,
            explanation: d.explanation || "",
            suspicious_words: d.suspicious_words || [],
            scam_category: d.scam_category || "none",
            original_message: d.input_text,
            scan_type: d.scan_type,
            timestamp: new Date(d.created_at),
          })));
        }
      })
      .catch((error) => {
        console.error('Failed to load history:', error);
      });
  }, [user]);

  const handleAnalyze = useCallback(async (scanType: ScanType) => {
    if (!message.trim() || !user) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const aiResult = await api.scan.analyze({
        scan_type: scanType,
        input: message,
        privacy_mode: privacyMode,
      });

      const analysisResult: AnalysisResult = {
        status: aiResult.status,
        confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        suspicious_words: aiResult.suspicious_words || [],
        scam_category: aiResult.scam_category || "none",
        original_message: message,
        scan_type: scanType,
      };

      setResult(analysisResult);

      // Refresh history if not in privacy mode
      if (!privacyMode) {
        const data = await api.scan.getHistory({ limit: 20 });
        if (data) {
          setHistory(data.map((d: any) => ({
            id: d.id,
            status: d.status as AnalysisResult["status"],
            confidence: d.confidence,
            explanation: d.explanation || "",
            suspicious_words: d.suspicious_words || [],
            scam_category: d.scam_category || "none",
            original_message: d.input_text,
            scan_type: d.scan_type,
            timestamp: new Date(d.created_at),
          })));
        }
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [message, user, privacyMode]);

  const handleReport = useCallback(async () => {
    if (!result || !user) return;
    try {
      await api.scan.report({
        report_text: result.original_message,
        category: result.scam_category,
      });
      toast.success("Scam reported! Thanks for helping keep others safe.");
    } catch (error) {
      toast.error("Failed to submit report");
    }
  }, [result, user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} activeSection={activeSection} onNavigate={setActiveSection} />

      {activeSection === "Home" && (
        <>
          <HeroSection message={message} onMessageChange={setMessage} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {/* Privacy toggle */}
          <div className="container mx-auto flex justify-center px-4 -mt-6 mb-4">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="rounded border-border"
              />
              🔐 Privacy Mode — don't save this scan
            </label>
          </div>

          <div className="container mx-auto px-4 pb-12" ref={resultRef}>
            {isAnalyzing && <AnalysisLoader />}
            {result && !isAnalyzing && <ResultSection result={result} onReport={handleReport} />}
          </div>
        </>
      )}

      {activeSection === "History" && (
        <>
          {history.length > 0 && <StatsSection history={history} />}
          <HistorySection history={history} />
          {history.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <p>No scans yet. Go to Home to analyze your first message!</p>
            </div>
          )}
        </>
      )}

      {activeSection === "Chat" && <ChatSection />}
      {activeSection === "About" && <AboutSection />}

      <Footer />
    </div>
  );
};

export default Index;
