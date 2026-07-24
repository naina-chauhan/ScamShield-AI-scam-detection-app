import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="border-t py-8">
    <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
        <Shield className="h-4 w-4 text-primary" />
        AI Scam Detector
      </div>
      <p>Protecting you from online fraud with AI-powered message analysis.</p>
    </div>
  </footer>
);

export default Footer;
