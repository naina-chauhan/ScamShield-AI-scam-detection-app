import { motion } from "framer-motion";
import { Brain, Zap, Lock } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Analysis", desc: "Advanced NLP models detect phishing patterns, urgency tactics, and social engineering in real time." },
  { icon: Zap, title: "Instant Results", desc: "Get detailed threat analysis in seconds with confidence scoring and word-level highlighting." },
  { icon: Lock, title: "Privacy First", desc: "Your messages are analyzed locally and never stored on our servers. Complete privacy guaranteed." },
];

const AboutSection = () => (
  <section className="border-t py-16">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold">How It Works</h2>
        <p className="mt-3 text-muted-foreground">Our AI engine analyzes text for common scam indicators including urgency language, suspicious links, and social engineering patterns.</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl border bg-card p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <f.icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="font-heading font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
