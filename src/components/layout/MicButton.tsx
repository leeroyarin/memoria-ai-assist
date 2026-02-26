import { Mic } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MicButton = () => {
  const [isListening, setIsListening] = useState(false);

  const handleToggle = () => {
    setIsListening((prev) => !prev);
    // TODO: Hook into voice input system
  };

  return (
    <>
      {/* Overlay when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={handleToggle}
          >
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <p className="font-display text-lg font-semibold text-primary">
                  Listening...
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap anywhere to stop
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating mic button */}
      <button
        onClick={handleToggle}
        className={cn(
          "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95",
          isListening && "animate-mic-pulse bg-destructive"
        )}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        <Mic className="h-6 w-6" />
      </button>
    </>
  );
};

export default MicButton;
