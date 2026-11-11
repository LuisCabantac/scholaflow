import { isValid, parseISO } from "date-fns";

import { streamType } from "@/lib/schema";
import type { StreamFormFields } from "@/types/stream";

function text(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value !== "" ? value : null;
}

function list(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter(
      (value): value is string => typeof value === "string" && value !== "",
    );
}

function isoDate(formData: FormData, key: string): Date | null {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function flag(formData: FormData, key: string): boolean {
  return formData.get(key) === "true";
}

function announceTo(formData: FormData): string[] {
  const entries = list(formData, "announceTo");
  if (entries.length === 1 && entries[0]?.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(entries[0]);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  }
  return entries;
}

export function readStreamFormFields(formData: FormData): StreamFormFields {
  const typeResult = streamType.safeParse(text(formData, "type"));
  const points = text(formData, "points");

  return {
    classroomId: text(formData, "classroomId") ?? "",
    streamId: text(formData, "streamId"),
    type: typeResult.success ? typeResult.data : "stream",
    title: text(formData, "title"),
    content: text(formData, "description"),
    topicId: text(formData, "topicId") ?? "no-topic",
    dueDate: isoDate(formData, "dueDate"),
    scheduledAt: isoDate(formData, "scheduledAt"),
    points: points ? Number(points) : null,
    acceptingSubmissions: flag(formData, "acceptingSubmissions"),
    closeSubmissionsAfterDueDate: flag(
      formData,
      "closeSubmissionsAfterDueDate",
    ),
    isAssignToAll: flag(formData, "isAssignToAll"),
    announceTo: announceTo(formData),
    links: list(formData, "links"),
    currentLinks: list(formData, "curUrlLinks"),
    currentAttachments: list(formData, "curAttachments"),
  };
}
