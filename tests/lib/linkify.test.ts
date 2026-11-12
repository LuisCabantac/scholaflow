import { describe, expect, it } from "vitest";

import { linkifySegments } from "@/lib/linkify";

describe("linkifySegments", () => {
  it("returns the plain text as a single segment when there is no link", () => {
    expect(linkifySegments("hello class")).toEqual([
      { type: "text", value: "hello class" },
    ]);
  });

  it("splits text around a full url", () => {
    expect(linkifySegments("see https://example.com/a?b=1 now")).toEqual([
      { type: "text", value: "see " },
      {
        type: "link",
        href: "https://example.com/a?b=1",
        text: "https://example.com/a?b=1",
      },
      { type: "text", value: " now" },
    ]);
  });

  it("links bare domains and www hosts with an http scheme", () => {
    expect(linkifySegments("example.com and www.google.com")).toEqual([
      { type: "link", href: "http://example.com", text: "example.com" },
      { type: "text", value: " and " },
      { type: "link", href: "http://www.google.com", text: "www.google.com" },
    ]);
  });

  it("links email addresses with mailto", () => {
    expect(linkifySegments("mail me@example.org")).toEqual([
      { type: "text", value: "mail " },
      { type: "link", href: "mailto:me@example.org", text: "me@example.org" },
    ]);
  });

  it("returns an empty list for an empty string", () => {
    expect(linkifySegments("")).toEqual([]);
  });
});
