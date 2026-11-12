import { createClient } from "@/lib/supabase/client";

export function subscribeToChatInserts(classId: string, onInsert: () => void) {
  const supabase = createClient();
  const channel = supabase
    .channel(`chat-${classId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat",
        filter: `class_id=eq.${classId}`,
      },
      onInsert,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
