import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { processWithAI, type AIResponse } from "@/api/ai";
import { createMemory, createReminder, updateReminderStatus } from "@/api/db";
import ReminderConfirmDialog, { type PendingReminder } from "@/components/ReminderConfirmDialog";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "Hi! I can help you save memories, set reminders, or give you a summary. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingReminder, setPendingReminder] = useState<PendingReminder | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const voice = useVoiceInput();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const aiResult: AIResponse = await processWithAI(text);

      if (aiResult.action === "save_memory" && aiResult.data?.content) {
        await createMemory({
          content: aiResult.data.content,
          category: aiResult.data.category,
          tags: aiResult.data.tags,
        });
        toast({ title: "Memory saved" });
      } else if (aiResult.action === "complete_reminder" && aiResult.data?.reminder_id) {
        await updateReminderStatus(aiResult.data.reminder_id, "done");
        toast({ title: "Reminder completed ✓" });
      } else if (aiResult.action === "create_reminder" && aiResult.data?.title) {
        setPendingReminder({
          title: aiResult.data.title,
          type: aiResult.data.type || "time",
          trigger_time: aiResult.data.trigger_time,
          trigger_context: aiResult.data.trigger_context,
          priority: aiResult.data.priority,
        });
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResult.spoken_reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReminder = async (edited: PendingReminder) => {
    try {
      await createReminder({
        title: edited.title,
        type: edited.type,
        trigger_time: edited.trigger_time,
        trigger_context: edited.trigger_context,
        priority: edited.priority,
      });
      toast({ title: "Reminder saved" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save error", description: e.message });
    } finally {
      setPendingReminder(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-1.5rem)]">
      <h1 className="font-display text-xl font-bold px-1 pb-3">Chat</h1>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-28 pr-1 scrollbar-thin">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i === 0 ? 0 : 0.05 }}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                : "mr-auto bg-card text-card-foreground border border-border rounded-bl-sm"
            )}
          >
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mr-auto flex items-center gap-2 rounded-2xl bg-card border border-border px-4 py-3 text-sm text-muted-foreground rounded-bl-sm shadow-sm"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-[4rem] left-0 right-0 z-30">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-2">
          <div className="flex items-center gap-2 rounded-2xl bg-card border border-border p-1.5 shadow-lg">
            {voice.voiceState === "listening" ? (
              <div className="flex-1 flex items-center gap-2 text-sm text-destructive animate-pulse px-3 py-2">
                <Mic className="h-4 w-4" />
                <span>{voice.partialTranscript || "Listening..."}</span>
              </div>
            ) : (
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                disabled={loading}
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 h-9"
              />
            )}
            <Button
              size="icon"
              variant={voice.voiceState === "listening" ? "destructive" : "ghost"}
              className="h-9 w-9 rounded-xl shrink-0"
              onClick={() => {
                if (voice.voiceState === "idle") {
                  voice.startListening();
                } else if (voice.voiceState === "listening") {
                  const text = voice.stopAndGetTranscript();
                  if (text) setInput(text);
                }
              }}
              disabled={loading || (voice.voiceState !== "idle" && voice.voiceState !== "listening")}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-xl shrink-0"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {pendingReminder && (
        <ReminderConfirmDialog
          open={!!pendingReminder}
          reminder={pendingReminder}
          onConfirm={handleConfirmReminder}
          onCancel={() => setPendingReminder(null)}
        />
      )}
    </div>
  );
};

export default ChatPage;
