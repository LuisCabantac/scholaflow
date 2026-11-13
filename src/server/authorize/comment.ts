import type { Outcome } from "@/types/api";
import type { Classroom, Stream, StreamPrivateComment } from "@/lib/schema";

const allowed: Outcome<void> = { ok: true, value: undefined };

function forbidden(message: string): Outcome<never> {
  return { ok: false, code: "forbidden", message };
}

export function canComment(
  classroom: Classroom,
  userId: string,
  isEnrolled: boolean,
): Outcome<void> {
  const isTeacher = classroom.teacherId === userId;
  if (isTeacher || (isEnrolled && classroom.allowUsersToComment)) {
    return allowed;
  }
  return forbidden("You don't have permission to comment on this post.");
}

export function canPrivateComment(
  classroom: Classroom,
  stream: Stream,
  userId: string,
  isEnrolled: boolean,
): Outcome<void> {
  const isTeacher = classroom.teacherId === userId;
  if (!isTeacher && !isEnrolled) {
    return forbidden("You don't have permission to comment.");
  }
  if (
    !(stream.announceToAll || isTeacher || stream.announceTo.includes(userId))
  ) {
    return forbidden("You don't have permission to comment on this classwork.");
  }
  return allowed;
}

export function privateCommentRecipient(
  classroom: Classroom,
  userId: string,
  requested: string | null,
): string | null {
  return classroom.teacherId === userId ? requested : classroom.teacherId;
}

export function visiblePrivateComments(
  comments: StreamPrivateComment[],
  userId: string,
  teacherId: string,
): StreamPrivateComment[] {
  if (teacherId === userId) return comments;
  return comments.filter(
    (comment) => comment.userId === userId || comment.toUserId === userId,
  );
}

export function canDeleteComment(
  comment: { userId: string },
  classroom: Classroom,
  userId: string,
): Outcome<void> {
  if (comment.userId !== userId && classroom.teacherId !== userId) {
    return forbidden("You're not authorized to delete this comment.");
  }
  return allowed;
}
