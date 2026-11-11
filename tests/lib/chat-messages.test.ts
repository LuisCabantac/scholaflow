import { describe, expect, it } from "vitest";

import type { Chat } from "@/lib/schema";
import {
  groupMessages,
  isImageAttachment,
  MAX_CHAT_ATTACHMENT_BYTES,
  messageDateLabel,
  sortMessages,
  splitBySize,
} from "@/lib/chat-messages";

function message(
  id: string,
  userId: string,
  createdAt: string,
  overrides: Partial<Chat> = {},
): Chat {
  return {
    id,
    userId,
    userName: userId,
    userImage: "",
    classId: "c1",
    message: id,
    attachments: [],
    createdAt: new Date(createdAt),
    ...overrides,
  };
}

describe("sortMessages", () => {
  it("orders by createdAt ascending and keeps equal timestamps stable", () => {
    const list = [
      message("c", "a", "2026-01-03T00:00:00Z"),
      message("a", "a", "2026-01-01T00:00:00Z"),
      message("b1", "b", "2026-01-02T00:00:00Z"),
      message("b2", "b", "2026-01-02T00:00:00Z"),
    ];
    expect(sortMessages(list).map((m) => m.id)).toEqual(["a", "b1", "b2", "c"]);
  });

  it("does not mutate the input", () => {
    const list = [
      message("b", "a", "2026-01-02T00:00:00Z"),
      message("a", "a", "2026-01-01T00:00:00Z"),
    ];
    sortMessages(list);
    expect(list[0].id).toBe("b");
  });

  it("returns an empty array for null or undefined", () => {
    expect(sortMessages(null)).toEqual([]);
    expect(sortMessages(undefined)).toEqual([]);
  });
});

describe("groupMessages", () => {
  const rows = groupMessages(
    [
      message("1", "a", "2026-01-01T00:00:00Z"),
      message("2", "a", "2026-01-01T00:01:00Z"),
      message("3", "b", "2026-01-01T00:02:00Z"),
      message("4", "a", "2026-01-01T00:03:00Z"),
    ],
    "a",
  );

  it("marks the session user's messages as own", () => {
    expect(rows.map((r) => r.isOwn)).toEqual([true, true, false, true]);
  });

  it("starts a group on the first message and whenever the author changes", () => {
    expect(rows.map((r) => r.startsGroup)).toEqual([true, false, true, true]);
  });

  it("shows the avatar on the last message of a run", () => {
    expect(rows.map((r) => r.showAvatar)).toEqual([false, true, true, true]);
  });

  it("keeps the message on each row", () => {
    expect(rows.map((r) => r.message.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("returns an empty array for an empty list", () => {
    expect(groupMessages([], "a")).toEqual([]);
  });
});

describe("messageDateLabel", () => {
  const labels = { yesterday: "Yesterday" };
  const now = new Date("2026-11-11T15:00:00");

  it("shows the time for a message sent today", () => {
    expect(messageDateLabel(new Date("2026-11-11T09:05:00"), now, labels)).toBe(
      "09:05 AM",
    );
  });

  it("says yesterday for the previous day", () => {
    expect(messageDateLabel(new Date("2026-11-10T23:59:00"), now, labels)).toBe(
      "Yesterday",
    );
  });

  it("shows month and day within the current year", () => {
    expect(messageDateLabel(new Date("2026-06-13T10:39:00"), now, labels)).toBe(
      "Jun 13",
    );
  });

  it("adds the year for another year", () => {
    expect(messageDateLabel(new Date("2025-06-13T10:39:00"), now, labels)).toBe(
      "Jun 13, 2025",
    );
  });

  it("accepts ISO strings", () => {
    expect(messageDateLabel("2026-11-11T09:05:00", now, labels)).toBe(
      "09:05 AM",
    );
  });
});

describe("isImageAttachment", () => {
  it("accepts common image extensions regardless of case", () => {
    expect(isImageAttachment("https://x/y/shot.png")).toBe(true);
    expect(isImageAttachment("https://x/y/shot.JPG")).toBe(true);
    expect(isImageAttachment("https://x/y/anim.webp")).toBe(true);
    expect(isImageAttachment("https://x/y/icon.svg")).toBe(true);
  });

  it("ignores a trailing query string", () => {
    expect(isImageAttachment("https://x/y/shot.png?token=abc")).toBe(true);
  });

  it("rejects non-image files and bare urls", () => {
    expect(isImageAttachment("https://x/y/notes.pdf")).toBe(false);
    expect(isImageAttachment("https://x/y/archive.zip")).toBe(false);
    expect(isImageAttachment("https://x/y/noext")).toBe(false);
  });
});

describe("splitBySize", () => {
  const file = (name: string, size: number) =>
    new File([new Uint8Array(size)], name);

  it("keeps files at or under the limit and rejects larger ones", () => {
    const small = file("small.png", 10);
    const exact = file("exact.png", 100);
    const big = file("big.png", 101);
    expect(splitBySize([small, exact, big], 100)).toEqual({
      accepted: [small, exact],
      rejected: [big],
    });
  });

  it("exports a 4 MB cap", () => {
    expect(MAX_CHAT_ATTACHMENT_BYTES).toBe(4 * 1024 * 1024);
  });
});
