import { describe, expect, it } from "vitest";

import type { Notification } from "@/lib/schema";
import {
  filterNotifications,
  hasUnread,
  notificationTitleKey,
  notificationWhen,
} from "@/lib/notifications";

function notification(overrides: Partial<Notification>): Notification {
  return {
    id: "n1",
    userId: "u1",
    type: "stream",
    fromUserName: "Teacher",
    fromUserImage: "",
    resourceId: "11111111-1111-4111-8111-111111111111",
    resourceContent: "Hello",
    resourceUrl: "/classroom/class/x/stream/y",
    isRead: false,
    createdAt: new Date("2026-06-10T12:00:00Z"),
    ...overrides,
  };
}

describe("notificationTitleKey", () => {
  it("maps every notification type to its title key", () => {
    expect(notificationTitleKey("stream")).toBe("stream");
    expect(notificationTitleKey("addToClass")).toBe("addToClass");
    expect(notificationTitleKey("grade")).toBe("grade");
  });
});

describe("notificationWhen", () => {
  const now = new Date("2026-06-15T15:20:00");

  it("counts whole hours for the same day", () => {
    expect(notificationWhen(new Date("2026-06-15T12:05:00"), now)).toEqual({
      kind: "hours",
      hours: 3,
    });
  });

  it("counts minutes when less than an hour passed", () => {
    expect(notificationWhen(new Date("2026-06-15T15:00:00"), now)).toEqual({
      kind: "minutes",
      minutes: 20,
    });
    expect(notificationWhen(new Date("2026-06-15T15:19:50"), now)).toEqual({
      kind: "minutes",
      minutes: 0,
    });
  });

  it("marks the previous calendar day as yesterday", () => {
    expect(notificationWhen(new Date("2026-06-14T23:50:00"), now)).toEqual({
      kind: "yesterday",
    });
  });

  it("gives a short date otherwise", () => {
    expect(notificationWhen(new Date("2026-06-01T09:00:00"), now)).toEqual({
      kind: "date",
      date: "Jun 1",
    });
  });

  it("accepts ISO strings", () => {
    expect(notificationWhen("2026-06-01T09:00:00", now)).toEqual({
      kind: "date",
      date: "Jun 1",
    });
  });
});

describe("filterNotifications", () => {
  const list = [
    notification({ id: "a", isRead: true }),
    notification({ id: "b" }),
  ];

  it("returns everything for all", () => {
    expect(filterNotifications(list, "all").map((n) => n.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("returns only unread for unread", () => {
    expect(filterNotifications(list, "unread").map((n) => n.id)).toEqual(["b"]);
  });

  it("returns an empty list for null", () => {
    expect(filterNotifications(null, "all")).toEqual([]);
    expect(filterNotifications(undefined, "unread")).toEqual([]);
  });
});

describe("hasUnread", () => {
  it("is true only when an unread notification exists", () => {
    expect(hasUnread([notification({ isRead: true })])).toBe(false);
    expect(hasUnread([notification({ isRead: true }), notification({})])).toBe(
      true,
    );
    expect(hasUnread(null)).toBe(false);
  });
});
