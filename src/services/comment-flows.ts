import type { Outcome } from "@/types/api";
import type { StreamRef } from "@/types/stream";
import { extractCommentFilePath } from "@/lib/utils";
import { canSeeStream } from "@/lib/stream-visibility";
import { uploadAttachments } from "@/services/storage";
import type { Actor } from "@/services/classroom-flows";
import { getClassStreamByStreamId } from "@/services/stream";
import { deleteFileFromBucket } from "@/services/user-management";
import type { CommentInput, PrivateCommentInput } from "@/types/comment";
import type { Stream, StreamComment, StreamPrivateComment } from "@/lib/schema";
import {
  createStreamCommentSchema,
  createStreamPrivateCommentSchema,
} from "@/lib/schema";
import {
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/services/classroom";
import {
  deleteAllNotificationsByResourceId,
  sendNotification,
} from "@/services/notification";
import {
  canComment,
  canDeleteComment,
  canPrivateComment,
  privateCommentRecipient,
} from "@/server/authorize/comment";
import {
  createPrivateComment,
  createStreamComment,
  deletePrivateCommentRecord,
  deleteStreamCommentRecord,
  getStreamCommentByCommentId,
  getStreamPrivateCommentByCommentId,
} from "@/services/comment";

const done: Outcome<void> = { ok: true, value: undefined };

function failure(
  code: "not_found" | "forbidden" | "validation_failed" | "conflict",
  message: string,
): Outcome<never> {
  return { ok: false, code, message };
}

const classMissing = failure("not_found", "This class doesn't exist.");
const postMissing = failure(
  "not_found",
  "This post doesn't exist in this class.",
);
const commentMissing = failure(
  "not_found",
  "This comment doesn't exist on this post.",
);

async function isEnrolled(userId: string, classId: string): Promise<boolean> {
  return Boolean(await getEnrolledClassByClassAndSessionId(userId, classId));
}

async function streamInClass(ref: StreamRef): Promise<Stream | null> {
  const stream = await getClassStreamByStreamId(ref.streamId);
  return stream && stream.classId === ref.classId ? stream : null;
}

async function uploadCommentFile(
  classId: string,
  file: File | null,
): Promise<string | null> {
  return file ? await uploadAttachments("comments", classId, file) : null;
}

function commentPreview(comment: {
  content: string | null;
  attachment: string | null;
}): string {
  return comment.content ?? (comment.attachment ? "Commented an image" : "");
}

async function removeCommentFile(attachment: string | null): Promise<void> {
  if (attachment) {
    await deleteFileFromBucket("comments", extractCommentFilePath(attachment));
  }
}

type StoredComment = {
  streamId: string;
  userId: string;
  attachment: string | null;
};

async function deletableComment<T extends StoredComment>(
  user: Actor,
  ref: StreamRef,
  commentId: string,
  load: (commentId: string) => Promise<T | null>,
): Promise<Outcome<T>> {
  const classroom = await getClassByClassId(ref.classId);
  if (!classroom) return classMissing;

  if (!(await streamInClass(ref))) return postMissing;

  const comment = await load(commentId);
  if (!comment || comment.streamId !== ref.streamId) return commentMissing;

  const allowed = canDeleteComment(comment, classroom, user.id);
  if (!allowed.ok) return allowed;

  return { ok: true, value: comment };
}

export async function addCommentFlow(
  user: Actor,
  ref: StreamRef,
  input: CommentInput,
): Promise<Outcome<StreamComment>> {
  const classroom = await getClassByClassId(ref.classId);
  if (!classroom) return classMissing;

  const allowed = canComment(
    classroom,
    user.id,
    await isEnrolled(user.id, ref.classId),
  );
  if (!allowed.ok) return allowed;

  const stream = await streamInClass(ref);
  if (!stream || !canSeeStream(stream, user.id, classroom.teacherId)) {
    return postMissing;
  }

  const result = createStreamCommentSchema.safeParse({
    streamId: ref.streamId,
    classId: ref.classId,
    userId: user.id,
    userName: user.name,
    userImage: user.image as string,
    content: input.content,
    attachment: null,
  });
  if (result.error) {
    return failure("validation_failed", "Invalid comment data provided.");
  }

  const attachment = await uploadCommentFile(ref.classId, input.file);
  const data = await createStreamComment({ ...result.data, attachment });
  if (!data) return failure("conflict", "Failed to save comment.");

  await sendNotification(
    "comment",
    classroom.teacherId,
    data.id,
    commentPreview(data),
    `/classroom/class/${data.classId}/stream/${data.streamId}?comment=${data.id}`,
    user.name,
    user.image as string,
  );

  return { ok: true, value: data };
}

export async function deleteCommentFlow(
  user: Actor,
  ref: StreamRef,
  commentId: string,
): Promise<Outcome<void>> {
  const outcome = await deletableComment(
    user,
    ref,
    commentId,
    getStreamCommentByCommentId,
  );
  if (!outcome.ok) return outcome;

  await removeCommentFile(outcome.value.attachment);
  const data = await deleteStreamCommentRecord(commentId, ref.streamId);
  if (data) await deleteAllNotificationsByResourceId(data.id);

  return done;
}

export async function addPrivateCommentFlow(
  user: Actor,
  ref: StreamRef,
  input: PrivateCommentInput,
): Promise<Outcome<StreamPrivateComment>> {
  const classroom = await getClassByClassId(ref.classId);
  if (!classroom) return classMissing;

  const enrolled = await isEnrolled(user.id, ref.classId);
  const isTeacher = classroom.teacherId === user.id;
  if (!isTeacher && !enrolled) {
    return failure("forbidden", "You don't have permission to comment.");
  }

  const stream = await streamInClass(ref);
  if (!stream) return failure("not_found", "This stream doesn't exist.");

  const allowed = canPrivateComment(classroom, stream, user.id, enrolled);
  if (!allowed.ok) return allowed;

  const toUserId = privateCommentRecipient(
    classroom,
    user.id,
    input.recipientId,
  );
  if (isTeacher && toUserId && !(await isEnrolled(toUserId, ref.classId))) {
    return failure("not_found", "This user is not in this class.");
  }

  const result = createStreamPrivateCommentSchema.safeParse({
    streamId: ref.streamId,
    classId: ref.classId,
    userId: user.id,
    userName: user.name,
    userImage: user.image as string,
    content: input.content,
    attachment: null,
    toUserId,
  });
  if (result.error) {
    return failure(
      "validation_failed",
      "Invalid private comment data provided.",
    );
  }

  const attachment = await uploadCommentFile(ref.classId, input.file);
  const data = await createPrivateComment({ ...result.data, attachment });
  if (!data) return failure("conflict", "Failed to save private comment.");

  await sendNotification(
    "comment",
    data.toUserId,
    data.id,
    commentPreview(data),
    `/classroom/class/${data.classId}/stream/${data.streamId}/submissions?name=${data.userName.toLowerCase().replace(/\s+/g, "-")}&user=${data.userId}&comment=${data.id}`,
    user.name,
    user.image as string,
  );

  return { ok: true, value: data };
}

export async function deletePrivateCommentFlow(
  user: Actor,
  ref: StreamRef,
  commentId: string,
): Promise<Outcome<void>> {
  const outcome = await deletableComment(
    user,
    ref,
    commentId,
    getStreamPrivateCommentByCommentId,
  );
  if (!outcome.ok) return outcome;

  await removeCommentFile(outcome.value.attachment);
  const data = await deletePrivateCommentRecord(commentId, ref.streamId);
  if (!data)
    return failure("conflict", "Failed to delete the private comment.");

  await deleteAllNotificationsByResourceId(data.id);
  return done;
}
