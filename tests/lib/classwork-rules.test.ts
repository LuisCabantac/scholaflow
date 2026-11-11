import { describe, expect, it } from "vitest";

import type {
  Classwork,
  EnrolledClass,
  StreamPrivateComment,
} from "@/lib/schema";
import {
  assignedUsers,
  privateThread,
  submissionCounts,
  submissionsOpen,
  submitLabel,
  workStatus,
} from "@/lib/classwork-rules";

const now = new Date("2026-11-11T12:00:00Z");
const past = new Date("2026-11-10T12:00:00Z");
const future = new Date("2026-11-12T12:00:00Z");

const classwork = (overrides: Partial<Classwork> = {}): Classwork =>
  ({
    id: "cw-1",
    userId: "student",
    isTurnedIn: false,
    isGraded: false,
    points: null,
    ...overrides,
  }) as Classwork;

const enrolled = (userId: string): EnrolledClass =>
  ({ id: `e-${userId}`, userId, classId: "class" }) as EnrolledClass;

const comment = (userId: string, toUserId: string): StreamPrivateComment =>
  ({ id: `${userId}->${toUserId}`, userId, toUserId }) as StreamPrivateComment;

describe("submissionsOpen", () => {
  it("is closed when the teacher turned submissions off", () => {
    expect(
      submissionsOpen(
        {
          acceptingSubmissions: false,
          closeSubmissionsAfterDueDate: false,
          dueDate: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("is closed after the due date when close-after-due is on", () => {
    expect(
      submissionsOpen(
        {
          acceptingSubmissions: true,
          closeSubmissionsAfterDueDate: true,
          dueDate: past,
        },
        now,
      ),
    ).toBe(false);
  });

  it("stays open before the due date with close-after-due on", () => {
    expect(
      submissionsOpen(
        {
          acceptingSubmissions: true,
          closeSubmissionsAfterDueDate: true,
          dueDate: future,
        },
        now,
      ),
    ).toBe(true);
  });

  it("stays open after the due date without close-after-due", () => {
    expect(
      submissionsOpen(
        {
          acceptingSubmissions: true,
          closeSubmissionsAfterDueDate: false,
          dueDate: past,
        },
        now,
      ),
    ).toBe(true);
  });
});

describe("workStatus", () => {
  it("reports graded before anything else when the stream has points", () => {
    expect(
      workStatus(
        classwork({ isGraded: true, isTurnedIn: true }),
        { points: 10, dueDate: past },
        now,
      ),
    ).toBe("graded");
  });

  it("reports turned in before the due date", () => {
    expect(
      workStatus(
        classwork({ isTurnedIn: true }),
        { points: null, dueDate: future },
        now,
      ),
    ).toBe("turnedIn");
  });

  it("reports turned in when there is no due date", () => {
    expect(
      workStatus(
        classwork({ isTurnedIn: true }),
        { points: null, dueDate: null },
        now,
      ),
    ).toBe("turnedIn");
  });

  it("reports done late after the due date", () => {
    expect(
      workStatus(
        classwork({ isTurnedIn: true }),
        { points: null, dueDate: past },
        now,
      ),
    ).toBe("doneLate");
  });

  it("reports missing when not turned in after the due date", () => {
    expect(workStatus(classwork(), { points: null, dueDate: past }, now)).toBe(
      "missing",
    );
    expect(workStatus(null, { points: null, dueDate: past }, now)).toBe(
      "missing",
    );
  });

  it("reports nothing when not turned in and not yet due", () => {
    expect(workStatus(null, { points: null, dueDate: future }, now)).toBeNull();
  });
});

describe("submitLabel", () => {
  it("says turn in when there is new work", () => {
    expect(submitLabel(true, null, { points: 10 })).toBe("turnIn");
  });

  it("says resubmit for graded work on a graded stream", () => {
    expect(
      submitLabel(false, classwork({ isGraded: true }), { points: 10 }),
    ).toBe("resubmit");
  });

  it("says mark as done otherwise", () => {
    expect(
      submitLabel(false, classwork({ isGraded: true }), { points: null }),
    ).toBe("markAsDone");
    expect(submitLabel(false, null, { points: 10 })).toBe("markAsDone");
  });
});

describe("submissionCounts", () => {
  const works = [
    classwork({ userId: "a", isTurnedIn: true, isGraded: true }),
    classwork({ userId: "b", isTurnedIn: true }),
    classwork({ userId: "c" }),
  ];
  const roster = [enrolled("a"), enrolled("b"), enrolled("c"), enrolled("d")];

  it("counts the roster when announced to all", () => {
    expect(
      submissionCounts(works, roster, {
        announceToAll: true,
        announceTo: [],
        points: 10,
      }),
    ).toEqual({ turnedIn: 2, assigned: 4, graded: 1 });
  });

  it("counts the audience when targeted and no grades without points", () => {
    expect(
      submissionCounts(works, roster, {
        announceToAll: false,
        announceTo: ["a", "b"],
        points: null,
      }),
    ).toEqual({ turnedIn: 2, assigned: 2, graded: 0 });
  });

  it("handles missing lists", () => {
    expect(
      submissionCounts(null, null, {
        announceToAll: true,
        announceTo: [],
        points: 10,
      }),
    ).toEqual({ turnedIn: 0, assigned: 0, graded: 0 });
  });
});

describe("assignedUsers", () => {
  const roster = [enrolled("a"), enrolled("b"), enrolled("c")];

  it("returns everyone when announced to all", () => {
    expect(
      assignedUsers(roster, { announceToAll: true, announceTo: [] }),
    ).toEqual(roster);
  });

  it("returns only the audience when targeted", () => {
    expect(
      assignedUsers(roster, { announceToAll: false, announceTo: ["c", "x"] }),
    ).toEqual([enrolled("c")]);
  });

  it("returns an empty list without a roster", () => {
    expect(
      assignedUsers(null, { announceToAll: true, announceTo: [] }),
    ).toEqual([]);
  });
});

describe("privateThread", () => {
  it("keeps both directions of the pair and drops third parties", () => {
    const comments = [
      comment("student", "teacher"),
      comment("teacher", "student"),
      comment("other", "teacher"),
      comment("teacher", "other"),
    ];
    expect(
      privateThread(comments, "student", "teacher").map((c) => c.id),
    ).toEqual(["student->teacher", "teacher->student"]);
  });

  it("returns an empty list without comments", () => {
    expect(privateThread(null, "a", "b")).toEqual([]);
  });
});
