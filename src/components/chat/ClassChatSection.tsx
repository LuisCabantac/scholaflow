import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { Classroom } from "@/lib/schema";
import type { SessionUser } from "@/types/auth";
import { addMessageToChatFn } from "@/server/functions/message";
import { messageKeys, messageQueries } from "@/queries/message";
import { groupMessages, sortMessages } from "@/lib/chat-messages";

import ChatComposer from "@/components/chat/ChatComposer";
import ZoomedImage from "@/components/stream/ZoomedImage";
import ChatMessageItem from "@/components/chat/ChatMessageItem";

export default function ClassChatSection({
  classroom,
  user,
}: {
  classroom: Classroom;
  user: SessionUser;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("chat");

  const messagesEndRef = useRef<HTMLLIElement>(null);
  const [isLong, setIsLong] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const messagesKey = messageKeys.byClass(classroom.id);
  const { data: messages } = useSuspenseQuery({
    ...messageQueries.byClass(classroom.id),
    refetchInterval: 5000,
  });

  const rows = groupMessages(sortMessages(messages), user.id);

  const sendMessage = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addMessageToChatFn({ data: formData });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      toast.success(t("messages.sent"));
      queryClient.invalidateQueries({ queryKey: messagesKey });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    import("@/lib/supabase/chat-channel").then(({ subscribeToChatInserts }) => {
      if (!active) return;
      unsubscribe = subscribeToChatInserts(classroom.id, () => {
        queryClient.invalidateQueries({
          queryKey: messageKeys.byClass(classroom.id),
        });
      });
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [classroom.id, queryClient]);

  useEffect(() => {
    if (!messages?.length) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="relative">
      <div className="md:bg-card flex w-full flex-col rounded-md md:border md:p-4">
        <div className={`relative ${isLong ? "pb-40" : "pb-16"}`}>
          <ul className="flex h-[75dvh] flex-col gap-2 overflow-y-auto overscroll-contain rounded-md md:h-[75dvh]">
            {rows.length ? (
              rows.map((row) => (
                <ChatMessageItem
                  key={row.message.id}
                  row={row}
                  onZoom={setZoomedImage}
                />
              ))
            ) : (
              <li className="flex items-center justify-center">{t("empty")}</li>
            )}
            <li ref={messagesEndRef} className="h-0 w-0" />
          </ul>
          <ChatComposer
            classroomId={classroom.id}
            isPending={sendMessage.isPending}
            onSend={sendMessage.mutate}
            onLengthChange={(length) => setIsLong(length > 50)}
          />
        </div>
      </div>
      {zoomedImage && (
        <ZoomedImage src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </section>
  );
}
