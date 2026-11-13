import type { Outcome } from "@/types/api";
import type { StreamRef } from "@/types/stream";
import { getClassStreamByStreamId } from "@/services/stream";
import { classroomForMember } from "@/server/authorize/classroom";
import type { Classroom, Stream, StreamType } from "@/lib/schema";
import { canSeeStream, visibleStreams } from "@/lib/stream-visibility";

const postMissing: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This post doesn't exist.",
};

const postMissingInClass: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This post doesn't exist in this class.",
};

const allowed: Outcome<void> = { ok: true, value: undefined };

function forbidden(message: string): Outcome<never> {
  return { ok: false, code: "forbidden", message };
}

export async function streamRef(streamId: string): Promise<Outcome<StreamRef>> {
  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return postMissingInClass;
  return { ok: true, value: { classId: stream.classId, streamId: stream.id } };
}

export async function streamForMember(
  userId: string,
  streamId: string,
): Promise<Outcome<{ stream: Stream; classroom: Classroom }>> {
  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return postMissing;

  const classroom = await classroomForMember(userId, stream.classId);
  if (!classroom.ok) return classroom;

  return { ok: true, value: { stream, classroom: classroom.value } };
}

export async function streamForViewer(
  userId: string,
  streamId: string,
): Promise<Outcome<{ stream: Stream; classroom: Classroom }>> {
  const found = await streamForMember(userId, streamId);
  if (!found.ok) return found;

  const { stream, classroom } = found.value;
  if (!canSeeStream(stream, userId, classroom.teacherId)) return postMissing;

  return found;
}

export async function visibleClassStreams(
  userId: string,
  classId: string,
  load: (classId: string) => Promise<Stream[] | null>,
): Promise<Outcome<Stream[]>> {
  const classroom = await classroomForMember(userId, classId);
  if (!classroom.ok) return classroom;

  return {
    ok: true,
    value: visibleStreams(
      await load(classId),
      userId,
      classroom.value.teacherId,
    ),
  };
}

export function canPostToClass(
  classroom: Classroom,
  user: { id: string; role: string },
  isMember: boolean,
  type: StreamType,
): Outcome<void> {
  if (user.role === "admin" || !isMember) {
    return forbidden("You can't create a post on this class.");
  }

  const isTeacher = classroom.teacherId === user.id;
  if (!isTeacher && !classroom.allowUsersToPost) {
    return forbidden("Students are not allowed to post to the class.");
  }
  if (!isTeacher && type !== "stream") {
    return forbidden("Only teachers can create this type of stream post.");
  }
  return allowed;
}

export function canEditStream(stream: Stream, userId: string): Outcome<void> {
  if (stream.userId !== userId) {
    return forbidden("Only the original author can edit this post.");
  }
  return allowed;
}

export function canDeleteStream(
  stream: Stream,
  classroom: Classroom,
  userId: string,
): Outcome<void> {
  if (stream.userId !== userId && classroom.teacherId !== userId) {
    return forbidden("You're not authorized to delete this post.");
  }
  return allowed;
}
