import { supabase } from "@/integrations/supabase/client";

// Memories
export async function fetchMemories() {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createMemory(memory: { content: string; category?: string; tags?: string[] }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("memories")
    .insert({ ...memory, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMemory(id: string) {
  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) throw error;
}

// Reminders
export async function fetchReminders(filter?: "time" | "activity") {
  let query = supabase.from("reminders").select("*").order("created_at", { ascending: false });
  if (filter) query = query.eq("type", filter);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createReminder(reminder: {
  title: string;
  type: "time" | "activity";
  trigger_time?: string;
  trigger_context?: string;
  priority?: string;
  recurrence?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("reminders")
    .insert({ ...reminder, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReminderStatus(id: string, status: "done" | "dismissed") {
  const { error } = await supabase.from("reminders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateReminder(id: string, fields: {
  title?: string;
  type?: string;
  trigger_time?: string;
  trigger_context?: string;
  priority?: string;
  recurrence?: string;
}) {
  const { error } = await supabase.from("reminders").update(fields).eq("id", id);
  if (error) throw error;
}

// Profile
export async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
}

// Counts
export async function fetchCounts() {
  const [memories, reminders] = await Promise.all([
    supabase.from("memories").select("id", { count: "exact", head: true }),
    supabase.from("reminders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    memories: memories.count ?? 0,
    reminders: reminders.count ?? 0,
  };
}
