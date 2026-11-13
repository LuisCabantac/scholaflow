import type { Outcome } from "@/types/api";
import { uploadAttachments } from "@/services/storage";
import type { Actor } from "@/services/classroom-flows";
import { getClassTopicByTopicId } from "@/services/class-topic";
import { deleteStreamContent } from "@/services/classroom-flows";
import type { Classroom, ClassTopic, Stream } from "@/lib/schema";
import { deleteFilesFromBucket } from "@/services/user-management";
import { arraysAreEqual, extractStreamFilePath } from "@/lib/utils";
import { createStreamSchema, editStreamSchema } from "@/lib/schema";
import {
  keptAttachments,
  pathsInFolder,
  removedAttachments,
} from "@/lib/attachments";
import {
  canDeleteStream,
  canEditStream,
  canPostToClass,
} from "@/server/authorize/stream";
import {
  deleteAllNotificationsByResourceId,
  sendNotification,
} from "@/services/notification";
import type {
  StreamCreateInput,
  StreamPatch,
  StreamRef,
  StreamUpdateInput,
} from "@/types/stream";
import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  isClassMember,
} from "@/services/classroom";
import {
  createStreamPost,
  deleteClassStreamPost,
  getClassStreamByStreamId,
  updateStreamPost,
} from "@/services/stream";

const classMissing: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This class doesn't exist.",
};

const postMissing: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This post doesn't exist in this class.",
};

const invalidPost: Outcome<never> = {
  ok: false,
  code: "validation_failed",
  message:
    "Invalid post information provided. Please check all fields and try again.",
};

const invalidUpdate: Outcome<never> = {
  ok: false,
  code: "validation_failed",
  message:
    "Invalid update data provided. Please check all fields and try again.",
};

function conflict(message: string): Outcome<never> {
  return { ok: false, code: "conflict", message };
}

async function classTopic(
  topicId: string,
  classId: string,
): Promise<ClassTopic | null> {
  if (topicId === "no-topic") return null;
  const topic = await getClassTopicByTopicId(topicId);
  return topic && topic.classId === classId ? topic : null;
}

async function rosterUserIds(classId: string): Promise<string[]> {
  const enrolled = await getAllEnrolledClassesByClassId(classId);
  return enrolled?.map((entry) => entry.userId) ?? [];
}

async function audienceFor(
  classId: string,
  alsoAllowed: string[],
  isAssignToAll: boolean,
  announceTo: string[],
): Promise<string[] | null> {
  if (isAssignToAll) return rosterUserIds(classId);
  if (!announceTo.length) return announceTo;

  const members = new Set([...alsoAllowed, ...(await rosterUserIds(classId))]);
  return announceTo.every((id) => members.has(id)) ? announceTo : null;
}

async function uploadAll(classId: string, files: File[]): Promise<string[]> {
  const urls = await Promise.all(
    files.map((file) => uploadAttachments("streams", classId, file)),
  );
  return urls.filter((url): url is string => url !== null);
}

export function newStreamRecord(
  user: Actor,
  classroom: Classroom,
  input: StreamCreateInput,
  extras: {
    attachments: string[];
    topic: ClassTopic | null;
    announceTo: string[];
  },
) {
  return {
    type: input.type,
    classId: classroom.id,
    className: classroom.name,
    userId: user.id,
    userName: user.name,
    userImage: user.image as string,
    title: input.title,
    content: input.content,
    attachments: extras.attachments,
    links: input.links,
    points: input.points,
    dueDate: input.dueDate,
    topicId: extras.topic ? extras.topic.id : null,
    topicName: extras.topic ? extras.topic.name : null,
    announceToAll: input.isAssignToAll,
    announceTo: extras.announceTo,
    acceptingSubmissions: input.acceptingSubmissions,
    closeSubmissionsAfterDueDate: input.closeSubmissionsAfterDueDate,
    scheduledAt: input.scheduledAt,
  };
}

export function mergeStreamUpdate(
  current: Stream,
  patch: StreamPatch,
): StreamUpdateInput {
  return {
    title: patch.title === undefined ? current.title : patch.title,
    content: patch.content === undefined ? current.content : patch.content,
    topicId: patch.topicId ?? current.topicId ?? "no-topic",
    dueDate: patch.dueDate === undefined ? current.dueDate : patch.dueDate,
    scheduledAt:
      patch.scheduledAt === undefined ? current.scheduledAt : patch.scheduledAt,
    points: patch.points === undefined ? current.points : patch.points,
    acceptingSubmissions:
      patch.acceptingSubmissions ?? current.acceptingSubmissions,
    closeSubmissionsAfterDueDate:
      patch.closeSubmissionsAfterDueDate ??
      current.closeSubmissionsAfterDueDate,
    isAssignToAll: patch.isAssignToAll ?? current.announceToAll,
    announceTo: patch.announceTo ?? current.announceTo,
    links: patch.links ?? [],
    currentLinks: patch.currentLinks ?? current.links,
    currentAttachments: patch.currentAttachments ?? current.attachments,
    files: patch.files,
  };
}

export function streamChanges(
  current: Stream,
  input: StreamUpdateInput,
  announceTo: string[],
): boolean {
  return (
    input.title !== current.title ||
    input.content !== current.content ||
    input.points !== current.points ||
    input.dueDate?.getTime() !== current.dueDate?.getTime() ||
    input.topicId !== (current.topicId || "no-topic") ||
    input.isAssignToAll !== current.announceToAll ||
    input.scheduledAt?.getTime() !== current.scheduledAt?.getTime() ||
    input.acceptingSubmissions !== current.acceptingSubmissions ||
    input.closeSubmissionsAfterDueDate !==
      current.closeSubmissionsAfterDueDate ||
    input.files.length > 0 ||
    input.links.length > 0 ||
    !arraysAreEqual(input.currentAttachments, current.attachments ?? []) ||
    !arraysAreEqual(input.currentLinks, current.links ?? []) ||
    !arraysAreEqual(
      [...announceTo].sort(),
      [...(current.announceTo ?? [])].sort(),
    )
  );
}

export function streamUpdateRecord(
  current: Stream,
  input: StreamUpdateInput,
  extras: {
    uploaded: string[];
    topic: ClassTopic | null;
    announceTo: string[];
  },
) {
  return {
    title: input.title,
    content: input.content,
    attachments: extras.uploaded.concat(
      keptAttachments(current.attachments, input.currentAttachments),
    ),
    links: input.links.concat(input.currentLinks),
    points: input.points,
    dueDate: input.dueDate,
    topicId: extras.topic ? extras.topic.id : null,
    topicName: extras.topic ? extras.topic.name : null,
    announceToAll: input.isAssignToAll,
    announceTo: extras.announceTo,
    acceptingSubmissions: input.acceptingSubmissions,
    closeSubmissionsAfterDueDate: input.closeSubmissionsAfterDueDate,
    scheduledAt: input.scheduledAt,
    updatedAt: new Date(),
  };
}

export async function createStreamFlow(
  user: Actor,
  classId: string,
  input: StreamCreateInput,
): Promise<Outcome<Stream>> {
  const classroom = await getClassByClassId(classId);
  if (!classroom) return classMissing;

  const isMember =
    user.role !== "admin" && (await isClassMember(user.id, classId));
  const allowed = canPostToClass(classroom, user, isMember, input.type);
  if (!allowed.ok) return allowed;

  const topic = await classTopic(input.topicId, classId);
  const announceTo = await audienceFor(
    classId,
    [classroom.teacherId],
    input.isAssignToAll,
    input.announceTo,
  );
  if (!announceTo) return invalidPost;

  const result = createStreamSchema.safeParse(
    newStreamRecord(user, classroom, input, {
      attachments: [],
      topic,
      announceTo,
    }),
  );
  if (result.error) return invalidPost;

  const attachments = await uploadAll(classId, input.files);
  const data = await createStreamPost({ ...result.data, attachments });
  if (!data) return conflict("Failed to create post.");

  await sendNotification(
    data.type,
    announceTo,
    data.id,
    data.title ?? data.content ?? "",
    `/classroom/class/${data.classId}/stream/${data.id}`,
    user.name,
    user.image as string,
  );

  return { ok: true, value: data };
}

export async function updateStreamFlow(
  user: Actor,
  ref: StreamRef,
  patch: StreamPatch,
): Promise<Outcome<{ stream: Stream; changed: boolean }>> {
  const classroom = await getClassByClassId(ref.classId);
  if (!classroom) return classMissing;

  const current = await getClassStreamByStreamId(ref.streamId);
  if (!current) return postMissing;

  const allowed = canEditStream(current, user.id);
  if (!allowed.ok) return allowed;

  const input = mergeStreamUpdate(current, patch);
  const teacherIds =
    current.classId === classroom.id ? [classroom.teacherId] : [];
  const announceTo = await audienceFor(
    current.classId,
    [...teacherIds, ...current.announceTo],
    input.isAssignToAll,
    input.announceTo,
  );
  if (!announceTo) return invalidUpdate;

  const topic = await classTopic(input.topicId, current.classId);
  if (!streamChanges(current, input, announceTo)) {
    return { ok: true, value: { stream: current, changed: false } };
  }

  const result = editStreamSchema.safeParse(
    streamUpdateRecord(current, input, { uploaded: [], topic, announceTo }),
  );
  if (result.error) return invalidUpdate;

  const removed = pathsInFolder(
    removedAttachments(current.attachments, input.currentAttachments).map(
      extractStreamFilePath,
    ),
    current.classId,
  );
  if (removed.length) await deleteFilesFromBucket("streams", removed);

  const uploaded = await uploadAll(current.classId, input.files);
  const data = await updateStreamPost(ref.streamId, {
    ...result.data,
    attachments: uploaded.concat(result.data.attachments),
  });
  if (!data) return conflict("Failed to update post.");

  return { ok: true, value: { stream: data, changed: true } };
}

export async function deleteStreamFlow(
  user: Actor,
  ref: StreamRef,
): Promise<Outcome<void>> {
  const stream = await getClassStreamByStreamId(ref.streamId);
  if (!stream || stream.classId !== ref.classId) return postMissing;

  const classroom = await getClassByClassId(stream.classId);
  if (!classroom) return classMissing;

  const allowed = canDeleteStream(stream, classroom, user.id);
  if (!allowed.ok) return allowed;

  await deleteStreamContent(stream.id);

  if (stream.attachments?.length) {
    await deleteFilesFromBucket(
      "streams",
      stream.attachments.map((file) => extractStreamFilePath(file as string)),
    );
  }

  await deleteAllNotificationsByResourceId(stream.id);
  await deleteClassStreamPost(stream.id);

  return { ok: true, value: undefined };
}
