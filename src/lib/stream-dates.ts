import { format, isThisYear, isToday, isYesterday } from "date-fns";

import type { DueLabel } from "@/types/stream";

export function relativeDay(
  date: Date | string,
  labels: { today: string; yesterday: string },
): string {
  if (isToday(date)) return labels.today;
  if (isYesterday(date)) return labels.yesterday;
  return format(date, "MMM d");
}

export function longDateTime(date: Date | string): string {
  const year = isThisYear(date) ? "" : `${format(date, "y ")}`;
  return `${format(date, "MMM d,")} ${year} ${format(date, "h:mm a")}`;
}

export function timeOfDay(date: Date | string): string {
  return format(date, "h:mm a");
}

export function dueLabel(
  date: Date | string,
  now: Date = new Date(),
): DueLabel {
  const due = new Date(date);
  const sameDay = (other: Date) =>
    due.getFullYear() === other.getFullYear() &&
    due.getMonth() === other.getMonth() &&
    due.getDate() === other.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const kind = sameDay(now)
    ? "today"
    : sameDay(yesterday)
      ? "yesterday"
      : "other";

  return { kind, time: timeOfDay(due), date: longDateTime(due) };
}
