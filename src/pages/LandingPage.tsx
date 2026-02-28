import { Brain, Bell, Mic, MessageCircle, Volume2, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const features = [
  { icon: Mic, title: "Voice Input", desc: "Speak naturally to save memories and set reminders via the mic button", color: "text-primary" },
  { icon: MessageCircle, title: "AI Chat", desc: "Conversational assistant that understands intent — save, remind, or summarize", color: "text-accent" },
  { icon: Brain, title: "Memories", desc: "Store and search thoughts, ideas, and notes with categories and tags", color: "text-primary" },
  { icon: Bell, title: "Reminders", desc: "Time-based and activity-based reminders with priority levels", color: "text-warning" },
  { icon: BarChart3, title: "Smart Summaries", desc: "Ask AI for daily summaries and 'Am I forgetting anything?' overviews", color: "text-accent" },
  { icon: Volume2, title: "Voice Feedback", desc: "AI speaks responses aloud using text-to-speech for hands-free use", color: "text-primary" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          {/* Hero */}
          <motion.div variants={item} className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold">Remember</h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Your voice-powered AI memory assistant. Capture thoughts, set reminders, and never forget what matters.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div variants={item} className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-center">What You Can Do</h2>
            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <Card key={f.title} className="border-border/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <f.icon className={`h-4 w-4 ${f.color}`} />
                    </div>
                    <p className="font-display text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={item} className="text-center space-y-3">
            <Button size="lg" className="w-full gap-2" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">Free to use · Sign up in seconds</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
