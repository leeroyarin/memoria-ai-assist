import { motion, AnimatePresence } from "framer-motion";
import type { VoiceState } from "@/hooks/useVoiceInput";

const stateLabels: Record<VoiceState, string> = {
  idle: "",
  listening: "Listening...",
  processing: "Processing...",
  thinking: "AI is thinking...",
  speaking: "Speaking...",
  confirming: "",
};

interface VoiceOverlayProps {
  voiceState: VoiceState;
  partialTranscript: string;
  lastResponse: string;
  onStopListening: () => void;
}

const VoiceOverlay = ({ voiceState, partialTranscript, lastResponse, onStopListening }: VoiceOverlayProps) => {
  const isActive = voiceState !== "idle" && voiceState !== "confirming";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={voiceState === "listening" ? onStopListening : undefined}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="font-display text-lg font-semibold text-primary">
                {stateLabels[voiceState]}
              </p>
              {voiceState === "listening" && partialTranscript && (
                <p className="mt-2 text-sm text-muted-foreground italic max-w-xs">
                  "{partialTranscript}"
                </p>
              )}
              {voiceState === "speaking" && lastResponse && (
                <p className="mt-2 text-sm text-foreground max-w-xs">
                  {lastResponse}
                </p>
              )}
              {voiceState === "listening" && (
                <p className="mt-2 text-xs text-muted-foreground">Tap anywhere to stop</p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceOverlay;
