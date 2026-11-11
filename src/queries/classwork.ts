import { queryOptions } from "@tanstack/react-query";

import { getAllClassworksByUserIdFn } from "@/server/functions/classwork";

export const classworkKeys = {
  all: ["classwork"] as const,
  byUser: (userId: string) => [...classworkKeys.all, "byUser", userId] as const,
};

export const classworkQueries = {
  byUser: (userId: string) =>
    queryOptions({
      queryKey: classworkKeys.byUser(userId),
      queryFn: () => getAllClassworksByUserIdFn({ data: userId }),
    }),
};
