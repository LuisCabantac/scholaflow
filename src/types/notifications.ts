import type { NotificationType } from "@/lib/schema";

export type NotificationSort = "all" | "unread";

export type NotificationTitleKey = NotificationType;

export type NotificationWhen =
  | { kind: "minutes"; minutes: number }
  | { kind: "hours"; hours: number }
  | { kind: "yesterday" }
  | { kind: "date"; date: string };
