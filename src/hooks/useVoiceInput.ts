import { useState, useCallback } from "react";
import { useScribe, CommitStrategy } from "@elevenlabs/react";
import { getScribeToken, textToSpeech } from "@/api/voice";
import { processWithAI, type AIResponse } from "@/api/ai";
import { createMemory, createReminder } from "@/api/db";
import { useToast } from "@/hooks/use-toast";

export type VoiceState = "idle" | "listening" | "processing" | "thinking" | "speaking";

export function useVoiceInput() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [lastResponse, setLastResponse] = useState<string>("");
  const { toast } = useToast();

  const scribe = useScribe({
    modelId: "scribe_v2_realtime",
    commitStrategy: CommitStrategy.VAD,
    onCommittedTranscript: () => {}, // handled via stop flow
  });

  const startListening = useCallback(async () => {
    try {
      setVoiceState("listening");
      const token = await getScribeToken();
      await scribe.connect({
        token,
        microphone: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e: any) {
      setVoiceState("idle");
      toast({ variant: "destructive", title: "Mic error", description: e.message });
    }
  }, [scribe, toast]);

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
      } else if (aiResult.action === "create_reminder" && aiResult.data?.title) {
        await createReminder({
          title: aiResult.data.title,
          type: aiResult.data.type || "time",
          trigger_time: aiResult.data.trigger_time,
          trigger_context: aiResult.data.trigger_context,
          priority: aiResult.data.priority,
        });
      }

      setLastResponse(aiResult.spoken_reply);
      setVoiceState("speaking");

      try {
        await textToSpeech(aiResult.spoken_reply);
      } catch {
        // TTS failed, still show response
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Processing error", description: e.message });
    } finally {
      setVoiceState("idle");
    }
  }, [scribe, toast]);

  return {
    voiceState,
    lastResponse,
    startListening,
    stopAndProcess,
    partialTranscript: scribe.partialTranscript,
    isConnected: scribe.isConnected,
  };
}
