import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Classroom, EnrolledClass } from "@/lib/schema";
import {
  canRemoveEnrollment,
  classroomForMember,
  classroomForTeacher,
  classroomView,
  requireNotAdmin,
} from "@/server/authorize/classroom";

const { getClassByClassId, isClassMember } = vi.hoisted(() => ({
  getClassByClassId: vi.fn(),
  isClassMember: vi.fn(),
}));

vi.mock("@/services/classroom", () => ({ getClassByClassId, isClassMember }));

const classroom = {
  id: "c1",
  code: "abcd1234",
  teacherId: "teacher",
} as Classroom;

describe("classroomForMember", () => {
  beforeEach(() => {
    getClassByClassId.mockReset();
    isClassMember.mockReset();
  });

  it("is not_found when the class does not exist", async () => {
    getClassByClassId.mockResolvedValue(null);
    await expect(classroomForMember("u", "c1")).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "This class doesn't exist.",
    });
  });

  it("is forbidden for a non-member", async () => {
    getClassByClassId.mockResolvedValue(classroom);
    isClassMember.mockResolvedValue(false);
    await expect(classroomForMember("u", "c1")).resolves.toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });

  it("returns the class for a member", async () => {
    getClassByClassId.mockResolvedValue(classroom);
    isClassMember.mockResolvedValue(true);
    await expect(classroomForMember("u", "c1")).resolves.toEqual({
      ok: true,
      value: classroom,
    });
  });
});

describe("classroomForTeacher", () => {
  it("is forbidden for anyone but the teacher", async () => {
    getClassByClassId.mockResolvedValue(classroom);
    await expect(classroomForTeacher("student", "c1")).resolves.toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });

  it("returns the class for the teacher", async () => {
    getClassByClassId.mockResolvedValue(classroom);
    await expect(classroomForTeacher("teacher", "c1")).resolves.toEqual({
      ok: true,
      value: classroom,
    });
  });
});

describe("classroomView", () => {
  it("blanks the invite code for a student and keeps it for the teacher", () => {
    expect(classroomView(classroom, "student").code).toBe("");
    expect(classroomView(classroom, "teacher").code).toBe("abcd1234");
  });
});

describe("canRemoveEnrollment", () => {
  const enrollment = {
    id: "e1",
    classId: "c1",
    userId: "student",
  } as EnrolledClass;

  it("is not_found when the enrollment belongs to another class", () => {
    expect(
      canRemoveEnrollment(
        classroom,
        { ...enrollment, classId: "other" },
        "teacher",
      ),
    ).toMatchObject({ ok: false, code: "not_found" });
  });

  it("is forbidden for a stranger", () => {
    expect(canRemoveEnrollment(classroom, enrollment, "someone")).toMatchObject(
      { ok: false, code: "forbidden" },
    );
  });

  it("is ok for the teacher and for the member themselves", () => {
    expect(canRemoveEnrollment(classroom, enrollment, "teacher").ok).toBe(true);
    expect(canRemoveEnrollment(classroom, enrollment, "student").ok).toBe(true);
  });
});

describe("requireNotAdmin", () => {
  it("is a conflict for admins with the given message", () => {
    expect(requireNotAdmin({ role: "admin" }, "No admins.")).toEqual({
      ok: false,
      code: "conflict",
      message: "No admins.",
    });
  });

  it("is ok for users", () => {
    expect(requireNotAdmin({ role: "user" }, "No admins.").ok).toBe(true);
  });
});
