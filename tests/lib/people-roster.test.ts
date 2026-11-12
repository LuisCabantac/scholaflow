import { describe, expect, it } from "vitest";

import { sortRoster } from "@/lib/people-roster";
import type { EnrolledClass } from "@/lib/schema";

function enrolled(id: string, userName: string): EnrolledClass {
  return {
    id,
    userId: `u-${id}`,
    userName,
    userImage: "",
    classId: "c1",
    name: "Class",
    subject: "",
    section: "",
    teacherName: "",
    teacherImage: "",
    cardBackground: "",
    illustrationIndex: 0,
    createdAt: new Date("2026-01-01T00:00:00Z"),
  } as EnrolledClass;
}

describe("sortRoster", () => {
  it("orders by name ignoring case", () => {
    const list = [
      enrolled("1", "zoe"),
      enrolled("2", "Adam"),
      enrolled("3", "bea"),
    ];
    expect(sortRoster(list).map((e) => e.userName)).toEqual([
      "Adam",
      "bea",
      "zoe",
    ]);
  });

  it("keeps equal names in their original order", () => {
    const list = [enrolled("1", "Sam"), enrolled("2", "sam")];
    expect(sortRoster(list).map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("does not mutate the input", () => {
    const list = [enrolled("1", "zoe"), enrolled("2", "Adam")];
    sortRoster(list);
    expect(list[0].id).toBe("1");
  });

  it("returns an empty array for null or undefined", () => {
    expect(sortRoster(null)).toEqual([]);
    expect(sortRoster(undefined)).toEqual([]);
  });
});
