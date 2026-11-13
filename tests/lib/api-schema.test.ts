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
  it("defaults regenerateCode to false", () => {
    const parsed = updateClassBody.parse({
      name: "Math",
      color: "#112233",
      allowUsersToComment: true,
      allowUsersToPost: false,
    });
    expect(parsed.regenerateCode).toBe(false);
    expect(parsed.description).toBeNull();
  });
});

describe("joinClassBody", () => {
  it("trims the code", () => {
    expect(joinClassBody.parse({ code: " abcd1234 " })).toEqual({
      code: "abcd1234",
    });
  });
});
