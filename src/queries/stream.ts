import { queryOptions } from "@tanstack/react-query";

import {
  getAllClassStreamsByClassIdFn,
  getAllEnrolledClassesClassworksFn,
  getClassStreamByStreamIdFn,
} from "@/server/functions/stream";

export const streamKeys = {
  all: ["stream"] as const,
  enrolledClassworks: (userId: string) =>
    [...streamKeys.all, "enrolledClassworks", userId] as const,
  byClass: (classId: string) =>
    [...streamKeys.all, "byClass", classId] as const,
  byId: (streamId: string) => [...streamKeys.all, "byId", streamId] as const,
};

export const streamQueries = {
  enrolledClassworks: (userId: string) =>
    queryOptions({
      queryKey: streamKeys.enrolledClassworks(userId),
      queryFn: () => getAllEnrolledClassesClassworksFn(),
    }),
  byClass: (classId: string) =>
    queryOptions({
      queryKey: streamKeys.byClass(classId),
      queryFn: () => getAllClassStreamsByClassIdFn({ data: classId }),
    }),
  byId: (streamId: string) =>
    queryOptions({
      queryKey: streamKeys.byId(streamId),
      queryFn: () => getClassStreamByStreamIdFn({ data: streamId }),
    }),
};
