import { queryOptions } from "@tanstack/react-query";

import {
  getAllClassesByTeacherIdFn,
  getAllEnrolledClassesByUserIdFn,
  getClassByClassCodeFn,
  getClassByClassIdFn,
  getEnrolledClassByClassAndSessionIdFn,
} from "@/server/functions/classroom";

export const classroomKeys = {
  all: ["classroom"] as const,
  byTeacher: (userId: string) =>
    [...classroomKeys.all, "byTeacher", userId] as const,
  enrolledByUser: (userId: string) =>
    [...classroomKeys.all, "enrolledByUser", userId] as const,
  byId: (classId: string) => [...classroomKeys.all, "byId", classId] as const,
  byCode: (code: string) => [...classroomKeys.all, "byCode", code] as const,
  enrolledByClassAndSession: (userId: string, classId: string) =>
    [...classroomKeys.all, "enrolled", userId, classId] as const,
};

export const classroomQueries = {
  byTeacher: (userId: string) =>
    queryOptions({
      queryKey: classroomKeys.byTeacher(userId),
      queryFn: () => getAllClassesByTeacherIdFn({ data: userId }),
    }),
  enrolledByUser: (userId: string) =>
    queryOptions({
      queryKey: classroomKeys.enrolledByUser(userId),
      queryFn: () => getAllEnrolledClassesByUserIdFn({ data: userId }),
    }),
  byId: (classId: string) =>
    queryOptions({
      queryKey: classroomKeys.byId(classId),
      queryFn: () => getClassByClassIdFn({ data: classId }),
    }),
  byCode: (code: string) =>
    queryOptions({
      queryKey: classroomKeys.byCode(code),
      queryFn: () => getClassByClassCodeFn({ data: code }),
    }),
  enrolledByClassAndSession: (userId: string, classId: string) =>
    queryOptions({
      queryKey: classroomKeys.enrolledByClassAndSession(userId, classId),
      queryFn: () =>
        getEnrolledClassByClassAndSessionIdFn({ data: { userId, classId } }),
    }),
};
