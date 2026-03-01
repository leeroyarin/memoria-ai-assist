import { Brain, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemories } from "@/hooks/useMemories";
import { useState } from "react";
import { format } from "date-fns";
import AddMemoryDialog from "@/components/AddMemoryDialog";
import FloatingActions from "@/components/FloatingActions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import VoiceOverlay from "@/components/VoiceOverlay";
import ReminderConfirmDialog from "@/components/ReminderConfirmDialog";

const Memories = () => {
  const { data: memories, isLoading, remove } = useMemories();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const voice = useVoiceInput();

  const filtered = memories?.filter(
    (m: any) =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Memories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your digital brain</p>
      </div>

      <AddMemoryDialog open={addOpen} onOpenChange={setAddOpen} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search memories..." className="pl-10 rounded-xl bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((m: any, i: number) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {m.category && (
                        <span className="text-[11px] font-medium bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">{m.category}</span>
                      )}
                      {m.tags?.map((tag: string) => (
                        <span key={tag} className="text-[11px] bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                      <span className="text-[11px] text-muted-foreground ml-auto">{format(new Date(m.created_at), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => remove(m.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Brain className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-display font-semibold">No memories saved</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-[240px]">
              Tap the + button or use voice to save your first memory.
            </p>
          </CardContent>
        </Card>
      )}

      {voice.voiceState === "idle" && (
        <FloatingActions
          onManualAdd={() => setAddOpen(true)}
          onVoice={() => voice.startListening()}
        />
      )}

      <VoiceOverlay
        voiceState={voice.voiceState}
        partialTranscript={voice.partialTranscript}
        lastResponse={voice.lastResponse}
        onStopListening={voice.stopAndProcess}
        onCancel={voice.cancelVoice}
      />

      {voice.pendingReminder && (
        <ReminderConfirmDialog
          open={voice.voiceState === "confirming"}
          reminder={voice.pendingReminder}
          onConfirm={voice.confirmReminder}
          onCancel={voice.cancelReminder}
        />
      )}
    </motion.div>
  );
};

export default Memories;
