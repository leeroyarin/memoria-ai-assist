import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingReminder {
  title: string;
  type: "time" | "activity";
  trigger_time?: string;
  trigger_context?: string;
  priority?: string;
  recurrence?: string;
}

interface ReminderConfirmDialogProps {
  open: boolean;
  reminder: PendingReminder;
  onConfirm: (edited: PendingReminder) => void;
  onCancel: () => void;
}

const ReminderConfirmDialog = ({ open, reminder, onConfirm, onCancel }: ReminderConfirmDialogProps) => {
  const [form, setForm] = useState<PendingReminder>(reminder);

  useEffect(() => {
    setForm(reminder);
  }, [reminder]);

  const handleConfirm = () => {
    onConfirm(form);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onCancel()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Confirm Reminder</DrawerTitle>
          <DrawerDescription>Review and edit before saving</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <ToggleGroup
              type="single"
              value={form.type}
              onValueChange={(v) => v && setForm((f) => ({ ...f, type: v as "time" | "activity" }))}
              className="justify-start"
            >
              <ToggleGroupItem value="time" className="text-xs">Time</ToggleGroupItem>
              <ToggleGroupItem value="activity" className="text-xs">Activity</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {form.type === "time" && (
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.trigger_time && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.trigger_time
                      ? format(new Date(form.trigger_time), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.trigger_time ? new Date(form.trigger_time) : undefined}
                    onSelect={(day) => {
                      if (!day) return;
                      const existing = form.trigger_time ? new Date(form.trigger_time) : new Date();
                      day.setHours(existing.getHours(), existing.getMinutes(), existing.getSeconds());
                      setForm((f) => ({ ...f, trigger_time: day.toISOString() }));
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {form.type === "time" && (
            <div className="space-y-1.5">
              <Label htmlFor="trigger_time_input">Time</Label>
              <Input
                id="trigger_time_input"
                type="time"
                value={
                  form.trigger_time
                    ? format(new Date(form.trigger_time), "HH:mm")
                    : ""
                }
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [h, m] = e.target.value.split(":").map(Number);
                  const existing = form.trigger_time ? new Date(form.trigger_time) : new Date();
                  existing.setHours(h, m, 0, 0);
                  setForm((f) => ({ ...f, trigger_time: existing.toISOString() }));
                }}
              />
            </div>
          )}

          {form.type === "activity" && (
            <div className="space-y-1.5">
              <Label htmlFor="trigger_context">Context</Label>
              <Input
                id="trigger_context"
                placeholder="e.g. after I finish eating"
                value={form.trigger_context || ""}
                onChange={(e) => setForm((f) => ({ ...f, trigger_context: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <ToggleGroup
              type="single"
              value={form.priority || "normal"}
              onValueChange={(v) => v && setForm((f) => ({ ...f, priority: v }))}
              className="justify-start"
            >
              <ToggleGroupItem value="normal" className="text-xs">Normal</ToggleGroupItem>
              <ToggleGroupItem value="high" className="text-xs">High</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {form.type === "time" && (
            <div className="space-y-1.5">
              <Label>Repeat</Label>
              <ToggleGroup
                type="single"
                value={form.recurrence || "once"}
                onValueChange={(v) => v && setForm((f) => ({ ...f, recurrence: v }))}
                className="justify-start"
              >
                <ToggleGroupItem value="once" className="text-xs">Once</ToggleGroupItem>
                <ToggleGroupItem value="daily" className="text-xs">Daily</ToggleGroupItem>
                <ToggleGroupItem value="weekly" className="text-xs">Weekly</ToggleGroupItem>
                <ToggleGroupItem value="custom" className="text-xs">Custom</ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button onClick={handleConfirm} disabled={!form.title.trim()}>Confirm</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ReminderConfirmDialog;
