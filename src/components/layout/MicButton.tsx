import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import VoiceOverlay from "@/components/VoiceOverlay";
import ReminderConfirmDialog from "@/components/ReminderConfirmDialog";
import { useLocation } from "react-router-dom";

const MicButton = () => {
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";
  const isMemoriesOrReminders = location.pathname === "/memories" || location.pathname === "/reminders";
  const {
    voiceState, lastResponse, startListening, stopAndProcess,
    partialTranscript, pendingReminder, confirmReminder, cancelReminder, cancelVoice,
  } = useVoiceInput();

  // On chat/memories/reminders pages, only render the reminder dialog from this instance
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

  const handleToggle = () => {
    if (voiceState === "idle") {
      startListening();
    } else if (voiceState === "listening") {
      stopAndProcess();
    }
  };

  return (
    <>
      <VoiceOverlay
        voiceState={voiceState}
        partialTranscript={partialTranscript}
        lastResponse={lastResponse}
        onStopListening={stopAndProcess}
        onCancel={cancelVoice}
      />

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
