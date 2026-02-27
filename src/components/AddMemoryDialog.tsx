import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMemory } from "@/api/db";
import { addToOfflineQueue } from "@/hooks/useOfflineSync";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Finance", "Other"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMemoryDialog({ open, onOpenChange }: Props) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const reset = () => { setContent(""); setCategory(""); setTagsInput(""); };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const data = { content: content.trim(), category: category || undefined, tags: tags.length ? tags : undefined };

    try {
      await createMemory(data);
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      toast({ title: "Memory saved" });
      reset();
      onOpenChange(false);
    } catch {
      addToOfflineQueue({ type: "memory", data });
      toast({ title: "Saved offline", description: "Will sync when you're back online." });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Memory</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea placeholder="What do you want to remember?" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input placeholder="tag1, tag2, tag3" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={!content.trim() || saving}>
            {saving ? "Saving..." : "Save Memory"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
