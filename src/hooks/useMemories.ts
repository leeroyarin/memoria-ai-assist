import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMemories, deleteMemory } from "@/api/db";
import { useAuthContext } from "@/contexts/AuthContext";

export function useMemories() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["memories"],
    queryFn: fetchMemories,
    enabled: !!user,
  });

  const remove = async (id: string) => {
    await deleteMemory(id);
    queryClient.invalidateQueries({ queryKey: ["memories"] });
  };

  return { ...query, remove, invalidate: () => queryClient.invalidateQueries({ queryKey: ["memories"] }) };
}
