import { differenceInMinutes, format, isSameDay, subDays } from "date-fns";

import type { Notification, NotificationType } from "@/lib/schema";
import type {
  NotificationSort,
  NotificationTitleKey,
  NotificationWhen,
} from "@/types/notifications";

const titleKeys: Record<NotificationType, NotificationTitleKey> = {
  stream: "stream",
  assignment: "assignment",
  quiz: "quiz",
  question: "question",
  material: "material",
  comment: "comment",
  join: "join",
  addToClass: "addToClass",
  submit: "submit",
  grade: "grade",
};

export function notificationTitleKey(
  type: NotificationType,
): NotificationTitleKey {
  return titleKeys[type];
}

export function notificationWhen(
  createdAt: Date | string,
  now: Date = new Date(),
): NotificationWhen {
  const date = new Date(createdAt);

  if (isSameDay(date, now)) {
    const minutes = Math.max(differenceInMinutes(now, date), 0);
    if (minutes >= 60)
      return { kind: "hours", hours: Math.floor(minutes / 60) };
    return { kind: "minutes", minutes };
  }
  if (isSameDay(date, subDays(now, 1))) return { kind: "yesterday" };

  return { kind: "date", date: format(date, "MMM d") };
}

export function filterNotifications(
  notifications: Notification[] | null | undefined,
  sort: NotificationSort,
): Notification[] {
  const list = notifications ?? [];

  return sort === "unread" ? list.filter((item) => !item.isRead) : list;
}

export function hasUnread(
  notifications: Notification[] | null | undefined,
): boolean {
  return (notifications ?? []).some((item) => !item.isRead);
}
