import { describe, expect, it } from "vitest";

import { isSafeRedirectPath, resolveRedirect } from "@/lib/redirect";

describe("isSafeRedirectPath", () => {
  it.each([
    "/classroom",
    "/classroom/class/abc?x=1",
    "/notes#top",
  ])("accepts same-origin path %s", (value) => {
    expect(isSafeRedirectPath(value)).toBe(true);
  });

  it.each([
    undefined,
    "",
    "classroom",
    "//evil.example",
    "https://evil.example",
    "/\\evil.example",
    "/a@b",
    "/line\nbreak",
  ])("rejects %j", (value) => {
    expect(isSafeRedirectPath(value)).toBe(false);
  });
});

describe("resolveRedirect", () => {
  it("returns the path when safe", () => {
    expect(resolveRedirect("/notes")).toBe("/notes");
  });

  it("falls back to /classroom otherwise", () => {
    expect(resolveRedirect("//x")).toBe("/classroom");
    expect(resolveRedirect(undefined)).toBe("/classroom");
  });
});
