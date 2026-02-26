import { Brain, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Memories = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Memories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your digital brain</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search memories..." className="pl-10" />
      </div>

      {/* Empty state */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-display font-semibold">No memories saved</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Speak a note using the mic button to save your first memory.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Memories;
