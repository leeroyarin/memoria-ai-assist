import { Mic, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionsProps {
  onManualAdd: () => void;
  onVoice?: () => void;
  showVoice?: boolean;
}

const FloatingActions = ({ onManualAdd, onVoice, showVoice = true }: FloatingActionsProps) => {
  return (
    <div className="fixed bottom-[4.5rem] left-0 right-0 z-50 px-4 pb-2">
      <div className="flex gap-3">
        {showVoice && onVoice && (
          <Button
            onClick={onVoice}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold tracking-wide text-sm gap-2 shadow-[0_4px_20px_hsl(var(--primary)/0.3)]"
          >
            <Mic className="h-4 w-4" />
            VOICE
          </Button>
        )}
        <Button
          onClick={onManualAdd}
          variant="outline"
          className="flex-1 h-12 rounded-xl font-semibold tracking-wide text-sm gap-2 border-border"
        >
          <PenLine className="h-4 w-4" />
          MANUAL
        </Button>
      </div>
    </div>
  );
};

export default FloatingActions;
