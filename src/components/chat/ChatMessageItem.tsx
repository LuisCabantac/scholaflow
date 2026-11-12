import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import type { MessageRow } from "@/types/chat";
import { getFileNameFromAttachments } from "@/lib/utils";
import { isImageAttachment, messageDateLabel } from "@/lib/chat-messages";

import UserAvatar from "@/components/shared/UserAvatar";
import LinkifiedText from "@/components/stream/LinkifiedText";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";

export default function ChatMessageItem({
  row,
  onZoom,
}: {
  row: MessageRow;
  onZoom: (url: string) => void;
}) {
  const { t } = useTranslation("chat");

  const { message, isOwn, showAvatar, startsGroup } = row;
  const dateLabels = { yesterday: t("yesterday") };

  return (
    <li
      className={`${startsGroup ? "mt-4 mb-2" : ""} ${isOwn ? "self-end" : "self-start"} max-w-[85%] sm:max-w-[75%]`}
    >
      <div className="flex max-w-full items-end gap-2">
        {!isOwn && showAvatar ? (
          <UserAvatar
            src={message.userImage}
            alt={t("avatarAlt", { name: message.userName })}
            width={32}
            height={32}
            onDragStart={(e) => e.preventDefault()}
            className="mb-1 h-8 w-8 shrink-0 rounded-full object-contain"
          />
        ) : !isOwn ? (
          <div className="mb-1 h-8 w-8 shrink-0 rounded-full" />
        ) : null}
        <div className="min-w-0 flex-1">
          {!isOwn && startsGroup && (
            <p className="mb-1 text-xs font-semibold">{message.userName}</p>
          )}
          {message.message && (
            <div
              className={`overflow-hidden rounded-lg px-3 py-2 break-words whitespace-pre-line ${isOwn ? "bg-card md:bg-foreground/10" : "border"}`}
            >
              <p className="text-foreground/90 overflow-hidden break-words whitespace-pre-line">
                <LinkifiedText>{message.message}</LinkifiedText>
              </p>
              <ClientOnly fallback={<p className="mt-1 h-4 text-xs" />}>
                <p
                  className={`text-foreground/70 mt-1 text-xs font-medium text-nowrap select-none ${isOwn ? "text-left" : "text-right"}`}
                >
                  {messageDateLabel(message.createdAt, new Date(), dateLabels)}
                </p>
              </ClientOnly>
            </div>
          )}
          {message.attachments.map((attachment, index) =>
            isImageAttachment(attachment) ? (
              <button
                key={attachment}
                type="button"
                className="mt-2 block cursor-pointer"
                onClick={() => onZoom(attachment)}
                aria-label={t("zoomImage")}
              >
                <img
                  src={attachment}
                  alt={getFileNameFromAttachments(attachment)}
                  width={250}
                  height={250}
                  className="w-[10rem] rounded-xl object-cover md:w-[15rem]"
                  onDragStart={(e) => e.preventDefault()}
                />
              </button>
            ) : (
              <ul key={attachment} className="mt-2">
                <AttachmentFileCard
                  file={attachment}
                  index={index}
                  type="curFile"
                  location="stream"
                  isLoading={false}
                />
              </ul>
            ),
          )}
        </div>
      </div>
    </li>
  );
}
