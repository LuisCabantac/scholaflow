import { z } from "zod";

import {
  classTopicSchema,
  classroomSchema,
  enrolledClassSchema,
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

export const classroomResponse = classroomSchema;
export const enrolledClassResponse = enrolledClassSchema;
export const classTopicResponse = classTopicSchema;
export const myClassesResponse = z.object({
  taught: z.array(classroomSchema),
  enrolled: z.array(enrolledClassSchema),
});

export type CreateClassInput = z.infer<typeof createClassBody>;
export type UpdateClassInput = z.infer<typeof updateClassBody>;
