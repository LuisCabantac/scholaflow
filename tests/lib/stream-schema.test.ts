import { describe, expect, it } from "vitest";

import { createStreamSchema } from "@/lib/schema";

const base = {
  type: "stream",
  classId: "6dc6c587-a760-478e-8e7a-a3c76046847c",
  className: "Test",
  userId: "user-1",
  userName: "User",
  userImage: "https://example.com/avatar.png",
  title: null,
  content: "hello",
  attachments: [],
  links: [],
  points: null,
  dueDate: null,
  topicId: null,
  topicName: null,
  announceToAll: true,
  announceTo: [],
  acceptingSubmissions: true,
  closeSubmissionsAfterDueDate: false,
  scheduledAt: null,
};

describe("createStreamSchema", () => {
  it("accepts a new post that carries the class name", () => {
    expect(createStreamSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a new post without the class name", () => {
    const { className: _omitted, ...withoutName } = base;
    expect(createStreamSchema.safeParse(withoutName).success).toBe(false);
  });
});
