import { describe, expect, it } from "vitest";

import {
  STREAM_LIST_FIELDS,
  classworkSearchQuery,
  commentForm,
  commentParams,
  createClassBody,
  createStreamForm,
  joinClassBody,
  privateCommentForm,
  streamIdParams,
  updateClassBody,
  updateStreamForm,
} from "@/lib/schema/api";

describe("createClassBody", () => {
  it("rejects a missing name and a bad colour", () => {
    expect(createClassBody.safeParse({ color: "#112233" }).success).toBe(false);
    expect(
      createClassBody.safeParse({ name: "Math", color: "blue" }).success,
    ).toBe(false);
  });

  it("fills optional fields with the website's defaults", () => {
    expect(createClassBody.parse({ name: " Math ", color: "#112233" })).toEqual(
      {
        name: "Math",
        subject: null,
        section: "",
        room: null,
        color: "#112233",
      },
    );
  });
});

describe("updateClassBody", () => {
  it("treats every field as optional so a patch keeps what it omits", () => {
    const parsed = updateClassBody.parse({ name: "Math" });
    expect(parsed).toEqual({ name: "Math" });
    expect(parsed.regenerateCode).toBeUndefined();
  });

  it("still rejects an empty name and a bad color", () => {
    expect(updateClassBody.safeParse({ name: " " }).success).toBe(false);
    expect(updateClassBody.safeParse({ color: "blue" }).success).toBe(false);
  });
});

describe("createClassBody", () => {
  it("stores blank subject and room as null like the website", () => {
    const parsed = createClassBody.parse({
      name: "Math",
      subject: "  ",
      room: "",
      color: "#112233",
    });
    expect(parsed.subject).toBeNull();
    expect(parsed.room).toBeNull();
    expect(parsed.section).toBe("");
  });
});

describe("joinClassBody", () => {
  it("trims the code", () => {
    expect(joinClassBody.parse({ code: " abcd1234 " })).toEqual({
      code: "abcd1234",
    });
  });
});

describe("createStreamForm", () => {
  it("fills the website's defaults and assigns to all when no audience was sent", () => {
    expect(createStreamForm.parse({})).toEqual({
      type: "stream",
      title: null,
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
    });
  });

  it("assigns to the listed audience when announceTo was sent", () => {
    const parsed = createStreamForm.parse({ announceTo: ["u1"] });
    expect(parsed.isAssignToAll).toBe(false);
    expect(parsed.announceTo).toEqual(["u1"]);
  });

  it("keeps an explicit isAssignToAll over the audience rule", () => {
    expect(
      createStreamForm.parse({ announceTo: ["u1"], isAssignToAll: "true" })
        .isAssignToAll,
    ).toBe(true);
  });

  it("rejects an unknown type, fractional or non-numeric points, a loose date and a non-web link", () => {
    expect(createStreamForm.safeParse({ type: "bogus" }).success).toBe(false);
    expect(createStreamForm.safeParse({ points: "1.5" }).success).toBe(false);
    expect(createStreamForm.safeParse({ points: "abc" }).success).toBe(false);
    expect(createStreamForm.safeParse({ dueDate: "tomorrow" }).success).toBe(
      false,
    );
    expect(
      createStreamForm.safeParse({ links: ["javascript:alert(1)"] }).success,
    ).toBe(false);
  });

  it("maps description to content and parses the typed fields", () => {
    const parsed = createStreamForm.parse({
      type: "assignment",
      description: "Hi",
      points: "50",
      dueDate: "2026-06-15T10:00:00.000Z",
      acceptingSubmissions: "true",
      topicId: "6dc6c587-a760-478e-8e7a-a3c76046847c",
      links: ["https://a.test"],
    });
    expect(parsed).toMatchObject({
      type: "assignment",
      content: "Hi",
      points: 50,
      dueDate: new Date("2026-06-15T10:00:00.000Z"),
      acceptingSubmissions: true,
      topicId: "6dc6c587-a760-478e-8e7a-a3c76046847c",
      links: ["https://a.test"],
    });
  });

  it("accepts announceTo as one JSON array entry", () => {
    expect(
      createStreamForm.parse({ announceTo: ['["a","b"]'] }).announceTo,
    ).toEqual(["a", "b"]);
  });
});

describe("updateStreamForm", () => {
  it("leaves every field undefined when nothing was sent", () => {
    const parsed = updateStreamForm.parse({});
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
    expect(Object.values(parsed).every((v) => v === undefined)).toBe(true);
    expect(parsed).not.toHaveProperty("type");
  });

  it("clears a text field sent empty and keeps the rename of the list fields", () => {
    expect(updateStreamForm.parse({ title: "" }).title).toBeNull();
    expect(
      updateStreamForm.parse({ curAttachments: [] }).currentAttachments,
    ).toEqual([]);
    expect(
      updateStreamForm.parse({ curUrlLinks: ["https://x.test"] }).currentLinks,
    ).toEqual(["https://x.test"]);
    expect(updateStreamForm.parse({ topicId: "" }).topicId).toBe("no-topic");
    expect(updateStreamForm.parse({ description: "x" }).content).toBe("x");
  });

  it("strips type instead of letting it change", () => {
    expect(updateStreamForm.parse({ type: "quiz" })).not.toHaveProperty("type");
  });
});

describe("commentForm", () => {
  it("turns an empty or missing comment into null content", () => {
    expect(commentForm.parse({ comment: "" })).toEqual({ content: null });
    expect(commentForm.parse({})).toEqual({ content: null });
    expect(commentForm.parse({ comment: "Hi" })).toEqual({ content: "Hi" });
  });

  it("reads the private comment recipient", () => {
    expect(privateCommentForm.parse({ comment: "Hi", userId: "u1" })).toEqual({
      content: "Hi",
      recipientId: "u1",
    });
    expect(privateCommentForm.parse({}).recipientId).toBeNull();
  });
});

describe("stream params and query", () => {
  it("requires uuids and trims the search", () => {
    expect(streamIdParams.safeParse({ streamId: "abc" }).success).toBe(false);
    expect(
      commentParams.safeParse({
        streamId: "6dc6c587-a760-478e-8e7a-a3c76046847c",
        commentId: "x",
      }).success,
    ).toBe(false);
    expect(classworkSearchQuery.parse({ q: " hw " })).toEqual({ q: "hw" });
    expect(classworkSearchQuery.parse({})).toEqual({});
    expect(STREAM_LIST_FIELDS).toEqual([
      "announceTo",
      "links",
      "curUrlLinks",
      "curAttachments",
    ]);
  });
});
