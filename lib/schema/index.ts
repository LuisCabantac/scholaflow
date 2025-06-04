import { z } from "zod/v4";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.union([
    z.literal("student"),
    z.literal("teacher"),
    z.literal("admin"),
  ]),
  schoolName: z.nullable(z.string()),
});

export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.string(),
  schoolName: z.string().optional().nullable(),
});

export type Session = z.infer<typeof sessionSchema>;

export const verificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.email(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.nullable(z.date()),
});

export type Verification = z.infer<typeof verificationSchema>;

export const roleRequestSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userEmail: z.string(),
  userImage: z.string(),
  status: z.union([z.literal("pending"), z.literal("rejected")]),
  createdAt: z.date(),
});

export type RoleRequest = z.infer<typeof roleRequestSchema>;

export const classroomSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  subject: z.nullable(z.string()),
  section: z.string(),
  description: z.nullable(z.string()),
  room: z.nullable(z.string()),
  code: z.string(),
  cardBackground: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  teacherImage: z.string(),
  illustrationIndex: z.number(),
  allowUsersToComment: z.boolean(),
  allowUsersToPost: z.boolean(),
  createdAt: z.date(),
});

export type Classroom = z.infer<typeof classroomSchema>;

export const enrolledClassSchema = z.object({
  id: z.uuid(),
  classId: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  name: z.string(),
  subject: z.nullable(z.string()),
  section: z.string(),
  teacherName: z.string(),
  teacherImage: z.string(),
  cardBackground: z.string(),
  illustrationIndex: z.number(),
  createdAt: z.date(),
});

export type EnrolledClass = z.infer<typeof enrolledClassSchema>;

export const classworkSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  classId: z.uuid(),
  className: z.string(),
  streamId: z.uuid(),
  title: z.nullable(z.string()),
  attachments: z.array(z.string()),
  links: z.array(z.string()),
  points: z.nullable(z.number()),
  isGraded: z.boolean(),
  isReturned: z.boolean(),
  streamCreatedAt: z.date(),
  isTurnedIn: z.boolean(),
  turnedInDate: z.nullable(z.date()),
  createdAt: z.date(),
});

export type Classwork = z.infer<typeof classworkSchema>;

export const classTopicSchema = z.object({
  id: z.uuid(),
  classId: z.uuid(),
  name: z.string(),
  type: z.string(),
  createdAt: z.date(),
});

export type ClassTopic = z.infer<typeof classTopicSchema>;

export const streamSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  classId: z.uuid(),
  className: z.string(),
  title: z.nullable(z.string()),
  content: z.nullable(z.string()),
  type: z.union([
    z.literal("stream"),
    z.literal("assignment"),
    z.literal("quiz"),
    z.literal("question"),
    z.literal("material"),
  ]),
  attachments: z.array(z.string()),
  links: z.array(z.string()),
  points: z.nullable(z.number()),
  isPinned: z.boolean(),
  acceptingSubmissions: z.boolean(),
  closeSubmissionsAfterDueDate: z.boolean(),
  announceTo: z.array(z.string()),
  announceToAll: z.boolean(),
  topicId: z.nullable(z.uuid()),
  topicName: z.nullable(z.string()),
  dueDate: z.nullable(z.date()),
  createdAt: z.date(),
  updatedAt: z.nullable(z.date()),
  scheduledAt: z.nullable(z.date()),
});

export type Stream = z.infer<typeof streamSchema>;

export const streamCommentSchema = z.object({
  id: z.uuid(),
  streamId: z.uuid(),
  classId: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  content: z.nullable(z.string()),
  attachments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.nullable(z.date()),
});

export type StreamComment = z.infer<typeof streamCommentSchema>;

export const streamPrivateCommentSchema = z.object({
  id: z.uuid(),
  streamId: z.uuid(),
  classId: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  content: z.nullable(z.string()),
  attachments: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.nullable(z.date()),
  toUserId: z.uuid(),
});

export type StreamPrivateComment = z.infer<typeof streamPrivateCommentSchema>;

export const noteSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.nullable(z.string()),
  content: z.nullable(z.string()),
  attachments: z.array(z.string()),
  isPinned: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.nullable(z.date()),
});

export type Note = z.infer<typeof noteSchema>;

export const chatSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  userName: z.string(),
  userImage: z.string(),
  classId: z.uuid(),
  message: z.nullable(z.string()),
  attachments: z.array(z.string()),
  createdAt: z.date(),
});

export type Chat = z.infer<typeof chatSchema>;
