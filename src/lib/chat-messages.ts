import { format } from "date-fns";

import type { Chat } from "@/lib/schema";
import { getFileExtension } from "@/lib/utils";
import type {
  AttachmentSplit,
  MessageDateLabels,
  MessageRow,
} from "@/types/chat";

export const MAX_CHAT_ATTACHMENT_BYTES = 4 * 1024 * 1024;

const imageExtensions = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "avif",
  "svg",
  "ico",
]);

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sortMessages(messages: Chat[] | null | undefined): Chat[] {
  if (!messages) return [];

  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function groupMessages(
  messages: Chat[],
  sessionId: string,
): MessageRow[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];

    return {
      message,
      isOwn: message.userId === sessionId,
      showAvatar: !next || next.userId !== message.userId,
      startsGroup: !previous || previous.userId !== message.userId,
    };
  });
}

export function messageDateLabel(
  date: Date | string,
  now: Date,
  labels: MessageDateLabels,
): string {
  const value = new Date(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameDay(value, now)) return format(value, "hh:mm a");
  if (sameDay(value, yesterday)) return labels.yesterday;
  if (value.getFullYear() === now.getFullYear()) {
    return format(value, "MMM d");
  }

  return format(value, "MMM d, yyyy");
}

export function isImageAttachment(url: string): boolean {
  return imageExtensions.has(getFileExtension(url).toLowerCase());
}

export function splitBySize(files: File[], maxBytes: number): AttachmentSplit {
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    (file.size <= maxBytes ? accepted : rejected).push(file);
  }

  return { accepted, rejected };
}
