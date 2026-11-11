import { format, isThisYear, isToday, isYesterday } from "date-fns";

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
