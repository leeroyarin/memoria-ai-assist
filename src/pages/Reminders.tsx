import { Bell, Clock, Activity, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useReminders } from "@/hooks/useReminders";
import { format } from "date-fns";
import { useState } from "react";

const ReminderCard = ({ reminder, onDone, onDismiss }: { reminder: any; onDone: () => void; onDismiss: () => void }) => (
  <Card>
    <CardContent className="p-3 flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {reminder.priority === "high" && <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />}
          <p className="text-sm font-medium">{reminder.title}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{reminder.type}</span>
          {reminder.trigger_time && (
            <span className="text-xs text-muted-foreground">{format(new Date(reminder.trigger_time), "MMM d, h:mm a")}</span>
          )}
          {reminder.trigger_context && (
            <span className="text-xs text-muted-foreground italic">After: {reminder.trigger_context}</span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={onDone}><Check className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onDismiss}><X className="h-4 w-4" /></Button>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </CardContent>
  </Card>
);

const ReminderList = ({ filter }: { filter?: "time" | "activity" }) => {
  const { data: reminders, isLoading, markStatus } = useReminders(filter);
  const pending = reminders?.filter((r: any) => r.status === "pending") ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!pending.length) {
    const emptyIcon = filter === "time" ? Clock : filter === "activity" ? Activity : Bell;
    const emptyText = filter ? `No ${filter}-based reminders` : "No reminders set. Say \"Remind me to...\" using the mic.";
    return <EmptyState icon={emptyIcon} text={emptyText} />;
  }

  return (
    <div className="space-y-2">
      {pending.map((r: any) => (
        <ReminderCard key={r.id} reminder={r} onDone={() => markStatus(r.id, "done")} onDismiss={() => markStatus(r.id, "dismissed")} />
      ))}
    </div>
  );
};

const Reminders = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Never forget again</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="time" className="flex-1 gap-1"><Clock className="h-3.5 w-3.5" /> Time</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 gap-1"><Activity className="h-3.5 w-3.5" /> Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4"><ReminderList /></TabsContent>
        <TabsContent value="time" className="mt-4"><ReminderList filter="time" /></TabsContent>
        <TabsContent value="activity" className="mt-4"><ReminderList filter="activity" /></TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Reminders;
