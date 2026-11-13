import { describe, expect, it } from "vitest";

import { announceToList, readStreamFormFields } from "@/lib/stream-form";

function form(entries: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      data.append(key, item);
    }
  }
  return data;
}

describe("readStreamFormFields", () => {
  it("reads every field with the branch's names", () => {
    const fields = readStreamFormFields(
      form({
        classroomId: "c1",
        streamId: "s1",
        type: "assignment",
        title: "HW 1",
        description: "Do it",
        topicId: "t1",
        dueDate: "2026-06-15T10:00:00.000Z",
        scheduledAt: "2026-06-10T08:00:00.000Z",
        points: "50",
        acceptingSubmissions: "true",
        closeSubmissionsAfterDueDate: "true",
        isAssignToAll: "false",
        announceTo: ["u1", "u2"],
        links: ["https://a.test", "https://b.test"],
        curUrlLinks: ["https://old.test"],
        curAttachments: ["https://files/old.pdf"],
      }),
    );
    expect(fields).toEqual({
      classroomId: "c1",
      streamId: "s1",
      type: "assignment",
      title: "HW 1",
      content: "Do it",
      topicId: "t1",
      dueDate: new Date("2026-06-15T10:00:00.000Z"),
      scheduledAt: new Date("2026-06-10T08:00:00.000Z"),
      points: 50,
      acceptingSubmissions: true,
      closeSubmissionsAfterDueDate: true,
      isAssignToAll: false,
      announceTo: ["u1", "u2"],
      links: ["https://a.test", "https://b.test"],
      currentLinks: ["https://old.test"],
      currentAttachments: ["https://files/old.pdf"],
    });
  });

  it("applies defaults when fields are absent or empty", () => {
    const fields = readStreamFormFields(
      form({ classroomId: "c1", type: "stream", points: "" }),
    );
    expect(fields.streamId).toBeNull();
    expect(fields.title).toBeNull();
    expect(fields.content).toBeNull();
    expect(fields.topicId).toBe("no-topic");
    expect(fields.dueDate).toBeNull();
    expect(fields.scheduledAt).toBeNull();
    expect(fields.points).toBeNull();
    expect(fields.acceptingSubmissions).toBe(false);
    expect(fields.closeSubmissionsAfterDueDate).toBe(false);
    expect(fields.isAssignToAll).toBe(false);
    expect(fields.announceTo).toEqual([]);
    expect(fields.links).toEqual([]);
    expect(fields.currentLinks).toEqual([]);
    expect(fields.currentAttachments).toEqual([]);
  });

  it("accepts announceTo as a single JSON array entry", () => {
    const fields = readStreamFormFields(
      form({ classroomId: "c1", type: "quiz", announceTo: '["u1","u3"]' }),
    );
    expect(fields.announceTo).toEqual(["u1", "u3"]);
  });

  it("falls back to stream for an unknown type and keeps invalid dates null", () => {
    const fields = readStreamFormFields(
      form({ classroomId: "c1", type: "bogus", dueDate: "not-a-date" }),
    );
    expect(fields.type).toBe("stream");
    expect(fields.dueDate).toBeNull();
  });
});

describe("announceToList", () => {
  it("expands a single JSON array entry", () => {
    expect(announceToList(['["a"]'])).toEqual(["a"]);
  });

  it("keeps plain entries as they are", () => {
    expect(announceToList(["a", "b"])).toEqual(["a", "b"]);
  });

  it("drops non-string items of a JSON entry and ignores broken JSON", () => {
    expect(announceToList(['["a", 1, null]'])).toEqual(["a"]);
    expect(announceToList(["[not json"])).toEqual([]);
  });
});
