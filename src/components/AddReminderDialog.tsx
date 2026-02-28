import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createReminder } from "@/api/db";
import { addToOfflineQueue } from "@/hooks/useOfflineSync";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddReminderDialog({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"time" | "activity">("time");
  const [triggerTime, setTriggerTime] = useState("");
  const [triggerContext, setTriggerContext] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [recurrence, setRecurrence] = useState<"once" | "daily" | "weekly" | "custom">("once");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const reset = () => { setTitle(""); setType("time"); setTriggerTime(""); setTriggerContext(""); setPriority("normal"); setRecurrence("once"); };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data: any = {
      title: title.trim(),
      type,
      priority,
      recurrence: type === "time" ? recurrence : "once",
      ...(type === "time" && triggerTime ? { trigger_time: new Date(triggerTime).toISOString() } : {}),
      ...(type === "activity" && triggerContext ? { trigger_context: triggerContext.trim() } : {}),
    };

    try {
      await createReminder(data);
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Reminder created" });
      reset();
      onOpenChange(false);
    } catch {
      addToOfflineQueue({ type: "reminder", data });
      toast({ title: "Saved offline", description: "Will sync when you're back online." });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Reminder</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input placeholder="What to remind you about?" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Tabs value={type} onValueChange={v => setType(v as "time" | "activity")} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="time" className="flex-1">Time-based</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">Activity-based</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {type === "time" ? (
            <>
              <div className="space-y-2">
                <Label>When</Label>
                <Input type="datetime-local" value={triggerTime} onChange={e => setTriggerTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Repeat</Label>
                <Tabs value={recurrence} onValueChange={v => setRecurrence(v as any)} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="once" className="flex-1">Once</TabsTrigger>
                    <TabsTrigger value="daily" className="flex-1">Daily</TabsTrigger>
                    <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>After what activity?</Label>
              <Input placeholder="e.g. After lunch" value={triggerContext} onChange={e => setTriggerContext(e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Tabs value={priority} onValueChange={v => setPriority(v as "normal" | "high")} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="normal" className="flex-1">Normal</TabsTrigger>
                <TabsTrigger value="high" className="flex-1">High</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? "Saving..." : "Create Reminder"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
