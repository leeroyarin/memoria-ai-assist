import { useState, useCallback } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { getScribeToken, textToSpeech } from "@/api/voice";
import { processWithAI, type AIResponse } from "@/api/ai";
import { createMemory, createReminder, updateReminderStatus } from "@/api/db";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errors";
import type { PendingReminder } from "@/components/ReminderConfirmDialog";

export type VoiceState = "idle" | "listening" | "processing" | "thinking" | "speaking" | "confirming";

export function useVoiceInput() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [pendingReminder, setPendingReminder] = useState<PendingReminder | null>(null);
  const { toast } = useToast();

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    languageCode: "eng",
    commitStrategy: CommitStrategy.VAD,
    onCommittedTranscript: () => {},
  });

  const startListening = useCallback(async () => {
    if (scribe.isConnected) return; // Prevent duplicate connections
    try {
      setVoiceState("listening");
      const token = await getScribeToken();
      await scribe.connect({
        token,
        microphone: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e: any) {
      setVoiceState("idle");
      toast({ variant: "destructive", title: "Mic error", description: getUserFriendlyError(e) });
    }
  }, [scribe, toast]);

  const stopAndGetTranscript = useCallback((): string => {
    const transcripts = scribe.committedTranscripts.map((t) => t.text).join(" ");
    const partial = scribe.partialTranscript;
    const fullText = [transcripts, partial].filter(Boolean).join(" ").trim();
    scribe.disconnect();
    setVoiceState("idle");
    return fullText;
  }, [scribe]);

  const stopAndProcess = useCallback(async () => {
    const transcripts = scribe.committedTranscripts.map((t) => t.text).join(" ");
    const partial = scribe.partialTranscript;
    const fullText = [transcripts, partial].filter(Boolean).join(" ").trim();
    scribe.disconnect();

    if (!fullText) {
      setVoiceState("idle");
      return;
    }

    try {
      setVoiceState("thinking");
      const aiResult: AIResponse = await processWithAI(fullText);

      // Execute action
      if (aiResult.action === "save_memory" && aiResult.data?.content) {
        await createMemory({
          content: aiResult.data.content,
          category: aiResult.data.category,
          tags: aiResult.data.tags,
        });
      } else if (aiResult.action === "complete_reminder" && aiResult.data?.reminder_id) {
        await updateReminderStatus(aiResult.data.reminder_id, "done");
        toast({ title: "Reminder completed ✓" });
      } else if (aiResult.action === "create_reminder" && aiResult.data?.title) {
        // Store pending reminder instead of saving directly
        setPendingReminder({
          title: aiResult.data.title,
          type: aiResult.data.type || "time",
          trigger_time: aiResult.data.trigger_time,
          trigger_context: aiResult.data.trigger_context,
          priority: aiResult.data.priority,
          recurrence: aiResult.data.recurrence || "once",
        });
      }

      setLastResponse(aiResult.spoken_reply);
      setVoiceState("speaking");

      try {
        await textToSpeech(aiResult.spoken_reply);
      } catch {
        // TTS failed, still show response
      }

      // If there's a pending reminder, show confirmation dialog
      if (aiResult.action === "create_reminder" && aiResult.data?.title) {
        setVoiceState("confirming");
        return; // Don't go to idle yet
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Processing error", description: getUserFriendlyError(e) });
    } finally {
      if (voiceState !== "confirming") {
        setVoiceState((prev) => (prev === "confirming" ? prev : "idle"));
      }
    }
  }, [scribe, toast]);

  const confirmReminder = useCallback(async (edited: PendingReminder) => {
    try {
      await createReminder({
        title: edited.title,
        type: edited.type,
        trigger_time: edited.trigger_time,
        trigger_context: edited.trigger_context,
        priority: edited.priority,
        recurrence: edited.recurrence,
      });
      toast({ title: "Reminder saved" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Save error", description: getUserFriendlyError(e) });
    } finally {
      setPendingReminder(null);
      setVoiceState("idle");
    }
  }, [toast]);

  const cancelReminder = useCallback(() => {
    setPendingReminder(null);
    setVoiceState("idle");
  }, []);

  const cancelVoice = useCallback(() => {
    scribe.disconnect();
    setPendingReminder(null);
    setVoiceState("idle");
  }, [scribe]);

  return {
    voiceState,
    lastResponse,
    startListening,
    stopAndProcess,
    stopAndGetTranscript,
    partialTranscript: scribe.partialTranscript,
    isConnected: scribe.isConnected,
    pendingReminder,
    confirmReminder,
    cancelReminder,
    cancelVoice,
  };
}
