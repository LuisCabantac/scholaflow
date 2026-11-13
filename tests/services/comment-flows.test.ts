import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StreamRef } from "@/types/stream";
import type { Classroom, Stream } from "@/lib/schema";
import {
  addCommentFlow,
  addPrivateCommentFlow,
  deleteCommentFlow,
  deletePrivateCommentFlow,
} from "@/services/comment-flows";

const streams = vi.hoisted(() => ({ getClassStreamByStreamId: vi.fn() }));
const classrooms = vi.hoisted(() => ({
  getClassByClassId: vi.fn(),
  getEnrolledClassByClassAndSessionId: vi.fn(),
}));
const storage = vi.hoisted(() => ({ uploadAttachments: vi.fn() }));
const buckets = vi.hoisted(() => ({ deleteFileFromBucket: vi.fn() }));
const notifications = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  deleteAllNotificationsByResourceId: vi.fn(),
}));
const comments = vi.hoisted(() => ({
  createStreamComment: vi.fn(),
  createPrivateComment: vi.fn(),
  deleteStreamCommentRecord: vi.fn(),
  deletePrivateCommentRecord: vi.fn(),
  getStreamCommentByCommentId: vi.fn(),
  getStreamPrivateCommentByCommentId: vi.fn(),
}));

vi.mock("@/services/stream", () => streams);
vi.mock("@/services/classroom", () => classrooms);
vi.mock("@/services/storage", () => storage);
vi.mock("@/services/user-management", () => buckets);
vi.mock("@/services/notification", () => notifications);
vi.mock("@/services/comment", () => comments);

const C1 = "11111111-1111-4111-8111-111111111111";
const C2 = "44444444-4444-4444-8444-444444444444";
const S1 = "33333333-3333-4333-8333-333333333333";
const K1 = "55555555-5555-4555-8555-555555555555";
const S2 = "66666666-6666-4666-8666-666666666666";
const ATTACHMENT = `https://x/storage/v1/object/public/comments/${C1}/c.png`;

const teacher = {
  id: "t1",
  name: "Teacher",
  image: "https://x/t.png",
  role: "user",
};
const student = {
  id: "s1",
  name: "Student One",
  image: "https://x/s.png",
  role: "user",
};
const classroom = {
  id: C1,
  name: "Math",
  teacherId: "t1",
  allowUsersToComment: true,
} as Classroom;
const post = {
  id: S1,
  classId: C1,
  userId: "t1",
  type: "assignment",
  announceToAll: true,
  announceTo: [],
  scheduledAt: null,
} as unknown as Stream;
const ref: StreamRef = { classId: C1, streamId: S1 };
const enrollment = { id: "e1", userId: "s1", classId: C1 };
const stored = {
  id: K1,
  streamId: S1,
  classId: C1,
  userId: "s1",
  attachment: ATTACHMENT,
};
const file = () => new File(["png"], "c.png");

beforeEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  classrooms.getClassByClassId.mockResolvedValue(classroom);
  classrooms.getEnrolledClassByClassAndSessionId.mockImplementation(
    async (userId: string) => (userId === "s1" ? enrollment : null),
  );
  streams.getClassStreamByStreamId.mockResolvedValue(post);
  storage.uploadAttachments.mockResolvedValue(ATTACHMENT);
  comments.createStreamComment.mockImplementation(async (data) => ({
    ...data,
    id: K1,
    createdAt: new Date(),
    updatedAt: null,
  }));
  comments.createPrivateComment.mockImplementation(async (data) => ({
    ...data,
    id: K1,
    createdAt: new Date(),
    updatedAt: null,
  }));
  comments.getStreamCommentByCommentId.mockResolvedValue(stored);
  comments.getStreamPrivateCommentByCommentId.mockResolvedValue(stored);
  comments.deleteStreamCommentRecord.mockResolvedValue(stored);
  comments.deletePrivateCommentRecord.mockResolvedValue(stored);
});

describe("addCommentFlow", () => {
  it("is not_found when the class does not exist", async () => {
    classrooms.getClassByClassId.mockResolvedValue(null);
    expect(
      await addCommentFlow(student, ref, { content: "hi", file: null }),
    ).toEqual({
      ok: false,
      code: "not_found",
      message: "This class doesn't exist.",
    });
  });

  it("is forbidden for a student when comments are off and uploads nothing", async () => {
    classrooms.getClassByClassId.mockResolvedValue({
      ...classroom,
      allowUsersToComment: false,
    });
    const outcome = await addCommentFlow(student, ref, {
      content: "hi",
      file: file(),
    });
    expect(outcome).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment on this post.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
  });

  it("is not_found for a student on a post scheduled ahead", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue({
      ...post,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const outcome = await addCommentFlow(student, ref, {
      content: "hi",
      file: null,
    });
    expect(outcome).toMatchObject({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
  });

  it("is not_found when the post is in another class", async () => {
    const outcome = await addCommentFlow(
      teacher,
      { classId: C2, streamId: S1 },
      { content: "hi", file: null },
    );
    expect(outcome).toMatchObject({ ok: false, code: "not_found" });
  });

  it("fails validation before any upload", async () => {
    const outcome = await addCommentFlow({ ...teacher, image: null }, ref, {
      content: "hi",
      file: file(),
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message: "Invalid comment data provided.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
  });

  it("uploads to the class folder, saves and notifies the teacher", async () => {
    const outcome = await addCommentFlow(teacher, ref, {
      content: null,
      file: file(),
    });
    expect(storage.uploadAttachments).toHaveBeenCalledWith(
      "comments",
      C1,
      expect.any(File),
    );
    expect(comments.createStreamComment).toHaveBeenCalledWith(
      expect.objectContaining({ attachment: ATTACHMENT, content: null }),
    );
    expect(notifications.sendNotification).toHaveBeenCalledWith(
      "comment",
      "t1",
      K1,
      "Commented an image",
      `/classroom/class/${C1}/stream/${S1}?comment=${K1}`,
      "Teacher",
      "https://x/t.png",
    );
    expect(outcome).toMatchObject({ ok: true, value: { id: K1 } });
  });

  it("is a conflict when the insert returns nothing", async () => {
    comments.createStreamComment.mockResolvedValue(null);
    expect(
      await addCommentFlow(student, ref, { content: "hi", file: null }),
    ).toEqual({
      ok: false,
      code: "conflict",
      message: "Failed to save comment.",
    });
  });
});

describe("deleteCommentFlow", () => {
  it("is not_found for a comment of another post", async () => {
    comments.getStreamCommentByCommentId.mockResolvedValue({
      ...stored,
      streamId: S2,
    });
    expect(await deleteCommentFlow(teacher, ref, K1)).toEqual({
      ok: false,
      code: "not_found",
      message: "This comment doesn't exist on this post.",
    });
    expect(comments.deleteStreamCommentRecord).not.toHaveBeenCalled();
  });

  it("is forbidden for an enrolled stranger", async () => {
    const outcome = await deleteCommentFlow({ ...student, id: "s2" }, ref, K1);
    expect(outcome).toEqual({
      ok: false,
      code: "forbidden",
      message: "You're not authorized to delete this comment.",
    });
    expect(buckets.deleteFileFromBucket).not.toHaveBeenCalled();
  });

  it("deletes the file, the row and its notifications for the teacher", async () => {
    expect(await deleteCommentFlow(teacher, ref, K1)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(buckets.deleteFileFromBucket).toHaveBeenCalledWith(
      "comments",
      `${C1}/c.png`,
    );
    expect(comments.deleteStreamCommentRecord).toHaveBeenCalledWith(K1, S1);
    expect(
      notifications.deleteAllNotificationsByResourceId,
    ).toHaveBeenCalledWith(K1);
  });
});

describe("addPrivateCommentFlow", () => {
  it("sends a student's private comment to the teacher whatever userId says", async () => {
    const outcome = await addPrivateCommentFlow(student, ref, {
      content: "help",
      file: null,
      recipientId: "other",
    });
    expect(comments.createPrivateComment).toHaveBeenCalledWith(
      expect.objectContaining({ toUserId: "t1", userId: "s1" }),
    );
    expect(notifications.sendNotification).toHaveBeenCalledWith(
      "comment",
      "t1",
      K1,
      "help",
      `/classroom/class/${C1}/stream/${S1}/submissions?name=student-one&user=s1&comment=${K1}`,
      "Student One",
      "https://x/s.png",
    );
    expect(outcome).toMatchObject({ ok: true });
  });

  it("is a validation failure for a teacher without a recipient and uploads nothing", async () => {
    const outcome = await addPrivateCommentFlow(teacher, ref, {
      content: "hi",
      file: file(),
      recipientId: null,
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message: "Invalid private comment data provided.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
  });

  it("refuses a teacher recipient who is not enrolled", async () => {
    const outcome = await addPrivateCommentFlow(teacher, ref, {
      content: "hi",
      file: null,
      recipientId: "stranger",
    });
    expect(outcome).toEqual({
      ok: false,
      code: "not_found",
      message: "This user is not in this class.",
    });
    expect(comments.createPrivateComment).not.toHaveBeenCalled();
  });

  it("lets the teacher reply to an enrolled student", async () => {
    await addPrivateCommentFlow(teacher, ref, {
      content: "ok",
      file: null,
      recipientId: "s1",
    });
    expect(comments.createPrivateComment).toHaveBeenCalledWith(
      expect.objectContaining({ toUserId: "s1", userId: "t1" }),
    );
  });

  it("is forbidden for a non-member before the post is read", async () => {
    const outcome = await addPrivateCommentFlow({ ...student, id: "x" }, ref, {
      content: "hi",
      file: null,
      recipientId: null,
    });
    expect(outcome).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment.",
    });
    expect(streams.getClassStreamByStreamId).not.toHaveBeenCalled();
  });

  it("is not_found with the stream message for a post of another class", async () => {
    const missing = {
      ok: false,
      code: "not_found",
      message: "This stream doesn't exist.",
    };
    const input = { content: "hi", file: null, recipientId: null };
    streams.getClassStreamByStreamId.mockResolvedValue({
      ...post,
      classId: C2,
    });
    expect(await addPrivateCommentFlow(student, ref, input)).toEqual(missing);
    streams.getClassStreamByStreamId.mockResolvedValue(null);
    expect(await addPrivateCommentFlow(student, ref, input)).toEqual(missing);
    expect(comments.createPrivateComment).not.toHaveBeenCalled();
  });

  it("is forbidden with the classwork message for a student outside announceTo", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue({
      ...post,
      announceToAll: false,
      announceTo: ["s9"],
    });
    const outcome = await addPrivateCommentFlow(student, ref, {
      content: "hi",
      file: null,
      recipientId: null,
    });
    expect(outcome).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment on this classwork.",
    });
  });
});

describe("deletePrivateCommentFlow", () => {
  it("is a conflict when the delete returns nothing", async () => {
    comments.deletePrivateCommentRecord.mockResolvedValue(null);
    expect(await deletePrivateCommentFlow(student, ref, K1)).toEqual({
      ok: false,
      code: "conflict",
      message: "Failed to delete the private comment.",
    });
    expect(
      notifications.deleteAllNotificationsByResourceId,
    ).not.toHaveBeenCalled();
  });

  it("is not_found for a post in another class", async () => {
    expect(
      await deletePrivateCommentFlow(
        teacher,
        { classId: C2, streamId: S1 },
        K1,
      ),
    ).toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
  });

  it("deletes the author's private comment and its notifications", async () => {
    expect(await deletePrivateCommentFlow(student, ref, K1)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(comments.deletePrivateCommentRecord).toHaveBeenCalledWith(K1, S1);
    expect(
      notifications.deleteAllNotificationsByResourceId,
    ).toHaveBeenCalledWith(K1);
  });
});
