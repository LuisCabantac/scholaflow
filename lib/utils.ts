import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow,
  isSameYear,
  isThisYear,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";

export function extractImagePath(url: string): string {
  const match = url.match(/\/([^\/]+)$/);
  return match ? match[1] : "";
}

export function extractCommentFilePath(url: string): string {
  const match = url.match(/\/comments\/(.+)/);
  return match![1];
}

export function extractNoteFilePath(url: string): string {
  const match = url.match(/\/notes\/(.+)/);
  return match![1];
}

export function extractAvatarFilePath(url: string): string {
  const match = url.match(/\/avatars\/(.+)/);
  return match![1];
}

export function extractStreamFilePath(url: string): string {
  const match = url.match(/\/streams\/(.+)/);
  return match![1];
}

export function extractClassworkFilePath(url: string): string {
  const match = url.match(/\/classworks\/(.+)/);
  return match![1];
}

export function extractMessagesFilePath(url: string): string {
  const match = url.match(/\/messages\/(.+)/);
  return match![1];
}

export function formatDueDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return `Due today, ${format(date, "h:mm a")}`;
  }

  if (isYesterday(date)) {
    return `Due yesterday, ${format(date, "h:mm a")}`;
  }

  const today = new Date();

  const formattedDate = isSameYear(date, today)
    ? format(date, "MMM d")
    : format(date, "MMM d, yyyy");

  const formattedTime = format(date, "h:mm a");

  return `Due ${formattedDate}, ${formattedTime}`;
}

export function arraysAreEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
}

export function removeUUIDFromFilename(filename: string): string {
  return filename.replace(
    /_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=\.\w+$)/,
    "",
  );
}

export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export function formatDate(createdAt: string | Date): string {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();

  const differenceInDays =
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  const differenceInYears = now.getFullYear() - date.getFullYear();

  if (differenceInDays < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (differenceInDays < 2) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  } else if (differenceInDays < 7) {
    return format(date, "EEEE 'at' h:mm a");
  } else if (differenceInYears < 1) {
    return format(date, "MMMM d 'at' h:mm a");
  } else {
    return format(date, "MMMM d, yyyy 'at' h:mm a");
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

export function formatTimeFromDate(date?: Date): string {
  if (!date) return "";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFileNameFromAttachments(url: string): string {
  const urlObject = new URL(url);
  const pathSegments = urlObject.pathname.split("/");
  return pathSegments[pathSegments.length - 1];
}

export function getClassUid(path: string): string | null {
  const segments = path.split("/");
  return segments.pop() || null;
}

export function extractFirstUuid(url: string): string | null {
  const uuidPattern =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = url.match(uuidPattern);

  return match ? match[0] : null;
}

export function extractStreamIdFromUrl(url: string): string | null {
  const streamIdPattern = /\/stream\/([^\/]+)/;
  const match = url.match(streamIdPattern);

  return match ? match[1] : null;
}

export function getFileExtension(url: string): string {
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match ? match[1] : "";
}

export function formatMessageDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? parseISO(dateString) : dateString;

  if (isToday(date)) {
    return format(date, "hh:mm a");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (isThisYear(date)) {
    return format(date, "MMM d");
  } else {
    return format(date, "MMM d, yyyy");
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
