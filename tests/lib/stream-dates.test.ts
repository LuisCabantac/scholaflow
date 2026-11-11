import { describe, expect, it } from "vitest";

import { dueLabel } from "@/lib/stream-dates";

describe("dueLabel", () => {
  it("marks a due date on the current day as today", () => {
    const now = new Date();
    const due = new Date(now);
    due.setHours(23, 30, 0, 0);
    expect(dueLabel(due, now)).toMatchObject({
      kind: "today",
      time: "11:30 PM",
    });
  });

  it("marks a due date on the previous day as yesterday", () => {
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() - 1);
    due.setHours(9, 5, 0, 0);
    expect(dueLabel(due, now)).toMatchObject({
      kind: "yesterday",
      time: "9:05 AM",
    });
  });

  it("gives the long date for any other day without the year when in the current year", () => {
    const now = new Date("2026-11-11T12:00:00");
    const due = new Date("2026-12-24T08:00:00");
    expect(dueLabel(due, now)).toEqual({
      kind: "other",
      time: "8:00 AM",
      date: "Dec 24,  8:00 AM",
    });
  });

  it("adds the year for another year", () => {
    const now = new Date("2026-11-11T12:00:00");
    const due = new Date("2027-01-02T08:00:00");
    expect(dueLabel(due, now).date).toBe("Jan 2, 2027  8:00 AM");
  });
});
