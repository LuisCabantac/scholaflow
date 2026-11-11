import { queryOptions } from "@tanstack/react-query";

import {
  getAllAssignedClassworksByStreamAndClassroomIdFn,
  getAllClassworksByUserIdFn,
  getClassworkByClassAndUserIdFn,
} from "@/server/functions/classwork";

export const classworkKeys = {
  all: ["classwork"] as const,
  byUser: (userId: string) => [...classworkKeys.all, "byUser", userId] as const,
  byStreamAndUser: (userId: string, classId: string, streamId: string) =>
    [
      ...classworkKeys.all,
      "byStreamAndUser",
      userId,
      classId,
      streamId,
    ] as const,
  assignedByStream: (classId: string, streamId: string) =>
    [...classworkKeys.all, "assignedByStream", classId, streamId] as const,
};

export const classworkQueries = {
  byUser: (userId: string) =>
    queryOptions({
      queryKey: classworkKeys.byUser(userId),
      queryFn: () => getAllClassworksByUserIdFn({ data: userId }),
    }),
  byStreamAndUser: (userId: string, classId: string, streamId: string) =>
    queryOptions({
      queryKey: classworkKeys.byStreamAndUser(userId, classId, streamId),
      queryFn: () =>
        getClassworkByClassAndUserIdFn({ data: { userId, classId, streamId } }),
    }),
  assignedByStream: (classId: string, streamId: string) =>
    queryOptions({
      queryKey: classworkKeys.assignedByStream(classId, streamId),
      queryFn: () =>
        getAllAssignedClassworksByStreamAndClassroomIdFn({
          data: { classId, streamId },
        }),
    }),
};
