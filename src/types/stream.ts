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

export type StreamRef = { classId: string; streamId: string };

export type StreamCreateInput = Omit<
  StreamFormFields,
  "classroomId" | "streamId" | "currentLinks" | "currentAttachments"
> & { files: File[] };

export type StreamUpdateInput = Omit<
  StreamFormFields,
  "classroomId" | "streamId" | "type"
> & { files: File[] };

export type StreamPatch = Partial<Omit<StreamUpdateInput, "files">> & {
  files: File[];
};

export type AttachmentLocation = "form" | "stream";

export type AttachmentFileKind = "curFile" | "newFile";

export type LinkSegment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; text: string };

export type WorkStatus = "graded" | "turnedIn" | "doneLate" | "missing" | null;

export type SubmitLabel = "turnIn" | "resubmit" | "markAsDone";

export type SubmissionCounts = {
  turnedIn: number;
  assigned: number;
  graded: number;
};

export type DueLabel = {
  kind: "today" | "yesterday" | "other";
  time: string;
  date: string;
};
