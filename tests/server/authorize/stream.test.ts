import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Classroom, Stream } from "@/lib/schema";
import {
  canDeleteStream,
  canEditStream,
  canPostToClass,
  streamForMember,
  streamForViewer,
  streamRef,
  visibleClassStreams,
} from "@/server/authorize/stream";

const streams = vi.hoisted(() => ({ getClassStreamByStreamId: vi.fn() }));
const classrooms = vi.hoisted(() => ({
  getClassByClassId: vi.fn(),
  isClassMember: vi.fn(),
}));

vi.mock("@/services/stream", () => streams);
vi.mock("@/services/classroom", () => classrooms);

const now = new Date("2026-06-15T12:00:00Z");
const classroom = {
  id: "c1",
  teacherId: "teacher",
  allowUsersToPost: true,
} as Classroom;

function post(overrides: Partial<Stream>): Stream {
  return {
    id: "s1",
    userId: "teacher",
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
    createdAt: new Date("2026-06-01T12:00:00Z"),
    updatedAt: null,
    scheduledAt: null,
    ...overrides,
  };
}

const scheduled = post({
  id: "s-scheduled",
  scheduledAt: new Date(now.getTime() + 60 * 60 * 1000),
});
const targeted = post({
  id: "s-targeted",
  userId: "author",
  announceToAll: false,
  announceTo: ["other"],
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.clearAllMocks();
  classrooms.getClassByClassId.mockResolvedValue(classroom);
  classrooms.isClassMember.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("streamRef", () => {
  it("is not_found when the post does not exist", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(null);
    await expect(streamRef("s1")).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
  });

  it("returns the post's class and id", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(post({}));
    await expect(streamRef("s1")).resolves.toEqual({
      ok: true,
      value: { classId: "c1", streamId: "s1" },
    });
  });
});

describe("streamForMember", () => {
  it("is not_found for a missing post", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(null);
    await expect(streamForMember("student", "s1")).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist.",
    });
  });

  it("is forbidden for a non-member of the post's class", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(post({}));
    classrooms.isClassMember.mockResolvedValue(false);
    await expect(streamForMember("stranger", "s1")).resolves.toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });

  it("returns the post and its class for a member", async () => {
    const stream = post({});
    streams.getClassStreamByStreamId.mockResolvedValue(stream);
    await expect(streamForMember("student", "s1")).resolves.toEqual({
      ok: true,
      value: { stream, classroom },
    });
  });
});

describe("streamForViewer", () => {
  it("hides a post scheduled one hour ahead from a student", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(scheduled);
    await expect(streamForViewer("student", "s-scheduled")).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist.",
    });
  });

  it("shows the same scheduled post to the teacher", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(scheduled);
    await expect(streamForViewer("teacher", "s-scheduled")).resolves.toEqual({
      ok: true,
      value: { stream: scheduled, classroom },
    });
  });

  it("hides a post announced only to others from a student", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(targeted);
    await expect(
      streamForViewer("student", "s-targeted"),
    ).resolves.toMatchObject({ ok: false, code: "not_found" });
  });

  it("shows a targeted post to its author", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue(targeted);
    await expect(streamForViewer("author", "s-targeted")).resolves.toEqual({
      ok: true,
      value: { stream: targeted, classroom },
    });
  });
});

describe("visibleClassStreams", () => {
  it("is forbidden for a non-member", async () => {
    classrooms.isClassMember.mockResolvedValue(false);
    const load = vi.fn();
    await expect(
      visibleClassStreams("stranger", "c1", load),
    ).resolves.toMatchObject({ ok: false, code: "forbidden" });
    expect(load).not.toHaveBeenCalled();
  });

  it("drops the scheduled and the targeted post for a student and keeps the order", async () => {
    const first = post({ id: "s-first" });
    const last = post({ id: "s-last" });
    const load = vi.fn().mockResolvedValue([scheduled, first, targeted, last]);
    await expect(visibleClassStreams("student", "c1", load)).resolves.toEqual({
      ok: true,
      value: [first, last],
    });
    expect(load).toHaveBeenCalledWith("c1");
  });

  it("treats a missing list as empty", async () => {
    const load = vi.fn().mockResolvedValue(null);
    await expect(visibleClassStreams("student", "c1", load)).resolves.toEqual({
      ok: true,
      value: [],
    });
  });
});

describe("canPostToClass", () => {
  const user = (id: string, role = "user") => ({ id, role });

  it("forbids an admin even when they teach the class", () => {
    expect(
      canPostToClass(classroom, user("teacher", "admin"), true, "stream"),
    ).toEqual({
      ok: false,
      code: "forbidden",
      message: "You can't create a post on this class.",
    });
  });

  it("forbids a non-member", () => {
    expect(
      canPostToClass(classroom, user("stranger"), false, "stream"),
    ).toEqual({
      ok: false,
      code: "forbidden",
      message: "You can't create a post on this class.",
    });
  });

  it("forbids a student when posting is off", () => {
    expect(
      canPostToClass(
        { ...classroom, allowUsersToPost: false },
        user("student"),
        true,
        "stream",
      ),
    ).toEqual({
      ok: false,
      code: "forbidden",
      message: "Students are not allowed to post to the class.",
    });
  });

  it("forbids a student creating classwork", () => {
    expect(
      canPostToClass(classroom, user("student"), true, "assignment"),
    ).toEqual({
      ok: false,
      code: "forbidden",
      message: "Only teachers can create this type of stream post.",
    });
  });

  it("lets the teacher create a quiz and a student post when allowed", () => {
    expect(canPostToClass(classroom, user("teacher"), true, "quiz").ok).toBe(
      true,
    );
    expect(canPostToClass(classroom, user("student"), true, "stream").ok).toBe(
      true,
    );
  });
});

describe("canEditStream", () => {
  it("forbids the teacher when they are not the author", () => {
    expect(canEditStream(post({ userId: "student" }), "teacher")).toEqual({
      ok: false,
      code: "forbidden",
      message: "Only the original author can edit this post.",
    });
  });

  it("allows the author", () => {
    expect(canEditStream(post({ userId: "student" }), "student").ok).toBe(true);
  });
});

describe("canDeleteStream", () => {
  const stream = post({ userId: "author" });

  it("allows the teacher and the author", () => {
    expect(canDeleteStream(stream, classroom, "teacher").ok).toBe(true);
    expect(canDeleteStream(stream, classroom, "author").ok).toBe(true);
  });

  it("forbids anyone else", () => {
    expect(canDeleteStream(stream, classroom, "stranger")).toEqual({
      ok: false,
      code: "forbidden",
      message: "You're not authorized to delete this post.",
    });
  });
});
