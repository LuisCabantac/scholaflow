import { z } from "zod";

import { isWebUrl } from "@/lib/links";
import { announceToList } from "@/lib/stream-form";
import type { StreamCreateInput, StreamPatch } from "@/types/stream";
import {
  classTopicSchema,
  classroomSchema,
  enrolledClassSchema,
  streamCommentSchema,
  streamPrivateCommentSchema,
  streamSchema,
  streamType,
} from "@/lib/schema";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const blankToNull = (value: string | null | undefined) => value || null;

export const createClassBody = z.object({
  name: z.string().trim().min(1),
  subject: z.string().trim().nullable().default(null).transform(blankToNull),
  section: z.string().trim().default(""),
  room: z.string().trim().nullable().default(null).transform(blankToNull),
  color: hexColor,
});

export const updateClassBody = z.object({
  name: z.string().trim().min(1).optional(),
  subject: z.string().trim().nullable().optional(),
  section: z.string().trim().optional(),
  description: z.string().trim().nullable().optional(),
  color: hexColor.optional(),
  allowUsersToComment: z.boolean().optional(),
  allowUsersToPost: z.boolean().optional(),
  regenerateCode: z.boolean().optional(),
});

export const joinClassBody = z.object({ code: z.string().trim().min(1) });
export const addMemberBody = z.object({ email: z.email() });
export const topicBody = z.object({ name: z.string().trim().min(1) });

export const classIdParams = z.object({ classId: z.uuid() });
export const topicIdParams = z.object({ topicId: z.uuid() });
export const enrollmentParams = classIdParams.extend({
  enrollmentId: z.uuid(),
});
export const codeParams = z.object({ code: z.string().trim().min(1) });
export const streamIdParams = z.object({ streamId: z.uuid() });
export const commentParams = streamIdParams.extend({ commentId: z.uuid() });
export const classworkSearchQuery = z.object({
  q: z.string().trim().optional(),
});

export const STREAM_LIST_FIELDS = [
  "announceTo",
  "links",
  "curUrlLinks",
  "curAttachments",
] as const;

const formText = z.string().transform((value) => (value === "" ? null : value));
const formFlag = z
  .enum(["true", "false"])
  .transform((value) => value === "true");
const formDate = z.union([
  z.literal("").transform(() => null),
  z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
]);
const formPoints = z.union([
  z.literal("").transform(() => null),
  z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().max(2147483647)),
]);
const formTopic = z.union([
  z.enum(["", "no-topic"]).transform(() => "no-topic" as const),
  z.uuid(),
]);
const formAnnounceTo = z
  .array(z.string())
  .transform(announceToList)
  .pipe(z.array(z.string().min(1)));
const formLinks = z.array(z.string().refine(isWebUrl));
const formStrings = z.array(z.string().min(1));

const streamFormFields = {
  title: formText.optional(),
  description: formText.optional(),
  topicId: formTopic.optional(),
  dueDate: formDate.optional(),
  scheduledAt: formDate.optional(),
  points: formPoints.optional(),
  acceptingSubmissions: formFlag.optional(),
  closeSubmissionsAfterDueDate: formFlag.optional(),
  isAssignToAll: formFlag.optional(),
  announceTo: formAnnounceTo.optional(),
  links: formLinks.optional(),
};

export const createStreamForm = z
  .object({ type: streamType.optional(), ...streamFormFields })
  .transform(
    (form): Omit<StreamCreateInput, "files"> => ({
      type: form.type ?? "stream",
      title: form.title ?? null,
      content: form.description ?? null,
      topicId: form.topicId ?? "no-topic",
      dueDate: form.dueDate ?? null,
      scheduledAt: form.scheduledAt ?? null,
      points: form.points ?? null,
      acceptingSubmissions: form.acceptingSubmissions ?? false,
      closeSubmissionsAfterDueDate: form.closeSubmissionsAfterDueDate ?? false,
      isAssignToAll: form.isAssignToAll ?? form.announceTo === undefined,
      announceTo: form.announceTo ?? [],
      links: form.links ?? [],
    }),
  );

export const updateStreamForm = z
  .object({
    ...streamFormFields,
    curUrlLinks: formStrings.optional(),
    curAttachments: formStrings.optional(),
  })
  .transform(
    (form): Omit<StreamPatch, "files"> => ({
      title: form.title,
      content: form.description,
      topicId: form.topicId,
      dueDate: form.dueDate,
      scheduledAt: form.scheduledAt,
      points: form.points,
      acceptingSubmissions: form.acceptingSubmissions,
      closeSubmissionsAfterDueDate: form.closeSubmissionsAfterDueDate,
      isAssignToAll:
        form.isAssignToAll ??
        (form.announceTo === undefined ? undefined : false),
      announceTo: form.announceTo,
      links: form.links,
      currentLinks: form.curUrlLinks,
      currentAttachments: form.curAttachments,
    }),
  );

const commentFields = { comment: z.string().optional() };

export const commentForm = z
  .object(commentFields)
  .transform((form) => ({ content: form.comment || null }));

export const privateCommentForm = z
  .object({ ...commentFields, userId: z.string().optional() })
  .transform((form) => ({
    content: form.comment || null,
    recipientId: form.userId || null,
  }));

export const classroomResponse = classroomSchema;
export const enrolledClassResponse = enrolledClassSchema;
export const classTopicResponse = classTopicSchema;
export const streamResponse = streamSchema;
export const streamCommentResponse = streamCommentSchema;
export const privateCommentResponse = streamPrivateCommentSchema;
export const myClassesResponse = z.object({
  taught: z.array(classroomSchema),
  enrolled: z.array(enrolledClassSchema),
});

export type CreateClassInput = z.infer<typeof createClassBody>;
export type UpdateClassInput = z.infer<typeof updateClassBody>;
