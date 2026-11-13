import { describe, expect, it } from "vitest";

import type { Classroom, Stream, StreamPrivateComment } from "@/lib/schema";
import {
  canComment,
  canDeleteComment,
  canPrivateComment,
  privateCommentRecipient,
  visiblePrivateComments,
} from "@/server/authorize/comment";

const classroom = {
  id: "c1",
  teacherId: "teacher",
  allowUsersToComment: false,
} as Classroom;

const announcedToAll = {
  announceToAll: true,
  announceTo: [],
} as unknown as Stream;
const targeted = {
  announceToAll: false,
  announceTo: ["other"],
} as unknown as Stream;

describe("canComment", () => {
  it("forbids an enrolled student when comments are off", () => {
    expect(canComment(classroom, "student", true)).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment on this post.",
    });
  });

  it("forbids a non-member even when comments are on", () => {
    expect(
      canComment({ ...classroom, allowUsersToComment: true }, "stranger", false)
        .ok,
    ).toBe(false);
  });

  it("allows the teacher with comments off and a student with comments on", () => {
    expect(canComment(classroom, "teacher", false).ok).toBe(true);
    expect(
      canComment({ ...classroom, allowUsersToComment: true }, "student", true)
        .ok,
    ).toBe(true);
  });
});

describe("canPrivateComment", () => {
  it("forbids someone who is neither teacher nor enrolled", () => {
    expect(
      canPrivateComment(classroom, announcedToAll, "stranger", false),
    ).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment.",
    });
  });

  it("forbids an enrolled student outside the post's audience", () => {
    expect(canPrivateComment(classroom, targeted, "student", true)).toEqual({
      ok: false,
      code: "forbidden",
      message: "You don't have permission to comment on this classwork.",
    });
  });

  it("allows the teacher on a targeted post and a student in the audience", () => {
    expect(canPrivateComment(classroom, targeted, "teacher", false).ok).toBe(
      true,
    );
    expect(canPrivateComment(classroom, targeted, "other", true).ok).toBe(true);
    expect(
      canPrivateComment(classroom, announcedToAll, "student", true).ok,
    ).toBe(true);
  });
});

describe("privateCommentRecipient", () => {
  it("sends a student's comment to the teacher whatever was requested", () => {
    expect(privateCommentRecipient(classroom, "student1", "someoneElse")).toBe(
      "teacher",
    );
    expect(privateCommentRecipient(classroom, "student1", null)).toBe(
      "teacher",
    );
  });

  it("sends the teacher's comment to the requested user", () => {
    expect(privateCommentRecipient(classroom, "teacher", "student1")).toBe(
      "student1",
    );
    expect(privateCommentRecipient(classroom, "teacher", null)).toBeNull();
  });
});

describe("visiblePrivateComments", () => {
  const rows = [
    { id: "a", userId: "student1", toUserId: "teacher" },
    { id: "b", userId: "teacher", toUserId: "student1" },
    { id: "c", userId: "student2", toUserId: "teacher" },
  ] as StreamPrivateComment[];

  it("keeps only the rows a student wrote or received", () => {
    expect(
      visiblePrivateComments(rows, "student1", "teacher").map((r) => r.id),
    ).toEqual(["a", "b"]);
  });

  it("keeps every row for the teacher", () => {
    expect(visiblePrivateComments(rows, "teacher", "teacher")).toEqual(rows);
  });
});

describe("canDeleteComment", () => {
  const comment = { userId: "author" };

  it("allows the author", () => {
    expect(canDeleteComment(comment, classroom, "author").ok).toBe(true);
  });

  it("allows the class teacher", () => {
    expect(canDeleteComment(comment, classroom, "teacher").ok).toBe(true);
  });

  it("forbids anyone else", () => {
    expect(canDeleteComment(comment, classroom, "stranger")).toEqual({
      ok: false,
      code: "forbidden",
      message: "You're not authorized to delete this comment.",
    });
  });
});
