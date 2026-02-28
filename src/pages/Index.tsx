import { Brain, Bell, Sparkles, Mic, MessageCircle, Home, Settings, Volume2, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchCounts, fetchMemories } from "@/api/db";
import { useAuthContext } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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

const pages = [
  { to: "/", icon: Home, label: "Home", desc: "Dashboard overview with stats and recent activity" },
  { to: "/chat", icon: MessageCircle, label: "Chat", desc: "Talk to your AI assistant in real time" },
  { to: "/memories", icon: Brain, label: "Memories", desc: "Browse, search, and manage saved memories" },
  { to: "/reminders", icon: Bell, label: "Reminders", desc: "View and manage upcoming reminders" },
  { to: "/settings", icon: Settings, label: "Settings", desc: "Configure notifications, voice, and preferences" },
];

const Index = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { data: counts } = useQuery({
    queryKey: ["counts"],
    queryFn: fetchCounts,
    enabled: !!user,
  });
  const { data: recentMemories } = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
    enabled: !!user,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI-powered memory assistant — capture thoughts, set reminders, and never forget what matters.
        </p>
      </motion.div>

      {/* AI Overview Tip */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">AI Overview</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap the mic and ask "Am I forgetting anything?" to get a smart summary of your day.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{counts?.memories ?? 0}</p>
              <p className="text-xs text-muted-foreground">Memories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{counts?.reminders ?? 0}</p>
              <p className="text-xs text-muted-foreground">Reminders</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* What You Can Do */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold mb-3">What You Can Do</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <Card key={f.title} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
                </div>
                <p className="font-display text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* App Pages */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold mb-3">App Pages</h2>
        <div className="space-y-2">
          {pages.map((p) => (
            <Card
              key={p.to}
              className="cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.98]"
              onClick={() => navigate(p.to)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold mb-3">Recent Activity</h2>
        {recentMemories && recentMemories.length > 0 ? (
          <div className="space-y-2">
            {recentMemories.slice(0, 5).map((m: any) => (
              <Card key={m.id}>
                <CardContent className="p-3">
                  <p className="text-sm">{m.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {m.category && <span className="text-primary">{m.category}</span>}
                    {m.category && " · "}
                    {format(new Date(m.created_at), "MMM d, h:mm a")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No memories yet. Tap the mic to start talking!</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Index;
