import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.slice(0, 5000) : "";
    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const history = Array.isArray(body.history)
      ? body.history.slice(0, 50).map((h: any) => ({ role: h.role === "user" ? "user" : "assistant", content: typeof h.content === "string" ? h.content.slice(0, 5000) : "" }))
      : [];
    const userLocalTime = typeof body.userLocalTime === "string" ? body.userLocalTime.slice(0, 100) : undefined;
    const userTimezone = typeof body.userTimezone === "string" ? body.userTimezone.slice(0, 100) : undefined;

    // Fetch user context
    const [memoriesRes, remindersRes] = await Promise.all([
      supabase.from("memories").select("content, category, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("reminders").select("id, title, type, trigger_time, trigger_context, status, priority").eq("user_id", userId).eq("status", "pending").order("created_at", { ascending: false }).limit(20),
    ]);

    const memories = memoriesRes.data || [];
    const reminders = remindersRes.data || [];

    const localTimeStr = userLocalTime || new Date().toISOString();
    const timezoneStr = userTimezone || "UTC";

    const systemPrompt = `You are a voice-activated memory and reminder assistant. The user speaks to you via voice.

The user's current local date/time: ${localTimeStr}
The user's timezone: ${timezoneStr}

IMPORTANT: All relative time references the user makes (e.g. "today", "yesterday", "this morning", "last night", "tomorrow") MUST be interpreted relative to their local date/time and timezone shown above, NOT UTC. When saving memories, include the actual date/time the event occurred based on the user's local time. When creating reminders with times, convert to the correct absolute time respecting their timezone.

User's recent memories:
${memories.length ? memories.map(m => `- [${m.category || 'uncategorized'}] ${m.content} (saved: ${m.created_at})`).join("\n") : "None yet."}

User's pending reminders:
${reminders.length ? reminders.map(r => `- [id:${r.id}] [${r.type}/${r.priority}] ${r.title}${r.trigger_time ? ` (at ${r.trigger_time})` : ""}${r.trigger_context ? ` (after: ${r.trigger_context})` : ""}`).join("\n") : "None yet."}

Analyze the user's message and respond using the suggest_action tool. Determine the intent:
- "save_memory": user wants to remember/note something. Include temporal context (when the event happened) in the content based on their local time.
- "create_reminder": user wants to be reminded about something
- "complete_reminder": user says they finished/completed a task that matches a pending reminder
- "summary": user asks "am I forgetting anything?" or wants an overview
- "chat": general conversation or question

For save_memory, extract content (include when the event happened relative to user's local time), suggest a category (Personal/Work/Shopping/Health/Finance/Other), and relevant tags.
For create_reminder, extract title, determine if time-based or activity-based, extract trigger_time (ISO format in user's timezone) or trigger_context, and priority.
For complete_reminder, match the user's statement against pending reminders and return the reminder_id of the matching one.
For summary, analyze their memories and reminders and provide a helpful spoken overview.
Always provide a natural, concise spoken_reply (1-2 sentences) suitable for text-to-speech.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_action",
              description: "Determine the user's intent and provide structured response",
              parameters: {
                type: "object",
                properties: {
                  action: { type: "string", enum: ["save_memory", "create_reminder", "complete_reminder", "summary", "chat"] },
                  data: {
                    type: "object",
                    properties: {
                      content: { type: "string" },
                      category: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      title: { type: "string" },
                      type: { type: "string", enum: ["time", "activity"] },
                      trigger_time: { type: "string" },
                      trigger_context: { type: "string" },
                      priority: { type: "string", enum: ["normal", "high"] },
                      reminder_id: { type: "string", description: "The id of the reminder to mark as done" },
                    },
                  },
                  spoken_reply: { type: "string" },
                },
                required: ["action", "spoken_reply"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_action" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      throw new Error(`AI gateway error [${response.status}]: ${t}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
