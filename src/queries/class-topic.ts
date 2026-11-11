import { queryOptions } from "@tanstack/react-query";

import { getAllClassTopicsByClassIdFn } from "@/server/functions/class-topic";

export const classTopicKeys = {
  all: ["classTopic"] as const,
  byClass: (classId: string) =>
    [...classTopicKeys.all, "byClass", classId] as const,
};

export const classTopicQueries = {
  byClass: (classId: string) =>
    queryOptions({
      queryKey: classTopicKeys.byClass(classId),
      queryFn: () => getAllClassTopicsByClassIdFn({ data: classId }),
    }),
};
