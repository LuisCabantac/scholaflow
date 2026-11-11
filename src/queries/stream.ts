import { queryOptions } from "@tanstack/react-query";

import { getAllEnrolledClassesClassworksFn } from "@/server/functions/stream";

export const streamKeys = {
  all: ["stream"] as const,
  enrolledClassworks: (userId: string) =>
    [...streamKeys.all, "enrolledClassworks", userId] as const,
};

export const streamQueries = {
  enrolledClassworks: (userId: string) =>
    queryOptions({
      queryKey: streamKeys.enrolledClassworks(userId),
      queryFn: () => getAllEnrolledClassesClassworksFn(),
    }),
};
