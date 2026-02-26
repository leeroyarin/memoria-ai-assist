import { Brain, Bell, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl font-bold">Good evening 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What would you like to remember?
        </p>
      </motion.div>

      {/* AI Overview Card */}
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
              <p className="text-2xl font-bold font-display">0</p>
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
              <p className="text-2xl font-bold font-display">0</p>
              <p className="text-xs text-muted-foreground">Reminders</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent activity placeholder */}
      <motion.div variants={item}>
        <h2 className="font-display text-lg font-semibold mb-3">Recent Activity</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No memories yet. Tap the mic to start talking!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Index;
