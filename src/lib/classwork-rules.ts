import type { SubmissionCounts, SubmitLabel, WorkStatus } from "@/types/stream";
import type {
  Classwork,
  EnrolledClass,
  Stream,
  StreamPrivateComment,
} from "@/lib/schema";

function isPastDue(dueDate: Date | string | null, now: Date): boolean {
  return dueDate !== null && new Date(dueDate) < now;
}

export function submissionsOpen(
  stream: Pick<
    Stream,
    "acceptingSubmissions" | "closeSubmissionsAfterDueDate" | "dueDate"
  >,
  now: Date = new Date(),
): boolean {
  if (!stream.acceptingSubmissions) return false;
  if (stream.closeSubmissionsAfterDueDate && isPastDue(stream.dueDate, now))
    return false;
  return true;
}

export function workStatus(
  classwork: Classwork | null | undefined,
  stream: Pick<Stream, "points" | "dueDate">,
  now: Date = new Date(),
): WorkStatus {
  const pastDue = isPastDue(stream.dueDate, now);

  if (stream.points && classwork?.isGraded) return "graded";
  if (classwork?.isTurnedIn) return pastDue ? "doneLate" : "turnedIn";
  return pastDue ? "missing" : null;
}

export function submitLabel(
  hasNewWork: boolean,
  classwork: Classwork | null | undefined,
  stream: Pick<Stream, "points">,
): SubmitLabel {
  if (hasNewWork) return "turnIn";
  if (classwork?.isGraded && stream.points) return "resubmit";
  return "markAsDone";
}

export function assignedUsers(
  enrolled: EnrolledClass[] | null | undefined,
  stream: Pick<Stream, "announceToAll" | "announceTo">,
): EnrolledClass[] {
  const roster = enrolled ?? [];
  if (stream.announceToAll) return roster;
  return roster.filter((entry) => stream.announceTo.includes(entry.userId));
}

export function submissionCounts(
  classworks: Classwork[] | null | undefined,
  enrolled: EnrolledClass[] | null | undefined,
  stream: Pick<Stream, "announceToAll" | "announceTo" | "points">,
): SubmissionCounts {
  const works = classworks ?? [];

  return {
    turnedIn: works.filter((work) => work.isTurnedIn).length,
    assigned: stream.announceToAll
      ? (enrolled ?? []).length
      : stream.announceTo.length,
    graded: stream.points ? works.filter((work) => work.isGraded).length : 0,
  };
}

export function privateThread(
  comments: StreamPrivateComment[] | null | undefined,
  a: string,
  b: string,
): StreamPrivateComment[] {
  return (comments ?? []).filter(
    (comment) =>
      (comment.userId === a && comment.toUserId === b) ||
      (comment.userId === b && comment.toUserId === a),
  );
}
