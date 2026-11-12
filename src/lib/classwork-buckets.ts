import type { Classwork, EnrolledClass, Stream } from "@/lib/schema";

function dayValue(value: Date | string | null | undefined): number {
  const date = new Date(value ?? 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function sortByDayDesc<T>(
  items: T[],
  pick: (item: T) => Date | string | null | undefined,
): T[] {
  return [...items].sort((a, b) => dayValue(pick(b)) - dayValue(pick(a)));
}

function isVisibleTo(stream: Stream, userId: string): boolean {
  return stream.announceToAll || stream.announceTo.includes(userId);
}

function isPublished(stream: Stream, now: Date): boolean {
  return !stream.scheduledAt || new Date(stream.scheduledAt) < now;
}

export function assignedClassworks(
  streams: Stream[] | null | undefined,
  classworks: Classwork[] | null | undefined,
  userId: string,
  now: Date = new Date(),
): Stream[] {
  const submittedStreamIds = new Set(classworks?.map((work) => work.streamId));

  const assigned = (streams ?? []).filter(
    (stream) =>
      !submittedStreamIds.has(stream.id) &&
      (!stream.dueDate || new Date(stream.dueDate) > now) &&
      isVisibleTo(stream, userId) &&
      isPublished(stream, now),
  );

  return sortByDayDesc(assigned, (stream) => stream.createdAt);
}

export function missingClassworks(
  streams: Stream[] | null | undefined,
  classworks: Classwork[] | null | undefined,
  userId: string,
  now: Date = new Date(),
): Stream[] {
  const turnedInStreamIds = new Set(
    classworks?.filter((work) => work.isTurnedIn).map((work) => work.streamId),
  );

  const missing = (streams ?? []).filter(
    (stream) =>
      !turnedInStreamIds.has(stream.id) &&
      !!stream.dueDate &&
      new Date(stream.dueDate) < now &&
      isVisibleTo(stream, userId) &&
      isPublished(stream, now),
  );

  return sortByDayDesc(missing, (stream) => stream.createdAt);
}

export function doneClassworks(
  classworks: Classwork[] | null | undefined,
  enrolledClasses: EnrolledClass[] | null | undefined,
): Classwork[] {
  const enrolledClassIds = new Set(
    enrolledClasses?.map((enrolledClass) => enrolledClass.classId),
  );

  const done = (classworks ?? []).filter(
    (work) =>
      (work.isTurnedIn || work.isGraded) && enrolledClassIds.has(work.classId),
  );

  return sortByDayDesc(done, (work) => work.turnedInDate);
}
