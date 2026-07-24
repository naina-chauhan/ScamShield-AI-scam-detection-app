import { Shield, Moon, Sun, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  darkMode: boolean;
  onToggleDark: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Navbar = ({ darkMode, onToggleDark, activeSection, onNavigate }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const links = ["Home", "History", "Chat", "About"];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button onClick={() => onNavigate("Home")} className="flex items-center gap-2 font-heading text-lg font-bold">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-gradient">AI Scam Detector</span>
        </button>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <button
              key={l}
              onClick={() => onNavigate(l)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === l ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
          <button onClick={onToggleDark} className="rounded-lg p-2 transition-colors hover:bg-secondary" aria-label="Toggle theme">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {user.email?.split("@")[0]}
              </span>
              <button onClick={handleSignOut} className="rounded-lg p-2 transition-colors hover:bg-secondary" title="Sign out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onToggleDark} className="rounded-lg p-2 hover:bg-secondary">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 hover:bg-secondary">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <button
                  key={l}
                  onClick={() => { onNavigate(l); setMobileOpen(false); }}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary ${
                    activeSection === l ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
              {user && (
                <button onClick={handleSignOut} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-secondary">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
