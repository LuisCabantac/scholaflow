import { describe, expect, it } from "vitest";

import type { Stream } from "@/lib/schema";
import {
  canSeeStream,
  filterStreamsByType,
  latestAssignedClasswork,
  streamsForTopic,
  visibleStreams,
} from "@/lib/stream-visibility";

const now = new Date("2026-06-15T12:00:00Z");
const past = new Date("2026-06-01T12:00:00Z");
const future = new Date("2026-07-01T12:00:00Z");
const teacher = "teacher";
const me = "me";

function stream(overrides: Partial<Stream>): Stream {
  return {
    id: "s1",
    userId: teacher,
    userName: "T",
    userImage: "",
    classId: "c1",
    className: "Class",
    title: "Post",
    content: null,
    type: "stream",
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
    createdAt: past,
    updatedAt: null,
    scheduledAt: null,
    ...overrides,
  };
}

describe("canSeeStream", () => {
  it("shows announce-to-all and announce-to-me posts to a student", () => {
    expect(canSeeStream(stream({}), me, teacher, now)).toBe(true);
    expect(
      canSeeStream(
        stream({ announceToAll: false, announceTo: [me] }),
        me,
        teacher,
        now,
      ),
    ).toBe(true);
  });

  it("hides posts announced only to others, unless the student wrote them", () => {
    expect(
      canSeeStream(
        stream({ announceToAll: false, announceTo: ["other"] }),
        me,
        teacher,
        now,
      ),
    ).toBe(false);
    expect(
      canSeeStream(
        stream({ announceToAll: false, announceTo: ["other"], userId: me }),
        me,
        teacher,
        now,
      ),
    ).toBe(true);
  });

  it("hides future-scheduled posts from students but not from the teacher", () => {
    expect(
      canSeeStream(stream({ scheduledAt: future }), me, teacher, now),
    ).toBe(false);
    expect(canSeeStream(stream({ scheduledAt: past }), me, teacher, now)).toBe(
      true,
    );
    expect(
      canSeeStream(stream({ scheduledAt: future }), teacher, teacher, now),
    ).toBe(true);
    expect(
      canSeeStream(
        stream({ announceToAll: false, announceTo: ["other"] }),
        teacher,
        teacher,
        now,
      ),
    ).toBe(true);
  });
});

describe("visibleStreams and filterStreamsByType", () => {
  const list = [
    stream({ id: "a", type: "stream" }),
    stream({ id: "b", type: "quiz", scheduledAt: future }),
    stream({ id: "c", type: "assignment" }),
    stream({
      id: "d",
      type: "material",
      announceToAll: false,
      announceTo: ["other"],
    }),
  ];

  it("filters by visibility then by type, and treats all as no filter", () => {
    const visible = visibleStreams(list, me, teacher, now);
    expect(visible.map((s) => s.id)).toEqual(["a", "c"]);
    expect(filterStreamsByType(visible, "all").map((s) => s.id)).toEqual([
      "a",
      "c",
    ]);
    expect(filterStreamsByType(visible, "assignment").map((s) => s.id)).toEqual(
      ["c"],
    );
    expect(filterStreamsByType(visible, "quiz")).toEqual([]);
    expect(visibleStreams(null, me, teacher, now)).toEqual([]);
  });
});

describe("latestAssignedClasswork", () => {
  it("returns the first visible non-post, non-material stream", () => {
    const list = [
      stream({ id: "post", type: "stream" }),
      stream({ id: "mat", type: "material" }),
      stream({ id: "hidden", type: "quiz", scheduledAt: future }),
      stream({ id: "hw", type: "assignment" }),
      stream({ id: "later", type: "quiz" }),
    ];
    expect(latestAssignedClasswork(list, me, teacher, now)?.id).toBe("hw");
    expect(latestAssignedClasswork(list, teacher, teacher, now)?.id).toBe(
      "hidden",
    );
    expect(
      latestAssignedClasswork([stream({ type: "stream" })], me, teacher, now),
    ).toBeUndefined();
  });
});

describe("streamsForTopic", () => {
  it("returns visible streams of one topic only", () => {
    const list = [
      stream({ id: "a", topicId: "t1" }),
      stream({ id: "b", topicId: "t2" }),
      stream({ id: "c", topicId: "t1", scheduledAt: future }),
    ];
    expect(
      streamsForTopic(list, "t1", me, teacher, now).map((s) => s.id),
    ).toEqual(["a"]);
    expect(
      streamsForTopic(list, "t1", teacher, teacher, now).map((s) => s.id),
    ).toEqual(["a", "c"]);
  });
});
