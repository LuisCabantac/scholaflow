import { describe, expect, it } from "vitest";

import type { Classroom } from "@/lib/schema";
import { classChanges, newClassRecord } from "@/services/classroom-flows";

const teacher = {
  id: "t1",
  name: "Teacher",
  image: "https://x/t.png",
  role: "user",
};

describe("newClassRecord", () => {
  it("applies the website's defaults for a new class", () => {
    const record = newClassRecord(teacher, {
      name: "Math",
      subject: null,
      section: "",
      room: null,
      color: "#112233",
    });
    expect(record).toMatchObject({
      name: "Math",
      subject: null,
      section: "",
      room: null,
      cardBackground: "#112233",
      teacherId: "t1",
      teacherName: "Teacher",
      teacherImage: "https://x/t.png",
      description: null,
      allowUsersToComment: false,
      allowUsersToPost: false,
    });
    expect(record.illustrationIndex).toBeGreaterThanOrEqual(0);
    expect(record.illustrationIndex).toBeLessThan(5);
    expect(record.code).toHaveLength(8);
  });
});

describe("classChanges", () => {
  const current = {
    id: "c1",
    name: "Math",
    subject: "Algebra",
    section: "A",
    description: "Desc",
    cardBackground: "#112233",
    code: "oldcode1",
    teacherId: "t1",
    teacherName: "Teacher",
    teacherImage: "https://x/t.png",
    allowUsersToComment: true,
    allowUsersToPost: false,
  } as Classroom;
  const same = {
    name: "Math",
    subject: "Algebra",
    section: "A",
    description: "Desc",
    color: "#112233",
    allowUsersToComment: true,
    allowUsersToPost: false,
    regenerateCode: false,
  };

  it("returns null when nothing changed", () => {
    expect(classChanges(current, same, teacher)).toBeNull();
  });

  it("returns the class and enrolment payloads when a field changed", () => {
    const changes = classChanges(current, { ...same, name: "Maths" }, teacher);
    expect(changes?.classroom).toMatchObject({
      name: "Maths",
      code: "oldcode1",
    });
    expect(changes?.enrolled).toMatchObject({
      name: "Maths",
      teacherName: "Teacher",
    });
  });

  it("regenerates the code on request even when nothing else changed", () => {
    const changes = classChanges(
      current,
      { ...same, regenerateCode: true },
      teacher,
    );
    expect(changes).not.toBeNull();
    expect(changes?.classroom.code).toHaveLength(8);
    expect(changes?.classroom.code).not.toBe("oldcode1");
  });

  it("detects a teacher name or avatar drift as a change", () => {
    expect(
      classChanges(current, same, { ...teacher, name: "Renamed" }),
    ).not.toBeNull();
  });
});
