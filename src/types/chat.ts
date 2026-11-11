import type { Chat } from "@/lib/schema";

export type MessageRow = {
  message: Chat;
  isOwn: boolean;
  showAvatar: boolean;
  startsGroup: boolean;
};

export type MessageDateLabels = { yesterday: string };

export type AttachmentSplit = { accepted: File[]; rejected: File[] };
