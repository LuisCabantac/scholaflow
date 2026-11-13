import type { Outcome } from "@/types/api";
import type { Classroom, EnrolledClass } from "@/lib/schema";
import { getClassByClassId, isClassMember } from "@/services/classroom";

const missing: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This class doesn't exist.",
};

export async function classroomForMember(
  userId: string,
  classId: string,
): Promise<Outcome<Classroom>> {
  const classroom = await getClassByClassId(classId);
  if (!classroom) return missing;
  if (!(await isClassMember(userId, classId))) {
    return {
      ok: false,
      code: "forbidden",
      message: "You are not a member of this class.",
    };
  }
  return { ok: true, value: classroom };
}

export async function classroomForTeacher(
  userId: string,
  classId: string,
): Promise<Outcome<Classroom>> {
  const classroom = await getClassByClassId(classId);
  if (!classroom) return missing;
  if (classroom.teacherId !== userId) {
    return {
      ok: false,
      code: "forbidden",
      message: "Only the teacher can manage this class.",
    };
  }
  return { ok: true, value: classroom };
}

export function classroomView(classroom: Classroom, userId: string): Classroom {
  return classroom.teacherId === userId
    ? classroom
    : { ...classroom, code: "" };
}

export function canRemoveEnrollment(
  classroom: Classroom,
  enrollment: EnrolledClass,
  userId: string,
): Outcome<void> {
  if (enrollment.classId !== classroom.id) {
    return {
      ok: false,
      code: "not_found",
      message: "You are not a member of this class.",
    };
  }
  if (classroom.teacherId !== userId && enrollment.userId !== userId) {
    return {
      ok: false,
      code: "forbidden",
      message: "You're not authorized to remove this user.",
    };
  }
  return { ok: true, value: undefined };
}

export function requireNotAdmin(
  user: { role: string },
  message: string,
): Outcome<void> {
  if (user.role === "admin") return { ok: false, code: "conflict", message };
  return { ok: true, value: undefined };
}
