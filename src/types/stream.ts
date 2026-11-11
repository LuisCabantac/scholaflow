import type { StreamType } from "@/lib/schema";

export type StreamSort =
  | "all"
  | "stream"
  | "assignment"
  | "quiz"
  | "question"
  | "material";

export type StreamFormType = "create" | "edit";

export type StreamFormFields = {
  classroomId: string;
  streamId: string | null;
  type: StreamType;
  title: string | null;
  content: string | null;
  topicId: string;
  dueDate: Date | null;
  scheduledAt: Date | null;
  points: number | null;
  acceptingSubmissions: boolean;
  closeSubmissionsAfterDueDate: boolean;
  isAssignToAll: boolean;
  announceTo: string[];
  links: string[];
  currentLinks: string[];
  currentAttachments: string[];
};

export type AttachmentLocation = "form" | "stream";

export type AttachmentFileKind = "curFile" | "newFile";

export type LinkSegment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; text: string };
