import { Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useVoiceInput, type VoiceState } from "@/hooks/useVoiceInput";
import ReminderConfirmDialog from "@/components/ReminderConfirmDialog";
import { useLocation } from "react-router-dom";

const stateLabels: Record<VoiceState, string> = {
  idle: "",
  listening: "Listening...",
  processing: "Processing...",
  thinking: "AI is thinking...",
  speaking: "Speaking...",
  confirming: "",
};

const MicButton = () => {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";
  const isMemoriesOrReminders = location.pathname === "/memories" || location.pathname === "/reminders";
  const {
    voiceState, lastResponse, startListening, stopAndProcess,
    partialTranscript, pendingReminder, confirmReminder, cancelReminder,
  } = useVoiceInput();
  const isActive = voiceState !== "idle" && voiceState !== "confirming";

  const handleToggle = () => {
    if (voiceState === "idle") {
      startListening();
    } else if (voiceState === "listening") {
      stopAndProcess();
    }
  };

  if (isChatPage || isMemoriesOrReminders) {
    return pendingReminder ? (
      <ReminderConfirmDialog
        open={voiceState === "confirming"}
        reminder={pendingReminder}
        onConfirm={confirmReminder}
        onCancel={cancelReminder}
      />
    ) : null;
  }

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={voiceState === "listening" ? stopAndProcess : undefined}
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

      {pendingReminder && (
        <ReminderConfirmDialog
          open={voiceState === "confirming"}
          reminder={pendingReminder}
          onConfirm={confirmReminder}
          onCancel={cancelReminder}
        />
      )}

      <button
        onClick={handleToggle}
        disabled={voiceState !== "idle" && voiceState !== "listening"}
        className={cn(
          "fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.35)] transition-all active:scale-95 disabled:opacity-50",
          voiceState === "listening" && "animate-mic-pulse bg-destructive shadow-[0_4px_20px_hsl(var(--destructive)/0.4)]"
        )}
        aria-label={voiceState === "idle" ? "Start voice input" : "Stop listening"}
      >
        <Mic className="h-5 w-5" />
      </button>
    </>
  );
};

export default MicButton;
