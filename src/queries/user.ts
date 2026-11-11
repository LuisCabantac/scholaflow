import { queryOptions } from "@tanstack/react-query";

import { getUserByUserIdFn } from "@/server/functions/user";

export const userKeys = {
  all: ["user"] as const,
  byId: (userId: string) => [...userKeys.all, "byId", userId] as const,
};

export const userQueries = {
  byId: (userId: string) =>
    queryOptions({
      queryKey: userKeys.byId(userId),
      queryFn: () => getUserByUserIdFn({ data: userId }),
    }),
};
