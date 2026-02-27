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

const FloatingActions = ({ onManualAdd, onVoice, showVoice = true }: FloatingActionsProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: Plus, label: "Manual", onClick: () => { onManualAdd(); setOpen(false); } },
    ...(showVoice && onVoice
      ? [{ icon: Mic, label: "Voice", onClick: () => { onVoice(); setOpen(false); } }]
      : []),
    { icon: MessageCircle, label: "Chat", onClick: () => { navigate("/chat"); setOpen(false); } },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-[7.5rem] right-4 z-50 flex flex-col-reverse items-center gap-3">
        <AnimatePresence>
          {open &&
            actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.3, y: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={action.onClick}
                className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg pl-3 pr-4 py-2 text-xs font-medium"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </motion.button>
            ))}
        </AnimatePresence>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95",
            open && "rotate-45"
          )}
          style={{ transition: "transform 0.2s" }}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
};

export default FloatingActions;
