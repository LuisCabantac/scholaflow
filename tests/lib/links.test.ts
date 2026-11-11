import { describe, expect, it } from "vitest";

import { isWebUrl } from "@/lib/links";

describe("isWebUrl", () => {
  it("accepts http and https urls", () => {
    expect(isWebUrl("https://tanstack.com/router")).toBe(true);
    expect(isWebUrl("http://example.com")).toBe(true);
  });

  it("rejects other schemes", () => {
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("ftp://example.com/file")).toBe(false);
    expect(isWebUrl("mailto:me@example.com")).toBe(false);
  });

  it("rejects text that is not a url", () => {
    expect(isWebUrl("not a url")).toBe(false);
    expect(isWebUrl("")).toBe(false);
  });
});
