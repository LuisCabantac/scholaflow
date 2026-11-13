import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

  const listRef = useRef<HTMLUListElement>(null);
  const [isLong, setIsLong] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const messagesKey = messageKeys.byClass(classroom.id);
  const { data: messages } = useSuspenseQuery({
    ...messageQueries.byClass(classroom.id),
    refetchInterval: 5000,
  });

  const rows = groupMessages(sortMessages(messages), user.id);

  const lastMessage = rows.at(-1)?.message;
  const lastMessageId = lastMessage?.id;
  const lastMessageUserId = lastMessage?.userId;
  const seenLastMessageId = useRef<string | undefined>(undefined);
  const pinnedToBottom = useRef(true);

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
    const list = listRef.current;
    if (!list) return;

    const handleScroll = () => {
      pinnedToBottom.current =
        list.scrollHeight - list.scrollTop - list.clientHeight <= 80;
    };

    const handleLoad = () => {
      if (pinnedToBottom.current) list.scrollTop = list.scrollHeight;
    };

    list.addEventListener("scroll", handleScroll);
    list.addEventListener("load", handleLoad, true);
    return () => {
      list.removeEventListener("scroll", handleScroll);
      list.removeEventListener("load", handleLoad, true);
    };
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !lastMessageId) return;

    if (seenLastMessageId.current === undefined) {
      list.scrollTop = list.scrollHeight;
      seenLastMessageId.current = lastMessageId;
      return;
    }

    if (seenLastMessageId.current === lastMessageId) return;
    seenLastMessageId.current = lastMessageId;

    const distanceFromBottom =
      list.scrollHeight - list.scrollTop - list.clientHeight;
    const isOwn = lastMessageUserId === user.id;
    if (distanceFromBottom > 80 && !isOwn) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollTo({
      top: list.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [lastMessageId, lastMessageUserId, user.id]);

  return (
    <section className="relative">
      <div className="md:bg-card flex w-full flex-col rounded-md md:border md:p-4">
        <div className={`relative ${isLong ? "pb-40" : "pb-16"}`}>
          <ul
            ref={listRef}
            className="flex h-[75dvh] flex-col gap-2 overflow-y-auto overscroll-contain rounded-md md:h-[75dvh]"
          >
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
