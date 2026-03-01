import { Bell, Clock, Activity, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useReminders } from "@/hooks/useReminders";
import { format } from "date-fns";
import { useState } from "react";
import AddReminderDialog from "@/components/AddReminderDialog";
import FloatingActions from "@/components/FloatingActions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import VoiceOverlay from "@/components/VoiceOverlay";
import ReminderConfirmDialog from "@/components/ReminderConfirmDialog";

const ReminderCard = ({ reminder, onDone, onDismiss }: { reminder: any; onDone: () => void; onDismiss: () => void }) => (
  <Card className="border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
    <CardContent className="p-4 flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {reminder.priority === "high" && <span className="h-2 w-2 rounded-full bg-destructive shrink-0 animate-pulse" />}
          <p className="text-sm font-medium leading-relaxed">{reminder.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">{reminder.type}</span>
          {reminder.recurrence && reminder.recurrence !== "once" && (
            <span className="text-[11px] font-medium bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">{reminder.recurrence}</span>
          )}
          {reminder.trigger_time && (
            <span className="text-[11px] text-muted-foreground">{format(new Date(reminder.trigger_time), "MMM d, h:mm a")}</span>
          )}
          {reminder.trigger_context && (
            <span className="text-[11px] text-muted-foreground italic">After: {reminder.trigger_context}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={onDone}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={onDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <Card className="border-dashed border-border/60">
    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground max-w-[240px]">{text}</p>
    </CardContent>
  </Card>
);

const ReminderList = ({ filter }: { filter?: "time" | "activity" }) => {
  const { data: reminders, isLoading, markStatus } = useReminders(filter);
  const pending = reminders?.filter((r: any) => r.status === "pending") ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!pending.length) {
    const emptyIcon = filter === "time" ? Clock : filter === "activity" ? Activity : Bell;
    const emptyText = filter ? `No ${filter}-based reminders` : "No reminders set. Tap + or say \"Remind me to...\"";
    return <EmptyState icon={emptyIcon} text={emptyText} />;
  }

  return (
    <div className="space-y-3">
      {pending.map((r: any, i: number) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <ReminderCard reminder={r} onDone={() => markStatus(r.id, "done")} onDismiss={() => markStatus(r.id, "dismissed")} />
        </motion.div>
      ))}
    </div>
  );
};

const Reminders = () => {
  const [addOpen, setAddOpen] = useState(false);
  const voice = useVoiceInput();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Never forget again</p>
      </div>

      <AddReminderDialog open={addOpen} onOpenChange={setAddOpen} />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full rounded-xl bg-card border border-border">
          <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
          <TabsTrigger value="time" className="flex-1 gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Clock className="h-3.5 w-3.5" /> Time</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4"><ReminderList /></TabsContent>
        <TabsContent value="time" className="mt-4"><ReminderList filter="time" /></TabsContent>
        <TabsContent value="activity" className="mt-4"><ReminderList filter="activity" /></TabsContent>
      </Tabs>

      {voice.voiceState === "idle" && (
        <FloatingActions
          onManualAdd={() => setAddOpen(true)}
          onVoice={() => voice.startListening()}
        />
      )}

      <VoiceOverlay
        voiceState={voice.voiceState}
        partialTranscript={voice.partialTranscript}
        lastResponse={voice.lastResponse}
        onStopListening={voice.stopAndProcess}
        onCancel={voice.cancelVoice}
      />

      {voice.pendingReminder && (
        <ReminderConfirmDialog
          open={voice.voiceState === "confirming"}
          reminder={voice.pendingReminder}
          onConfirm={voice.confirmReminder}
          onCancel={voice.cancelReminder}
        />
      )}
    </motion.div>
  );
};

export default Reminders;
