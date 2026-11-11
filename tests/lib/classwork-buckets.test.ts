import { describe, expect, it } from "vitest";

import type { Classwork, EnrolledClass, Stream } from "@/lib/schema";
import {
  assignedClassworks,
  doneClassworks,
  missingClassworks,
  sortByDayDesc,
} from "@/lib/classwork-buckets";

const now = new Date("2026-06-15T12:00:00Z");
const past = new Date("2026-06-01T12:00:00Z");
const future = new Date("2026-07-01T12:00:00Z");
const me = "user-me";

function stream(overrides: Partial<Stream>): Stream {
  return {
    id: "s1",
    userId: "teacher",
    userName: "T",
    userImage: "",
    classId: "c1",
    className: "Class 1",
    title: "Work",
    content: null,
    type: "assignment",
    attachments: [],
    links: [],
    points: null,
    isPinned: false,
    acceptingSubmissions: true,
    closeSubmissionsAfterDueDate: false,
    announceTo: [],
    announceToAll: true,
    topicId: null,
    topicName: null,
    dueDate: null,
    createdAt: new Date("2026-06-10T12:00:00Z"),
    updatedAt: null,
    scheduledAt: null,
    ...overrides,
  };
}

function classwork(overrides: Partial<Classwork>): Classwork {
  return {
    id: "w1",
    userId: me,
    userName: "Me",
    userImage: "",
    classId: "c1",
    className: "Class 1",
    streamId: "s1",
    title: "Work",
    attachments: [],
    links: [],
    points: null,
    isGraded: false,
    isReturned: false,
    streamCreatedAt: new Date("2026-06-10T12:00:00Z"),
    isTurnedIn: false,
    turnedInDate: null,
    createdAt: new Date("2026-06-11T12:00:00Z"),
    ...overrides,
  };
}

const enrolled: EnrolledClass[] = [
  {
    id: "e1",
    classId: "c1",
    userId: me,
    userName: "Me",
    userImage: "",
    name: "Class 1",
    subject: null,
    section: "A",
    teacherName: "T",
    teacherImage: "",
    cardBackground: "#000",
    illustrationIndex: 0,
    createdAt: past,
  },
];

describe("assignedClassworks", () => {
  it("includes announced, unsubmitted, not-yet-due work", () => {
    expect(assignedClassworks([stream({})], [], me, now)).toHaveLength(1);
    expect(
      assignedClassworks([stream({ dueDate: future })], [], me, now),
    ).toHaveLength(1);
  });

  it("excludes work the user already has a classwork row for", () => {
    expect(
      assignedClassworks(
        [stream({})],
        [classwork({ streamId: "s1" })],
        me,
        now,
      ),
    ).toHaveLength(0);
  });

  it("excludes overdue work", () => {
    expect(
      assignedClassworks([stream({ dueDate: past })], [], me, now),
    ).toHaveLength(0);
  });

  it("excludes work not announced to the user", () => {
    expect(
      assignedClassworks(
        [stream({ announceToAll: false, announceTo: ["other"] })],
        [],
        me,
        now,
      ),
    ).toHaveLength(0);
    expect(
      assignedClassworks(
        [stream({ announceToAll: false, announceTo: [me] })],
        [],
        me,
        now,
      ),
    ).toHaveLength(1);
  });

  it("excludes work scheduled for the future", () => {
    expect(
      assignedClassworks([stream({ scheduledAt: future })], [], me, now),
    ).toHaveLength(0);
    expect(
      assignedClassworks([stream({ scheduledAt: past })], [], me, now),
    ).toHaveLength(1);
  });

  it("sorts newest day first and tolerates null inputs", () => {
    const older = stream({
      id: "a",
      createdAt: new Date("2026-06-01T23:00:00Z"),
    });
    const newer = stream({
      id: "b",
      createdAt: new Date("2026-06-09T01:00:00Z"),
    });
    expect(
      assignedClassworks([older, newer], null, me, now).map((s) => s.id),
    ).toEqual(["b", "a"]);
    expect(assignedClassworks(null, undefined, me, now)).toEqual([]);
  });
});

describe("missingClassworks", () => {
  it("includes overdue work without a turned-in submission", () => {
    expect(
      missingClassworks([stream({ dueDate: past })], [], me, now),
    ).toHaveLength(1);
    expect(
      missingClassworks(
        [stream({ dueDate: past })],
        [classwork({ isTurnedIn: false })],
        me,
        now,
      ),
    ).toHaveLength(1);
  });

  it("excludes turned-in, not-due, future-due, unannounced and future-scheduled work", () => {
    expect(
      missingClassworks(
        [stream({ dueDate: past })],
        [classwork({ isTurnedIn: true })],
        me,
        now,
      ),
    ).toHaveLength(0);
    expect(missingClassworks([stream({})], [], me, now)).toHaveLength(0);
    expect(
      missingClassworks([stream({ dueDate: future })], [], me, now),
    ).toHaveLength(0);
    expect(
      missingClassworks(
        [stream({ dueDate: past, announceToAll: false, announceTo: ["x"] })],
        [],
        me,
        now,
      ),
    ).toHaveLength(0);
    expect(
      missingClassworks(
        [stream({ dueDate: past, scheduledAt: future })],
        [],
        me,
        now,
      ),
    ).toHaveLength(0);
  });
});

describe("doneClassworks", () => {
  it("includes turned-in or graded work from enrolled classes only", () => {
    expect(
      doneClassworks([classwork({ isTurnedIn: true })], enrolled),
    ).toHaveLength(1);
    expect(
      doneClassworks([classwork({ isGraded: true })], enrolled),
    ).toHaveLength(1);
    expect(doneClassworks([classwork({})], enrolled)).toHaveLength(0);
    expect(
      doneClassworks(
        [classwork({ isTurnedIn: true, classId: "other" })],
        enrolled,
      ),
    ).toHaveLength(0);
    expect(doneClassworks(null, null)).toEqual([]);
  });

  it("sorts by turned-in day descending with nulls last", () => {
    const a = classwork({
      id: "a",
      isTurnedIn: true,
      turnedInDate: new Date("2026-06-02T00:00:00Z"),
    });
    const b = classwork({
      id: "b",
      isTurnedIn: true,
      turnedInDate: new Date("2026-06-12T00:00:00Z"),
    });
    const c = classwork({ id: "c", isGraded: true, turnedInDate: null });
    expect(doneClassworks([a, c, b], enrolled).map((w) => w.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });
});

describe("sortByDayDesc", () => {
  it("orders by calendar day, ignoring time within the day", () => {
    const items = [
      { id: "x", at: "2026-06-08T01:00:00Z" },
      { id: "y", at: "2026-06-09T23:00:00Z" },
      { id: "z", at: "2026-06-11T12:30:00Z" },
    ];
    expect(sortByDayDesc(items, (i) => i.at).map((i) => i.id)[0]).toBe("z");
  });
});
