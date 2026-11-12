import type { Stream } from "@/lib/schema";
import type { StreamSort } from "@/types/stream";

export function canSeeStream(
  stream: Stream,
  userId: string,
  teacherId: string,
  now: Date = new Date(),
): boolean {
  const isTeacher = teacherId === userId;
  const isAudience =
    (stream.announceTo.includes(userId) && !stream.announceToAll) ||
    stream.announceToAll ||
    stream.userId === userId ||
    isTeacher;
  const isPublished =
    !stream.scheduledAt || new Date(stream.scheduledAt) < now || isTeacher;

  return isAudience && isPublished;
}

export function visibleStreams(
  streams: Stream[] | null | undefined,
  userId: string,
  teacherId: string,
  now: Date = new Date(),
): Stream[] {
  return (streams ?? []).filter((stream) =>
    canSeeStream(stream, userId, teacherId, now),
  );
}

export function filterStreamsByType(
  streams: Stream[],
  sort: StreamSort,
): Stream[] {
  return sort === "all" ? streams : streams.filter((s) => s.type === sort);
}

export function latestAssignedClasswork(
  streams: Stream[] | null | undefined,
  userId: string,
  teacherId: string,
  now: Date = new Date(),
): Stream | undefined {
  return visibleStreams(streams, userId, teacherId, now).find(
    (stream) => stream.type !== "stream" && stream.type !== "material",
  );
}

export function streamsForTopic(
  streams: Stream[] | null | undefined,
  topicId: string,
  userId: string,
  teacherId: string,
  now: Date = new Date(),
): Stream[] {
  return visibleStreams(streams, userId, teacherId, now).filter(
    (stream) => stream.topicId === topicId,
  );
}
