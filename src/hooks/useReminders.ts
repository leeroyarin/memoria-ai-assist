import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReminders, updateReminderStatus } from "@/api/db";
import { useAuthContext } from "@/contexts/AuthContext";

export function useReminders(filter?: "time" | "activity") {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reminders", filter],
    queryFn: () => fetchReminders(filter),
    enabled: !!user,
  });

  const markStatus = async (id: string, status: "done" | "dismissed") => {
    await updateReminderStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["reminders"] });
  };

  return { ...query, markStatus, invalidate: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }) };
}
