import { supabase } from "@/integrations/supabase/client";

export interface AIResponse {
  action: "save_memory" | "create_reminder" | "complete_reminder" | "summary" | "chat";
  data?: {
    content?: string;
    category?: string;
    tags?: string[];
    title?: string;
    type?: "time" | "activity";
    trigger_time?: string;
    trigger_context?: string;
    priority?: "normal" | "high";
    recurrence?: "once" | "daily" | "weekly" | "custom";
    reminder_id?: string;
  };
  spoken_reply: string;
}

export async function processWithAI(transcribedText: string): Promise<AIResponse> {
  const userLocalTime = new Date().toISOString();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, error } = await supabase.functions.invoke("ai-assistant", {
    body: { message: transcribedText, userLocalTime, userTimezone },
  });
  if (error) throw new Error(error.message || "AI processing failed");
  return data as AIResponse;
}
