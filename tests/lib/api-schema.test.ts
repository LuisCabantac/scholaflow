import { describe, expect, it } from "vitest";

import {
  createClassBody,
  joinClassBody,
  updateClassBody,
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
