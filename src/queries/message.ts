import { queryOptions } from "@tanstack/react-query";

import { getAllMessagesByClassIdFn } from "@/server/functions/message";

export const messageKeys = {
  all: ["message"] as const,
  byClass: (classId: string) =>
    [...messageKeys.all, "byClass", classId] as const,
};

export const messageQueries = {
  byClass: (classId: string) =>
    queryOptions({
      queryKey: messageKeys.byClass(classId),
      queryFn: () => getAllMessagesByClassIdFn({ data: classId }),
    }),
};
