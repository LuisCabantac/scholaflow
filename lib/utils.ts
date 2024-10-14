import { Session } from "next-auth";
import { format, formatDistanceToNow } from "date-fns";
import { ISession } from "@/lib/auth";

export function hasUser(session: Session | null): session is ISession {
  return !!session?.user;
}

export function extractImagePath(url: string): string {
  const match = url.match(/\/([^\/]+)$/);
  return match ? match[1] : "";
}

export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export function formatDate(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();

  const differenceInDays =
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

  if (differenceInDays < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (differenceInDays < 2) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  } else if (differenceInDays < 7) {
    return format(date, "EEEE 'at' h:mm a");
  } else {
    return format(date, "MMMM d 'at' h:mm a");
  }
}
