import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Classroom, ClassTopic, Stream } from "@/lib/schema";
import type { StreamCreateInput, StreamPatch } from "@/types/stream";
import {
  createStreamFlow,
  deleteStreamFlow,
  mergeStreamUpdate,
  newStreamRecord,
  streamChanges,
  streamUpdateRecord,
  updateStreamFlow,
} from "@/services/stream-flows";

const streams = vi.hoisted(() => ({
  getClassStreamByStreamId: vi.fn(),
  createStreamPost: vi.fn(),
  updateStreamPost: vi.fn(),
  deleteClassStreamPost: vi.fn(),
  getAllClassStreamsByClassId: vi.fn(),
  getAllClassworkStreamsByTopicId: vi.fn(),
  updateClassStreamPostTopic: vi.fn(),
}));
const classrooms = vi.hoisted(() => ({
  getClassByClassId: vi.fn(),
  isClassMember: vi.fn(),
  getAllEnrolledClassesByClassId: vi.fn(),
  getEnrolledClassByClassAndSessionId: vi.fn(),
}));
const topics = vi.hoisted(() => ({ getClassTopicByTopicId: vi.fn() }));
const storage = vi.hoisted(() => ({ uploadAttachments: vi.fn() }));
const buckets = vi.hoisted(() => ({
  deleteFilesFromBucket: vi.fn(),
  deleteFileFromBucket: vi.fn(),
}));
const notifications = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  deleteAllNotificationsByResourceId: vi.fn(),
}));
const comments = vi.hoisted(() => ({
  getAllCommentsByStreamId: vi.fn(),
  getAllPrivateCommentsByStreamId: vi.fn(),
  deleteAllClassStreamCommentsByStreamIdRecord: vi.fn(),
  deleteAllPrivateStreamCommentsByStreamIdRecord: vi.fn(),
}));
const classworks = vi.hoisted(() => ({
  getAllClassworksByStreamId: vi.fn(),
  deleteAllClassworksByStreamIdRecord: vi.fn(),
  getAllClassworksByClassAndUserId: vi.fn(),
  deleteAllClassworksByClassAndUserIdRecord: vi.fn(),
}));

vi.mock("@/services/stream", () => streams);
vi.mock("@/services/classroom", () => classrooms);
vi.mock("@/services/class-topic", () => topics);
vi.mock("@/services/storage", () => storage);
vi.mock("@/services/user-management", () => buckets);
vi.mock("@/services/notification", () => notifications);
vi.mock("@/services/comment", () => comments);
vi.mock("@/services/classwork", () => classworks);

const C1 = "11111111-1111-4111-8111-111111111111";
const C2 = "44444444-4444-4444-8444-444444444444";
const T1 = "22222222-2222-4222-8222-222222222222";
const S1 = "33333333-3333-4333-8333-333333333333";
const A1 = `https://x/storage/v1/object/public/streams/${C1}/a.pdf`;
const A2 = `https://x/storage/v1/object/public/streams/${C1}/b.pdf`;
const FOREIGN = "https://x/storage/v1/object/public/streams/other/v.png";

const teacher = {
  id: "t1",
  name: "Teacher",
  image: "https://x/t.png",
  role: "user",
};
const student = {
  id: "s1",
  name: "Student",
  image: "https://x/s.png",
  role: "user",
};
const classroom = {
  id: C1,
  name: "Math",
  teacherId: "t1",
  allowUsersToPost: true,
} as Classroom;
const topic = {
  id: T1,
  classId: C1,
  name: "Week 1",
  createdAt: new Date("2026-05-01T00:00:00Z"),
} as ClassTopic;
const roster = [{ userId: "u1" }, { userId: "u2" }];

const stored: Stream = {
  id: S1,
  userId: "t1",
  userName: "Teacher",
  userImage: "https://x/t.png",
  classId: C1,
  className: "Math",
  title: "HW 1",
  content: "Do it",
  type: "assignment",
  attachments: [A1, A2],
  links: ["https://old.test"],
  points: 50,
  isPinned: false,
  acceptingSubmissions: true,
  closeSubmissionsAfterDueDate: false,
  announceTo: ["u1", "u2", "u3", "u4", "u5"],
  announceToAll: false,
  topicId: T1,
  topicName: "Week 1",
  dueDate: new Date("2026-06-15T10:00:00Z"),
  createdAt: new Date("2026-06-01T12:00:00Z"),
  updatedAt: null,
  scheduledAt: null,
};

const emptyPatch: StreamPatch = { files: [] };
const createInput: StreamCreateInput = {
  type: "stream",
  title: "Hello",
  content: null,
  topicId: "no-topic",
  dueDate: null,
  scheduledAt: null,
  points: null,
  acceptingSubmissions: false,
  closeSubmissionsAfterDueDate: false,
  isAssignToAll: true,
  announceTo: [],
  links: [],
  files: [],
};
const file = () => new File(["abc"], "notes.txt");

beforeEach(() => {
  vi.clearAllMocks();
  classrooms.getClassByClassId.mockResolvedValue(classroom);
  classrooms.isClassMember.mockResolvedValue(true);
  classrooms.getAllEnrolledClassesByClassId.mockResolvedValue(roster);
  topics.getClassTopicByTopicId.mockResolvedValue(topic);
  storage.uploadAttachments.mockResolvedValue("https://x/up.pdf");
  streams.getClassStreamByStreamId.mockResolvedValue(stored);
  streams.createStreamPost.mockImplementation(async (data) => ({
    ...data,
    id: S1,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: null,
  }));
  streams.updateStreamPost.mockImplementation(async (_id, data) => ({
    ...stored,
    ...data,
  }));
  comments.getAllCommentsByStreamId.mockResolvedValue(null);
  comments.getAllPrivateCommentsByStreamId.mockResolvedValue(null);
  classworks.getAllClassworksByStreamId.mockResolvedValue(null);
});

describe("newStreamRecord", () => {
  it("builds the website's insert record", () => {
    expect(
      newStreamRecord(teacher, classroom, createInput, {
        attachments: ["https://x/up.pdf"],
        topic,
        announceTo: ["u1", "u2"],
      }),
    ).toEqual({
      type: "stream",
      classId: C1,
      className: "Math",
      userId: "t1",
      userName: "Teacher",
      userImage: "https://x/t.png",
      title: "Hello",
      content: null,
      attachments: ["https://x/up.pdf"],
      links: [],
      points: null,
      dueDate: null,
      topicId: T1,
      topicName: "Week 1",
      announceToAll: true,
      announceTo: ["u1", "u2"],
      acceptingSubmissions: false,
      closeSubmissionsAfterDueDate: false,
      scheduledAt: null,
    });
  });
});

describe("mergeStreamUpdate", () => {
  it("keeps every stored field for an empty patch and adds no links", () => {
    expect(mergeStreamUpdate(stored, emptyPatch)).toEqual({
      title: "HW 1",
      content: "Do it",
      topicId: T1,
      dueDate: stored.dueDate,
      scheduledAt: null,
      points: 50,
      acceptingSubmissions: true,
      closeSubmissionsAfterDueDate: false,
      isAssignToAll: false,
      announceTo: ["u1", "u2", "u3", "u4", "u5"],
      links: [],
      currentLinks: ["https://old.test"],
      currentAttachments: [A1, A2],
      files: [],
    });
  });

  it("clears only the title when title is null", () => {
    const merged = mergeStreamUpdate(stored, { title: null, files: [] });
    expect(merged.title).toBeNull();
    expect(merged.content).toBe("Do it");
    expect(merged.currentAttachments).toEqual([A1, A2]);
    expect(merged.dueDate).toEqual(stored.dueDate);
  });

  it("drops every stored attachment on an explicit empty list", () => {
    expect(
      mergeStreamUpdate(stored, { currentAttachments: [], files: [] })
        .currentAttachments,
    ).toEqual([]);
  });

  it("clears the topic and falls back to no-topic for a post without one", () => {
    expect(
      mergeStreamUpdate(stored, { topicId: "no-topic", files: [] }).topicId,
    ).toBe("no-topic");
    expect(
      mergeStreamUpdate({ ...stored, topicId: null }, emptyPatch).topicId,
    ).toBe("no-topic");
  });

  it("passes the files through", () => {
    const f = file();
    expect(mergeStreamUpdate(stored, { files: [f] }).files).toEqual([f]);
  });
});

describe("streamChanges", () => {
  const same = mergeStreamUpdate(stored, emptyPatch);

  it("is false for a merged empty patch", () => {
    expect(streamChanges(stored, same, stored.announceTo)).toBe(false);
  });

  it("is true for a new file", () => {
    expect(
      streamChanges(stored, { ...same, files: [file()] }, stored.announceTo),
    ).toBe(true);
  });

  it("is false for the same audience in another order", () => {
    expect(streamChanges(stored, same, [...stored.announceTo].reverse())).toBe(
      false,
    );
  });

  it("is true for a different scheduledAt", () => {
    expect(
      streamChanges(
        stored,
        { ...same, scheduledAt: new Date("2026-07-01T00:00:00Z") },
        stored.announceTo,
      ),
    ).toBe(true);
  });
});

describe("streamUpdateRecord", () => {
  it("puts uploaded urls first, keeps only stored urls and sets updatedAt", () => {
    const record = streamUpdateRecord(
      stored,
      {
        ...mergeStreamUpdate(stored, emptyPatch),
        currentAttachments: [
          A2,
          `https://x/storage/v1/object/public/streams/${C1}/never.pdf`,
        ],
      },
      { uploaded: ["https://x/up.pdf"], topic, announceTo: stored.announceTo },
    );
    expect(record.attachments).toEqual(["https://x/up.pdf", A2]);
    expect(record.links).toEqual(["https://old.test"]);
    expect(record.topicId).toBe(T1);
    expect(record.updatedAt).toBeInstanceOf(Date);
  });
});

describe("createStreamFlow", () => {
  it("is not_found when the class does not exist", async () => {
    classrooms.getClassByClassId.mockResolvedValue(null);
    await expect(createStreamFlow(teacher, C1, createInput)).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This class doesn't exist.",
    });
  });

  it("is forbidden for a non-member and uploads nothing", async () => {
    classrooms.isClassMember.mockResolvedValue(false);
    const outcome = await createStreamFlow(student, C1, {
      ...createInput,
      files: [file()],
    });
    expect(outcome).toMatchObject({ ok: false, code: "forbidden" });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.createStreamPost).not.toHaveBeenCalled();
  });

  it("fails validation before any upload when the record is invalid", async () => {
    const outcome = await createStreamFlow({ ...teacher, image: null }, C1, {
      ...createInput,
      files: [file()],
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message:
        "Invalid post information provided. Please check all fields and try again.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.createStreamPost).not.toHaveBeenCalled();
  });

  it("sends the roster ids to the insert and the notification when assigning to all", async () => {
    const outcome = await createStreamFlow(teacher, C1, createInput);
    expect(outcome.ok).toBe(true);
    expect(streams.createStreamPost).toHaveBeenCalledWith(
      expect.objectContaining({
        announceTo: ["u1", "u2"],
        announceToAll: true,
        attachments: [],
      }),
    );
    expect(notifications.sendNotification).toHaveBeenCalledWith(
      "stream",
      ["u1", "u2"],
      S1,
      "Hello",
      `/classroom/class/${C1}/stream/${S1}`,
      "Teacher",
      "https://x/t.png",
    );
  });

  it("ignores a topic that belongs to another class", async () => {
    topics.getClassTopicByTopicId.mockResolvedValue({ ...topic, classId: C2 });
    await createStreamFlow(teacher, C1, { ...createInput, topicId: T1 });
    expect(streams.createStreamPost).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: null, topicName: null }),
    );
  });

  it("uploads to the class folder after validation and stores the urls", async () => {
    const f = file();
    const outcome = await createStreamFlow(teacher, C1, {
      ...createInput,
      files: [f],
    });
    expect(storage.uploadAttachments).toHaveBeenCalledWith("streams", C1, f);
    expect(streams.createStreamPost).toHaveBeenCalledWith(
      expect.objectContaining({ attachments: ["https://x/up.pdf"] }),
    );
    expect(outcome.ok && outcome.value.attachments).toEqual([
      "https://x/up.pdf",
    ]);
  });

  it("rejects an audience id that is not in the class", async () => {
    const outcome = await createStreamFlow(teacher, C1, {
      ...createInput,
      isAssignToAll: false,
      announceTo: ["u1", "outsider"],
      files: [file()],
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message:
        "Invalid post information provided. Please check all fields and try again.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.createStreamPost).not.toHaveBeenCalled();
  });

  it("accepts enrolled users and the teacher as the audience", async () => {
    const outcome = await createStreamFlow(teacher, C1, {
      ...createInput,
      isAssignToAll: false,
      announceTo: ["u2", "t1"],
    });
    expect(outcome.ok).toBe(true);
    expect(streams.createStreamPost).toHaveBeenCalledWith(
      expect.objectContaining({
        announceTo: ["u2", "t1"],
        announceToAll: false,
      }),
    );
  });

  it("is a conflict when the insert returns nothing", async () => {
    streams.createStreamPost.mockResolvedValue(null);
    await expect(createStreamFlow(teacher, C1, createInput)).resolves.toEqual({
      ok: false,
      code: "conflict",
      message: "Failed to create post.",
    });
    expect(notifications.sendNotification).not.toHaveBeenCalled();
  });
});

describe("updateStreamFlow", () => {
  const ref = { classId: C1, streamId: S1 };

  it("checks the form's class first, then the post", async () => {
    classrooms.getClassByClassId.mockResolvedValue(null);
    await expect(updateStreamFlow(teacher, ref, emptyPatch)).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This class doesn't exist.",
    });
    classrooms.getClassByClassId.mockResolvedValue(classroom);
    streams.getClassStreamByStreamId.mockResolvedValue(null);
    await expect(updateStreamFlow(teacher, ref, emptyPatch)).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
  });

  it("is forbidden for a member who sees the post but did not write it", async () => {
    await expect(
      updateStreamFlow({ ...student, id: "u1" }, ref, emptyPatch),
    ).resolves.toEqual({
      ok: false,
      code: "forbidden",
      message: "Only the original author can edit this post.",
    });
  });

  it("is not_found for a member who may not see the post", async () => {
    await expect(updateStreamFlow(student, ref, emptyPatch)).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
  });

  it("keeps only stored links from currentLinks", () => {
    const merged = mergeStreamUpdate(stored, {
      currentLinks: ["javascript:alert(1)//https://", "https://old.test"],
      files: [],
    });
    expect(merged.currentLinks).toEqual(["https://old.test"]);
  });

  it("reports no change without touching storage or the row", async () => {
    await expect(updateStreamFlow(teacher, ref, emptyPatch)).resolves.toEqual({
      ok: true,
      value: { stream: stored, changed: false },
    });
    expect(buckets.deleteFilesFromBucket).not.toHaveBeenCalled();
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.updateStreamPost).not.toHaveBeenCalled();
  });

  it("neither deletes nor uploads when the merged record fails validation", async () => {
    const outcome = await updateStreamFlow(teacher, ref, {
      dueDate: new Date("not a date"),
      currentAttachments: [A2],
      files: [file()],
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message:
        "Invalid update data provided. Please check all fields and try again.",
    });
    expect(buckets.deleteFilesFromBucket).not.toHaveBeenCalled();
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.updateStreamPost).not.toHaveBeenCalled();
  });

  it("deletes removed files only inside the class folder", async () => {
    streams.getClassStreamByStreamId.mockResolvedValue({
      ...stored,
      attachments: [A1, FOREIGN],
    });
    const outcome = await updateStreamFlow(teacher, ref, {
      currentAttachments: [],
      files: [],
    });
    expect(outcome).toMatchObject({ ok: true, value: { changed: true } });
    expect(buckets.deleteFilesFromBucket).toHaveBeenCalledTimes(1);
    expect(buckets.deleteFilesFromBucket).toHaveBeenCalledWith("streams", [
      `${C1}/a.pdf`,
    ]);
    expect(streams.updateStreamPost).toHaveBeenCalledWith(
      S1,
      expect.objectContaining({ attachments: [] }),
    );
  });

  it("keeps attachments, links, dates, topic and audience on a title-only patch", async () => {
    const outcome = await updateStreamFlow(teacher, ref, {
      title: "New",
      files: [],
    });
    expect(outcome).toMatchObject({ ok: true, value: { changed: true } });
    expect(buckets.deleteFilesFromBucket).not.toHaveBeenCalled();
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.updateStreamPost).toHaveBeenCalledWith(
      S1,
      expect.objectContaining({
        title: "New",
        content: "Do it",
        attachments: [A1, A2],
        links: ["https://old.test"],
        dueDate: stored.dueDate,
        scheduledAt: null,
        points: 50,
        topicId: T1,
        topicName: "Week 1",
        announceToAll: false,
        announceTo: ["u1", "u2", "u3", "u4", "u5"],
      }),
    );
  });

  it("uploads new files after validation and puts them first", async () => {
    const f = file();
    await updateStreamFlow(teacher, ref, { files: [f] });
    expect(storage.uploadAttachments).toHaveBeenCalledWith("streams", C1, f);
    expect(streams.updateStreamPost).toHaveBeenCalledWith(
      S1,
      expect.objectContaining({ attachments: ["https://x/up.pdf", A1, A2] }),
    );
  });

  it("re-reads the roster when assigning to all", async () => {
    await updateStreamFlow(teacher, ref, { isAssignToAll: true, files: [] });
    expect(streams.updateStreamPost).toHaveBeenCalledWith(
      S1,
      expect.objectContaining({
        announceToAll: true,
        announceTo: ["u1", "u2"],
      }),
    );
  });

  it("rejects a new audience id that is not in the class", async () => {
    const outcome = await updateStreamFlow(teacher, ref, {
      announceTo: ["u1", "outsider"],
      files: [file()],
    });
    expect(outcome).toEqual({
      ok: false,
      code: "validation_failed",
      message:
        "Invalid update data provided. Please check all fields and try again.",
    });
    expect(storage.uploadAttachments).not.toHaveBeenCalled();
    expect(streams.updateStreamPost).not.toHaveBeenCalled();
  });

  it("is a conflict when the update returns nothing", async () => {
    streams.updateStreamPost.mockResolvedValue(null);
    await expect(
      updateStreamFlow(teacher, ref, { title: "New", files: [] }),
    ).resolves.toEqual({
      ok: false,
      code: "conflict",
      message: "Failed to update post.",
    });
  });
});

describe("deleteStreamFlow", () => {
  it("is not_found when the post is not in the given class and deletes nothing", async () => {
    await expect(
      deleteStreamFlow(teacher, { classId: C2, streamId: S1 }),
    ).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
    expect(streams.deleteClassStreamPost).not.toHaveBeenCalled();
    expect(buckets.deleteFilesFromBucket).not.toHaveBeenCalled();
  });

  it("is not_found when the post's class is gone", async () => {
    classrooms.getClassByClassId.mockResolvedValue(null);
    await expect(
      deleteStreamFlow(teacher, { classId: C1, streamId: S1 }),
    ).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This class doesn't exist.",
    });
  });

  it("is forbidden for an enrolled non-author", async () => {
    await expect(
      deleteStreamFlow({ ...student, id: "u1" }, { classId: C1, streamId: S1 }),
    ).resolves.toEqual({
      ok: false,
      code: "forbidden",
      message: "You're not authorized to delete this post.",
    });
    expect(streams.deleteClassStreamPost).not.toHaveBeenCalled();
  });

  it("is not_found for a member who may not see the post", async () => {
    await expect(
      deleteStreamFlow(student, { classId: C1, streamId: S1 }),
    ).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This post doesn't exist in this class.",
    });
    expect(streams.deleteClassStreamPost).not.toHaveBeenCalled();
  });

  it("cascades comments, files and notifications before deleting the post", async () => {
    comments.getAllCommentsByStreamId.mockResolvedValue([
      {
        id: "cm1",
        attachment: `https://x/storage/v1/object/public/comments/${C1}/c.png`,
      },
    ]);
    await expect(
      deleteStreamFlow(teacher, { classId: C1, streamId: S1 }),
    ).resolves.toEqual({ ok: true, value: undefined });
    expect(buckets.deleteFilesFromBucket).toHaveBeenCalledWith("comments", [
      `${C1}/c.png`,
    ]);
    expect(
      comments.deleteAllClassStreamCommentsByStreamIdRecord,
    ).toHaveBeenCalledWith(S1);
    expect(buckets.deleteFilesFromBucket).toHaveBeenCalledWith("streams", [
      `${C1}/a.pdf`,
      `${C1}/b.pdf`,
    ]);
    expect(
      notifications.deleteAllNotificationsByResourceId,
    ).toHaveBeenCalledWith("cm1");
    expect(
      notifications.deleteAllNotificationsByResourceId,
    ).toHaveBeenCalledWith(S1);
    expect(streams.deleteClassStreamPost).toHaveBeenCalledWith(S1);
  });
});
