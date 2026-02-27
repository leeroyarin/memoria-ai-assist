import { useEffect } from "react";
import { createMemory, createReminder } from "@/api/db";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const QUEUE_KEY = "offline_queue";

interface QueueItem {
  type: "memory" | "reminder";
  data: any;
  timestamp: number;
}

export function getOfflineQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: Omit<QueueItem, "timestamp">) {
  const queue = getOfflineQueue();
  queue.push({ ...item, timestamp: Date.now() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function useOfflineSync() {
  const queryClient = useQueryClient();

  const flushQueue = async () => {
    const queue = getOfflineQueue();
    if (!queue.length) return;

    let synced = 0;
    const failed: QueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.type === "memory") {
          await createMemory(item.data);
        } else {
          await createReminder(item.data);
        }
        synced++;
      } catch {
        failed.push(item);
      }
    }

    if (failed.length) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(failed));
    } else {
      clearOfflineQueue();
    }

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: `Synced ${synced} offline item${synced > 1 ? "s" : ""}` });
    }
  };

  useEffect(() => {
    // Try flushing on mount
    if (navigator.onLine) flushQueue();

    const handleOnline = () => flushQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);
}
