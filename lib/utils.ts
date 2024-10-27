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

export function handleFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);
  let firstName, lastName, middleName;

  if (nameParts.length === 1) {
    firstName = nameParts[0];
    lastName = "";
    middleName = "";
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
    middleName = "";
  } else {
    firstName = nameParts.slice(0, -2).join(" ");
    lastName = nameParts[nameParts.length - 1];
    middleName = nameParts[nameParts.length - 2];
  }

  return {
    firstName,
    middleName: middleName || "",
    lastName,
  };
}

export function capitalizeFirstLetter(str: string) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const generateClassCode = (): string =>
  Array.from(
    { length: 8 },
    () =>
      "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)],
  ).join("");

export function getLastRouteName(url: string) {
  const segments = url.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  return lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generatePassword(length: number = 8) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    (value) => charset[value % charset.length],
  ).join("");
}
