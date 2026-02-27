import { useState } from "react";
import { Plus, Mic, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionsProps {
  onManualAdd: () => void;
  onVoice?: () => void;
  showVoice?: boolean;
}

const actionsMeta = [
  { key: "manual", icon: Plus, label: "Manual", color: "bg-accent text-accent-foreground" },
  { key: "voice", icon: Mic, label: "Voice", color: "bg-destructive/90 text-destructive-foreground" },
  { key: "chat", icon: MessageCircle, label: "Chat", color: "bg-secondary text-secondary-foreground" },
];

const FloatingActions = ({ onManualAdd, onVoice, showVoice = true }: FloatingActionsProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { ...actionsMeta[0], onClick: () => { onManualAdd(); setOpen(false); } },
    ...(showVoice && onVoice
      ? [{ ...actionsMeta[1], onClick: () => { onVoice(); setOpen(false); } }]
      : []),
    { ...actionsMeta[2], onClick: () => { navigate("/chat"); setOpen(false); } },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[7rem] right-5 z-50 flex flex-col-reverse items-end gap-2.5">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => (
              <motion.button
                key={action.key}
                initial={{ opacity: 0, scale: 0.4, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.4, y: 16 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 22 }}
                onClick={action.onClick}
                className={cn(
                  "flex items-center gap-2.5 rounded-full shadow-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-transform active:scale-95",
                  action.color
                )}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </motion.button>
            ))}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_24px_hsl(var(--primary)/0.4)] active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </>
  );
};

export default FloatingActions;
