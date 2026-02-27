import { Brain, Search, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemories } from "@/hooks/useMemories";
import { useState } from "react";
import { format } from "date-fns";
import AddMemoryDialog from "@/components/AddMemoryDialog";

const Memories = () => {
  const { data: memories, isLoading, remove } = useMemories();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = memories?.filter(
    (m: any) =>
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Memories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your digital brain</p>
        </div>
        <Button size="icon" onClick={() => setAddOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <AddMemoryDialog open={addOpen} onOpenChange={setAddOpen} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search memories..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((m: any) => (
            <Card key={m.id}>
              <CardContent className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{m.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {m.category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.category}</span>
                    )}
                    {m.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">{format(new Date(m.created_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(m.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="font-display font-semibold">No memories saved</p>
            <p className="mt-1 text-sm text-muted-foreground">Speak a note using the mic button to save your first memory.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default Memories;
