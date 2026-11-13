import { z } from "zod";

import {
  classTopicSchema,
  classroomSchema,
  enrolledClassSchema,
} from "@/lib/schema";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const createClassBody = z.object({
  name: z.string().trim().min(1),
  subject: z.string().trim().nullable().default(null),
  section: z.string().trim().default(""),
  room: z.string().trim().nullable().default(null),
  color: hexColor,
});

export const updateClassBody = z.object({
  name: z.string().trim().min(1),
  subject: z.string().trim().nullable().default(null),
  section: z.string().trim().default(""),
  description: z.string().trim().nullable().default(null),
  color: hexColor,
  allowUsersToComment: z.boolean(),
  allowUsersToPost: z.boolean(),
  regenerateCode: z.boolean().default(false),
});

export const joinClassBody = z.object({ code: z.string().trim().min(1) });
export const addMemberBody = z.object({ email: z.email() });
export const topicBody = z.object({ name: z.string().trim().min(1) });

export const classIdParams = z.object({ classId: z.uuidv4() });
export const topicIdParams = z.object({ topicId: z.uuidv4() });
export const enrollmentParams = classIdParams.extend({
  enrollmentId: z.uuidv4(),
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
