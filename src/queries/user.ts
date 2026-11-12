import { queryOptions } from "@tanstack/react-query";

import { getAllUsersFn, getUserByUserIdFn } from "@/server/functions/user";

export const userKeys = {
  all: ["user"] as const,
  list: () => [...userKeys.all, "list"] as const,
  byId: (userId: string) => [...userKeys.all, "byId", userId] as const,
};

export const userQueries = {
  list: () =>
    queryOptions({
      queryKey: userKeys.list(),
      queryFn: () => getAllUsersFn(),
    }),
  byId: (userId: string) =>
    queryOptions({
      queryKey: userKeys.byId(userId),
      queryFn: () => getUserByUserIdFn({ data: userId }),
    }),
};
